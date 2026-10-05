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
- VERY IMPORTANT: never introduce a new CSS custom property (`--…`) without the user's explicit permission.
  - Ask first, with the name and why none of the existing ones does.
  - The need should be rare: use the existing ones (`--ui-*`, the package's own), plain values, or a local calc.
  - A new one, once allowed, carries the package's prefix (never a generic name like `--shadow` or `--border`: the
    mini-apps are light DOM children and inherit them, and they collide with other libraries).
- Never run `git commit` or `git push`.
  - The user does this personally.
  - This overrides any default attribution or commit guidance.
- Never read, list or scan anything outside this repository.
  - Only the user may explicitly grant an exception for a specific path.
- Each package has its own `CLAUDE.md` (or, for `overlays`, its conventions: double quotes, `.js` import suffixes, and
  the demo rules in the comment of `OverlaysDemo.ts`). Its rules apply to changes in that package.
- The root's own demos have one each too: `demo/media-manager/CLAUDE.md`, `demo/board-manager/CLAUDE.md` (loaded when
  working there). Their details go there, not into this file; add behavior details decided for them there, in the same
  step as the code.

## Layout

- `packages/`: the components, npm workspaces (`"workspaces": ["packages/*"]`), each private and self-contained, so it
  can be copied as it is:
  - `data-navigator` (`@local/data-navigator`): a data table: a custom element, and a React component (`/react`).
  - `file-upload` (`@local/file-upload`): a file upload custom element, with a React wrapper.
  - `overlays` (`@local/overlays`): dialogs and toasts.
  - `form-validation` (`@local/form-validation`): form validation for React with Zod, a `useForm` hook. Tests only, no
    demo (so no tab on the root page).
  - `app-cockpit` (`@local/app-cockpit`, `<app-cockpit>`): an admin panel shell for office mini-apps
    (micro-frontends): only a sidebar with the apps (search, recent, groups; from a few apps up to hundreds); the
    open app fills the rest. Lit + Zag.js in its shadow DOM, styled with the `ui-*` tokens. The root's demo page uses it.
  - `app-login` (`@local/app-login`, 2026-10-03): a generic login screen for apps (React, Mantine): `LoginScreen`, and
    `mountLoginScreen()` for a host without React. The root page shows it when signed out.
  - `mantine-themes` (`@local/mantine-themes`, 2026-10-04): a few nicer Mantine themes, to be used easily:
    `createMantineTheme({ colors, size, variant })` gives the theme and the CSS variables resolver for a
    `MantineProvider`; named color setups; `modernTheme` (small corners, a bit more contrast), which the root's three
    apps use (2026-10-04, merged into their own themes); a demo.
  - A package keeps its own tests, demo (`npm run dev` inside it) and `package-lock.json` (unused in the workspace,
    where the root lock file counts; it matters again in a standalone copy).
