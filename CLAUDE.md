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
  - `data-navigator` (`@local/data-navigator`): a data table: a custom element, and a React component (`/react`).
  - `file-upload` (`@local/file-upload`): a file upload custom element, with a React wrapper.
  - `overlays` (`@local/overlays`): dialogs and toasts.
  - A package keeps its own tests, demo (`npm run dev` inside it) and `package-lock.json` (unused in the workspace,
    where the root lock file counts; it matters again in a standalone copy).
- The root is the demo page of all packages:
  - `index.html`: a header with the title and, top right, the global switches (language `en-US`/`de-DE`, color
    scheme), which change `<html>` (`lang`, `data-scheme`) for every demo. Below it a split: vertical tabs on the left
    ("Data navigator", "File upload", "Dialogs + Toasts", "Media Manager", "Board Manager"), the chosen demo on the
    right.
    - The URL hash has one segment per level of tabs: `#file-upload/react`, `#dialogs-toasts/react-i18n` (the first tab,
      the data navigator, has none).
  - `demo/main.ts`: imports the demo element of each package by a relative path
    (`../packages/file-upload/demo/FileUploadDemo`) and registers it (`data-navigator-demo`, `file-upload-demo`,
    `overlays-demo`; the root's own `media-manager-demo` and `board-manager-demo`). Each demo element is a light DOM custom
    element of its package (see "Demo element" in the package's `CLAUDE.md`), exported and not registered.
  - `demo/media-manager/`: the "Media Manager" tab, a demo of the root (not of a package), because it combines three
    packages: a data navigator lists the attachments, dialogs and toasts of the overlays package, and a file upload
    (React wrapper) in a drawer adds new ones. The table is compact (`density="compact"`), striped, with the default
    accent selection, and has a search, a Reload button
    (`reloadable`), a column toggle menu (every column but the filename is `hideable`),
    sorting (by default by filename, ascending), paging, column filters, in the data navigator's filter view (Filename: a text filter, contains, starts with or ends with; User, Type and Size: one or
    more; Uploaded: a date range, `dateRangeColumnFilter()`; the types are a fixed list of common ones, `TYPES`; the
    sizes are small < 100 kB, medium 100 kB – 1 MB, large ≥ 1 MB, `SIZES`), multi-selection with "Delete" for the
    selected rows (in the selection bar, which takes the toolbar's place while rows are selected), and "Delete" in
    each row (`contextMenu: false`: in the context menu, the "Delete" of the selection does the same). Both ask first, in a critical confirmation dialog of the overlays
    package (`confirmCritical`: a "Delete" button in the danger style, no confirm on Enter), with the file name, or for
    several files only their number ("Delete the 3 selected files?", no list: the table shows which ones). Deleting takes a second (`DELETE_TIME`): the dialog is opened in a scope
    (`dialogs.open()`), so it stays open after "Delete", its button shows a spinner, and it closes when the files are
    gone (`scope.dispose()`).
    - Toasts of the overlays package, bottom right (`toasts: { placement: 'bottom-end', size: 'small', stacked: true
      }` in the provider's config): "3 files deleted" after a delete, "2 files uploaded" after an "Apply" of the upload
      drawer. For a single file, its name instead: `"report.txt" deleted`, `"report.txt" uploaded`.
    - "Upload" (the first general action in the toolbar, an upload icon) opens a form drawer
      (`dialogs.form({ surface: 'drawer' })`, "Upload files", buttons "Apply" and "Cancel") with the file upload
      (`multiple`, `previews`, `required`, `name="files"`). Each added file is uploaded at once, but only staged on the
      fake server (not in the table yet).
      - "Apply" adds the staged files (their ids are the upload's form values, `attempt.data.getAll('files')`) to the
        list (`commitUploads()`, takes a second, `COMMIT_TIME`: the button shows a spinner), closes the drawer, reloads
        the table and shows the toast.
      - The upload is a form control of the drawer's form, so the drawer's native validation blocks "Apply" while a
        file is unfinished or failed, and while there is no file (`required`), with the upload's own message.
      - "Cancel" (also Escape, the close button) discards the staged files (`discardUploads()`, the `result`s of the
        latest `items`); running uploads are aborted when the drawer removes the element.
    - "Download" (the last action in the toolbar, a menu): "Selected file" (a row action, only while exactly one row
      is selected), a separator, "Selected files as zip", "Selected files as tar.gz" (rows actions, only while rows are
      selected). Every entry opens a warning dialog of the overlays package (`dialogs.warn()`): downloading is not
      available in the demo.
    - "Information" (one icon-only single-row action, `show: 'both'`, tip "Information": the info icon in the action
      column of every row and in the selection bar while exactly one row is selected, before "Delete"; one entry in
      the context menu; the default action, `default: true`: a double click on a row opens it too) opens a drawer of
      the overlays package
      (an info dialog on the drawer surface, `dialogs.info({ surface: 'drawer' })`, with only "OK") with made-up
      details from the fake server (`getDetails()`: description, versions, downloads, tags, storage, checksum, stable
      per attachment). Loading them takes a second (`DETAILS_TIME`); the drawer is opened in a scope
      (`dialogs.open()`), so the dialogs show their spinner meanwhile (after 300 ms), and the drawer replaces it.
    - The type of a file is its extension in capitals (`PDF`, `XLSX`), not its MIME type: a MIME type can be very long
      (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`).
    - `attachments.ts`: the fake server, in memory for as long as the page is open (eleven seed files of four users, at
      least one of every type in `TYPES`; new uploads belong to the current user, "Admin"): the table's source, the
      upload function (progress by size; at the end the file is staged and its id is the result), commit and discard
      of staged files, and delete.
    - Its texts say "file"/"files" everywhere (never "attachment"). The code keeps its names (`Attachment`,
      `attachments.ts`): a type `File` would clash with the DOM's `File`.
    - `MediaManagerDemo.tsx`: the demo element (light DOM, React inside, registered as
      `media-manager-demo`). It uses the i18n adapters of the two packages' demos, so it follows `<html lang>`.
  - `demo/board-manager/`: the "Board Manager" tab, a demo of the root (a small app, not a product): boards and
    committees, their meetings, agendas, minutes and documents. Mantine, React Router, Zustand, and three packages:
    a data navigator for every list, the dialogs and toasts of the overlays package, the file upload for documents.
    - Made to be embedded (later e.g. in XWiki, with content around it): no side navigation, a top bar with the app
      icon, the title "Board Manager" (a menu of the modules: Home, Boards, Meetings, Members) and a breadcrumb that
      starts with "Home" (a neutral icon, not linked, and the text as the link; no tip).
    - Routes (`App.tsx`, a memory router): `/`, `/boards`, `/boards/:boardId` (tabs Meetings, Members),
      `/boards/:boardId/meetings/:meetingId` and `/meetings/:meetingId` (tabs Overview, Agenda, Minutes, Documents),
      `/members`.
      The route is mirrored in the hash after the tab's segment (`#board-manager/boards/b1`), only while the tab is shown.
    - Mantine is scoped: its layered CSS, its variables and color scheme on `.board-manager` (the app, and the content
      of each dialog through `wrapContent`), following `<html data-scheme>`; its popups without portal.
    - `db.ts`: the fake server, a Zustand store in memory, seeded (stable) with dates relative to today: 6 boards,
      28 people, about 50 meetings with agendas, minutes of the held ones, documents.
    - The dialogs' buttons and close button are Mantine's (`render.actionButton`, `render.closeButton` in the
      overlays config, each in a Mantine scope): primary filled, danger filled red, secondary `default`.
    - The toasts (medium, stacked, bottom right) are in Mantine's palette (`TOAST_THEME`, `createToastTheme()`): they
      live in `<body>`, outside the scopes, so the colors are the theme's values (`mergeMantineTheme`), with
      `light-dark()` for the page's scheme.
    - Forms (`forms.tsx`) are validated by Mantine (`@mantine/form`, `useForm` uncontrolled), not by the browser:
      `submitForm()` (`flows.ts`) opens the form dialog with `nativeValidation: false` and a `validator` that asks the
      form (`useCheck`); the errors are shown on the inputs. The upload drawer keeps the native validation (the file
      upload is no Mantine input and reports its own message).
    - No native date picker: the date and time of a meeting is Mantine's `DateTimePicker` (`DD.MM.YYYY HH:mm`, its
      popup in the dialog with a fixed position); `fromPicker()` turns its value into the fake server's `start`.
    - `<board-manager>` (`BoardManagerElement.tsx`): the whole app in a shadow root, for a host page (e.g. XWiki).
      `npm run build:board-manager` (`vite.board-manager.config.ts`) bundles it with everything (React, Mantine, the
      packages) into one ES module, `dist-board-manager/board-manager.js`, with an example `index.html` beside it.
      - Its CSS is put into the module by the build (in place of the marker `__BOARD_MANAGER_STYLES__`) and added to
        the shadow root: nothing of it reaches the host page. The dialogs and toasts are in the shadow root too (the
        overlays provider's mount point).
      - `scheme` (`light`, `dark`) sets the color scheme; without it, `<html data-scheme>`, else the system's. The
        language follows `<html lang>`. The routes are in memory only (no hash: the host page owns its URL).
    - Members: the people, with create, edit and delete. Deleting also removes their memberships, and their agenda
      items keep no presenter (the confirmation says from how many boards). Memberships are changed on a board's page.
    - A meeting's page opens on "Overview" (`MeetingOverview`): its base information as labels and values (title,
      board, date and time with the end from the agenda's duration, location, status and minutes badges, the number of
      items and sections, documents) and "Edit", the same meeting form dialog as "Edit" in the meetings list
      (`editMeeting()` in `MeetingsTable.tsx`). The status keeps its own buttons in the page header.
    - The agenda is reordered by dragging (`reorder`), the minutes are recorded per item (a form drawer), the minutes
      tab shows them as one document; a held meeting's minutes are approved there.
    - Agenda sections (one level; the row groups of the data navigator): `agendaSections` (`{ id, meetingId, position,
      title }`), and an item's `sectionId` (`''`: none). Sections and items share one order per meeting (`position`),
      a section's items always follow it, and the items without a section come after all sections (`arranged()` in
      `db.ts`). Sections are optional: an agenda without any is flat (the default). Seed: only an agenda with four
      topics or more has sections, "Introduction" (the opening and the minutes of the last meeting), "Reports" and
      "Proposals for decision"; the others have none. The source gives the items as rows (with their number: `2`,
      `2.1`) and the sections as `Result.groups` (key: the section's id, with its total).
      - "Other": with sections, the items without one are a virtual last section, "Other" (the table's blank group,
        `''`; in the minutes too). It is no section of the fake server.
      - Numbers (`agendaNumbers()`): flat `1`, `2`, ...; with sections `2` for a section (also an empty one) and `2.1`
        for its items, "Other" the last number (its key in the map: `''`).
      - The table: `groupBy` (`sectionId`), `renderGroup` (`2. Finance`, the duration of its items), `reorder` (an item
        within its section or into another one). No group actions.
        - Only while the meeting has at least one section; without, no `groupBy` (plain rows). The table is remounted
          (`key`) when the first section comes or the last one goes.
      - "Manage sections" (a general action) opens a form drawer ("Sections", "Apply" and "Cancel") with a data
        navigator as wide as the drawer and as high as its body (`calc(100dvh - 11rem)`; `footer="auto"`): the sections
        of the meeting in their order, also the empty ones (`#` with a fixed `3rem`, and "Name").
        - Everything in it changes a draft (`SectionDraft`: the sections' order and names): "Add section" (the plus and
          the label, no tooltip) adds "New section" at the end, its input focused with the name selected (no dialog);
          "Delete" (a row action) and moving a
          section by its handle change the draft at once, without a confirmation. The `#` shows the numbers of the
          agenda as it would be.
        - The names are edited in place: the "Name" column renders an input (`SectionNameInput`, custom cell content,
          so a click into it selects no row). The draft changes on Enter or when it loses the focus (not per key: the
          list would reload and take the focus); a rename does not reload the list. Escape puts the name back, an
          empty name is not taken; Enter and Escape stay in the input (not "Apply"/"Cancel" of the drawer). It
          replaced a "Rename" row action with a dialog. Inline editing in the data navigator itself may come later.
        - "Apply" saves the whole draft at once (`saveSectionDraft`, the button shows a spinner), reloads the agenda
          and shows "Sections saved"; "Cancel" (also Escape, the close button) drops it, without asking.
        - `withSectionDraft()` (pure, in `db.ts`) applies a draft: the sections in the draft's order, each with its
          items; a missing section is deleted, its items go to the start of "Other".
      - The item form has a "Section" select (only while the meeting has sections): another section moves the item to
        its end, "(none)" moves it to "Other" (before "Any other business").
      - The minutes tab shows the sections and "Other" as headings, their items indented.
      - An empty section is an empty group of the source (`Result.groups` with `total: 0`, see the data navigator), so
        the table shows its header, and items can be dragged into it. The source gives "Other" (`''`) as the last
        group, only with items.
      - The agenda table has no search box and no column filters: an agenda is short, and moving its items needs all
        of them shown.
  - `demo/demo.css`: only what is specific to this page: the frame around the demos (header, tabs) is not selectable
    (`user-select: none`); inside the demos, selecting stays as their packages have it.
  - `demo/ui/`: the design language (`ui.css`, `ui.ts`), the same files as in every package. Read the header of `ui.css`
    before changing it, and copy a change into all copies (`demo/ui/` here, and in each package).
    - Its `ui-*` tokens are the default look: the packages' default themes follow them, and a change of a token is
      made in the packages' defaults too. The radius: `--ui-radius: 2px` for controls (inputs, selects, menus);
      the data navigator's `radius` is `2px`, the file upload's small parts `2px` (half of its `borderRadius`, `4px`).
      Buttons: `--ui-button-radius: 5px`; the data navigator's `buttonRadius`, the file upload's `buttonBorderRadius`
      and the overlays' `actionRadius` (dialog buttons) are `5px`. Larger surfaces are a bit rounder: the file
      upload's frame `4px`, dialogs `6px`, toasts `5px`.
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
  `@mantine/form` and `@mantine/dates` with `dayjs` (pinned to the versions the workspace has from `overlays`:
  `9.5.1`, `1.11.23`).
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
