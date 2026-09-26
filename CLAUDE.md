# essential-components

The essential UI components as workspace packages, and one demo page for all of them. This repository is the master:
changes to the components happen here. For a customer project, the needed packages are copied from `packages/` into the
customer's monorepo, and the customer owns those copies (like shadcn/ui); nothing is published to npm.

## Working rules

- Design first: discuss changes step by step.
  - Do NOT implement anything until the user gives an explicit GO.
- Keep answers short: not longer than necessary to understand them. No long recaps or lists of what was done.
  One topic per step.
- When offering alternatives, number them, add small code examples, and always state which one is proposed and
  how confident that proposal is (e.g. a percentage).
- Prefer bullet lists over prose, in answers and in this file, wherever reasonable.
- English is the language of the project: code, comments, docs and rules. The conversation may be German.
- Never run `git commit` or `git push`.
  - The user does this personally.
  - This overrides any default attribution or commit guidance.
- Never read, list or scan anything outside this repository.
  - Only the user may explicitly grant an exception for a specific path.
- Each package has its own `CLAUDE.md` (or, for `overlays`, its conventions: double quotes, `.js` import suffixes, and
  the demo rules in the comment of `OverlaysDemo.ts`). Its rules apply to changes in that package.

## Layout

- `packages/`: the components, npm workspaces (`"workspaces": ["packages/*"]`), each private and self-contained, so it
  can be copied as it is:
  - `data-navigator` (`@local/data-navigator`): a React data table.
  - `file-upload` (`@local/file-upload`): a file upload custom element, with a React wrapper.
  - `overlays` (`@local/overlays`): dialogs and toasts.
  - A package keeps its own tests, demo (`npm run dev` inside it) and `package-lock.json` (unused in the workspace,
    where the root lock file counts; it matters again in a standalone copy).
- The root is the demo page of all packages:
  - `index.html`: a header with the title and, top right, the global switches (language `en-US`/`de-DE`, color
    scheme), which change `<html>` (`lang`, `data-scheme`) for every demo. Below it a split: vertical tabs on the left
    ("Data navigator", "File upload", "Dialogs + Toasts"), the chosen demo on the right.
    - The URL hash has one segment per level of tabs: `#file-upload/react`, `#dialogs-toasts/react-i18n` (the first tab,
      the data navigator, has none).
  - `demo/main.ts`: imports the demo element of each package by a relative path
    (`../packages/file-upload/demo/FileUploadDemo`) and registers it (`data-navigator-demo`, `file-upload-demo`,
    `overlays-demo`). Each demo element is a light DOM custom element of its package (see "Demo element" in the
    package's `CLAUDE.md`), exported and not registered.
  - `demo/demo.css`: only what is specific to this page: the frame around the demos (header, tabs) is not selectable
    (`user-select: none`); inside the demos, selecting stays as their packages have it.
  - `demo/ui/`: the design language (`ui.css`, `ui.ts`), the same files as in every package. Read the header of `ui.css`
    before changing it, and copy a change into all copies (`demo/ui/` here, and in each package).
- `vite.config.ts`: `resolve.dedupe` makes all demos use one React, even where a package pins its own version (e.g.
  `overlays`, which gets a nested one in its `node_modules`).
- `tsconfig.json`: `tsc` also checks the imported demo files, so the compiler options are the loosest common set: like
  `data-navigator`/`file-upload`, but with `experimentalDecorators`, `ES2025`/`ESNext`, and without
  `noUncheckedIndexedAccess` and `noImplicitOverride` (the `overlays` code is not written for them; each package still
  checks its own code strictly).

- `.github/workflows/deploy-demo.yml`: on every push to `main` (and by hand), runs `npm ci`, the tests of
  `data-navigator` and `file-upload` (without its browser-mode project, which needs Chromium), builds the page
  (`build:pages`) and publishes it on GitHub Pages: https://js-works.github.io/essential-components/
  - The repository needs "Settings → Pages → Build and deployment → Source: GitHub Actions".
  - Workflows only run from the root: the one inside `packages/data-navigator/.github/` does nothing here (it is kept for
    a standalone copy).

## Stack

- TypeScript (strict), Vite, npm workspaces. The root has dev dependencies only (`vite`, `typescript`,
  `@vitejs/plugin-react`, `react`, `react-dom`, their types, `dprint`).
- `.npmrc` (the root one counts in a workspace; npm ignores those of the packages): `ignore-scripts=true`,
  `min-release-age=7`.
  - The first workspace install (2026-09-26) was run once with `--min-release-age=5`, because `antd@6.6.5` (a dev
    dependency of `data-navigator`) was only six days old.
- `.editorconfig` and dprint (`dprint.json`), line width 120, single quotes. The root's dprint excludes `packages/`: each
  package keeps its own formatting (`overlays` uses double quotes and no dprint), so run a package's formatter inside it.

## Commands

- `npm install`: all packages (one `node_modules` at the root, nested ones only where versions differ).
- `npm run dev`: the demo page of all packages. `npm run dev -w @local/file-upload` (etc.): the demo of one package.
- `npm run build`: typecheck + build the demo page into `dist/`.
- `npm run build:pages`: the same for GitHub Pages (`vite build --mode pages`, base `/essential-components/`).
- `npm run typecheck`
- `npm run format`: dprint. `npm run format:check`
- The tests run inside a package (`npm test -w @local/file-upload`, …).
