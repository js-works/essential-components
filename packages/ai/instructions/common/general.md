# General conventions

- English is the language of the project: code, comments, docs, specs and rules. Never another language there.
  - Exception: translated texts (the texts of a language switch, message catalogs, test data).
- A package's `src/` has three trees (like Maven's `src/main` and `src/test`):
  - `main/`: the library, what ships (the entries and what they import).
  - `test/`: the tests, in the folders of what they test (`test/core/accept.test.ts` tests `main/core/accept.ts`), with
    the shared helpers and the setup (`test/setup.ts`). A test of several modules (the whole component) belongs there
    too.
  - `demo/`: the demo (`npm run dev`).
  - So the build, the coverage and the entries take `src/main` without excludes, and the tests' settings stay in their
    tree. Tooling stays outside `src/` (`scripts/`, the configs).
  - Other instructions name the paths inside a tree without it: `src/api/` is `src/main/api/`.
  - Weighed: tests beside their files (`accept.test.ts` next to `accept.ts`, common in UI libraries), where a test of
    several modules and the helpers have no place.
- File names in kebab-case, every kind of file: `user-table.tsx` (it exports `UserTable`), `use-form.tsx`,
  `table-actions.ts`. One rule without exceptions, and safe on case-insensitive file systems (a rename that only
  changes the case is a known trouble in git there).
- Decisions (also small ones) go into the package's docs, in the same step as the code.
- No history, in code or docs: comments and docs say what is and why, never how it came to be (no dates, no who
  decided, no "… before", "renamed from", "until"). Git has the history. A reason stays where it is not obvious, and
  an alternative that was weighed and dropped, where that keeps it from being proposed again.
- Ask before adding a dependency. Keep runtime dependencies minimal.
- Every public API change comes with a test and a usage example in the demo.
- `.npmrc`: `ignore-scripts=true`, `min-release-age=7`.
- What a tool writes for developers goes into the package's `.generated/`: the coverage (`.generated/coverage`), the
  screenshots of failed browser tests (`.generated/screenshots`), generated source, caches. Gitignored, skipped by the
  formatters, hidden in the editor. Not `dist/`: the package's product, which `exports` points to. (`.reports`
  weighed: it does not fit generated source.)
