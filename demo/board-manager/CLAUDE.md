# Board Manager

The "Board Manager" tab of the root's demo page: a demo of the root (a small app, not a product): boards and
committees, their meetings, agendas, minutes and documents. Mantine, React Router, Zustand, and three packages: a data
navigator for every list, the dialogs and toasts of the overlays package, the file upload for documents. The rules of
the root's `CLAUDE.md` apply.

## App

- Made to be embedded (later e.g. in XWiki, with content around it): no side navigation, a top bar with the app icon,
  the title "Board Manager" (a menu of the modules: Home, Boards, Meetings, Members, Organizations) and a breadcrumb
  that starts with "Home" (a neutral icon, not linked, and the text as the link; no tip).
  - The top bar is not selectable (`user-select: none`, 2026-10-01), its menu included (no portal).
  - The header line of an overview tab ("Overview" and its buttons) is not selectable either
    (`.board-manager__panel-header`, 2026-10-01), like the toolbars of the tables.
  - Always one line (no wrap): the icon and the title keep their size, the breadcrumb takes the rest and its crumbs
    end with an ellipsis when it is too short (Home and the separators keep their size). Back and Forward are hidden while the top bar is narrower
    than 40rem (a container query, 2026-10-01).
  - Back and Forward at its right end (2026-10-01; `HistoryButtons` in `App.tsx`): through the memory router's history,
    like the browser's buttons (which do not step through the app: the hash is only mirrored with `replaceState`, and
    the element has none). Disabled at either end: `useHistoryPosition()` keeps the keys of the entries (push, replace,
    pop). No keyboard shortcuts (Alt+arrows belong to the browser and the host page). Tooltips say where they go
    ("Back to Boards"; Mantine's, `fz="xs"`, after 400ms; none while disabled): the history keeps each entry's path, and the name
    is the last crumb of its routes (`matchRoutes`, the breadcrumb's `handle.crumb`), so it follows renames and new
    pages need nothing; `/` is "Home", a path without a crumb only "Back"/"Forward".
- Routes (`App.tsx`, a memory router): `/`, `/boards`, `/boards/:boardId` (tabs Meetings, Members),
  `/boards/:boardId/meetings/:meetingId` and `/meetings/:meetingId` (tabs Overview, Agenda, Minutes, Documents),
  `/members`, `/members/:personId` (tabs Overview, Boards, Meetings), `/organizations`, `/organizations/:organizationId` (tabs Overview, People).
  - The route is mirrored in the hash after the tab's segment (`#board-manager/boards/b1`), only while the tab is shown.
- `db.ts`: the fake server, a Zustand store in memory, seeded (stable) with dates relative to today: 6 boards, 28
  people, 8 organizations, about 50 meetings with agendas, minutes of the held ones, documents.

- The column menu of the data navigator (its columns with `hideable`) only in the tables with a column hidden by
  default (2026-10-01): Boards, Meetings, Members (and an organization's People), Organizations, a board's members.
  Not in the agenda and the documents (no hidden column there).
- "Delete" in the tables (decided 2026-10-01): a `multiRow` action everywhere (the selection, or a right-click on a
  row, which selects it). Also a row action (an icon in the action column) only where deleting is frequent and cheap:
  the documents of a meeting and the sections in the "Sections" drawer (a draft). Records much depends on (boards,
  meetings, people, organizations, a board's members, agenda items) are deleted through the selection only, so
  deleting is not one click away next to "Edit", and the action column stays narrow.

## Mantine

- BlockNote's stylesheet is imported into a layer of its own (`@import … layer(blocknote)` at the top of
  `board-manager.css`, 2026-10-01): it imports Mantine's component styles again, unlayered, which won over the app's
  rules (the breadcrumb wrapped).
- Mantine is scoped: its layered CSS, its variables and color scheme on `.board-manager` (the app, and the content of
  each dialog through `wrapContent`), following `<html data-scheme>`; its popups without portal.
- The components' themes follow Mantine as closely as possible (their values are Mantine's variables): the data
  navigator's `mantineTheme`, the file upload's `MANTINE_UPLOAD_THEME` (`MeetingPage.tsx`, kept in the app: a theme in
  the package would need its own test and demo). More contrast comes from the app's Mantine theme instead
  (`cssVariablesResolver`, 2026-09-30): `dimmed` `gray.7` (dark `dark.1`) and `placeholder` `gray.6` (dark `dark.2`),
  one step darker than Mantine's (lighter in dark mode); the text and the lines stay Mantine's.
- The look is made per element (`createLook()` in `BoardManagerDemo.tsx`, 2026-10-01): the theme, the CSS variables
  and the overlays' config. Two colors of ten shades: `accent` (the primary color) and `danger` (danger buttons, the
  error toasts, `--mantine-color-error`: shade 6, dark 8); by default Mantine's `indigo` and `red`. Danger buttons in
  the pages use `color="danger"`, never `red`. `autoContrast` (black text on a light accent).
- Buttons have a normal weight (`fw: 400` as a default prop of `Button` in the theme, 2026-10-01; Mantine's is 600),
  the dialogs' buttons too.
- `xs` buttons (30px high: the pages' buttons and the dialogs') have the app's text size, `sm` (14px; `--button-fz`
  through `vars` of `Button` in the theme, 2026-10-01, the user's wish; Mantine's `xs`, 12px, before).
- Badges keep the case of their text (`tt: 'none'` as a default prop of `Badge` in the theme, 2026-09-30): Mantine's
  stylesheet makes them uppercase ("PLANNED").
- The dialogs' buttons and close button are Mantine's (`render.actionButton`, `render.closeButton` in the overlays
  config, each in a Mantine scope): primary filled, danger filled in the danger color, secondary `default`. The
  buttons are `size="xs"` (30px, like the buttons of the pages; 2026-10-01, the user's wish; Mantine's `sm`, 36px,
  before). The maximize button of a maximizable dialog (`render.maximizeButton`) is a gray subtle `ActionIcon` like
  the close button, with Tabler's `TbMaximize`/`TbMinimize` and the label ("Maximize", "Restore") as its name and
  `title`.
- The dialogs' own text (title, message, note) has the app's size and font (2026-10-01): the overlays dialog theme's
  `fontSize` and `fontFamily` (`createDialogTheme`), set to Mantine's `fontSizes.sm` and `fontFamily` (the values: the
  dialogs are outside the scopes). Before, the dialogs had their fixed 16px and the system font, larger than the app.
  The spinner placeholder of a scope (the theme's `spinner`, 2026-10-01) is the accent's filled color.
- The toasts (small, like the Media Manager's; stacked, bottom right) are in Mantine's palette (`createToastTheme()` in
  `createLook()`): they live in `<body>`, outside the scopes, so the colors are the theme's values
  (`mergeMantineTheme`), with `light-dark()` for the page's scheme.
  - Success toasts in the accent color, like info and loading (2026-10-01, the user's wish: one accent color in the
    app; Mantine's `green` before): only the icon differs, so a toast from a spinner to success changes only its icon.
    Warnings orange, errors the danger color.
- Forms (`forms.tsx`) are validated by Mantine (`@mantine/form`, `useForm` uncontrolled), not by the browser:
  `submitForm()` (`flows.ts`) opens the form dialog with `nativeValidation: false` and a `validator` that asks the form
  (`useCheck`); the errors are shown on the inputs. The upload drawer keeps the native validation (the file upload is no
  Mantine input and reports its own message).
- No native date picker: the date and time of a meeting is Mantine's `DateTimePicker` (`DD.MM.YYYY HH:mm`, its popup in
  the dialog with a fixed position); `fromPicker()` turns its value into the fake server's `start`.

## The `<board-manager>` element

- `BoardManagerElement.tsx`: the whole app in a shadow root, for a host page (e.g. XWiki). `npm run build:board-manager`
  (`vite.board-manager.config.ts`) bundles it with everything (React, Mantine, the packages) into one ES module,
  `dist-board-manager/board-manager.js`, with an example `index.html` beside it.
  - Its CSS is put into the module by the build (in place of the marker `__BOARD_MANAGER_STYLES__`) and added to the
    shadow root: nothing of it reaches the host page. The dialogs and toasts are in the shadow root too (the overlays
    provider's mount point).
  - An AMD loader on the host page (XWiki: RequireJS, 2026-10-01): UMD modules in the bundle took the page's `define`
    and registered with it instead of exporting (react-pdf's hyphenation patterns: every PDF failed, `reading
    'length'`). The bundle starts with `var define;` (`banner`), a `define` of its own module scope, so the minifier
    drops their AMD branches; the page's `define` is untouched. The example `index.html` loads RequireJS to show it.
  - `scheme` (`light`, `dark`) sets the color scheme; without it, `<html data-scheme>`, else the system's. The language
    follows `<html lang>`. The routes are in memory only (the host page owns its URL), unless `hash` names a prefix
    (2026-10-01): `<board-manager hash="bm">` mirrors the route in `#bm/boards/b1`, like the demo tab (read on start, a
    `hashchange` navigates; written with `replaceState`). A hash with another start is left alone (e.g. XWiki's
    anchors). Read once, when the element is connected.
  - `accent-color` and `danger-color` (any CSS color, 2026-10-01; read once): the `accent` and `danger` of
    `createLook()`; an invalid color counts as none. `colors.ts` (no dependency; `chroma-js` was rejected after its
    supply chain attack): the browser parses the color (a canvas pixel), the ten shades are made in OKLCH, the color
    itself is shade 6. Without `danger-color`, a red that goes with the accent (`dangerFor()`): its lightness (0.55 to
    0.66) and chroma (0.17 to 0.22); an accent within 30° of red (and not a gray) moves the red 30° away, towards
    crimson, or towards orange red for a crimson accent.
  - Keyboard and input events (`keydown`, `keyup`, `keypress`, `beforeinput`, `input`, `composition*`) are stopped at
    the shadow root (bubble phase, 2026-09-30): they do not reach the host page (e.g. XWiki's shortcuts); inside, all
    get them. Mouse and focus events pass (a host page closes its menus on a click outside). A capture listener of the
    host page still sees them.

## Members

- The people, with create, edit and delete. Deleting also removes their memberships, and their agenda items keep no
  presenter (the confirmation says from how many boards). Memberships are changed on a board's page.
- A member's page (`MemberPage.tsx`, 2026-10-01; it replaced the "Information" drawer of the list): the name with the
  organization as subtitle, and three tabs:
  - "Overview": name, email (`mailto:`), organization (a link to its page), the number of boards; "Edit" and "Delete"
    (then back to the list), the same flows as in the list (`editPerson()`, `deletePeopleFlow()` in `PeopleTable.tsx`).
  - "Boards": the memberships, read-only (Board as a link, Role, Since; "Open board" the default action).
  - "Meetings": `MeetingsTable` with `personId`, the meetings of the person's boards (`fetchMeetings({ personId })`),
    with the board column and the actions of the Meetings module; a new meeting chooses one of the person's boards. A
    meeting opens below its board.
- In the people tables, the name is a link to the page, and "Open" (default, also a double click) opens it.
- `PeopleTable.tsx`: the table of the people, for the Members page and the People tab of an organization.
- A person's organization is a reference (`organizationId`, `''`: none), a select with "(none)" in the person form; the
  tables show its name.

## Organizations

- `Organization`: `name` (required, unique ignoring the case), `description`, the address (`street`, `zipCode`, `city`,
  `country`) and `website`, all optional (2026-10-01).
  - `country` is an ISO code (`DE`); its name is in the page's language (`Intl.DisplayNames`, `countries.ts`), a native
    select of all countries, sorted by name.
  - `website` is stored as a full URL: `https://` is added when the scheme is missing; anything else than an http(s) URL
    with a dot in the host is refused ("Not a valid URL", `normalizeWebsite()`). Shown as a link (a new tab).
  - A link that opens a new tab is marked: Tabler's `TbExternalLink` (an arrow out of a box) after the text, and
    "(opens in a new tab)" for screen readers (`WebsiteLink`, 2026-10-01). Not the `mailto:` links.
  - The form validates the name and the website; the fake server checks them again (`checkedOrganization()`).
- The list (`OrganizationsPage.tsx`): Organization (a link), City, Country (a select filter of the countries in use),
  Website, Members (the count); "New organization" (then its page), "Open" (default), "Edit", "Delete".
- The page (`OrganizationPage.tsx`): the name with the description as subtitle; "Overview" (labels and values, "Edit"
  and "Delete", then back to the list) and "People" (the people table of the organization: a new person belongs to it,
  no organization column).
- Deleting keeps the people, without an organization; the confirmation says how many (`deleteOrganizationsFlow()`).
- Seed: the organizations of the people's former names (fixed data, no random numbers: the rest of the seed stays the
  same; ids `o1`, ...). "Independent" became no organization, "Employee representative" the "Works Council".

## Meetings

- A meeting's page opens on "Overview" (`MeetingOverview`): its base information as labels and values (title, board,
  date and time with the end from the agenda's duration, location, status and minutes badges, the number of items and
  sections, documents), "Edit", the same meeting form dialog as "Edit" in the meetings list (`editMeeting()` in
  `MeetingsTable.tsx`), and "Delete" (2026-10-01), the same confirmation (`deleteMeetingsFlow()`), then back to where
  it was opened (its board's page, or the meetings list). The status keeps its own buttons in the page header.
- "PDF" (a menu on the overview, 2026-10-01): "Preview", "Print" and "Download" of the meeting's report (`pdf/`).
  - Its icon (`appIcons.pdf`) is `TbFileExport` for now; to be checked again (tried: `TbFileTypePdf`, too small at
    16px; `TbFileText`; `TbPdf`).
  - `pdf/report.tsx` (`@react-pdf/renderer`, A4, the standard Helvetica): the meeting's data, the attendees (the
    board's members by role), the agenda with sections, every item's presenter, duration, minutes (BlockNote's blocks:
    paragraphs, headings, lists, check lists as `[x]`, quotes, code, bold/italic/underline/strike, links, mentions as
    names) and decision, the documents; "DRAFT" while the minutes are not approved; a footer with "Page n of m" on
    every page. An item's title, presenter and first block of minutes are one group that never
    breaks (`wrap={false}`; `minPresenceAhead` had no effect). Black and white only, small
    sizes (2026-10-01: 9pt text, 14pt title, 11pt headings); set apart by weight and italics, thin black lines.
    - react-pdf 4.9: no `lineHeight` on the page (it drops the fixed footer), and a unitless one only together with a
      `fontSize` in the same style (else far too large).
    - The minutes are parsed by `minutes-format.ts` (no BlockNote), so the report does not load the editor.
  - "Preview": an extra wide dialog (`dialogs.confirm`, "Download" and "Close") with the pages, rendered by pdfjs
    (`pdf/preview.tsx`; its worker inlined with `?worker&inline`, so the `<board-manager>` build stays one module).
    The pages lie on a gray ground with a line above and below (`--mantine-color-default-border`, square corners;
    2026-10-01, the user's wish; tried the same day: a frame all around with a soft inner shadow, no gray ground, and
    only a line below).
    - Maximizable (2026-10-01): the pages stay as wide as the dialog, so maximized they fill the window's width (like a
      zoom); drawn at `RESOLUTION = 3`, so they stay sharp there. Not chosen: a capped page width.
  - "Print": built, loaded into a hidden frame (the browser's PDF viewer), which opens the print dialog; the frame
    stays until the next print.
  - "Download": built and saved, `<title> – <yyyy-mm-dd>.pdf`; no toast (the browser shows the download; removed
    2026-10-01).
  - All three build the PDF in a scope of the dialogs (`dialogs.open()`) and take at least 1.2s (a simulated server):
    meanwhile the scope's spinner placeholder shows, which the preview replaces. The preview's pages are drawn
    (pdfjs, canvases) before it opens, so it opens at its final size (`renderPages`, `PdfPages`).
  - Both are loaded on first use (dynamic imports in `pdf/index.tsx`).
- The agenda is reordered by dragging (`reorder`), the minutes are recorded per item (a form dialog), the minutes tab
  shows them as one document; a held meeting's minutes are approved there.
- The minutes of an item are a BlockNote document (`minutes.tsx`, 2026-10-01; `@blocknote/core`, `react`, `mantine`
  0.55; before, a `Textarea`): stored as its JSON in `AgendaItem.minutes` (`''` for an empty document); plain text (the
  seed) is read as one paragraph per line.
  - The minutes form is a centered dialog (2026-10-01; a drawer before), extra wide (`width: 'extraWide'`, 64em; the
    overlays' named widths for dialogs and drawers: `default`, `wide` 48em, `extraWide` 64em, `full`), and
    maximizable (`maximizable: true`, 2026-10-01: Maximize before the close button, then Restore). Maximized, the two
    fields share the height, two thirds for the minutes editor, one for the "Decision" textarea (`[data-maximized]` of
    the overlays' dialog element, `.board-manager__minutes-form`). The textarea gets `min-height: 100%`: Mantine's
    `autosize` sets its height inline with `!important`, which no stylesheet beats. (Tried the same day: only the
    minutes growing.)
  - The dialog's editor (`MinutesEditor`) writes the JSON into a hidden input `minutes`, so the form data works as
    before; "Decision" stays a `Textarea`. Framed like a Mantine input (`.board-manager__minutes-editor`),
    in the app's size and font (`--mantine-font-size-sm`, `--mantine-font-family`; BlockNote's own are 16px and Inter).
    - The frame is `position: relative` (2026-10-01): BlockNote's menus (slash menu, toolbar, side menu, …) are
      portalled into its container and placed by Floating UI from their `offsetParent`. In the overlays dialog, whose
      content is slotted into its shadow root, that cannot be the `<dialog>`; in the `<board-manager>` element the menus
      were off by the dialog's position (the demo tab was not affected). `strategy: 'fixed'` on every BlockNote
      controller was the other option (more code, and each controller to be listed).
  - Mentions: `@` opens a menu of the board's members (`SuggestionMenuController`, filtered as typed); a mention is a
    custom inline content (`mention`, prop `personId`), shown as "@<current name>", "@(deleted)" when the person is
    gone; in the size of the text around it (`fz="inherit"`) and Mantine's accent color, like the
    filled buttons (`.board-manager__mention`: `--mantine-primary-color-filled`), also as a link. Read-only inside the router, it links to the member's page.
  - Shown read-only (`MinutesText`: a `BlockNoteView` with `editable={false}`, without the side menu's room) in the
    minutes tab and an item's detail row. BlockNote looks like Mantine
    (2026-10-01): `MANTINE_LOOK`, a BlockNote theme whose colors, radius and font are Mantine's variables (else
    `@blocknote/mantine` styles its Mantine menus like BlockNote); with a theme object BlockNote takes the scheme from
    its context, so `SchemeContext` gives it the app's (`useScheme()`). Its highlight colors stay its own; Inter is not
    loaded.
- Documents: "Upload" (a drawer with the file upload), "Download" (the default action, a warning: not available in the
  demo), "Delete" (the selected ones, and in each row), and "Rename" (a row action in each row and in the context menu,
  a pencil, tip "Rename document"): a form dialog "Rename document" (2026-10-01; before, the data navigator's edit form
  in the place of the row) with one field, "Name" (`DocumentForm`, required). On its first focus only the name without
  the extension is selected, like in a file manager. "Save" saves it (`renameDocument()` in `db.ts`: trimmed, an empty
  name refused; the type follows the new extension, like for an upload) and shows `"<name>" renamed`.
- The editor of a text in an edit form (a section's name) is Mantine's `TextInput`
  (`mantineTextEditor()` in `MeetingPage.tsx`, for the column it is in).

## Agenda sections

- One level; the row groups of the data navigator: `agendaSections` (`{ id, meetingId, position, title }`), and an
  item's `sectionId` (`''`: none). Sections and items share one order per meeting (`position`), a section's items
  always follow it, and the items without a section come after all sections (`arranged()` in `db.ts`).
- Sections are optional: an agenda without any is flat (the default). Seed: only an agenda with four topics or more has
  sections, "Introduction" (the opening and the minutes of the last meeting), "Reports" and "Proposals for decision";
  the others have none.
- The source gives the items as rows (with their number: `2`, `2.1`) and the sections as `Result.groups` (key: the
  section's id, with its total).
- "Other": with sections, the items without one are a virtual last section, "Other" (the table's blank group, `''`; in
  the minutes too). It is no section of the fake server.
- Numbers (`agendaNumbers()`): flat `1`, `2`, ...; with sections `2` for a section (also an empty one) and `2.1` for its
  items, "Other" the last number (its key in the map: `''`).
- The table: `groupBy` (`sectionId`), `renderGroup` (`2. Finance`, the duration of its items), `reorder` (an item within
  its section or into another one). No group actions, and no checkboxes in the group headers (no `selectableGroups`).
  - Only while the meeting has at least one section; without, no `groupBy` (plain rows). The table is remounted (`key`)
    when the first section comes or the last one goes.
- "Manage sections" (a general action) opens a form drawer ("Sections", "Apply" and "Cancel") with a data navigator as
  wide as the drawer and as high as its body (`calc(100dvh - 11rem)`; `footer="auto"`): the sections of the meeting in
  their order, also the empty ones (`#` with a fixed `3rem`, and "Name").
  - Everything in it changes a draft (`SectionDraft`: the sections' order and names): "Delete" (a row action, and a
    `multiRow` action for the selected sections, since 2026-10-01: the rows have checkboxes) and moving a section by
    its handle change the draft at once, without a confirmation. The `#` shows the numbers of the
    agenda as it would be.
  - The names are edited in the data navigator's edit form (its row editing and new rows, see its `CLAUDE.md`): "Edit"
    (a row action, the default one: also a double click) opens the form of a section, "Add section" (the plus and the
    label, no tooltip) the form of a new one (`addRow`). One field, "Name", with Mantine's `TextInput` as its editor
    (`mantineTextEditor()`). "OK" (also Enter) only changes the draft: `saveRow` renames, `createRow` adds the section at
    the end; an empty name is refused with a message in the form. Enter and Escape belong to the form (not
    "Apply"/"Cancel" of the drawer). It replaced (2026-09-30) names edited in place (`SectionNameInput`, an input in the
    cell), which had replaced a "Rename" row action with a dialog.
  - "Apply" saves the whole draft at once (`saveSectionDraft`, the button shows a spinner), reloads the agenda and shows
    "Sections saved"; "Cancel" (also Escape, the close button) drops it, without asking.
  - `withSectionDraft()` (pure, in `db.ts`) applies a draft: the sections in the draft's order, each with its items; a
    missing section is deleted, its items go to the start of "Other".
- The item form has a "Section" select (only while the meeting has sections): another section moves the item to its
  end, "(none)" moves it to "Other" (before "Any other business").
- The minutes tab shows the sections and "Other" as headings, their items indented.
- An empty section is an empty group of the source (`Result.groups` with `total: 0`, see the data navigator), so the
  table shows its header, and items can be dragged into it. The source gives "Other" (`''`) as the last group, only
  with items.
- The agenda table has no search box and no column filters: an agenda is short, and moving its items needs all of them
  shown.

## Todo

- The minutes editor (BlockNote) still looks like BlockNote, not like Mantine (2026-10-01): `MANTINE_LOOK` (a BlockNote
  theme with Mantine's variables, `minutes.tsx`) showed no visible difference. To check in the browser: which `--bn-*`
  variables BlockNote's stylesheet really reads where (editor, menus, toolbar), whether the theme's variables reach
  them (set on the editor container, `applyThemedRoot` for the popups), and whether the scheme still follows the app
  (`SchemeContext`).
- The icon of the "PDF" menu (see Meetings).
- The demo tab with the real `<board-manager>` element (shadow DOM, its attributes) instead of `<board-manager-demo>`
  (2026-10-01, open). The obstacle: the CSS, which only `build:board-manager` puts into the module (its marker); under
  `dev` and `build:pages` Vite adds it to `<head>`. Ideas: copy the page's stylesheets into the shadow root while the
  marker is unreplaced (a `MutationObserver` on `<head>` for HMR; the page's own CSS gets in too, check `ui.css` for
  element selectors), or load the built module in the demo (no HMR).
- `accent-color`/`danger-color` with `var(--some-token)` (2026-10-01, open): today it turns black (`CSS.supports`
  accepts it, the canvas cannot resolve it and keeps its default). Idea: resolve it in the element's context first (a
  probe in the shadow root with `style.color = value`, then `getComputedStyle(probe).color`), and treat an unchanged
  canvas default as invalid. Read once, so a token that differs in dark mode is not followed (that would need a
  `MutationObserver` and a new look).
