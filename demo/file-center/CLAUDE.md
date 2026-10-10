# File Center

The "File Center" app of the root's demo page (a mini-app of its app cockpit): a demo of the root (not of a package),
a small file manager with storages, folders and files. Same look as the Board Manager (Mantine, the same theme), and
three packages: a data table for a folder's contents, the dialogs and toasts of the overlays package, the file
upload for uploads. The rules of the root's `CLAUDE.md` apply.

- Renamed 2026-10-08 (the user's wishes): "Media Manager" first, then "Drive" for a few hours, now "File Center": two
  words, like the other apps' names (balanced in the cockpit's menu), and a valid custom element name without a suffix
  (`<file-center>`; `<drive>` would not be one). Everything follows it: `demo/file-center/`, `file-center-demo`
  (`FileCenterDemo`), the hash `#file-center`, `.file-center__*`, `file-center.css`, and the four custom properties
  `--file-center-accent-color`, `-font-size`, `-font-family` and `-scale` (allowed by the user; `--media-manager-*`,
  then `--drive-*` before). The storage "Company drive" became "Company share" (while the app was "Drive"). Not renamed: `MediaFile` (see Texts), the query keys
  under `['media']`, the storage id `media` ("Media library"), the permissions `media.*` of the User Manager's made-up
  catalog.

Rebuilt 2026-10-03 (before: one table of attachments), as the first app that follows the Board Manager's decided target
structure completely (`demo/board-manager/STRUCTURE.md`): a reference for its phase 2.

## Structure

- `domain/`: pure TypeScript, imports nothing from outside.
  - `query.ts`: `Range`, `Sort`, `Paging` (`{ offset, limit }`), `Page`.
  - `folder.ts`: `Folder` (the root is a folder too, `ROOT_ID`, "Files"), `FolderRepository`, and the rules
    `ancestorsOf`, `childrenOf`, `isInside`.
  - `file.ts`: `MediaFile`, `FileKind` (image, video, audio, document, spreadsheet, presentation, archive, other; by
    the extension, `kindOf`), `FileDetails`, `FileCriteria`, `FileSortKey`, `FileRepository` (with the upload: staged,
    then `commit` or `discard`).
- `infra/in-memory/`: the repositories' in-memory implementation, one store shared by both (a folder in the trash
  takes its files with it, `liveFolderIds`; it refuses what storages forbid). `seed.ts`: three storages (2026-10-07): "Company share" (Projects,
  Marketing with Brand assets › Logos/Fonts and Campaigns, Documents), "Media library" (Photos, Videos, Audio),
  "Archive" (its archives in it); 27 folders and about 120 files, stable (a seeded random generator), dates relative to today.
  Waits like a server (`LOADING_TIME`, `SAVE_TIME`). Only `app/` imports it.
