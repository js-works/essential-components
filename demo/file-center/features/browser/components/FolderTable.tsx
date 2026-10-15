import {
  dateRangeFilter,
  defineActions,
  defineColumns,
  defineFilters,
  generalAction,
  multiRowAction,
  singleRowAction,
  useDataTableController,
} from '@local/data-table/react';
import type { RowQuery, SavedFilter } from '@local/data-table/react';
import type { ReactElement } from 'react';
import { useNavigate } from 'react-router';
import type { NavigateFunction } from 'react-router';
import { ROOT_ID } from '../../../domain/index.js';
import type { FileKind, FileSortKey, Folder } from '../../../domain/index.js';
import { formatDateTime, formatSize } from '../../../shared/lib/format.js';
import { useQuerySource } from '../../../shared/lib/useQuerySource.js';
import { DataTable } from '../../../shared/ui/dataTable.js';
import { appIcons } from '../../../shared/ui/icons.js';
import { sharedBy, useSavedFilters } from '../../../shared/ui/savedFilters.js';
import { deleteAction, newAction, openAction } from '../../../shared/ui/tableActions.js';
import { folderPath, useBrowserService } from '../context.js';
import { fileKindFilter, ownerFilter } from '../filters.js';
import { useFolderFlows } from '../folderFlows.js';
import type { FolderFlows } from '../folderFlows.js';
import { browserKeys } from '../keys.js';
import { KIND_LABELS } from '../labels.js';
import type { EntryCriteria, EntryRow } from '../service.js';
import { useEntryActions } from '../useEntryActions.js';
import type { EntryActions } from '../useEntryActions.js';
import { EntryName } from './EntryName.js';

export { FolderTable };

const SORT_KEYS: readonly FileSortKey[] = ['name', 'type', 'size', 'modified', 'owner'];

// The table's state as the service's query: its search and filters as file criteria, its sort, its page as a window.
function toCriteria(query: RowQuery): EntryCriteria {
  const { kind, owner, modified } = query.filters as Record<string, unknown>;
  const range = modified as { from?: string; to?: string } | undefined;

  return {
    ...(query.search.trim() === '' ? {} : { text: query.search }),
    ...(Array.isArray(kind) && kind.length > 0 ? { kinds: kind as FileKind[] } : {}),
    ...(Array.isArray(owner) && owner.length > 0 ? { owners: owner as string[] } : {}),
    ...(range !== undefined && range !== null && (range.from !== undefined || range.to !== undefined)
      ? { modified: range }
      : {}),
  };
}

function toSort(query: RowQuery) {
  const key = query.sort?.key as FileSortKey | undefined;

  return query.sort !== undefined && key !== undefined && SORT_KEYS.includes(key)
    ? { key, direction: query.sort.direction }
    : undefined;
}

const toPaging = (query: RowQuery) => ({
  offset: (query.page - 1) * query.pageSize,
  limit: query.pageSize,
});

// The colleagues' shared filters of this table (2026-10-11, the user's wish: to show sharing).
const COLLEAGUES_FILTERS: readonly SavedFilter[] = [
  sharedBy('Anna Schröder', 'Images', { kind: ['image'] }),
  sharedBy('Ben Carter', 'Office documents', { kind: ['document', 'spreadsheet', 'presentation'] }),
  sharedBy('Claire Dubois', 'My files', { owner: ['Claire Dubois'] }),
];

// The columns of a folder's contents.
const columnsOf = ({ setFavorite }: EntryActions) =>
  defineColumns<EntryRow>([
    {
      key: 'name',
      header: 'Name',
      width: 4,
      sortable: true,
      render: (row) => <EntryName row={row} onFavorite={(entry, favorite) => setFavorite([entry], favorite)} />,
    },
    {
      key: 'kind',
      header: 'Kind',
      width: 1.7,
      hideable: true,
      render: (row) =>
        row.entry === 'folder' ? (row.folder.storage === true ? 'Storage' : 'Folder') : KIND_LABELS[row.kind],
    },
    {
      key: 'type',
      header: 'Type',
      width: 1.4,
      sortable: true,
      hideable: true,
      render: (row) => (row.entry === 'folder' ? '' : row.type),
    },
    {
      key: 'size',
      header: 'Size',
      width: 1.4,
      sortable: true,
      hideable: true,
      align: 'end',
      render: (row) =>
        row.entry === 'folder' ? (row.size === 1 ? '1 item' : `${row.size} items`) : formatSize(row.size),
    },
    {
      key: 'modified',
      header: 'Modified',
      width: 2.2,
      sortable: true,
      hideable: true,
      render: (row) => formatDateTime(row.modified),
    },
    {
      key: 'owner',
      header: 'Owner',
      width: 2,
      sortable: true,
      hideable: true,
    },
  ]);

// The filters of a folder's contents (the owners: those there are).
const filtersOf = (owners: readonly string[]) =>
  defineFilters({ kind: fileKindFilter, modified: dateRangeFilter(), owner: ownerFilter(owners) });

