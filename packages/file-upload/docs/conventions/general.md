# General conventions

The rules for every package (and the apps of the demo, where they apply). The master is the repository's
`docs/conventions/`; each package has a copy in its own `docs/conventions/`, so it stays self-contained when it is
copied into a customer's monorepo. A change is made in the master, then copied into every package by hand.

- English is the language of the project: code, comments, docs, specs and rules. Never German there.
  - Exception: translated texts (the German texts of a demo's language switch, message catalogs, test data).
- Two tiers of packages:
  - Tier 1, framework-free where possible, for any customer's stack: `overlays`, `file-upload`, `data-table`,
    `cockpit`, `form-validation`, `ui-theme`. No UI library, no i18n library (an `I18nAdapter`, `i18n.md`), themes as
    JS objects (`css.md`). Expensive to build: only for packages that important.
  - Tier 2, opinionated, for apps built on Mantine: `login`, `mantine-themes`, `rich-text`, `micro-app`. Mantine and
    react-i18next (with i18next) as peers, and TanStack Router where routing is involved; their look from Mantine's
    theme and variables, their texts from an i18next namespace of their own (`i18n.md`).
  - A tier-2 package may depend on a tier-1 one, never the other way round.
- A package is private and self-contained: `"private": true`, the name `@local/<name>`, never published to npm.
  - The customer copies the whole folder into its monorepo and owns the copy (like shadcn/ui).
  - It keeps its own tests, demo (`npm run dev` inside it) and `package-lock.json`.
  - License: MIT or the Unlicense.
- A package's `src/` has three trees (like Maven's `src/main` and `src/test`):
  - `main/`: the library, what ships (the entries and what they import).
  - `test/`: the tests, in the folders of what they test (`test/core/accept.test.ts` tests `main/core/accept.ts`), with
    the shared helpers and the setup (`test/setup.ts`). A test of several modules (the whole element) belongs there too.
  - `demo/`: the demo (`npm run dev`).
  - So the build, the coverage and the `exports`' `source` condition take `src/main` without excludes, and the tests'
    settings stay in their tree. Tooling stays outside `src/` (`scripts/`, the configs).
  - The other conventions name the paths inside a tree without it: `src/api/` is `src/main/api/`.
  - Weighed: tests beside their files (`accept.test.ts` next to `accept.ts`, common in UI libraries: Angular, Mantine,
    Radix), where a test of several modules and the helpers have no place.
- One name per package, in every form:
  - the folder and package: `data-table`, `@local/data-table`
  - the component and element: `DataTable`, `<data-table>`
    - The host registers the element under a tag of its choice; the package suggests its own name. A one-word package
      (no hyphen, so no valid tag) suggests a tag of two words with it, e.g. `@local/cockpit` and `<app-cockpit>`.
    - A package never registers a tag itself; an internal element of its own is registered as `internal-<name>-<n>`,
      `n` the first number not registered yet (e.g. the cockpit's taskbar, `internal-cockpit-taskbar-1`).
  - the BEM block: `data-table`, `data-table__cell` (see `css.md`)
  - the i18n namespace: `'dataTable'` (see `i18n.md`)
- File names in kebab-case, every kind of file: `member-table.tsx` (it exports `MemberTable`), `use-form.tsx`,
  `table-actions.ts`, `data-table-view.tsx`. One rule without exceptions, and safe on case-insensitive file systems (a
  rename that only changes the case is a known trouble in git there). In the root's apps, a feature's flows and
  filters are named after its subject (`board-flows.tsx`, `board-filters.ts`, not `flows.tsx` in every feature); the
  packages' topic files keep their names (`api/filters.ts`, `theme.ts`).
- Decisions (also small ones) go into the package's docs, in the same step as the code.
- No history, in code or docs: comments and docs say what is and why, never how it came to be (no dates, no who
  decided, no "… before", "renamed from", "until"). Git has the history. A reason stays where it is not obvious, and
  an alternative that was weighed and dropped, where that keeps it from being proposed again.
- Ask before adding a dependency. Keep runtime dependencies minimal.
- Every public API change comes with a test and a usage example in the demo.
- Browsers: only the latest Chrome, Edge, Firefox and Safari. Every Vite config builds with `build.target: 'es2024'`
  and `build.cssTarget: 'esnext'`: the CSS stays as it is (else the minifier lowers modern CSS like `light-dark()`
  wrongly), the JavaScript lowers newer syntax that not every one of them has yet (`using`: an unknown syntax breaks
  the whole module).
- `.npmrc`: `ignore-scripts=true`, `min-release-age=7`.
- What a tool writes for developers goes into the package's `.generated/`: the coverage (`.generated/coverage`,
  Vitest's `coverage.reportsDirectory`), the screenshots of failed browser tests (`.generated/screenshots`,
  `browser.screenshotDirectory`), generated source (the root apps' route trees), caches. Gitignored, skipped by the
  formatters, hidden in the editor (`files.exclude`). Not `dist/`: the package's product, which `exports` points to.
  (`.reports` weighed: it does not fit generated source.)
