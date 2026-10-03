# Media Manager

The "Media Manager" app of the root's demo page (a mini-app of its app cockpit): a demo of the root (not of a package),
a small file manager with folders and files. Same look as the Board Manager (Mantine, the same theme), and three
packages: a data navigator for a folder's contents, the dialogs and toasts of the overlays package, the file upload for
uploads. The rules of the root's `CLAUDE.md` apply.

Rebuilt 2026-10-03 (before: one table of attachments), as the first app that follows the Board Manager's decided target
structure completely (`demo/board-manager/STRUCTURE.md`): a reference for its phase 2.

## Structure

- `domain/`: pure TypeScript, imports nothing from outside.
  - `query.ts`: `Range`, `Sort`, `Paging` (`{ offset, limit }`), `Page`.
  - `folder.ts`: `Folder` (the root is a folder too, `ROOT_ID`, "All files"), `FolderRepository`, and the rules
    `ancestorsOf`, `childrenOf`, `isInside`.
  - `file.ts`: `MediaFile`, `FileKind` (image, video, audio, document, spreadsheet, presentation, archive, other; by
    the extension, `kindOf`), `FileDetails`, `FileCriteria`, `FileSortKey`, `FileRepository` (with the upload: staged,
    then `commit` or `discard`).
- `infra/in-memory/`: the repositories' in-memory implementation, one store shared by both (deleting a folder deletes
  its files). `seed.ts`: 25 folders (Projects, Marketing with Brand assets › Logos/Fonts and Campaigns, Photos,
  Documents, Videos, Audio, Archive) and about 120 files, stable (a seeded random generator), dates relative to today.
  Waits like a server (`LOADING_TIME`, `SAVE_TIME`). Only `app/` imports it.
- `features/browser/`: the one feature.
  - `service.ts`: `createBrowserService(repositories)`, what the UI calls: mostly the repositories' own methods, plus
    the logic: `entries()` (a folder's contents: its subfolders first, then its files, one window over both; a folder's
    `size` is its number of entries), `move()` and `remove()` for a mix of folders and files. `EntryRow`: the table's
    row type (built here, not in the domain).
  - `keys.ts`: the query keys (TanStack Query), all under `['media']`; a change invalidates them all.
  - `context.tsx`: the service's React context (`useBrowserService`), and `folderPath()` (the route of a folder).
  - `components/`: `FolderTree`, `NameForm`, `MoveForm`, `FileDetails`; `pages/FolderPage.tsx`: the table and its
    actions.
  - `index.ts`: the only import path for the app.
- `shared/`: no domain knowledge except icons per kind: `ui/scope.tsx` (Mantine's scope, `.media-manager`, and the
  page's color scheme), `ui/navigator.tsx` (the data navigator in Mantine's look), `ui/icons.tsx`, `lib/format.ts`,
  `lib/useQuerySource.ts`.
- `app/`: the wiring and the frame: `MediaManagerDemo.tsx` (the element, light DOM, registered as
  `media-manager-demo`; it creates the repositories, the service and the query client, and provides them),
  `App.tsx` (routes, layout, top bar, history, the hash), `look.tsx` (Mantine's theme and the overlays' config, taken
  from the Board Manager), `media-manager.css`.
  - The accent (2026-10-03): `--media-manager-accent-color` (any CSS color, set by the host page's CSS; the root page
    maps its `--app-accent-color` to it), live in CSS like the Board Manager's (`accentVariables()` in `look.tsx`);
    without it, Mantine's indigo.

## Data access

- Reads and changes go through TanStack Query: `useQuery` for the folders (tree, breadcrumb, history tips) and the
  owners; the table loads through `useQuerySource()` (`shared/lib`): each page it loads is a query
  (`browserKeys.entryPage`), and when a query under `browserKeys.entries()` is invalidated, the table reloads. After
  every change: `invalidateQueries(browserKeys.all)`.
  - The table's query runs on TanStack's own signal: it is shared, so the table's signal (aborted e.g. by React's
    StrictMode) only stops waiting for it, it never cancels it.

## App

- Top bar (like the Board Manager's): the app icon, "Media Manager", the open folder's path as a breadcrumb (a house icon
  only, a link to all files with the tooltip "Overview", like the other apps; then one crumb per folder; the last one
  not a link; none for all files; the app icon is a link to all files too), Back and Forward through the app's
  own history (tooltips "Back to Logos"; hidden below 40rem of the top bar).
- Below it: the folder tree on the left (15.5rem, sticky; hidden below 48rem of the app's width), the open folder's
  contents on the right.
- Routes: `/` (all files) and `/folders/<id>`, in a memory router, mirrored in the hash after `#media-manager`
  (`#media-manager/folders/logos`): a reload or a link opens the same folder. Written only while the element is shown;
  again when the cockpit shows it (it observes the closest `[data-hash-segment]` or `.ui-tabs__panel`).

## Folder tree

- Mantine's `Tree`, controlled: the open folder is selected, and the path to it is always expanded (derived from the
  open folder, so the tree's own initialization, which React's StrictMode runs twice, cannot collapse it); the user
  expands and collapses the rest (the chevron, or a click on the open folder). A click on a folder opens it.

## Table

- A folder's contents: subfolders first (a folder icon in the accent color, its name a link that opens it), then files
  (an icon per kind, in a color per kind).
- Columns: Name (sortable), Kind (a filter: one or more kinds; with kinds chosen, no folders), Type (the extension,
  sortable), Size (a folder: "5 items"; sortable), Modified (a date range filter, sortable), Owner (a filter: one or
  more, sortable). All but Name can be hidden. A search (the names). 25 per page (25, 50, 100). By name by default.
- A new table per folder (`key`): page, search and filters start fresh.
- Actions:
  - "New folder" and "Upload" (toolbar).
  - Open (the arrow in each row; the default action, so a double click on a row's free space does it too): a folder
    opens, a file shows its details.
  - Details and Rename (icons in each row and in the selection bar for one row).
  - Move, Delete (danger), Download (a menu: as zip, as tar.gz) for the selected rows.
- New folder, Rename: a form dialog with one field (`NameForm`, the overlays' `<Form confirm>`): an empty name is
  refused at once; the server refuses a name a sibling folder has already (ignoring the case), or a slash; the message
  shows under the field and the dialog stays open. Renaming a file selects the name without its extension first.
- Move: a form dialog with the folder tree (`MoveForm`), opened at the current folder; the current folder and the
  folders being moved (with everything in them) cannot be chosen. "Into: All files › …" shows the choice.
- Delete: a critical confirmation (in a scope: it stays open while deleting); folders are deleted with everything in
  them (the message says so).
- Upload: a form drawer with the file upload (Mantine's look), into the open folder: each file is staged at once,
  "Apply" adds them, "Cancel" discards them.
- Details: a drawer (an info dialog, no icon, the name as title): a preview (made up: an image is a colored picture
  from its id, every other kind its icon), the description, a table of properties (type, size, dimensions or duration
  where they fit, folder path, owner, modified, versions, downloads, checksum) and the tags. A folder's drawer: its
  path, subfolders, items, owner, created.
- Download: a warning ("not available in this demo").
- Toasts after every change: `Folder "Drafts" created`, `"Logo.png" renamed`, `2 items moved to "Fonts"`,
  `3 items deleted`, `"report.pdf" uploaded`.

## Texts

- English only (the data navigator and the file upload follow `<html lang>` through their demos' i18n adapters). The
  code says `MediaFile`, not `File` (that would clash with the DOM's `File`).
