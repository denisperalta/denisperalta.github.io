import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator } from '@playwright/test';
import { readdir } from 'node:fs/promises';

const cases = [
  { slug: 'trading-platform', title: 'Testing a trading platform for financial advisors' },
  { slug: 'bilingual-voice-assistant', title: 'Quality for a bilingual voice assistant' },
] as const;

test.describe('Core portfolio', () => {
  test.use({ reducedMotion: 'reduce' });

  test('NAV-01 follows the selected work and contact actions, with Back', async ({ page }) => {
    const firstCase = cases[0];
    await page.goto('./');
    const hero = page.getByRole('heading', { level: 1, name: 'Denis Peralta' });
    const viewWork = page.getByRole('link', { name: 'View selected work', exact: true });
    const getInTouch = page.getByRole('link', { name: 'Get in touch', exact: true });
    for (const element of [hero, viewWork, getInTouch]) {
      await expect(element).toBeInViewport();
    }

    await viewWork.click();
    await expect(page).toHaveURL(/#work$/);
    await expect(page.locator('#work').getByRole('heading', { name: /^Selected work\.?$/ })).toBeVisible();
    await page.getByRole('link', { name: firstCase.title, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/work/${firstCase.slug}/$`));
    await expect(page.getByRole('heading', { level: 1, name: firstCase.title })).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/#work$/);
    await getInTouch.click();
    await expect(page).toHaveURL(/#contact$/);
    await expect(page.locator('#contact').getByRole('heading', { level: 2 })).toBeVisible();
    await expect(page.getByRole('link', { name: /LinkedIn/i }).first()).toHaveAttribute(
      'href', 'https://www.linkedin.com/in/denis-peralta/',
    );
  });

  for (const [route, heading] of [
    ['./', 'Denis Peralta'],
    ...cases.map(({ slug, title }) => [`work/${slug}/`, title]),
    ['quality/', 'How I tested this site'],
  ]) {
    test(`PAGES-01 serves ${route} directly and after a reload`, async ({ page, baseURL }) => {
      const url = new URL(route, baseURL);
      expect((await page.goto(url.href))?.status()).toBe(200);
      expect((await page.reload())?.status()).toBe(200);
      await expect(page).toHaveURL(url.href);
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    });

    test(`A11Y-01 checks ${route} against axe WCAG AA rules`, async ({ page }) => {
      await page.goto(route);
      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      expect(violations).toEqual([]);
    });
  }

  test('PAGES-01 serves a static 404 with a working route back', async ({ page, baseURL }) => {
    expect((await page.goto('missing-portfolio-page/'))?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
    const home = page.getByRole('main').getByRole('link', { name: /home/i });
    await home.click();
    await expect(page).toHaveURL(baseURL!);
    await expect(page.getByRole('heading', { level: 1, name: 'Denis Peralta' })).toBeVisible();
  });

  test('PAGES-01 resolves local styles, fonts, metadata assets, and internal links', async ({ page, request, baseURL }) => {
    const base = new URL('./', baseURL);
    const requests = new Map<string, string>();
    const failedAssets: string[] = [];
    page.on('request', (resource) => {
      if (['stylesheet', 'script', 'font', 'image'].includes(resource.resourceType())) {
        requests.set(resource.url(), resource.resourceType());
      }
    });
    page.on('requestfailed', (resource) => {
      if (requests.has(resource.url())) failedAssets.push(resource.url());
    });
    page.on('response', (response) => {
      if (requests.has(response.url()) && response.status() >= 400) failedAssets.push(response.url());
    });
    const routes = ['./', ...cases.map(({ slug }) => `work/${slug}/`), 'quality/', '404.html'];
    const internalDestinations = new Set<string>();
    const titles = new Set<string>();

    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('html')).toHaveAttribute('lang', /^en(?:-|$)/);
      const title = await page.title();
      expect(title.trim()).not.toBe('');
      titles.add(title);
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S/);
      const canonical = page.locator('link[rel="canonical"]');
      if (route !== '404.html') {
        await expect(canonical).toHaveAttribute('href', `https://denisperalta.github.io${new URL(route, base).pathname}`);
      }
      const links = await page.locator('a[href]').evaluateAll((anchors) => anchors.map((anchor) => (anchor as HTMLAnchorElement).href));
      for (const href of links) {
        const destination = new URL(href);
        if (destination.origin === base.origin) {
          expect(destination.pathname.startsWith(base.pathname)).toBe(true);
          destination.hash = '';
          internalDestinations.add(destination.href);
        }
      }

      const favicon = await page.locator('link[rel="icon"]').first().getAttribute('href');
      const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
      expect(favicon).toBeTruthy();
      expect(ogImage).toBeTruthy();
      for (const source of [favicon!, ogImage!]) {
        const asset = new URL(source, page.url());
        expect([base.origin, 'https://denisperalta.github.io']).toContain(asset.origin);
        expect(asset.pathname.startsWith(base.pathname)).toBe(true);
        const response = await request.get(new URL(asset.pathname, base.origin).href);
        expect(response.ok()).toBe(true);
        expect(response.headers()['content-type']).toMatch(/^image\//);
      }
    }

    expect(titles.size).toBe(routes.length);
    for (const destination of internalDestinations) {
      expect((await request.get(destination)).ok(), `Internal destination ${destination}`).toBe(true);
    }
    await page.goto('./');
    const fontStatuses = await page.evaluate(async () => {
      const fontFamilies = ['Bricolage Grotesque', 'Inter', 'IBM Plex Mono'];
      return Promise.all(fontFamilies.map(async (family) => {
        const faces = await document.fonts.load(`16px "${family}"`);
        return { family, loaded: faces.some((face) => face.status === 'loaded') };
      }));
    });
    for (const { family, loaded } of fontStatuses) expect(loaded, family).toBe(true);
    expect([...requests.values()]).toContain('font');
    for (const url of requests.keys()) {
      const asset = new URL(url);
      expect(asset.origin).toBe(base.origin);
      expect(asset.pathname.startsWith(base.pathname)).toBe(true);
    }
    expect(failedAssets).toEqual([]);
  });

  test('RESP-01 fits navigation and hero actions on desktop and mobile', async ({ page }, testInfo) => {
    const viewport = testInfo.project.use.isMobile ? { width: 320, height: 568 } : { width: 1440, height: 700 };
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('./');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Work', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'View selected work', exact: true })).toBeInViewport({ ratio: 1 });
    await expect(page.getByRole('link', { name: 'Get in touch', exact: true })).toBeInViewport({ ratio: 1 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      await page.evaluate(() => document.documentElement.clientWidth),
    );
    await page.getByRole('navigation').getByRole('link', { name: 'Work', exact: true }).click();
    await expect(page).toHaveURL(/#work$/);
  });

  test('ASSET-01 keeps the private résumé out of the build and public navigation', async ({ page, request, baseURL }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'The built files are shared by every browser project');
    await page.goto('./');
    await expect(page.getByRole('link', { name: /download r[ée]sum[ée]/i })).toHaveCount(0);
    await expect(page.locator('a[href*=".pdf" i]')).toHaveCount(0);
    const outputNames = await readdir('dist', { recursive: true });
    expect(outputNames.filter((name) => /\.pdf$/i.test(name))).toEqual([]);
    for (const path of ['Denis Peralta QA CV EN (1).pdf', 'assets/CV Denis Peralta EN-573ed27d.pdf']) {
      expect((await request.get(new URL(path, baseURL).href)).status()).toBe(404);
    }
  });
});

test.describe('Keyboard and responsive boundaries', () => {
  test.use({ reducedMotion: 'reduce' });

  test('A11Y-01 can skip to main and navigate via focused links', async ({ page, browserName }, testInfo) => {
    test.skip(testInfo.project.use.isMobile === true, 'Desktop keyboard traversal');
    let nextLink: string | undefined = 'Tab';
    if (browserName === 'webkit') {
      // Some WebKit hosts reserve Tab for controls. Probe on a plain link so
      // the compatibility fallback cannot hide a focus-order regression here.
      const probe = await page.context().newPage();
      await probe.setContent('<a href="#example">Example</a>');
      nextLink = undefined;
      for (const key of ['Tab', 'Alt+Tab']) {
        await probe.keyboard.press(key);
        if (await probe.locator('a').evaluate((link) => link === document.activeElement)) {
          nextLink = key;
          break;
        }
      }
      await probe.close();
      if (!nextLink) {
        testInfo.annotations.push({
          type: 'browser limitation',
          description: 'This WebKit host skips native links with Tab and Alt+Tab. Focus or activation is checked directly.',
        });
      }
    }

    const focusLink = async (link: Locator, maxTabs: number) => {
      if (!nextLink) {
        await page.keyboard.press('Tab');
        await link.focus();
        return;
      }
      for (let tab = 0; tab < maxTabs; tab++) {
        if (await link.evaluate((element) => element === document.activeElement)) return;
        await page.keyboard.press(nextLink);
      }
    };

    await page.goto('./');
    const skip = page.getByRole('link', { name: 'Skip to content', exact: true });
    await focusLink(skip, 1);
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page.locator('main#main-content')).toBeFocused();

    await page.goto('./');
    const work = page.getByRole('navigation').getByRole('link', { name: 'Work', exact: true });
    await focusLink(work, 12);
    await expect(work).toBeFocused();
    await expect(work).toHaveCSS('outline-style', 'solid');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#work$/);

    const caseLink = page.getByRole('link', { name: cases[0].title, exact: true });
    await focusLink(caseLink, 20);
    await expect(caseLink).toBeFocused();
    await expect(caseLink).toHaveCSS('outline-style', 'solid');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { level: 1, name: cases[0].title })).toBeVisible();
  });

  for (const width of [699, 700, 701]) {
    test(`RESP-01 keeps navigation and CTAs accessible at ${width}px`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.use.isMobile === true, 'Dedicated desktop viewport around the CSS breakpoint');
      await page.setViewportSize({ width, height: 850 });
      await page.goto('./');
      const nav = page.getByRole('navigation');
      await expect(nav.getByRole('link', { name: 'Work', exact: true })).toBeInViewport();
      await expect(page.getByRole('link', { name: 'View selected work', exact: true })).toBeInViewport();
      await expect(page.getByRole('link', { name: 'Get in touch', exact: true })).toBeInViewport();
      const sizes = await page.evaluate(() => ({
        content: document.documentElement.scrollWidth,
        viewport: document.documentElement.clientWidth,
      }));
      expect(sizes.content).toBeLessThanOrEqual(sizes.viewport);
      await nav.getByRole('link', { name: 'Work', exact: true }).click();
      await expect(page).toHaveURL(/#work$/);
    });
  }
});

