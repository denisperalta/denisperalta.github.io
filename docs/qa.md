# Portfolio verification

## Risk matrix

| Case | Priority | Risk | Requirement | Evidence |
| --- | --- | --- | --- | --- |
| PAGES-01 | High | Hosting breaks routes, assets, or fallback behavior | Home, both cases, and Site QA open directly and on refresh. Canonical paths, favicon, social card, and local fonts respect root and prefix. An unknown route returns the custom 404. | Playwright response, metadata, asset, and reload checks. The post-deployment smoke checks live HTTP routes. |
| A11Y-01 | High | A keyboard user cannot reach the main content or case links | The skip link moves focus to main. Critical navigation takes visible focus and activates by keyboard. | Playwright focus and activation checks, axe WCAG 2.0 and 2.1 AA rules on home, both cases, and Site QA, and exploratory review. |
| MOTION-01 | High | Motion blocks content or removes visitor control | Each case appears once in the normal page flow. Experience follows the cards, and Back returns to the work links. | Playwright flow, history, media preference, and script-free checks. |
| VISUAL-01 | Medium | Late fonts shift visible text | The headline, navigation, intro, and actions keep their positions after first paint. | Chromium compares bounding rectangles while font responses are delayed and after they arrive. |
| RESP-01 | High | The header, name, or actions overflow at small widths | Navigation remains usable at 699, 700, and 701 CSS px and in mobile browsers. | Breakpoint and touch checks, portrait and landscape inspection, and browser zoom review. |
| NAV-01 | Medium | Recruiters lose the path from work to contact | The hero actions reach their destinations, opening a case works, and browser Back returns to work. | Playwright recruiter journey across all five browser projects. |
| ASSET-01 | High | An unapproved résumé is exposed | The build and navigation include PDF assets only after approval of a public copy. | Playwright checks the build tree, the former PDF path, and the presence of a download link. |

The test identifiers appear in [the Playwright spec](../tests/portfolio.spec.ts). GitHub Actions saves the HTML report from each base as a run artifact. The configuration takes screenshots on failure and records a trace on the first CI retry.

## Local production build review · 27 November 2026

- Astro type checking reported zero errors, warnings, or hints. The root and `/portfolio-preview` builds each generated five static pages.
- Each base passed 86 Playwright checks and reported 14 intentional project-specific skips. The runs covered desktop Chromium, Firefox, and WebKit and emulated Pixel 7 and iPhone 14. All 20 axe scans per base returned zero configured-rule violations.
- Inspected the home page and case layouts at desktop size and at 390 CSS px in portrait. Rechecked the home page at 844 CSS px in landscape. The name and navigation fit and the document had no horizontal overflow in either mobile orientation.
- Added regression coverage for both hero actions in the first viewport at 1440 × 700 and 320 × 568, and for returning to the visible case link with desktop motion enabled.
- Used Chromium browser zoom at 200%. The home page and voice-assistant case reflowed to a 640 CSS px viewport without document overflow.
- Inspected the illustrative voice-assistant matrix at 390 CSS px. Its table scrolled inside the labelled region and the surrounding page stayed within the viewport.
- Followed the visible keyboard skip link and confirmed that focus moved to main. The Windows WebKit runner skipped native links during default Tab traversal, so that project's keyboard check used focus and Enter activation. Chromium and Firefox exercised Tab order.
- Watched the desktop reel advance from Tieto to Samsung, and checked that reduced motion exposes the ordinary case cards. The touch layouts use the same case links in a vertical stack.
- Checked foreground/background pairs with the WCAG contrast formula and inspected the rendered styles. Ivory on dark measured 16.18:1, grey on dark 8.61:1, muted body text on ivory 7.51:1, and muted text at the darker start of the ivory transition 6.55:1. The light focus ring on ivory measured 8.92:1.

The review used Windows, locally served static files, emulated mobile devices, and no physical-device or screen-reader session. The deployment workflow has its own public smoke job for the GitHub Pages environment.

## First-paint and scrolling follow-up

- Checked the home page, both cases, Site QA, and the 404 in Chromium desktop and Pixel 7 emulation. The first painted text kept its measured bounds after all three delayed font responses arrived. A separate delayed-script check on the home page found no text movement when GSAP initialized.
- Confirmed that an ordinary cold desktop load rendered the locally hosted display font. The site preloads all three fonts and keeps the first-paint fallback when a font arrives too late.
- Reached Experience from the last work card with the mouse wheel, Page Down, and an emulated touch swipe. The desktop gap between the last card and Experience measured 115 CSS px at 1440 × 850. The browser suite also checks Back navigation, reduced motion, and navigation with JavaScript disabled.
- The root and prefixed builds each passed 89 Playwright checks, with 16 planned project-specific skips. The repeat local mobile Lighthouse sample reported 100 for performance, 100 for accessibility, and zero cumulative layout shift.

## Lighthouse mobile

Initial targets are 90 for performance and 95 for accessibility. On the local production home page, Lighthouse 13.6.0 with Headless Chrome 159 reported **100 performance** and **100 accessibility**, with 0.9 s LCP, 0 ms total blocking time, 0.04 CLS, and 248 KiB transferred.

Serve a fresh root build, then run the mobile-default audit in a second terminal:

```sh
npm run build
node scripts/serve-dist.mjs
```

```sh
npm exec --yes --package=lighthouse@13.6.0 -- lighthouse http://127.0.0.1:4173/ --chrome-flags="--headless=new --disable-gpu --no-first-run" --only-categories=performance,accessibility --output=json --output-path=lighthouse-mobile.json
```

Set `CHROME_PATH` to the Chromium executable to reproduce with the same browser. The run used simulated mobile throttling and a 412 × 823 viewport at DPR 1.75. Scores vary by hardware, browser, and runner load. The report tracks a local sample, and CI gates deployment on the type, build, and Playwright checks.
