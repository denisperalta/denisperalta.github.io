export async function setupHomeMotion() {
  const track = document.querySelector<HTMLElement>('.showcase-track');
  const desktopMotionQuery = track?.dataset.motionQuery;
  if (!track || !desktopMotionQuery) return;

  const noPreference = window.matchMedia('(prefers-reduced-motion: no-preference)');
  if (!noPreference.matches) return;

  const modules = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]).catch(() => undefined);
  if (!modules) {
    track.hidden = true;
    return;
  }
  const [{ gsap }, { ScrollTrigger }] = modules;
  gsap.registerPlugin(ScrollTrigger);
  const motion = gsap.matchMedia();

  motion.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.from('.name-line', { yPercent: 88, duration: 0.65, stagger: 0.1, ease: 'power3.out', clearProps: 'transform' });
    gsap.from('[data-hero-enter]', { y: 14, duration: 0.45, stagger: 0.075, ease: 'power2.out', clearProps: 'transform' });

    for (const heading of document.querySelectorAll<HTMLElement>('.chapter-heading h2')) {
      gsap.from(heading, {
        y: 22,
        duration: 0.5,
        ease: 'power2.out',
        clearProps: 'transform',
        scrollTrigger: { trigger: heading, start: 'top 92%', once: true },
      });
    }

    const light = document.querySelector<HTMLElement>('[data-light-chapter]');
    if (light) {
      gsap.fromTo(light, { backgroundColor: '#e5e0d5' }, {
        backgroundColor: '#f2efe8',
        scrollTrigger: { trigger: light, start: 'top 95%', end: 'top 25%', scrub: true },
      });
    }
    gsap.to('.reading-progress', {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: true, refreshPriority: -1 },
    });
  });

  motion.add(desktopMotionQuery, () => {
    gsap.to('.signal-grid', {
      y: 22,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    const stage = track.querySelector<HTMLElement>('.showcase-stage');
    const pin = track.querySelector<HTMLElement>('.showcase-sticky');
    const panels = Array.from(track.querySelectorAll<HTMLElement>('[data-case]'));
    if (!pin || !stage || panels.length < 2) return;

    track.hidden = false;
    let active = 0;
    const setPanel = (progress: number) => {
      const index = Math.min(Math.floor(progress * panels.length), panels.length - 1);
      if (index === active) return;
      active = index;
      stage.dataset.activeCase = panels[index].dataset.case;
      gsap.fromTo(panels[index], { opacity: 0.6, y: 9 }, {
        opacity: 1, y: 0, duration: 0.25, ease: 'power2.out', overwrite: true, clearProps: 'opacity,transform',
      });
    };
    ScrollTrigger.create({
      trigger: track,
      start: 'top 36px',
      // The track reserves this space before GSAP loads, so Back can restore native scroll.
      end: () => `+=${Number.parseFloat(getComputedStyle(track).paddingBlockEnd)}`,
      pin,
      pinSpacing: false,
      onUpdate: (self) => setPanel(self.progress),
      onRefresh: (self) => setPanel(self.progress),
    });

    return () => { track.hidden = true; stage.dataset.activeCase = panels[0].dataset.case; };
  });

  await document.fonts.ready;
  ScrollTrigger.refresh();
}