test.describe('Motion and progressive enhancement', () => {
  test('MOTION-01 advances through both case panels on desktop scroll', async ({ page }, testInfo) => {
    test.skip(testInfo.project.use.isMobile === true, 'Desktop-only scroll pinning');
    await page.setViewportSize({ width: 1360, height: 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('./');
    await page.evaluate(() => document.fonts.ready);
    const stage = page.locator('.showcase-stage');
    const spacer = page.locator('.pin-spacer').filter({ has: stage });
    await expect(spacer).toHaveCount(1);

    for (const [index, entry] of cases.entries()) {
      await page.locator('.showcase-track').evaluate((track, ratio) => {
        const pinned = track.querySelector<HTMLElement>('.showcase-sticky')!;
        const top = track.getBoundingClientRect().top + window.scrollY;
        const distance = (track as HTMLElement).offsetHeight - pinned.offsetHeight;
        window.scrollTo({ top: top + distance * ratio, behavior: 'instant' });
      }, index === 0 ? 0.18 : 0.78);
      await expect(stage).toHaveAttribute('data-active-case', entry.slug);
      await expect(stage.getByText(entry.title, { exact: true })).toBeInViewport();
    }
    await page.getByRole('link', { name: 'View selected work', exact: true }).click();
    const caseLink = page.getByRole('link', { name: cases[0].title, exact: true });
    await caseLink.scrollIntoViewIfNeeded();
    await caseLink.click();
    await page.goBack();
    await expect(page).toHaveURL(/#work$/);
    await expect(spacer).toHaveCount(1);
    await page.evaluate(() => document.fonts.ready);
    await expect(caseLink).toBeInViewport({ ratio: 1 });
  });

  test('MOTION-01 presents static work when reduced motion is requested', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('./');
    await expect(page.locator('.showcase-stage')).toBeHidden();
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
    const work = page.locator('#work');
    for (const entry of cases) {
      const link = work.getByRole('link', { name: entry.title, exact: true });
      await expect(link).toBeVisible();
    }
    await page.getByRole('link', { name: cases[1].title, exact: true }).click();
    await expect(page.getByRole('heading', { level: 1, name: cases[1].title })).toBeVisible();
  });

  test.describe('JavaScript disabled', () => {
    test.use({ javaScriptEnabled: false });

    test('MOTION-01 serves essential content and links in reading order', async ({ page }) => {
      await page.goto('./');
      await expect(page.getByRole('heading', { level: 1, name: 'Denis Peralta' })).toBeVisible();
      await page.getByRole('link', { name: 'View selected work', exact: true }).click();
      await expect(page).toHaveURL(/#work$/);
      await expect(page.locator('.showcase-stage')).toBeHidden();
      await expect(page.locator('.pin-spacer')).toHaveCount(0);
      await expect(page.locator('#work .work-card').getByRole('link')).toHaveText(cases.map(({ title }) => title));
      for (const { slug, title } of cases) {
        await page.getByRole('link', { name: title, exact: true }).click();
        await expect(page).toHaveURL(new RegExp(`/work/${slug}/$`));
        await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
        await page.goBack();
      }
    });
  });
});
