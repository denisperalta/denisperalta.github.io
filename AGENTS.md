# Portfolio maintenance

This is Denis Peralta’s English-language QA portfolio. The deployment target is GitHub Pages on the repository’s `master` branch. Keep all routes prerendered and usable via direct URLs, keyboard, reduced motion, and with JavaScript disabled.

- Read [README.md](README.md) for the project map, commands, and deployment settings. Use Node 24 and the npm lockfile.
- Edit résumé-derived copy in `src/data/portfolio.ts`. Confirm new dates, responsibilities, metrics, and links with Denis or an approved source. Label synthetic evidence visibly. Publish personal contact information and résumé files with explicit approval.
- Route internal links and public asset paths through `src/lib/paths.ts`. Keep client JavaScript limited to progressive enhancements. Preview work at desktop and mobile widths.
- Run `npm run check`, `npm run build`, and `npm test`. Also test a non-root `SITE_BASE` when changing routing, the build, or assets. Update `docs/qa.md` with the environment and observed outcomes when changing coverage or making a verification claim.
- For a scoped feature or fix, ask Codex to use the `portfolio_maintainer` agent. Give it the expected behavior and the files or area it owns.