// What the actions of a folder's contents need: the folder's flows, the entries' actions, where a folder opens, the
// folder and the one above it (none in the root).
type FolderContext = {
  flows: FolderFlows;
  entries: EntryActions;
  navigate: NavigateFunction;
  folder: Folder;
  parent: Folder | undefined;
};

// The actions of a folder's contents. The root ("Files") holds only the storages (2026-10-07): nothing is created or
// uploaded there, and a storage is not renamed, moved or deleted (they are set up elsewhere; the server refuses it
// too).
const actionsOf = ({ flows, entries, navigate, folder, parent }: FolderContext) => {
  const list = defineActions<EntryRow>([
    // To the parent folder (2026-10-07, the user's wish; in place of a ".." row): not in the root. Pinned (2026-10-10,
    // the user's wish): at the start of the bar, and still there while files are selected.
    ...(parent === undefined ? [] : [
      generalAction('up', () => navigate(folderPath(parent.id)), {
        label: 'Up',
        icon: appIcons.up,
        tip: `Up to "${parent.name}"`,
        pinned: true,
      }),
    ]),
    newAction('New folder', flows.newFolder, { key: 'new-folder' }),
    // The secondary actions of the toolbar as ghost buttons (2026-10-11, the user's wish: `tertiary`).
    generalAction('upload', flows.upload, { label: 'Upload', icon: appIcons.upload, variant: 'tertiary' }),
    // The default actions (a double click): a folder opens, a file shows its details (the first one marked that is
    // there for the row). "Open" only for folders (2026-10-10, the user's wish: for a file it did the same as
    // "Details"; the data table's `visible`).
    openAction((row) => navigate(folderPath(row.id)), { visible: (row) => row.entry === 'folder' }),
    singleRowAction('info', entries.showDetails, {
      variant: 'tertiary',
      icon: appIcons.info,
      tip: 'Details',
      show: 'both',
      default: true,
    }),
    // Outlined (2026-10-11, the user's wish), like Move; with its text in the selection bar (the same day; icon only
    // before), the icon only in the rows (the table's `rowActionLook`), named by its label.
    singleRowAction('rename', flows.rename, { label: 'Rename', icon: appIcons.rename, show: 'both' }),
    // Outlined (2026-10-11, the user's wish): the main action on the selection.
    multiRowAction('move', flows.move, { label: 'Move', icon: appIcons.move }),
    deleteAction(flows.remove),
    {
      type: 'menu',
      key: 'favorites',
      // Icon only, with its tooltip (2026-10-11, the user's wish), like Download.
      tip: 'Favorites',
      variant: 'tertiary',
      icon: appIcons.star,
      actions: [
        multiRowAction('favorite-add', (rows) => flows.favorites(rows, true), { label: 'Add to favorites' }),
        multiRowAction('favorite-remove', (rows) => flows.favorites(rows, false), { label: 'Remove from favorites' }),
      ],
    },
    {
      type: 'menu',
      key: 'download',
      tip: 'Download',
      variant: 'tertiary',
      icon: appIcons.download,
      actions: [
        multiRowAction('download-zip', flows.download, { label: 'Selected items as zip' }),
        multiRowAction('download-tgz', flows.download, { label: 'Selected items as tar.gz' }),
      ],
    },
  ]);

  return folder.id === ROOT_ID
    ? list.filter((action) => !['new-folder', 'upload', 'rename', 'move', 'delete'].includes(action.key))
    : list;
};

// A folder's contents: its subfolders first, then its files, in one table.
function FolderTable({ folder, folders, owners }: {
  folder: Folder;
  folders: readonly Folder[];
  owners: readonly string[];
}): ReactElement {
  const service = useBrowserService();
  const nav = useDataTableController<EntryRow>();
  const entries = useEntryActions(folders);
  const ctx = {
    flows: useFolderFlows(folder, folders),
    entries,
    navigate: useNavigate(),
    folder,
    parent: folders.find((candidate) => candidate.id === folder.parentId),
  };
  const savedFilters = useSavedFilters('file-center:saved-filters:files', COLLEAGUES_FILTERS);

  const source = useQuerySource<EntryRow>(
    (query) => browserKeys.entryPage(folder.id, toCriteria(query), toSort(query), toPaging(query)),
    async (query, signal) => {
      const page = await service.entries(folder.id, toCriteria(query), toSort(query), toPaging(query), signal);

      return { rows: page.items, total: page.total };
    },
    browserKeys.entries(),
    nav.reload,
  );

  return (
    <DataTable
      controller={nav}
      title={folder.name}
      subtitle={folder.id === ROOT_ID
        ? 'The storages where the folders and files are kept. A double click opens one.'
        : 'Folders first, then files. A double click opens a folder or shows a file\'s details.'}
      source={source}
      rowKey="key"
      columns={columnsOf(entries)}
      filters={filtersOf(owners)}
      actions={actionsOf(ctx)}
      searchable
      reloadable
      pageSizeOptions={[25, 50, 100]}
      savedFilters={savedFilters}
      defaultSort={{ key: 'name', direction: 'asc' }}
      empty="This folder is empty. Create a folder or upload files."
    />
  );
}
