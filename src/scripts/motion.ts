export async function setupHomeMotion() {
  const noPreference = window.matchMedia('(prefers-reduced-motion: no-preference)');
  if (!noPreference.matches) return;

  const modules = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]).catch(() => undefined);
  if (!modules) return;
  const [{ gsap }, { ScrollTrigger }] = modules;
  gsap.registerPlugin(ScrollTrigger);
  const motion = gsap.matchMedia();

  motion.add(noPreference.media, () => {
    gsap.to('.reading-progress', {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: true, refreshPriority: -1 },
    });
  });

  motion.add(`(min-width: 960px) and (min-height: 620px) and ${noPreference.media}`, () => {
    gsap.to('.signal-grid', {
      y: 22,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    for (const card of document.querySelectorAll('.work-card')) {
      const chart = card.querySelector('.market-chart, .voice-bars');
      if (!chart) continue;
      gsap.fromTo(chart, { y: 6 }, {
        y: -6,
        ease: 'none',
        scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }
  });

  await document.fonts.ready;
  ScrollTrigger.refresh();
}
