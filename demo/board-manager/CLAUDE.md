# Board Manager

The "Board Manager" tab of the root's demo page: a demo of the root (a small app, not a product): boards and
committees, their meetings, agendas, minutes and documents. Mantine, React Router, Zustand, and three packages: a data
navigator for every list, the dialogs and toasts of the overlays package, the file upload for documents. The rules of
the root's `CLAUDE.md` apply.

## App

- Made to be embedded (later e.g. in XWiki, with content around it): no side navigation, a top bar with the app icon,
  the title "Board Manager" (a menu of the modules: Home, Boards, Meetings, Members) and a breadcrumb that starts with
  "Home" (a neutral icon, not linked, and the text as the link; no tip).
- Routes (`App.tsx`, a memory router): `/`, `/boards`, `/boards/:boardId` (tabs Meetings, Members),
  `/boards/:boardId/meetings/:meetingId` and `/meetings/:meetingId` (tabs Overview, Agenda, Minutes, Documents),
  `/members`.
  - The route is mirrored in the hash after the tab's segment (`#board-manager/boards/b1`), only while the tab is shown.
- `db.ts`: the fake server, a Zustand store in memory, seeded (stable) with dates relative to today: 6 boards, 28
  people, about 50 meetings with agendas, minutes of the held ones, documents.

## Mantine

- Mantine is scoped: its layered CSS, its variables and color scheme on `.board-manager` (the app, and the content of
  each dialog through `wrapContent`), following `<html data-scheme>`; its popups without portal.
- The components' themes follow Mantine as closely as possible (their values are Mantine's variables): the data
  navigator's `mantineTheme`, the file upload's `MANTINE_UPLOAD_THEME` (`MeetingPage.tsx`, kept in the app: a theme in
  the package would need its own test and demo). More contrast comes from the app's Mantine theme instead
  (`cssVariablesResolver`, 2026-09-30): `dimmed` `gray.7` (dark `dark.1`) and `placeholder` `gray.6` (dark `dark.2`),
  one step darker than Mantine's (lighter in dark mode); the text and the lines stay Mantine's.
- Badges keep the case of their text (`tt: 'none'` as a default prop of `Badge` in the theme, 2026-09-30): Mantine's
  stylesheet makes them uppercase ("PLANNED").
- The dialogs' buttons and close button are Mantine's (`render.actionButton`, `render.closeButton` in the overlays
  config, each in a Mantine scope): primary filled, danger filled red, secondary `default`.
- The toasts (small, like the Media Manager's; stacked, bottom right) are in Mantine's palette (`TOAST_THEME`,
  `createToastTheme()`): they live in `<body>`, outside the scopes, so the colors are the theme's values
  (`mergeMantineTheme`), with `light-dark()` for the page's scheme.
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
  - `scheme` (`light`, `dark`) sets the color scheme; without it, `<html data-scheme>`, else the system's. The language
    follows `<html lang>`. The routes are in memory only (no hash: the host page owns its URL).
  - Keyboard and input events (`keydown`, `keyup`, `keypress`, `beforeinput`, `input`, `composition*`) are stopped at
    the shadow root (bubble phase, 2026-09-30): they do not reach the host page (e.g. XWiki's shortcuts); inside, all
    get them. Mouse and focus events pass (a host page closes its menus on a click outside). A capture listener of the
    host page still sees them.

## Members

- The people, with create, edit and delete. Deleting also removes their memberships, and their agenda items keep no
  presenter (the confirmation says from how many boards). Memberships are changed on a board's page.

## Meetings

- A meeting's page opens on "Overview" (`MeetingOverview`): its base information as labels and values (title, board,
  date and time with the end from the agenda's duration, location, status and minutes badges, the number of items and
  sections, documents) and "Edit", the same meeting form dialog as "Edit" in the meetings list (`editMeeting()` in
  `MeetingsTable.tsx`). The status keeps its own buttons in the page header.
- The agenda is reordered by dragging (`reorder`), the minutes are recorded per item (a form drawer), the minutes tab
  shows them as one document; a held meeting's minutes are approved there.
- Documents: "Upload" (a drawer with the file upload), "Download" (the default action, a warning: not available in the
  demo), "Delete" (the selected ones, and in each row), and "Rename" (2026-09-30: a row action in each row and in the
  context menu, a pencil, tip "Rename document"): the data navigator's edit form in the place of the row, with one
  field, "Document" (the name). "OK" (also Enter) saves it (`renameDocument()` in `db.ts`: trimmed, an empty name is
  refused with a message in the form; the type follows the new extension, like for an upload) and shows
  `"<name>" renamed`.
- The editor of a text in an edit form (a section's name, a document's name) is Mantine's `TextInput`
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
  - Everything in it changes a draft (`SectionDraft`: the sections' order and names): "Delete" (a row action) and
    moving a section by its handle change the draft at once, without a confirmation. The `#` shows the numbers of the
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
