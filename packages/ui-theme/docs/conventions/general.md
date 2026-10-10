# General conventions

The rules for every package (and the apps of the demo, where they apply). The master is the repository's
`docs/conventions/`; each package has a copy in its own `docs/conventions/`, so it stays self-contained when it is
copied into a customer's monorepo. A change is made in the master, then copied into every package by hand.

- English is the language of the project: code, comments, docs, specs and rules. Never German there.
  - Exception: translated texts (the German texts of a demo's language switch, message catalogs, test data).
- A package is private and self-contained: `"private": true`, the name `@local/<name>`, never published to npm.
  - The customer copies the whole folder into its monorepo and owns the copy (like shadcn/ui).
  - It keeps its own tests, demo (`npm run dev` inside it) and `package-lock.json`.
  - License: MIT or the Unlicense.
- One name per package, in every form (2026-10-10):
  - the folder and package: `data-table`, `@local/data-table`
  - the component, element and types: `DataTable`, `<data-table>`
  - the BEM block: `data-table`, `data-table__cell` (see `css.md`)
  - the i18n namespace: `'dataTable'` (see `i18n.md`)
- Decisions (also small ones) go into the package's docs, in the same step as the code.
- Ask before adding a dependency. Keep runtime dependencies minimal.
- Every public API change comes with a test and a usage example in the demo.
- Browsers: only the latest Chrome, Edge, Firefox and Safari. Every Vite config builds with `build.target: 'esnext'`
  (the CSS follows it: else the minifier lowers modern CSS like `light-dark()` wrongly).
- `.npmrc`: `ignore-scripts=true`, `min-release-age=7`.
