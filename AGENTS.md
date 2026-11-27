# Portfolio maintenance

This is Denis Peralta’s English-language QA portfolio. Use `develop` for development and verification. The default branch, `master`, publishes to GitHub Pages. Keep all routes prerendered and usable via direct URLs, keyboard, reduced motion, and with JavaScript disabled.

- Read [README.md](README.md) for the project map, commands, and deployment settings. Use Node 24 and the npm lockfile.
- Edit résumé-derived copy in `src/data/portfolio.ts`. Confirm new dates, responsibilities, metrics, and links with Denis or an approved source. Label synthetic evidence visibly. Publish personal contact information and résumé files with explicit approval.
- Route internal links and public asset paths through `src/lib/paths.ts`. Keep client JavaScript limited to progressive enhancements. Preview work at desktop and mobile widths.
- Verify every change on `develop`. Run `npm run check`, `npm run build`, and `npm test` with both the root configuration and `SITE_BASE=/portfolio-preview`. Update `docs/qa.md` with the environment and observed outcomes when changing coverage or making a verification claim.
- Release through a pull request from `develop` into `master`. Update `develop` with the latest `master` and wait for **Verify root build** and **Verify prefix build** to pass on the updated branch before merging. Sync `develop` with `master` after each release.
- For a scoped feature or fix, ask Codex to use the `portfolio_maintainer` agent. Give it the expected behavior and the files or area it owns.
