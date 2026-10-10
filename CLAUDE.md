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
  - `app-cockpit` (`@local/app-cockpit`, `<app-cockpit>`): an admin panel shell for office mini-apps
    (micro-frontends): only a sidebar with the apps (search, recent, groups; from a few apps up to hundreds); the
    open app fills the rest. Lit in its shadow DOM (its own menus and native `<dialog>`s since 2026-10-08; Zag.js before), styled with the `ui-*` tokens. The root's demo page uses it.
  - `login` (`@local/login`, 2026-10-03; `app-login` until 2026-10-10, the user's wish: the "app" added nothing): a generic login screen for apps (React, Mantine): `LoginScreen`, and
    `mountLoginScreen()` for a host without React. The root page shows it when signed out.
  - `mantine-themes` (`@local/mantine-themes`, 2026-10-04): a few nicer Mantine themes, to be used easily:
    `createMantineTheme({ colors, size, variant })` gives the theme and the CSS variables resolver for a
    `MantineProvider`; named color setups; `modernTheme` (small corners, a bit more contrast), which the root's three
    apps use (2026-10-04, merged into their own themes); a demo.
  - `ui-theme` (`@local/ui-theme`, 2026-10-06): the master of the design language (`ui.css`, `ui.ts`) in `src/`. No
    package depends on it (nothing is imported from it): the copies stay in each project (see `demo/ui/` below). No
    demo page yet (see the TODO).
  - A package keeps its own tests, demo (`npm run dev` inside it) and `package-lock.json` (unused in the workspace,
    where the root lock file counts; it matters again in a standalone copy).
- The root is the demo page of all packages:
  - `index.html`: an `<app-cockpit>` (2026-10-03, `packages/app-cockpit`) that fills the window: the demos are its
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
      placeholder before)) and "Planned" ("Autocomplete"; placeholders of `demo/planned/PlannedDemo.ts` (`planned-demo`): what it will be, and that there is
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
      table to the filter drawer, see the todo in `packages/data-table/CLAUDE.md`; the color scheme: System, Light (the default), Dark, 2026-10-03; from
      `packages/app-cockpit/demo/footer.ts`, with a made-up menu), which change `<html>` (`lang`, `data-scheme`) for every
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
        apps (`app/hashHistory.ts`, the same file in each: a change goes into all five). Their memory routers follow the
        browser's Back and Forward, and their own Back and Forward buttons move the browser too (unless another app was
        used in between: then they replace the entry). The package demos' tabs (`ui.ts`) still only replace the hash.
  - `demo/main.ts`: creates the cockpit (`createAppCockpitClass`, title "Back Office", subtitle "Acme Corporate" (2026-10-03; "App Center" without a subtitle before), with the search, a made-up
    signed-in user) with
    the demos. Each is loaded when it is opened
    the first time (`load`: a dynamic `import()` by a relative path, e.g. `../packages/file-upload/demo/FileUploadDemo`)
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
    committees, their meetings, agendas, minutes and documents, with Mantine, React Router, Zustand and all three
    packages; also as a `<board-manager>` element for a host page (`npm run build:board-manager`). Details:
    `demo/board-manager/CLAUDE.md`.
  - `demo/demo.css`: (2026-10-04: the apps' own text size, `--board-manager-font-size` and the like, the same `14px` as the cockpit's `theme.fontSize` in `demo/main.ts`: one text size for the shell and the apps; it read the cockpit's `--app-cockpit-font-size` until 2026-10-10) only what is specific to this page: the cockpit fills the window (`100dvh`). (Its frame is not
    selectable, by the cockpit's own CSS; inside the demos, selecting stays as their packages have it.)
  - `demo/ui/`: the design language (`ui.css`, `ui.ts`), the same files as in every package. The master is
    `packages/ui-theme/src/` (2026-10-06): change it there, then copy the change into all copies by hand (`demo/ui/`
    here, and in each package; no sync script, the user's decision). Read the header of `ui.css` before changing it.
    - Its `ui-*` tokens are the default look: the packages' default themes follow them, and a change of a token is
      made in the packages' defaults too. The radius: `--ui-radius-sm: 2px` for controls (inputs, selects, menus);
      the data table's `radius` is `2px`, the file upload's small parts `2px` (half of its `borderRadius`, `4px`).
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
- `vite.config.ts`: `resolve.dedupe` makes all demos use one React, even where a package pins its own version (e.g.
  `overlays`, which gets a nested one in its `node_modules`).
- `tsconfig.json`: `tsc` also checks the imported demo files, so the compiler options are the loosest common set: like
  `data-table`/`file-upload`, but with `experimentalDecorators`, `ES2025`/`ESNext`, and without
  `noUncheckedIndexedAccess` and `noImplicitOverride` (the `overlays` code is not written for them; each package still
  checks its own code strictly).

- `.github/workflows/deploy-demo.yml`: on every push to `main` (and by hand), runs `npm ci`, the tests of
  `data-table` and `file-upload` (without its browser-mode project, which needs Chromium), builds the page
  (`build:pages`) and publishes it on GitHub Pages: https://js-works.github.io/essential-components/
  - The repository needs "Settings → Pages → Build and deployment → Source: GitHub Actions".
  - Workflows only run from the root: the one inside `packages/data-table/.github/` does nothing here (it is kept for
    a standalone copy).

## Stack

- TypeScript (strict), Vite, npm workspaces. The root has dev dependencies (`vite`, `typescript`,
  `@vitejs/plugin-react`, `react`, `react-dom`, their types, `dprint`; for the board manager `@mantine/core`,
  `@mantine/hooks`, `react-router`) and `zustand`, `react-icons` (the board manager's icons: its Tabler set, `tb`),
  `@mantine/dates` with `dayjs` (pinned to the versions the workspace has from `overlays`: `9.5.1`, `1.11.23`),
  `i18next` (the board manager's translations), `zod` (the schemas of `form-validation` in the board manager),
  `@tanstack/react-query` (the reads and changes of the board manager, the file center and the user manager).
  `@mantine/form` was removed (2026-10-02): the board manager's forms use `form-validation`.
- No overscroll (2026-10-08, the user's wish): see `docs/conventions/css.md`; the root's apps follow it too.
- Tables in the root's apps: 50 rows a page by default (2026-10-08, the user's wish; 10 or 25 before, set per table):
  the default of each app's `DataTable` wrapper (`pageSize={50}` before the table's own props), and no table sets its
  own, except the two of the Board Manager's meeting page that show everything on one page (the agenda: 50, its
  sections: 100). The package's own default stays 25.
- The toolbar of a table in the root's apps (2026-10-09, the user's wish): one action in the accent
  (`variant: 'primary'`), normally the "New …" or "Add …" one, else the main one (an upload, "Report sick"); the
  others secondary (a danger one stays danger). Every "New …" and "Add …" action has the plus icon (`appIcons.add`,
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
  with `esnext` too. The default target lowered `light-dark()` into variables that follow the page's color scheme, not
  the element's `color-scheme`: on the published page the cockpit's dark sidebar and menus got light colors.
- `.npmrc` (the root one counts in a workspace; npm ignores those of the packages): `ignore-scripts=true`,
  `min-release-age=7`.
  - The first workspace install (2026-09-26) was run once with `--min-release-age=5`, because `antd@6.6.5` (a dev
    dependency of `data-table`) was only six days old.
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