- `features/home/`: the start page (`OverviewPage`), on the browser feature's service (through its `index.ts`).
- `features/recent/`: the module Recent (`RecentPage`), the same way.
- `features/favorites/`: the module Favorites (`FavoritesPage`), the same way.
- `features/trash/`: the module Trash (`TrashPage`), the same way.
- `features/browser/`: the folders and files.
  - `service.ts`: `createBrowserService(repositories)`, what the UI calls: mostly the repositories' own methods, plus
    the logic: `entries()` (a folder's contents: its subfolders first, then its files, one window over both; a folder's
    `size` is its number of entries), `move()` and `remove()` for a mix of folders and files, `overview()` (the start
    page's numbers). `EntryRow`: the table's row type (built here, not in the domain).
  - `labels.ts`: the names of the kinds of file (`KIND_LABELS`).
  - `useEntryActions.tsx`: what the three tables share: `setFavorite`, and the drawers of details (`showDetails`,
    `showFileDetails`). The drawers' contents get their callbacks as props (no hooks inside them).
  - `components/`: also `EntryName` (the name with its icon and star), `Favorite.tsx` (`FavoriteStar`,
    `FavoriteButton`), `FolderDetails`.
  - `keys.ts`: the query keys (TanStack Query), all under `['media']`; a change invalidates them all.
  - `context.tsx`: the service's React context (`useBrowserService`), and `folderPath()` (the route of a folder).
  - `components/`: `FolderTree`, `NameForm`, `MoveForm`, `FileDetails`; `pages/FolderPage.tsx`: the table and its
    actions.
  - `index.ts`: the only import path for the app.
- `shared/`: no domain knowledge except icons per kind: `ui/scope.tsx` (Mantine's scope, `.file-center`, and the
  page's color scheme), `ui/dataTable.tsx` (the data table in Mantine's look), `ui/icons.tsx`, `lib/format.ts`,
  `lib/useQuerySource.ts`.
- `app/`: the wiring and the frame: `FileCenterDemo.tsx` (the element, light DOM, registered as
  `file-center-demo`; it creates the repositories, the service and the query client, and provides them),
  `App.tsx` (routes, layout, app header, history, the hash), `look.tsx` (Mantine's theme and the overlays' config, taken
  from the Board Manager), `file-center.css`.
  - The theme (2026-10-04): `modernTheme` of `packages/mantine-themes` merged with the app's own, like the Board Manager's:
    smaller corners and a bit more contrast (see its `CLAUDE.md`).
  - The accent (2026-10-03): `--file-center-accent-color` (any CSS color, set by the host page's CSS; the root page
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

- Modules (2026-10-08, the user's wish, built one by one): Overview, Files, Recent, Favorites, Trash. Done so far:
  all five.
- Trash (2026-10-08; `/trash`, `features/trash/`):
  - The model: `deletedAt` on a folder or a file; only what was deleted itself is marked, what is in a deleted folder
    goes with it. Its `parentId` / `folderId` stays: where it came from and goes back to. The repositories see only
    what is outside the trash (`all`, `find`; also the names a new folder may not repeat), except `trash()`; `delete`
    marks, `restore` unmarks (refused while the folder it was in is in the trash too, "Restore that first", or when a
    folder there has its name now), `purge` deletes for good (a folder with everything in it).
  - So everything else (Files, the tree, the Move dialog, Recent, Favorites, the Overview) shows nothing of the trash
    without a change of its own.
  - The module: a table of what was deleted itself (a folder as one row, "5 items"), the last deleted first: Name,
    Deleted from (the path), Kind, Size, Deleted, Owner; the search. "Restore" (a refusal as an error toast) and
    "Delete permanently" (a critical confirmation) for the selected rows, "Empty trash" (critical) in the toolbar.
    `trash()`, `restore()`, `purge()`, `emptyTrash()` of the browser service; `confirmAndRun` (critical, or plain for
    the move into the trash) is shared by Files and Trash.
- Favorites (2026-10-08): a folder or a file may be marked (`favorite?: true` in the model; `setFavorite` of both
  repositories, not the root; a few in the seed: two folders and every 15th file).
  - A star after the name in every table (Files, Recent, Favorites; `FavoriteStar`): filled (yellow) while it is one,
    else an outline shown only while the name is hovered or the star has the focus; a click marks or unmarks it at
    once, then saves (no toast; a failed save takes it back).
  - In Files a menu "Favorites" for the selected rows: "Add to favorites", "Remove from favorites" (a toast).
  - In the drawer of a folder's or a file's details a button "Add to favorites" / "Remove from favorites".
  - The module (`/favorites`; `features/favorites/`): a table of the marked folders and files of all folders (the
    folders first, like Files; `favorites()` of the browser service), with Folder (the path of the folder it is in, a
    link; none for a storage), Kind, Size, Modified, Owner; the search, the filters Kind and Owner. Open (the default:
    a folder opens, a file shows its details), Details, and "Remove from favorites" for the selected rows; an
    unmarked one leaves the list.
- Recent (`/recent`; `features/recent/`): a table of the files of all folders, the last modified first
  (`defaultSort`), starting with the last 30 days (the date filter as `defaultFilters` of the data table, added
  for it 2026-10-08: a pill like any filter, changed or removed by the user). Columns: Name (with its kind's icon),
  Folder (its path from the storage on, a link), Kind, Size, Modified, Owner; the filters and the search of Files. Row
  actions: Details (the default, a double click) and Open folder; no changes here (rename, move, delete, upload stay in
  Files). Reads through `findFiles` of the browser service (`browserKeys.filePage`, under `browserKeys.files()`).
- Overview (`/`, the start page; `features/home/`): four cards (files and folders, space used, storages, modified in the
  last 7 days; Files and Storages are links to Files), the space by kind (bars, the largest first; the kinds' icons in
  their colors), the storages (each a link, its share of all space as a bar; no capacity: the model has none), the 6
  last modified files (each with its folder as a link). One read, `overview()` of the browser service (all files, by
  `modified`; `browserKeys.overview()`, so every change refreshes it). "Modified", not "uploaded": a file has no date
  of its upload.
- App header (`AppHeader`; "top bar" before 2026-10-08; like the other apps, two lines, 2026-10-08): the app icon, "File Center", the modules as tabs (the current
  one, also on its folders' pages, in the accent's light ground; below 56rem of the bar a menu in their place: the
  current module and a chevron), Back and Forward through the app's own history (tooltips "Back to Logos"; hidden below
  40rem of the app header); below them the breadcrumb: a house icon with the label "Home" (2026-10-04, a link to the start
  page), the module ("Files", the root), then one crumb per folder; the last one not a link; the app icon is no link
  (2026-10-04).
- The full-height layout of the Board Manager (2026-10-07, the user's wish; like the Time Tracker's): the app fills
  its element, the app header stays, the body below takes the rest; the table fills it (its rows scroll, its toolbar,
  headers and footer stay; `file-center__table` around it), the folder tree scrolls on its own.
- Files, below the app header: the folder tree on the left (15.5rem, without a frame since 2026-10-07, a line on its right; hidden below 48rem of the
  app's width), the open folder's
  contents on the right.
- Routes: `/` (the start page), `/files` (the root, "Files") and `/files/<id>` (`/folders/<id>` before 2026-10-08), in
  a memory router, mirrored in the hash after `#file-center` (`#file-center/files/logos`): a reload or a link opens the same folder. Written only while the element is shown;
  again when the cockpit shows it (it observes the closest `[data-hash-segment]` or `.ui-tabs__panel`). The browser's
  Back and Forward step through the folders (`app/hashHistory.ts`, see the root's `CLAUDE.md`).

## Storages

- 2026-10-07, the user's wish: where files are kept, like mount points in Linux; the app does not know what is behind
  one (a share, a bucket, a disk). A folder with `storage: true`, always directly in the root; the root holds only
  storages.
- The root is called "Files" (2026-10-08, the module's name; "Media" since 2026-10-07, "All files" before): the
  table's title there, the paths ("Files › Company share › Projects"). It is not in the trees (the side tree and the
  Move dialog start with the storages); the breadcrumb's "Files" opens it.
- One icon (`TbServer2`, `appIcons.storage`) in the tree, the table and the Move dialog; "Storage" as its kind.
- Set up elsewhere: one cannot be created, renamed, moved or deleted here. In the root the table offers no New
  folder, Upload, Rename, Move, Delete; the server refuses them too (also a folder or file into the root). Moving
  between storages is an ordinary move.

## Folder tree

- A header (2026-10-07, the user's wish): "Folders" (small, gray, uppercase) and an icon button "Collapse all"
  (`TbCopyMinus`, with a tooltip), sticky while the tree scrolls. It collapses everything but the path to the open
  folder (always expanded); invisible (in its place: the header keeps its height) while nothing else is expanded.
- Only outline icons (2026-10-07, the user's wish): `TbFolder` for a folder, `TbServer2` for a storage; also in the
  Move dialog's tree. The table keeps its filled folders in the accent color.
- Mantine's `Tree`, controlled: the open folder is selected, and the path to it is always expanded (derived from the
  open folder, so the tree's own initialization, which React's StrictMode runs twice, cannot collapse it); the user
  expands and collapses the rest (the chevron, or a click on the open folder). A click on a folder opens it.

## Table

- Compact (2026-10-07, the user's wish; `density="compact"` in `shared/ui/dataTable.tsx`, like the User Manager's).
  The footer only when there is something to page (`footer="auto"`), the number of rows after the title
  (`showTotal`), like the Time Tracker's (2026-10-07).
- A folder's contents: subfolders first (a folder icon in the accent color, its name a link that opens it), then files
  (an icon per kind, in a color per kind).
- Columns: Name (sortable), Kind (a filter: one or more kinds; with kinds chosen, no folders), Type (the extension,
  sortable), Size (a folder: "5 items"; sortable), Modified (a date range filter, sortable), Owner (a filter: one or
  more, sortable). All but Name can be hidden. A search (the names). 50 per page (25, 50, 100; 2026-10-08, the
  user's wish, the default of `DataTable` in every app; 25 before). By name by default.
- A new table per folder (`key`): page, search and filters start fresh.
- Actions:
  - "Up" (toolbar, 2026-10-07, the user's wish, in place of a ".." row: the data table has no unselectable rows):
    opens the parent folder, the tooltip says which ("Up to "Marketing""); not in the root. Pinned (2026-10-10, the
    user's wish: `pinned: true`): at the start of the bar, before Reload, and still there while files are selected.
  - "New folder" and "Upload" (toolbar).
  - Open (the arrow in each row; the default action, so a double click on a row's free space does it too): only for
    folders (2026-10-10, the user's wish: for a file it did the same as Details; the data table's `visible`). A double
    click on a file shows its details (Details is a default action too: the first one marked that is there for the
    row counts).
  - Details and Rename (icons in each row and in the selection bar for one row).
  - Move, Delete (danger), Download (a menu: as zip, as tar.gz) for the selected rows.
- New folder, Rename: a form dialog with one field (`NameForm`, the overlays' `<Form confirm>`): an empty name is
  refused at once; the server refuses a name a sibling folder has already (ignoring the case), or a slash; the message
  shows under the field and the dialog stays open. Renaming a file selects the name without its extension first.
- Move: a form dialog with the folder tree (`MoveForm`), opened at the current folder; the current folder, the
  folders being moved (with everything in them) cannot be chosen; the tree starts with the storages (the root is not
  in it). "Into: Files › …" shows the choice.
- Delete moves into the trash (2026-10-08; deleted for good before): a plain confirmation "Move to trash" (in a scope:
  it stays open while moving; folders go with everything in them, the message says so, and that they can be
  restored), then a toast `3 items moved to the trash` with "Undo" (restores them).
- Upload: a form drawer with the file upload (Mantine's look), into the open folder: each file is staged at once,
  "Apply" adds them, "Cancel" discards them.
- Details: a drawer (an info dialog, no icon, the name as title): a preview (made up: an image is a colored picture
  from its id, every other kind its icon), the description, a table of properties (type, size, dimensions or duration
  where they fit, folder path, owner, modified, versions, downloads, checksum) and the tags. A folder's drawer: its
  path, subfolders, items, owner, created.
- Download: a warning ("not available in this demo").
- Toasts after every change: `Folder "Drafts" created`, `"Logo.png" renamed`, `2 items moved to "Fonts"`,
  `3 items moved to the trash`, `"report.pdf" uploaded`.

## Texts

- English only (the data table and the file upload follow `<html lang>` through their demos' i18n adapters). The
  code says `MediaFile`, not `File` (that would clash with the DOM's `File`).
