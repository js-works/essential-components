# Media Manager

The "Media Manager" tab of the root's demo page: a demo of the root (not of a package), because it combines three
packages: a data navigator lists the attachments, dialogs and toasts of the overlays package, and a file upload (React
wrapper) in a drawer adds new ones. The rules of the root's `CLAUDE.md` apply.

## The table

- Compact (`density="compact"`), striped, with the default accent selection, and has a search, a Reload button
  (`reloadable`), a column toggle menu (every column but the filename is `hideable`), sorting (by default by filename,
  ascending), paging, column filters, in the data navigator's filter view (Filename: a text filter, contains, starts
  with or ends with; User, Type and Size: one or more; Uploaded: a date range, `dateRangeColumnFilter()`; the types are
  a fixed list of common ones, `TYPES`; the sizes are small < 100 kB, medium 100 kB – 1 MB, large ≥ 1 MB, `SIZES`).
- Multi-selection with "Delete" for the selected rows (in the selection bar, which takes the toolbar's place while rows
  are selected), and "Delete" in each row (`contextMenu: false`: in the context menu, the "Delete" of the selection does
  the same).
  - Both ask first, in a critical confirmation dialog of the overlays package (`confirmCritical`: a "Delete" button in
    the danger style, no confirm on Enter), with the file name, or for several files only their number ("Delete the 3
    selected files?", no list: the table shows which ones).
  - Deleting takes a second (`DELETE_TIME`): the dialog is opened in a scope (`dialogs.open()`), so it stays open
    after "Delete", its button shows a spinner, and it closes when the files are gone (`scope.dispose()`).
- The type of a file is its extension in capitals (`PDF`, `XLSX`), not its MIME type: a MIME type can be very long
  (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`).

## Toasts

- Toasts of the overlays package, bottom right (`toasts: { placement: 'bottom-end', size: 'small', stacked: true }` in
  the provider's config): "3 files deleted" after a delete, "2 files uploaded" after an "Apply" of the upload drawer.
  For a single file, its name instead: `"report.txt" deleted`, `"report.txt" uploaded`.

## Actions

- "Upload" (the first general action in the toolbar, an upload icon) opens a form drawer
  (`dialogs.form({ surface: 'drawer' })`, "Upload files", buttons "Apply" and "Cancel") with the file upload
  (`multiple`, `previews`, `required`, `name="files"`). Each added file is uploaded at once, but only staged on the fake
  server (not in the table yet).
  - "Apply" adds the staged files (their ids are the upload's form values, `attempt.data.getAll('files')`) to the list
    (`commitUploads()`, takes a second, `COMMIT_TIME`: the button shows a spinner), closes the drawer, reloads the table
    and shows the toast.
  - The upload is a form control of the drawer's form, so the drawer's native validation blocks "Apply" while a file is
    unfinished or failed, and while there is no file (`required`), with the upload's own message.
  - "Cancel" (also Escape, the close button) discards the staged files (`discardUploads()`, the `result`s of the latest
    `items`); running uploads are aborted when the drawer removes the element.
- "Download" (the last action in the toolbar, a menu): "Selected file" (a row action, only while exactly one row is
  selected), a separator, "Selected files as zip", "Selected files as tar.gz" (rows actions, only while rows are
  selected). Every entry opens a warning dialog of the overlays package (`dialogs.warn()`): downloading is not available
  in the demo.
- "Information" (one icon-only single-row action, `show: 'both'`, tip "Information": the info icon in the action column
  of every row and in the selection bar while exactly one row is selected, before "Delete"; one entry in the context
  menu; the default action, `default: true`: a double click on a row opens it too) opens a drawer of the overlays
  package (an info dialog on the drawer surface, `dialogs.info({ surface: 'drawer' })`, with only "OK") with made-up
  details from the fake server (`getDetails()`: description, versions, downloads, tags, storage, checksum, stable per
  attachment).
  - Loading them takes a second (`DETAILS_TIME`); the drawer is opened in a scope (`dialogs.open()`), so the dialogs
    show their spinner meanwhile (after 300 ms), and the drawer replaces it.

## Files

- `attachments.ts`: the fake server, in memory for as long as the page is open (eleven seed files of four users, at
  least one of every type in `TYPES`; new uploads belong to the current user, "Admin"): the table's source, the upload
  function (progress by size; at the end the file is staged and its id is the result), commit and discard of staged
  files, and delete.
- `MediaManagerDemo.tsx`: the demo element (light DOM, React inside, registered as `media-manager-demo`). It uses the
  i18n adapters of the two packages' demos, so it follows `<html lang>`.

## Texts

- Its texts say "file"/"files" everywhere (never "attachment"). The code keeps its names (`Attachment`,
  `attachments.ts`): a type `File` would clash with the DOM's `File`.
