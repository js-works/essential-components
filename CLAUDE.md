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
- The conversation may be German; the project's language is English (see the conventions).
- Never run `git commit` or `git push`.
  - The user does this personally.
  - This overrides any default attribution or commit guidance.
- Never read, list or scan anything outside this repository.
  - Only the user may explicitly grant an exception for a specific path.
- These working rules are for this repository only (the user's way of working); they are not copied with a package.
- Each package has its own `CLAUDE.md`, with only its own rules and decisions. Its rules apply to changes in that
  package.
- The root's own demos have one each too: `demo/file-center/CLAUDE.md`, `demo/board-manager/CLAUDE.md`,
  `demo/user-manager/CLAUDE.md`, `demo/time-tracker/CLAUDE.md`, `demo/human-resources/CLAUDE.md` (loaded when working there). Their details go there, not into this file; add behavior details decided for them there, in the same
  step as the code.

## Conventions

The rules for code, CSS and texts of every package (2026-10-10, the user's decision): `docs/conventions/`, the master.
Each package has a copy in its own `docs/conventions/` (copied by hand after a change, like `ui.css`; no sync script)
and imports the files it needs from its `CLAUDE.md`.

@docs/conventions/general.md
@docs/conventions/css.md
@docs/conventions/typescript.md
@docs/conventions/i18n.md
@docs/conventions/react.md

## Layout

- `packages/`: the components, npm workspaces (`"workspaces": ["packages/*"]`), each private and self-contained, so it
  can be copied as it is:
  - `data-table` (`@local/data-table`, 2026-10-10; the data navigator, `@local/data-navigator`, before: it was planned
    for npm): a data table: a custom element, and a React component (`/react`). Not "data grid": that means a
    spreadsheet (cell-by-cell editing, the ARIA `grid` role).
  - `file-upload` (`@local/file-upload`): a file upload custom element, with a React wrapper.
  - `overlays` (`@local/overlays`): dialogs and toasts.
  - `form-validation` (`@local/form-validation`): form validation for React with Zod, a `useForm` hook. Tests, and a
    small demo (2026-10-07, `npm run dev` inside it).
  - `cockpit` (`@local/cockpit`, `createCockpitClass()`; `app-cockpit` until 2026-10-11, the user's wish: the host
    chooses the tag; the root page registers `<app-cockpit>`): an admin panel shell for office mini-apps
    (micro-frontends): only a sidebar with the apps (search, recent, groups; from a few apps up to hundreds); the
    open app fills the rest. Lit in its shadow DOM (its own menus and native `<dialog>`s since 2026-10-08; Zag.js before), styled with the `ui-*` tokens. The root's demo page uses it.
  - `login` (`@local/login`, 2026-10-03; `app-login` until 2026-10-10, the user's wish: the "app" added nothing): a generic login screen for apps (React, Mantine): `LoginScreen`, and
    `mountLoginScreen()` for a host without React. The root page shows it when signed out.
  - `mantine-themes` (`@local/mantine-themes`, 2026-10-04): a few nicer Mantine themes, to be used easily:
    `createMantineTheme({ colors, size, variant })` gives the theme and the CSS variables resolver for a
    `MantineProvider`; named color setups; `modernTheme` (small corners, a bit more contrast), which the root's three
    apps use (2026-10-04, merged into their own themes); a demo.
  - `rich-text` (`@local/rich-text`, 2026-10-17): a rich-text editor for Mantine apps (React), built on BlockNote:
    `RichTextEditor` (a Mantine field) and `RichText` (read-only); values as BlockNote's JSON, HTML or Markdown;
    generic mentions. A demo (`npm run dev` inside it). The Board Manager's minutes use it (2026-10-17).
  - `micro-app` (`@local/micro-app`, 2026-10-17): opinionated building blocks for the cockpit's micro-apps (Mantine,
    TanStack Router, react-i18next): the header, the look, the scope, the hash history, the table with its actions and
    saved filters, the form hook (see its `CLAUDE.md`). All five root apps are built on it (2026-10-17). A demo
    (`npm run dev` inside it). See the TODO.
  - `ui-theme` (`@local/ui-theme`, 2026-10-06): the master of the design language (`ui.css`, `ui.ts`) in `src/`. No
    package depends on it (nothing is imported from it): the copies stay in each project (see `demo/ui/` below). No
    demo page yet (see the TODO).
  - A package keeps its own tests, demo (`npm run dev` inside it) and `package-lock.json` (unused in the workspace,
    where the root lock file counts; it matters again in a standalone copy).
- The root is the demo page of all packages:
  - `index.html`: an `<app-cockpit>` (2026-10-03, `packages/cockpit`) that fills the window: the demos are its
    mini-apps, in two sections (groups, 2026-10-07, the user's wish), each with folders (subgroups: collapsible, with a count, their apps indented along a guide line):
    - "Main" (2026-10-07; "Apps" before): the folders "Apps" with "Human Resources" (2026-10-08),
      "Time Tracker" (2026-10-06), "Board Manager", and "Administration" (gear icon) with "File Center" (2026-10-08;
      "Media Manager", then "Drive" for a few hours, before), "User Manager" (two folders since 2026-10-08, the user's
      wish: one folder "Applications" with all five before; in this order since 2026-10-08, the user's wish); the long names, also as their
      titles: short ones collided with their modules; two words each (2026-10-08, the user's rule: balanced in the menu,
      and a valid custom element name of its own, like `<board-manager>`),
      decided 2026-10-03.
    - "Internals": the folders
      "Components" ("Data table", "File upload", "Dialogs + Toasts", "Form validation" (2026-10-07; a "Planned"
      placeholder before), "Rich text" (2026-10-17, `packages/rich-text/demo/rich-text-demo.tsx`), "Micro-app" (2026-10-17,
      `packages/micro-app/demo/micro-app-demo.tsx`)) and "Planned" ("Autocomplete"; placeholders of `demo/planned/planned-demo.ts` (`planned-demo`): what it will be, and that there is
      no demo yet, in a light gray box with rounded corners, `demo.css`).
    - The apps of "Apps" are pinned (`placement: 'pinned'`, 2026-10-08, the user's wish; File Center and User Manager
      too for a few hours): entries of
      their own, first (the topbar's line; the top of the rail; the start page); the expanded sidebar and the search
      keep their folders. The folder "Administration" is pinned too (`placement` of a subgroup, 2026-10-08, the user's
      wish): in the topbar a dropdown after them, in the rail its flyout button. The topbar: Human Resources, Time
      Tracker, Board Manager, Administration ▾, then "Internals" ("Main" is gone there: all of it is pinned).
    - The cockpit's taskbar (`taskbar: true`, 2026-10-07): the opened apps below the open one, to switch and close.
    - No "Recent" section (`recent: false`); the cockpit's `FEW` is 8 since 2026-10-07 (the sidebar of many apps); the groups are plain headings, not collapsible (`collapsibleGroups: false`).
    - The folders "Components" and "Planned" have icons ("Apps" and "Administration" none since 2026-10-09, the user's wish), and the five apps of "Main" (2026-10-07; the icons of their own app headers); the apps of "Internals" have none.
    - History: one group "Essentials" with these as subgroups, shown one at a time by the cockpit's group select, and
      two made-up groups ("Human Resources", "Finance") to show a larger navigation: all removed.
      In the cockpit's footer the cockpit's navigation (one button, 2026-10-03: which one, one attribute `nav` (2026-10-04; its values `auto`, `side`, `top`, `top-switcher`, `bottom`; `top` the topbar of one line with the groups as two-pane menus since 2026-10-08, `top-compact` before, when `top` was a topbar of two lines, removed that day): automatic (the sidebar, the bottom bar in a narrow window; the page's default until 2026-10-08), sidebar, topbar (the page's default since 2026-10-08, the user's wish: `nav: 'top'` of `navigationSetting`), app switcher, or bottom bar,
      and its colors, dark or like the page; dark by default since 2026-10-08, the user's wish: `navigationSetting(…,
      { scheme: 'dark' })` in `demo/main.ts`; a stored choice counts; the cockpit's own demo keeps "Match page" ("Like the page" until 2026-10-08)), the accent color (2026-10-03: one of Mantine's usual colors, indigo by default since 2026-10-07 (violet before; the cockpit's own demo keeps violet), or "Design language", i.e. `ui.css`'s; it sets the cockpit's `theme` (2026-10-10; the cockpit read `--app-accent-color` before) and `--app-accent-color` on `<html>`, which `demo/demo.css` maps to the apps' `--board-manager-accent-color`, `--file-center-accent-color`, `--user-manager-accent-color`, `--time-tracker-accent-color`, `--human-resources-accent-color`, with the design language's accent as the fallback, so the cockpit and the apps have one color; the package demos keep `ui.css`'s) and the page's settings (the language `en-US`/`de-DE` in the kebab menu, 2026-10-03; a section "Prototypes" there, before "Reset demo",
      only on the root page (2026-10-09, `demo/main.ts`): "Filter drawer", a check item that switches every data
      table to the filter drawer, on by default since 2026-10-11 (the user's wish; off before), see the todo in `packages/data-table/CLAUDE.md`; the color scheme: System, Light (the default), Dark, 2026-10-03; from
      `packages/cockpit/demo/footer.ts`, with a made-up menu), which change `<html>` (`lang`, `data-scheme`) for every
      demo.
    - Signing out (2026-10-03; the user menu's "Sign out") shows the login screen (`packages/login`; its subtitle "Welcome to Acme Corporate", 2026-10-07) in place of
      the cockpit (`hidden`), animated (2026-10-04): the cockpit fades out (250 ms), then the login screen fades in (350 ms;
      `demo/demo.css`, `signOut()` in `demo/main.ts`; none with reduced motion); any username and password sign in again (after 500 ms); with "Forgot password?" and "Create an account" (made-up
      server: the username "taken" exists already) and made-up providers ("Continue with Microsoft", "Google", "Company SSO"),
      which sign in after 700 ms. Signed out is remembered per
      browser (`demo-page:signed-in`). Its accent is the page's, as one of Mantine's colors (`loginAccent()` in `demo/main.ts`, the login's `theme`
      option; the design language's: Mantine's blue; `--app-login-accent-color` in `demo/demo.css` until 2026-10-10).
    - The URL hash: the app's id first, then one segment per level of tabs inside it: `#file-upload/react`,
      `#dialogs-toasts/react-i18n`, `#board-manager/boards/b1`. No hash: Human Resources (the cockpit's `defaultItem`, 2026-10-08, the user's wish; the start page for a few hours that day, Human Resources before, the Board Manager since 2026-10-03 before that). The cockpit's start page (the attribute `start-page`, set by the footer's "Navigation" menu, "Start page": On by default, Off switchable; 2026-10-08, the user's wish: the title, the filter, the apps as cards by folder) shows when every app is closed, and by the logo.
      - The browser's Back and Forward (2026-10-07, the user's wish; before, the apps only replaced the hash): opening a
        cockpit app is a new history entry (the cockpit's `pushState`), and so is every new page inside the root's five
        apps (`mirrorInHash` of `@local/micro-app` since 2026-10-17; `app/hash-history.ts`, the same file in each, before). Their memory routers follow the
        browser's Back and Forward, and their own Back and Forward buttons move the browser too (unless another app was
        used in between: then they replace the entry). The package demos' tabs (`ui.ts`) still only replace the hash.
  - `demo/main.ts`: creates the cockpit (`createCockpitClass`, title "Back Office", subtitle "Acme Corporate" (2026-10-03; "App Center" without a subtitle before), with the search, a made-up
    signed-in user) with
    the demos. Each is loaded when it is opened
    the first time (`load`: a dynamic `import()` by a relative path, e.g. `../packages/file-upload/src/demo/file-upload-demo.js`)
    and registered then (`data-table-demo`, `file-upload-demo`, `overlays-demo`; the root's own `file-center-demo`,
    `board-manager-demo`, `user-manager-demo`, `time-tracker-demo` and `human-resources-demo`). Each demo element is a light DOM custom element of its package (see "Demo element" in
    the package's `CLAUDE.md`), exported and not registered.
  - `demo/file-center/`: the "File Center" app (2026-10-08; the "Media Manager", `demo/media-manager/`, before), a demo of the
    root (not of a package): a small file manager (storages, folders and files: a folder tree, a data table per
    folder, dialogs and toasts, a file upload in a drawer; the modules Overview, Files, Recent, Favorites, Trash), in
    the Board Manager's look (Mantine). Built in the Board Manager's target structure (domain, `infra/in-memory/`,
    a service per feature, TanStack Query). Details: `demo/file-center/CLAUDE.md`.
  - The root's apps (File Center, Board Manager, User Manager, Time Tracker, Human Resources) work standalone and embedded (e.g. in the cockpit):
    no greetings like "Welcome" on their start pages, and no "Home" (2026-10-03): the start page is "Main" (the Board Manager's is "Overview" since 2026-10-04, the User Manager's since 2026-10-08, the user's wishes) (German
    "Hauptseite"): its title, its menu entry. The breadcrumb starts with a house icon and the label "Home" (2026-10-04, the
    user's wish; the icon only, labeled "Overview", before): a link to the start page; on the start page itself the same, not clickable (the current page); the app icon in the app header is only an
    icon, not a link (2026-10-04; a link to the start page before).
  - `demo/user-manager/`: the "User Manager" app, a demo of the root: users, groups, roles and grants (who has which
    role where, on a scope tree, inherited downwards; allow only), with a check of access that says why. The Board
    Manager's look, the File Center's architecture. Details: `demo/user-manager/CLAUDE.md`.
  - `demo/human-resources/`: the "Human Resources" app (2026-10-08), a demo of the root: employees (job, salary
    history, documents), departments with an org chart, recruiting (openings, a pipeline board, the hire), onboarding
    and offboarding checklists. The Board Manager's look and UX, the Time Tracker's architecture; no leave or time (the
    Time Tracker has them). Details: `demo/human-resources/CLAUDE.md`.
  - `demo/time-tracker/`: the "Time Tracker" app (2026-10-06), a demo of the root: the clock (clock in and out, breaks),
    timesheets with corrections, leave requests and their approval, sick calls with the doctor's note, a team calendar
    of who is off when, and the employees; a role switch (employee or team lead). The Board Manager's look (also its
    full-height layout) and texts (i18next, en/de), the User Manager's architecture; data tables, overlays,
    form-validation and the file upload. Details: `demo/time-tracker/CLAUDE.md`.
  - `demo/board-manager/`: the "Board Manager" app, a demo of the root (a small app, not a product): boards and
    committees, their meetings, agendas, minutes and documents, with Mantine, TanStack Router, Zustand and all three
    packages; also as a `<board-manager>` element for a host page (`npm run build:board-manager`). Details:
    `demo/board-manager/CLAUDE.md`.
  - `demo/demo.css`: (2026-10-04: the apps' own text size, `--board-manager-font-size` and the like, the same `14px` as the cockpit's `theme.fontSize` in `demo/main.ts`: one text size for the shell and the apps; it read the cockpit's `--app-cockpit-font-size` until 2026-10-10) only what is specific to this page: the cockpit fills the window (`100dvh`). (Its frame is not
    selectable, by the cockpit's own CSS; inside the demos, selecting stays as their packages have it.)
  - `demo/ui/`: the design language (`ui.css`, `ui.ts`), the same files as in every package. The master is
    `packages/ui-theme/src/` (2026-10-06): change it there, then copy the change into all copies by hand (`demo/ui/`
    here, and in each package; no sync script, the user's decision). Read the header of `ui.css` before changing it.
    - Its `ui-*` tokens are the default look: the packages' default themes follow them, and a change of a token is
      made in the packages' defaults too. The radius: `--ui-radius-sm: 2px` for controls (inputs, selects, menus);
      the data table's `radius` is `2px`, the file upload's small parts `2px` (its thumbnails and tooltip), its preview dialog `6px`.
      Buttons: `--ui-radius-md: 5px`; the data table's `buttonRadius`, the file upload's `buttonBorderRadius`
      and the overlays' `actionRadius` (dialog buttons) are `5px`. The default theme (the `ui-*` values) is the same in every
      package that has it, and MUST NOT be changed in just one of them (2026-10-04, the user's rule: the data table
      had `2px` buttons and other values for a while, put back). Larger surfaces are a bit rounder: the file
      upload's frame `4px`, dialogs `6px` (`--ui-radius-lg`), toasts `5px`. (2026-10-04: the tokens were `--ui-radius` and
      `--ui-button-radius`; `--ui-popup-padding` is gone, a plain `3px` in the select picker.)
- `old-demos/<version>/`: frozen, compiled demo pages of older versions (relative base `./`, so they work under any
  path). Never edit them.
  - `npm run freeze-demo` builds the current demo into `old-demos/<version of the root package.json>/` (it refuses an
    existing folder). So: freeze first, then raise the version in the root `package.json`.
  - The deploy workflow copies `old-demos/` into `dist/`: https://js-works.github.io/essential-components/old-demos/0.0.0/
- `vite.routes.ts` (2026-10-18): TanStack Router's plugin for the apps with file-based routes (each app's `routes/`,
  its tree generated into `.generated/route-tree.ts` of the app, not checked in, both set in the app's `tsr.config.json`, which `npm run routes`
  reads too), used by both Vite configs. Only its generator (`tanstackRouterGenerator`): the full plugin's HMR code in
  the route files patches the page's last router (`window.__TSR_ROUTER__`), another app's in the cockpit, so the Board
  Manager showed the previously opened app's layout. Open: each generated tree declares its
  routes globally (`FileRoutesByPath`), so two apps with file routes in the root's `tsc` program may conflict; to be
  checked with the second app.
- `vite.config.ts`: `resolve.dedupe` makes all demos use one React, even where a package pins its own version (e.g.
  `overlays`, which gets a nested one in its `node_modules`).
- The apps import the packages by name (2026-10-15, the user's choice, about 70%; relative paths into `packages/*/src/`
  before): `@local/data-table/react`, `@local/overlays/react`, … The packages' `exports` have a `source` condition
  (their files in `src/`) before `dist/`; `vite.config.ts` and `vite.board-manager.config.ts` resolve it
  (`resolve.conditions: ['source', ...defaultClientConditions]`), `tsconfig.json` too (`customConditions`). So no
  package needs a build for the demo. Weighed: an alias per package and entry in the Vite config and `paths` (two
  places to keep in sync). The package demos (`packages/*/demo/…`, their `i18n.js` too) stay relative: they are no
  entries.
- `tsconfig.json`: `tsc` also checks the imported demo files, so the compiler options are the loosest common set: like
  `data-table`/`file-upload`, but with `experimentalDecorators`, `ES2025`/`ESNext`, and without
  `noUncheckedIndexedAccess` and `noImplicitOverride` (the `overlays` code is not written for them; each package still
  checks its own code strictly). It excludes the apps' `app/router-types.ts`: each of the five apps has a
  `tsconfig.json` of its own (`"exclude": []`) that registers its TanStack router (`Register`), so its links and params
  are type-checked; `npm run typecheck` runs the root's check, then each app's (2026-10-17, the user's choice: a
  registration is global, one per TypeScript program).

- `.github/workflows/deploy-demo.yml`: on every push to `main` (and by hand), runs `npm ci`, the tests of
  `data-table` and `file-upload` (without its browser-mode project, which needs Chromium), builds the page
  (`build:pages`) and publishes it on GitHub Pages: https://js-works.github.io/essential-components/
  - The repository needs "Settings → Pages → Build and deployment → Source: GitHub Actions".
  - Workflows only run from the root: the one inside `packages/data-table/.github/` does nothing here (it is kept for
    a standalone copy).

## Stack

- TypeScript (strict), Vite, npm workspaces. The root has dev dependencies (`vite`, `typescript`,
  `@vitejs/plugin-react`, `react`, `react-dom`, their types, `dprint`, `@biomejs/biome` (only its organize imports, 2026-10-17); for the board manager `@mantine/core`,
  `@mantine/hooks`, `react-router` (no longer imported since 2026-10-17: to be removed)) and `@tanstack/react-router` (the
  apps' routing, 2026-10-17) with `@tanstack/router-plugin` (its file-based routes, 2026-10-18, pinned to `1.168.42`, the
  version for the router's `1.170.41`; so far the Board Manager only, `vite.routes.ts`) and `@tanstack/router-cli`
  (`tsr generate`, `npm run routes`, before every typecheck; pinned to `1.167.40`, the plugin's generator), and `zustand`, `react-icons` (the board manager's icons: its Tabler set, `tb`),
  `@mantine/dates` with `dayjs` (pinned to the versions the workspace has from `overlays`: `9.5.1`, `1.11.23`),
  `i18next` (the board manager's translations), `zod` (the schemas of `form-validation` in the board manager),
  `@tanstack/react-query` (the reads and changes of the board manager, the file center and the user manager).
  `@mantine/form` was removed (2026-10-02): the board manager's forms use `form-validation`.
- No overscroll (2026-10-08, the user's wish): see `docs/conventions/css.md`; the root's apps follow it too.
- Tables in the root's apps: 50 rows a page by default (2026-10-08, the user's wish; 10 or 25 before, set per table):
  the default of each app's `DataTable` wrapper (`pageSize={50}` before the table's own props), and no table sets its
  own, except the two of the Board Manager's meeting page that show everything on one page (the agenda: 50, its
  sections: 100). The package's own default stays 25.
- No `useMemo` around a table's `columns`, `actions` or `source` in the root's apps (2026-10-14, the user's rule: more
  work in a package, no boilerplate in the apps): the data table takes new ones on every render (see "No `useMemo`
  needed" in `packages/data-table/CLAUDE.md`). `useMemo` stays only for real computations (e.g. a list of options
  from the data, the Board Manager's sections draft).
- Names of table components in the root's apps (2026-10-15, the user's decision): the singular stem, like every other
  name of the concept (`MemberTable` with `MemberRow`, `MemberForm`; an English compound: "member table"), not the
  plural (`MembersTable`). Rolled out the same day: `MeetingTable`, `PersonTable`, `MembershipTable`,
  `DocumentTable` (Board Manager, Human Resources), `GrantTable`, `CandidateTable`.
- The structure of a table in the root's apps (2026-10-15, the user's wishes, step by step on the Board Manager's
  members table, then rolled out to all five apps; target rewritten the same day):
  - A table is a component of its own file (`features/<x>/components/<name>-table.tsx`, `<Name>Table`), also when it
    is the whole page (2026-10-17, the user's choice, proposed at about 60%; a module's list was its page before, e.g.
    `UsersPage`): the page only renders it (`function BoardsPage() { return <BoardTable />; }`, the User Manager's with
    its `PageHeader` around it). Moved the same day: `BoardTable`, `OrganizationTable` (Board Manager), `RecentTable`,
    `FavoriteTable`, `TrashTable` (File Center, in a `components/` of their feature), `EmployeeTable`, `OpeningTable`,
    `ChecklistTable` (Human Resources), `EmployeeTable` (Time Tracker), `UserTable`, `GroupTable`, `RoleTable`,
    `PermissionTable` (User Manager).
  - Its columns, filters and actions are hooks of its file, outside the component (2026-10-15, the user's choice,
    proposed at about 70%, like MUI: React does the wiring, nothing is passed by hand): `useColumns()`, `useFilters()`,
    `useActions(boardId)` (function declarations; the same names in every table file, a convention), each taking what
    it needs itself (`t`, a service, the flow hooks), called at the top of the component (`const columns =
    useColumns();`, not inside the JSX: the rules of hooks, the linters). The way there, the same day: `columnsOf(t)`,
    `filtersOf(t)`, `actionsOf(t, ctx)` (then `createColumns(t)` and `createFilters(t)`, the actions in the component);
    a context of the package (`context` in the config, `columns={createColumns}`, AG Grid's way) was weighed and dropped
    (a second mechanism for little: `(t)` per table). A plain constant when the columns depend on nothing (the apps
    without texts).
  - Its rows likewise (2026-10-17, the user's choice, proposed at about 75%; inline in the component before):
    `useSource(board): RowSource<Row>`, named after the prop like the others (not `useQuery`: TanStack's hook of that
    name is used beneath it). The first of the hooks, in the file and in the calls (2026-10-17, the user's choice,
    proposed at about 65%): the data first. The sort keys are the domain's (2026-10-17, the user's choice, proposed at
    about 65%; a `SORT_KEYS` of the table before): a constant beside the type, which comes from it, like `ROLES` and
    `Role` (`BOARD_MEMBER_SORT_KEYS`, `BoardMemberSortKey`). The table's query as the domain's criteria:
    `criteriaOf<C>('text', { name: 'names' })` of the data table (2026-10-17, the user's choice, proposed at about 65%;
    of the Board Manager's `shared/lib/table-query.ts` for a few hours, with the search always as `text`; then `{
    search, filters }` for a few hours): the search under the key given first, each filter under its key or the one the
    renames give it (checked against the criteria's keys; the values unchecked, like the cast before); `useFindSource`
    uses the data table's `sortOf` and `pagingOf`. The way there, the same day: a function `toCriteria` beside the hook,
    then inline in it, both with a cast of `query.filters`; weighed: the domain's keys like the filter keys (the UI
    would shape the domain), the filter keys like the domain's (needs a filter label of its own, a todo of the data
    table); the filters take the criteria's keys, with a label of their own where the key is not their column's (the
    data table's `{ label, filter }`), so no renames are needed: `names: { label: t('boards.columns.person'), filter:
    personFilter(…) }` and `criteriaOf<BoardMemberCriteria>('text')` (2026-10-17, the user's wish, worked out on
    `MemberTable`, then rolled out to every table of the Board Manager and the File Center; the label repeats the
    column's header, which is fine, the user said; the colleagues' saved filters took the new keys, a filter saved in
    `localStorage` with an old key no longer applies); the find passes its arguments on (`(...args) =>
    service.findMembers(board.id, ...args)`, 2026-10-17). Worked out on the Board Manager's `MemberTable`, rolled out
    the same day to every table of the Board Manager and the File Center, which have a repository's `find`:
    `useFindSource` of `@local/data-table/react-query` (the same file in both apps, `shared/lib/table-query.ts`, until
    the same day); a criterion the filters do not give is added to the mapped ones (`(query) => ({ ...toCriteria(query),
    organizationId })`). The User Manager, Human Resources and the Time Tracker filter on the client (the data table's
    `localPage`), so they have no `criteriaOf`. No `tableCtrl` (2026-10-17): the source reports a change itself (the
    data table's `onChange` of a source, `useQuerySource` of `@local/data-table/react-query` gives `{ load, onChange }`;
    the same file in each of the five apps, `shared/lib/use-query-source.ts`, until the same day), so a table needs a
    controller only for what else it does (e.g. the Board Manager's sections, `addRow`). Rolled out to every table of
    the five apps the same day.
  - What the actions do lives outside the component, in flows. The target (2026-10-15, the user's decisions, worked out
    on the Board Manager's `MemberTable`, the rollout to the other tables later):
    - One hook per flow, a use case each (separation of concerns; a hook per subject, `useMemberFlows`, was proposed and
      dropped): `useAddMemberFlow(boardId)` gives the function the action calls (`features/<x>/flows/use…Flow.tsx`). A
      hook, not a plain function with a context (that was the state for a few hours: plain flows in `<x>Flows.tsx` with
      `TableContext<Row>` of `shared/lib/flows.ts`): it takes the dialogs, toasts and `t` itself.
    - Early returns: `const result = await dialogs.form(…); if (result.canceled) { return; }`.
    - A flow does not know a table: the table follows the data itself (its queries through TanStack Query: a flow calls `changed()`, the
      tables reload; the Board Manager's `useReloadOnChange(tableCtrl)`, a subscription to its store, until 2026-10-16),
      so a flow can be used
      anywhere (a button on an overview).
    - The table's controller is `tableCtrl` (`nav` before, from the package's old name, the data navigator).
    - No comments in a table's file that do not help (2026-10-17, the user's wish; 2026-10-16 only above `useColumns`,
      `useFilters`, `useActions` and a table's `const columns`, `const filters`): none above the table component (what
      the table is), none that repeat a name, none with history (the code rule). Only what the code does not show
      stays: why (a column without data, a value fixed with `useState`), an order, the meaning of a field. What a table
      does that is not obvious goes into the app's `CLAUDE.md`. Applied to every table of the five apps the same day.
    - Explicit types, not the data table's `defineColumns`, `defineFilters`, `defineActions` (2026-10-15, the user's
      wish: they were not the best idea): `useColumns(): TableColumns<Row>`, `useFilters(): TableFilters`,
      `useActions(…): TableActions<Row>` (the list types of the data table, 2026-10-15).
    - Rolled out to every table of the five apps (2026-10-15/16). The other four apps' flow hooks per subject
      (`useEmployeeFlows()` …) were split, one hook per use case, in the features' `flows.tsx`; the File Center's
      `useEntryActions` became `entry-flows.tsx`. Tables there follow the data by their queries (`changed()`).
  - A filter of a domain concept lives in the feature that owns it (`features/<x>/<subject>-filters.ts`, through its `index.ts`
    where the app has that rule), however many tables use it; generic ones (`textFilter()`, `dateRangeFilter()`) stay
    inline. A filter that needs texts or data is a function of them (`roleFilter(t)`, `boardFilter(boards)`), not a
    hook: it is called inside `filtersOf`.
- The standard actions of a table in the root's apps (2026-10-14, the user's choice of three, proposed at about 70%):
  builders of `useTableActions()` of `@local/micro-app` (2026-10-17; `<app>/shared/ui/table-actions.ts` before, plain functions since 2026-10-15, the user's wish: the hook
  `useTableActions()` before, only for `t`; their texts from `translate()` when called: `newAction(label, onClick)`,
  `openAction(onClick)`, `editAction(onClick)`, `deleteAction(onClick)`, each with a few options: `key`, `label`, `tip`,
  `show`, `default`, `contextMenu`, `visible`; a `label` replaces the standard tip, 2026-10-15), in the app's look and
  texts; an `onClick` may return a promise (no `void`). The other actions use the data table's builders
  (2026-10-15, the user's choice: `generalAction(key, onClick, fields)`, `singleRowAction`, `multiRowAction`,
  `groupAction` of `@local/data-table/react`, on which the standard ones are built); menus stay plain objects. The
  lists without a type annotation (2026-10-15, the user's wish): `defineColumns<Row>([…])`, `defineActions<Row>([…])`,
  `defineFilters({…})` of the data table (a single column, e.g. one shared by two tables, keeps its `TableColumn<Row>`). The same
  file in each of the five apps (a change goes into all five), except the texts (i18n or English) and the Board
  Manager's look (Edit with its label, Delete not red, as before). Weighed: one `crudActions({ … })` call per table
  (extra actions harder to fit in), presets in `@local/data-table` (the icons and rules are the apps').
- Saved filters in the root's apps (2026-10-11, the user's wish; the data table's `savedFilters`): only in the main
  tables of the modules with at least two filters, never on a record's page (e.g. a meeting's documents, a board's
  meetings), nor in Trash. Board Manager: Boards, Meetings, Members, Organizations; File Center: Files, Recent,
  Favorites; Human Resources: Employees, Recruiting, Checklists; Time Tracker: Employees, Leave (the team's tab); User
  Manager: Users, Access. Each with 2 or 3 made-up colleagues' shared filters (first in the list, not removable; date
  ranges relative to today) and the user's own, with sharing (one user here: own shared ones are only marked).
  - Data like any other (2026-10-17, the user's choice, proposed at about 60%; before, the colleagues' filters were in
    the table components, and each table chose its `localStorage` key): the domain's `SavedFilterRepository` (`list`,
    `save`, `remove`, `setShared` by the table's name, e.g. `boards`, `team-leave`; `domain/saved-filter.ts`), the
    in-memory one (`infra/in-memory/saved-filter-repository.ts`: the others' filters given to it, the user's own per
    browser in `localStorage` under `<app>:saved-filters:<table>`, the keys of before), and `useSavedTableFilters(table)` of
    `@local/micro-app` (2026-10-17; `useSavedFilters(table)` of `shared/ui/saved-filters.ts` before), the data table's `useSavedFilters(store, table)` over the app's repository (over
    TanStack Query in the app for a few hours the same day), the repository given by the app (`MicroAppProvider`'s `savedFilters`). These
    three files are the same in each of the five apps (a change goes into all five); the colleagues' filters are each
    app's (`infra/in-memory/saved-filter-seed.ts`). A table only calls `useSavedFilters('boards')`.
- The toolbar of a table in the root's apps (2026-10-09, the user's wish): one action in the accent
  (`variant: 'primary'`), normally the "New …" or "Add …" one, else the main one (an upload, "Report sick"); the
  others secondary (a danger one stays danger; File Center's Files: `tertiary`, ghost buttons, 2026-10-11, the user's
  wish). Every "New …" and "Add …" action has the plus icon (`appIcons.add`,
  Tabler's `TbPlus`), not a specific one (a user plus, a folder plus).
- The vertical position of the overlays' dialogs (2026-10-08, the user's wish; `packages/overlays/src/main/dialogs/
  element/styles.ts`): every centered dialog (not a drawer, not maximized) sits a bit above the middle, the free
  space split 40/60 above and below it, never closer than 2em to the top, and never past the bottom (its
  `max-height`). CSS only: the top edge at `50dvh`, then `translate: 0 max(calc(2em - 50dvh), calc(-40% - 10dvh))`
  (a percentage of `translate` is the dialog's own height). Before: most dialogs at a top anchor (12dvh; a tall one
  ran past the bottom), forms and wide ones exactly centered. A note added to a form (a failed save) moves it up by
  40% of the note's height. The `translate` makes the dialog the containing block of fixed popups inside it (a date picker's
  calendar, a select's list, `floatingStrategy: 'fixed'`), so the open dialog does not clip (2026-10-10, `overflow:
  visible`; `hidden` before, which cut off the calendar in the Board Manager's "Edit meeting"): its body scrolls.
- Browsers (2026-10-03): see `docs/conventions/general.md`; the root's and the Board Manager's Vite configs build
  the same way (`es2024` for the JavaScript, `esnext` for the CSS, since 2026-10-16; `esnext` for both before). The default target lowered `light-dark()` into variables that follow the page's color scheme, not
  the element's `color-scheme`: on the published page the cockpit's dark sidebar and menus got light colors.
- `.npmrc` (the root one counts in a workspace; npm ignores those of the packages): `ignore-scripts=true`,
  `min-release-age=7`.
  - The first workspace install (2026-09-26) was run once with `--min-release-age=5`, because `antd@6.6.5` (a dev
    dependency of `data-table`) was only six days old.
- `.editorconfig` and dprint (`dprint.json`), line width 120, single quotes; the imports by Biome (`biome.json`); both
  skip the generated `.generated/` folders (gitignored, hidden in VSCodium by `.vscode/settings.json`). The root's dprint excludes `packages/`: each
  package keeps its own formatting (`overlays` uses double quotes and no dprint), so run a package's formatter inside it.

## Commands

- `npm install`: all packages (one `node_modules` at the root, nested ones only where versions differ).
- `npm run dev`: the demo page of all packages. `npm run dev -w @local/file-upload` (etc.): the demo of one package.
- `npm run build`: typecheck + build the demo page into `dist/`.
- `npm run build:pages`: the same for GitHub Pages (`vite build --mode pages`, base `/essential-components/`).
- `npm run build:board-manager`: the `<board-manager>` element as one module into `dist-board-manager/`.
- `npm run typecheck`: first `npm run routes` (the apps' route trees, `tsr generate`), then `tsc` for the root and each app.
- `npm run format`: Biome's organize imports (`biome check --write`; its formatter and linter off, `biome.json`), then
  dprint. `npm run format:check`: both checks. Biome only sorts and groups the imports (see
  `docs/conventions/typescript.md`); dprint formats and leaves the imports' order and their names' order to it
  (`module.sortImportDeclarations`, `importDeclaration.sortNamedImports`, `exportDeclaration.sortNamedExports`,
  `module.sortExportDeclarations` since 2026-10-17: `maintain`). Biome covers the packages too (2026-10-17, the user's wish; their own dprint configs got the same
  three `maintain`), the root's dprint does not (each package runs its own). (2026-10-17, the user's choice of Biome over ESLint with
  `simple-import-sort`, proposed at about 60%: one dependency with no transitive ones, and the linter question stays
  open; our own script `scripts/import-spacing.mjs` for a few hours before.)
- The tests run inside a package (`npm test -w @local/file-upload`, …).

## TODO

- `@local/micro-app` (2026-10-17, the user's decision; to be discussed step by step): a tier-2 package of highly
  opinionated building blocks for the cockpit's apps (micro-apps, as in micro frontends), built on Mantine and
  react-i18next. A micro-app has the header of the root's apps (the app icon, the title, the modules as tabs, the
  breadcrumb, Back and Forward); embeddable where possible (not a high priority). The name in every form: BEM
  `micro-app__…`, the i18n namespace `'microApp'`, components `MicroAppHeader`, `MicroAppPage`, … (weighed: `mini-app`,
  which sounds odd, `app-kit`, whose generic BEM block `app__` and namespace `'app'` would collide in customers' code,
  `app-blocks`, `office-kit`, `admin-kit`, `app-shell`, Mantine's `AppShell`). The idea behind it: the cockpit with a
  few ready micro-apps (the File Center, the User Manager) and the ones a customer needs developed on these building
  blocks, together a full app. The router: TanStack Router (2026-10-17, the user's decision, after weighing
  React Router 8, which the root's apps use: React Router's params and links are untyped strings in the mode the apps
  use, typed routes only in its framework mode; TanStack Router's params, search params and links are type-checked, it
  has a memory history for embedded apps, preloading on intent and a typed router context; its code is about the same,
  the routes file about 1.5 times as long), code-based (routes as objects, `createRoute({ getParentRoute, path })`),
  not file-based (that would dictate the files and folders). Links of Mantine through `createLink(Anchor)`.
  `MicroAppHeader` (the first building block): `icon`, `title`, `modules` (the tabs, router links; the start page's
  tab first; a menu when narrow), the breadcrumb from the current route's matches (each route's crumb in its
  `staticData`, "Home" first), Back and Forward through the router's history (disabled at either end; tooltips "Back
  to <page>" from the crumbs). The root's apps would move from React Router to it. The package's own texts ("Home",
  "Back", "Forward", "Back to {page}", the modules menu): English and German in its i18next namespace `'microApp'`,
  exported as resources the app adds to its i18next instance; the building blocks read them with
  `useTranslation('microApp')` (2026-10-17, the user's choice, proposed at about 60%; texts as props weighed).
  The header's look (2026-10-17, the user's choice of the three proposals): two lines (the icon, the title, the tabs
  and Back and Forward on top, the breadcrumb below: it needs the width); narrow, the tabs become a menu (the current
  module and a chevron) and Back and Forward hide (container queries on the header's own width, so it works embedded
  too); sticky at the top while the page scrolls below it.
  Built 2026-10-17: the package with `MicroAppHeader`, then everything the five apps had as copies (the hash history,
  the look, the scope, the form field's error popover, `useForm`, the table actions, the saved filters, the
  `DataTable` wrapper; see its `CLAUDE.md`), and all five apps moved to it and to TanStack Router the same day (the
  user's wish). Open: the contract with
  the cockpit (the signed-in user and the permissions, deep links between micro-apps), and the ready micro-apps as
  packages.
- Decide about the name `TFunction` (2026-10-15, the user's wish; later): i18next's type of its `t`, which the apps'
  translation function has (the Board Manager's `Translate = ReturnType<typeof useTranslate>`, a
  `TFunction<'app', undefined>`). It is no name of ours (none of our files mentions it), but it shows on hover and in
  errors. Open: whether the apps keep their own name for it (`Translate`), name it more plainly (e.g.
  `TranslateFunction`), or use i18next's directly.
- Review the overlays' `attempt.askDiscard()` (2026-10-09, later): the shortcut for the discard question
  (`ask()` with the library's texts, critical, title "Unsaved changes"). Open: is it the right name
  (alternatives: `confirmDiscard()`, `guardUnsaved()`); whether a second shortcut is worth it (e.g. Save / Discard / Keep
  editing, now `ask()` with `choices`).

- The arrow of the validation popover (`FieldError` of the Board Manager, the Time Tracker and the User Manager,
  2026-10-06, the user's idea; later): as high as the message when it has several lines, CSS only. The open popover a
  grid (`auto 1fr`), its `::before` stretched to the text's height (`margin-block: 0.15em`, so one line stays as now),
  drawn by two mask layers: the head as now, pinned to the top (`1.05em`), and the shaft a `linear-gradient` line
  (`0.11em` wide) down the rest. Not the whole arrow scaled up: its width cannot follow its stretched height in CSS
  (scaling it would need a line of script in `FieldError`, measuring the lines). The upload's error badge
  (`::part(error)`, inline) keeps the short arrow.
- A demo page for `packages/ui-theme` (2026-10-06, the user's wish; later): every `ui-*` class and token on one page,
  so a change to the design language can be seen at once.
- The look of the data table (the user does not like it yet; details in its `CLAUDE.md`, "Todo (later)").
- Maybe rename the file upload to file uploader (2026-10-06, the user's idea; not decided): `@local/file-uploader`,
  `<file-uploader>`, stressing that the component does the uploading (queue, the app's `upload` per file, progress,
  cancel, retry, statuses, results), not only the choosing. "File dropzone" was weighed and dropped: a dropzone
  elsewhere only hands over files (Mantine's `Dropzone`, react-dropzone), so half of the component would be missed.
  Keeping "file upload" is fine too (the common name for this scope: Ant Design's `Upload`, FilePond). If done: the
  package and folder, the element (`createFileUploadClass`), the React wrapper, the CSS custom properties, the i18n
  namespace, the demos, the Board Manager and the File Center (their upload drawers) and the docs.
- Discuss the CSS rules in more detail (2026-10-07, the user's wish; later): BEM for CSS without shadow DOM and
  without CSS modules is the rule, the details are open (block names, prefixes per package and app, how far it goes
  in the root's apps, which still style Mantine's classes under their root class, e.g. `.board-manager
  .mantine-InputWrapper-error`). Cause: the overlays' React demo CSS (`packages/overlays/src/demo/react.css`) was
  global, and its error badge of Mantine's `TextInput` (red, with a warning triangle and a nose) appeared in the
  Board Manager's validation popovers once "Dialogs + Toasts" had been opened. Fixed 2026-10-07: its rules are
  scoped to the block `overlays-react-demo-fields`, the wrapper of the dialog's fields (`display: contents`).
- The overlays' dialogs: a dead "Cancel" (2026-10-08, the user's decision: ignored for now). A dialog of a scope that
  has settled (e.g. a critical confirm, while the app deletes) stays on screen with the spinner on its button; its
  "Cancel" (and Escape, ×) still looks usable but does nothing (seen in Human Resources, deleting a department). Fix
  proposed: the controller ignores them once settled and the buttons look disabled, which needs a new field
  `disabled: boolean` in `ActionButtonRender` (the root's five apps draw the buttons themselves, `render.actionButton`
  in their `look.tsx`, and would pass it on).
- The overlays' dialogs: a Reset button for forms (2026-10-08, the user's wish; later, apart from the custom
  `actions`): a built-in role `reset` (`buttons: { reset: 'Reset' }`, forms only, shown only when given; the dialog
  stays open, the form is reset natively, the note removed). Needs form-validation to follow the form's `reset` event
  (controlled components ignore a native reset).
- The overlays' dialogs: review "buttons vs. actions" some day (2026-10-08, the user's wish): two fields now,
  `buttons` (relabels the built-in buttons, changeable by `update()`) and `actions` (buttons of the dialog's own, by id,
  fixed once open). One combined `buttons` was weighed (a role's key relabels, any other key adds a button, which must
  then be an object) and left for later.
- The overlays' dialogs: a submit from the content as Confirm (2026-10-08, dropped for now: no app needs it). For
  dialogs where one click decides ("Choose a template", "Open recent" with a double click, an action sheet): a submit
  of the dialog's form from its content (`<button type="submit" name value>`, `form.requestSubmit()`) would count like
  Confirm, with the submitter's `name`/`value` in the data. Today the adapters swallow it (`preventDefault()`). Two
  guards needed: the library's own `requestSubmit()` on Confirm must not count, and in critical forms only a submit
  with an explicit submitter (no Enter).
