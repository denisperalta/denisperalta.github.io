# Denis Peralta · QA Engineer

An English-language portfolio for QA Automation and SDET hiring teams. It includes two case studies, a résumé-based work timeline, and a risk-based account of how the site was tested.

## Local development

Start from `develop` for portfolio changes. Use Node.js 24 and npm with the committed lockfile.

```sh
npm ci
npm run dev
```

Astro prints the development URL. To check and serve the production build:

```sh
npm run check
npm run build
npm run preview
```

## Tests

Run the full checks from `develop` with `SITE_BASE` unset to verify the root configuration.

```sh
npx playwright install chromium firefox webkit
npm run check
npm run build
npm test
npx playwright show-report
```

Playwright starts a loopback static server for `dist/`. Tests run on desktop Chromium, Firefox, and WebKit, plus emulated Android and iOS devices. See the [QA matrix and verification log](docs/qa.md) for coverage, exploratory checks, and the Lighthouse setup.

Repeat the checks with `/portfolio-preview` to verify the project-site configuration. In PowerShell, set `SITE_BASE` for the check, build, and test commands, then restore the root build.

```powershell
$env:SITE_BASE = '/portfolio-preview'
npm run check
npm run build
npm test
Remove-Item Env:SITE_BASE
npm run build
```

In Bash, prefix `npm run check`, `npm run build`, and `npm test` with `SITE_BASE=/portfolio-preview`. Run `npm run build` in the root configuration afterward to restore `dist/`.

## GitHub Pages

1. In the repository, open **Settings → Pages** and select **GitHub Actions** under **Build and deployment → Source**.
2. Test changes on `develop` and push them there. The [GitHub Actions workflow](.github/workflows/pages.yml) verifies the root and `/portfolio-preview` builds on pushes to `develop` and `master` and on pull requests targeting either branch.
3. Open a pull request from `develop` into `master`. Bring `develop` up to date with `master`, then wait for **Verify root build** and **Verify prefix build** to pass on the updated branch before merging.
4. A push to `master` publishes the verified root `dist/` once both build checks pass. The `github-pages` environment must allow this branch. Check the deployment and its smoke job in **Actions**. Open the deployment URL, refresh each case directly, and verify that an unknown URL returns the custom 404. Run `node scripts/smoke-pages.mjs` to repeat the public HTTP checks.
5. After the release, merge the latest `master` back into `develop` and push `develop` to keep the branches in sync.

The user-site origin is `https://denisperalta.github.io` and its production base is `/`. To move this source to a GitHub Pages project site under the same owner, set the production matrix entry’s `base` to `/<repo>` and keep the second entry at a different prefix. Preview and test with that same `SITE_BASE`. For a different origin, update `site` in [astro.config.mjs](astro.config.mjs) and the expected origin and default URL in the [public smoke script](scripts/smoke-pages.mjs).

The new build excludes the legacy résumé file from the checkout and deployment artifact. The file remains in earlier Git history.

## Maintenance

- [Portfolio content](src/data/portfolio.ts) holds the typed public profile, experience, and examples. The Biofina link was checked against the résumé and the live project. LinkedIn is the public contact channel.
- [Static pages](src/pages) use the shared [layout](src/layouts/SiteLayout.astro) and [path helper](src/lib/paths.ts). Add public files under `public/`. The three local WOFF2 files come from Fontsource packages, with their OFL licenses in `public/licenses/`.
- [CSS](src/styles/global.css) defines the visual system. [GSAP motion](src/scripts/motion.ts) enhances the home page. Case transitions use cross-document view transitions in supporting browsers. Content and links render as HTML.
- [AGENTS.md](AGENTS.md) gives repository guidance. In a trusted Codex project, ask it to use [`portfolio_maintainer`](.codex/agents/portfolio-maintainer.toml) for a scoped maintenance task, for example `Use portfolio_maintainer to update the experience timeline and verify both deployment bases.`

The public site can link to a reviewed résumé when an approved copy is available. Add the reviewed file under `public/`, build the URL with `sitePath()`, and update ASSET-01 to cover the download.