- The root is the demo page of all packages:
  - `index.html`: an `<app-cockpit>` (2026-10-03, `packages/app-cockpit`) that fills the window: the demos are its
    mini-apps, one group at a time (2026-10-03, the cockpit's `groupDisplay: 'select'`): "Essentials" (2026-10-03; "Essential Components" before) with
    the subgroups "Components" ("Data navigator", "File upload", "Dialogs + Toasts"), "Planned": "Form validation", "Autocomplete", placeholders of `demo/planned/PlannedDemo.ts`
    (`planned-demo`): what it will be, and that there is no demo yet, in a light gray box with rounded corners,
    `demo.css`) and "Apps" ("Media Manager", "Board Manager", "User Manager"; the long names, also as their titles: short
    ones collided with their modules, decided 2026-10-03). In every group, every app (a leaf) has an icon and the
    subgroups (the nodes) have none (2026-10-05, the user's wish; before, the made-up groups had it the other way round,
    and "Planned" an hourglass; for a moment the same day: only the subgroups with icons). The apps of "Essentials"
    keep the icons of their own top bars; the groups have theirs in the group select. And two made-up groups, "Human
    Resources" and "Finance" (`FAKE` in `demo/main.ts`, a title, a description and an icon per app), only to show a
    larger navigation: their apps are
    `planned-demo` placeholders too. Each group has an icon. In the cockpit's footer the cockpit's navigation (one button, 2026-10-03: which one, one attribute `nav` (2026-10-04; its values `auto`, `side`, `top`, `top-compact`, `top-switcher`, `bottom` since 2026-10-06): automatic (the page's default: the sidebar, the bottom bar in a narrow window), sidebar, topbar of two lines, topbar of one line, app switcher, or bottom bar,
    and its colors, dark or like the page), the accent color (2026-10-03: one of Mantine's usual colors, violet by default, or "Design language", i.e. `ui.css`'s; it only sets `--app-accent-color` on `<html>`, which `demo/demo.css` maps to the apps' `--board-manager-accent-color`, `--media-manager-accent-color`, `--user-manager-accent-color`, with the design language's accent as the fallback, so the cockpit and the apps have one color; the package demos keep `ui.css`'s) and the page's settings (the language `en-US`/`de-DE` in the kebab menu, 2026-10-03; the color scheme: System, Light (the default), Dark, 2026-10-03; from
    `packages/app-cockpit/demo/footer.ts`, with a made-up menu), which change `<html>` (`lang`, `data-scheme`) for every
    demo.
    - Signing out (2026-10-03; the user menu's "Sign out") shows the login screen (`packages/app-login`) in place of
      the cockpit (`hidden`), animated (2026-10-04): the cockpit fades out (250 ms), then the login screen fades in (350 ms;
      `demo/demo.css`, `signOut()` in `demo/main.ts`; none with reduced motion); any username and password sign in again (after 500 ms); with "Forgot password?" and "Create an account" (made-up
      server: the username "taken" exists already) and made-up providers ("Continue with Microsoft", "Google", "Company SSO"),
      which sign in after 700 ms. Signed out is remembered per
      browser (`demo-page:signed-in`). Its accent is the page's (`--app-login-accent-color` in `demo/demo.css`).
    - The URL hash: the app's id first, then one segment per level of tabs inside it: `#file-upload/react`,
      `#dialogs-toasts/react-i18n`, `#board-manager/boards/b1`. No hash: the Board Manager (the cockpit's `defaultApp`, 2026-10-03).
  - `demo/main.ts`: creates the cockpit (`createAppCockpitClass`, title "Back Office", subtitle "Acme Corporate" (2026-10-03; "App Center" without a subtitle before), with the search, a made-up
    signed-in user) with
    the demos. Each is loaded when it is opened
    the first time (`load`: a dynamic `import()` by a relative path, e.g. `../packages/file-upload/demo/FileUploadDemo`)
    and registered then (`data-navigator-demo`, `file-upload-demo`, `overlays-demo`; the root's own `media-manager-demo`,
    `board-manager-demo` and `user-manager-demo`). Each demo element is a light DOM custom element of its package (see "Demo element" in
    the package's `CLAUDE.md`), exported and not registered.
  - `demo/media-manager/`: the "Media Manager" app, a demo of the root (not of a package): a small file manager
    (folders and files: a folder tree, a data navigator per folder, dialogs and toasts, a file upload in a drawer), in
    the Board Manager's look (Mantine). Built in the Board Manager's target structure (domain, `infra/in-memory/`,
    a service per feature, TanStack Query). Details: `demo/media-manager/CLAUDE.md`.
  - The root's apps (Media Manager, Board Manager, User Manager) work standalone and embedded (e.g. in the cockpit):
    no greetings like "Welcome" on their start pages, and no "Home" (2026-10-03): the start page is "Main" (the Board Manager's is "Overview" since 2026-10-04, the user's wish) (German
    "Hauptseite"): its title, its menu entry. The breadcrumb starts with a house icon and the label "Home" (2026-10-04, the
    user's wish; the icon only, labeled "Overview", before): a link to the start page; on the start page itself the same, not clickable (the current page); the app icon in the top bar is only an
    icon, not a link (2026-10-04; a link to the start page before).
  - `demo/user-manager/`: the "User Manager" app, a demo of the root: users, groups, roles and grants (who has which
    role where, on a scope tree, inherited downwards; allow only), with a check of access that says why. The Board
    Manager's look, the Media Manager's architecture. Details: `demo/user-manager/CLAUDE.md`.
  - `demo/board-manager/`: the "Board Manager" app, a demo of the root (a small app, not a product): boards and
    committees, their meetings, agendas, minutes and documents, with Mantine, React Router, Zustand and all three
    packages; also as a `<board-manager>` element for a host page (`npm run build:board-manager`). Details:
    `demo/board-manager/CLAUDE.md`.
  - `demo/demo.css`: (2026-10-04: the cockpit's base text size, `--app-cockpit-font-size`, is mapped there to the apps' own text size, `--board-manager-font-size` and the like: one text size for the shell and the apps) only what is specific to this page: the cockpit fills the window (`100dvh`). (Its frame is not
    selectable, by the cockpit's own CSS; inside the demos, selecting stays as their packages have it.)
  - `demo/ui/`: the design language (`ui.css`, `ui.ts`), the same files as in every package. Read the header of `ui.css`
    before changing it, and copy a change into all copies (`demo/ui/` here, and in each package).
    - Its `ui-*` tokens are the default look: the packages' default themes follow them, and a change of a token is
      made in the packages' defaults too. The radius: `--ui-radius-sm: 2px` for controls (inputs, selects, menus);
      the data navigator's `radius` is `2px`, the file upload's small parts `2px` (half of its `borderRadius`, `4px`).
      Buttons: `--ui-radius-md: 5px`; the data navigator's `buttonRadius`, the file upload's `buttonBorderRadius`
      and the overlays' `actionRadius` (dialog buttons) are `5px`. The default theme (the `ui-*` values) is the same in every
      package that has it, and MUST NOT be changed in just one of them (2026-10-04, the user's rule: the data navigator
      had `2px` buttons and other values for a while, put back). Larger surfaces are a bit rounder: the file
      upload's frame `4px`, dialogs `6px` (`--ui-radius-lg`), toasts `5px`. (2026-10-04: the tokens were `--ui-radius` and
      `--ui-button-radius`; `--ui-popup-padding` is gone, a plain `3px` in the select picker.)
- `old-demos/<version>/`: frozen, compiled demo pages of older versions (relative base `./`, so they work under any
  path). Never edit them.
  - `npm run freeze-demo` builds the current demo into `old-demos/<version of the root package.json>/` (it refuses an
    existing folder). So: freeze first, then raise the version in the root `package.json`.
  - The deploy workflow copies `old-demos/` into `dist/`: https://js-works.github.io/essential-components/old-demos/0.0.0/
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

- TypeScript (strict), Vite, npm workspaces. The root has dev dependencies (`vite`, `typescript`,
  `@vitejs/plugin-react`, `react`, `react-dom`, their types, `dprint`; for the board manager `@mantine/core`,
  `@mantine/hooks`, `react-router`) and `zustand`, `react-icons` (the board manager's icons: its Tabler set, `tb`),
  `@mantine/dates` with `dayjs` (pinned to the versions the workspace has from `overlays`: `9.5.1`, `1.11.23`),
  `i18next` (the board manager's translations), `zod` (the schemas of `form-validation` in the board manager),
  `@tanstack/react-query` (the reads and changes of the board manager, the media manager and the user manager).
  `@mantine/form` was removed (2026-10-02): the board manager's forms use `form-validation`.
- Browsers (2026-10-03): only the latest Chrome, Edge, Firefox and Safari. Every Vite config (the root's, the board
  manager's, each package's) builds with `build.target: 'esnext'` (the CSS too: `cssTarget` follows it), so modern CSS
  stays as it is. The default target let the minifier (Lightning CSS) lower `light-dark()` into variables that follow
  the page's color scheme, not the element's `color-scheme`: on the published page the cockpit's dark sidebar and menus
  got light colors (fine in `npm run dev`, which does not minify).
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
- `npm run build:board-manager`: the `<board-manager>` element as one module into `dist-board-manager/`.
- `npm run typecheck`
- `npm run format`: dprint. `npm run format:check`
- The tests run inside a package (`npm test -w @local/file-upload`, …).

## TODO

- The look of the data navigator (the user does not like it yet; details in its `CLAUDE.md`, "Todo (later)").
- Rename the data navigator (2026-10-06, the user's idea; not now): with `@local/…` packages a generic name is fine.
  Proposed: data table (`@local/data-table`, `DataTable`, `<data-table>`): it is semantically a table
  (`role="table"`), like shadcn/ui's "Data Table", TanStack Table, Mantine DataTable. Not data grid: that means a
  spreadsheet (cell-by-cell keyboard navigation, editing in cells, the ARIA `grid` role). The rename touches the package
  and its folder, the React component and factory (`DataNavigator`, `createDataNavigatorComponent`), the hooks
  (`useDataNavigatorController`, …), the type namespaces, the element, the CSS custom properties (`--datnav-*`), the i18n
  namespace (`'datanav'`: breaking for every app's translations), the demos, the root's apps and all docs. In one step,
  before a customer copies the package.
- Maybe rename the file upload to file uploader (2026-10-06, the user's idea; not decided): `@local/file-uploader`,
  `<file-uploader>`, stressing that the component does the uploading (queue, the app's `upload` per file, progress,
  cancel, retry, statuses, results), not only the choosing. "File dropzone" was weighed and dropped: a dropzone
  elsewhere only hands over files (Mantine's `Dropzone`, react-dropzone), so half of the component would be missed.
  Keeping "file upload" is fine too (the common name for this scope: Ant Design's `Upload`, FilePond). If done: the
  package and folder, the element (`createFileUploadClass`), the React wrapper, the CSS custom properties, the i18n
  namespace, the demos, the Board Manager and the Media Manager (their upload drawers) and the docs.
- The overlays' React demo CSS (`packages/overlays/src/demo/react.css`, imported by its `react.tsx`) is global: on
  this page it reaches every demo, e.g. its error badge of Mantine's `TextInput` (`.mantine-TextInput-error`) appeared
  in the board manager. The board manager now has its own (`board-manager.css`, for all Mantine inputs, 2026-10-02).
  Decide how to keep a package's demo CSS inside its demo (a scope class on the demo element, or CSS modules).
