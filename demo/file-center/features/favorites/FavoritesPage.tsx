import {
  defineActions,
  defineColumns,
  defineFilters,
  multiRowAction,
  singleRowAction,
  useDataTableController,
} from '@local/data-table/react';
import type { RowQuery, SavedFilter } from '@local/data-table/react';
import { useToast } from '@local/overlays/react';
import { Anchor } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { Link, useNavigate } from 'react-router';
import type { NavigateFunction } from 'react-router';
import { ancestorsOf } from '../../domain/index.js';
import type { FileKind, FileSortKey, Folder } from '../../domain/index.js';
import { countText, formatDateTime, formatSize } from '../../shared/lib/format.js';
import { useQuerySource } from '../../shared/lib/useQuerySource.js';
import { DataTable } from '../../shared/ui/dataTable.js';
import { appIcons } from '../../shared/ui/icons.js';
import { sharedBy, useSavedFilters } from '../../shared/ui/savedFilters.js';
import { openAction } from '../../shared/ui/tableActions.js';
import {
  browserKeys,
  EntryName,
  fileKindFilter,
  folderPath,
  KIND_LABELS,
  ownerFilter,
  useBrowserService,
  useEntryActions,
} from '../browser/index.js';
import type { EntryActions, EntryCriteria, EntryRow } from '../browser/index.js';

export { FavoritesPage };

const SORT_KEYS: readonly FileSortKey[] = ['name', 'type', 'size', 'modified', 'owner'];

// The table's state as the service's query: its search and filters, its sort, its page as a window.
function toCriteria(query: RowQuery): EntryCriteria {
  const { kind, owner } = query.filters as Record<string, unknown>;

  return {
    ...(query.search.trim() === '' ? {} : { text: query.search }),
    ...(Array.isArray(kind) && kind.length > 0 ? { kinds: kind as FileKind[] } : {}),
    ...(Array.isArray(owner) && owner.length > 0 ? { owners: owner as string[] } : {}),
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
  sharedBy('Claire Dubois', 'Documents', { kind: ['document'] }),
  sharedBy('Ben Carter', 'From Anna', { owner: ['Anna Schröder'] }),
];

// The columns of the favorites (the folder of an entry: from `folders`).
const columnsOf = ({ setFavorite }: EntryActions, folders: readonly Folder[]) =>
  defineColumns<EntryRow>([
    {
      key: 'name',
      header: 'Name',
      width: 4,
      sortable: true,
      render: (row) => <EntryName row={row} onFavorite={(entry, favorite) => setFavorite([entry], favorite)} />,
    },
    {
      // A key of the row (`entry` is shown nowhere else): the folder it is in.
      key: 'entry',
      header: 'Folder',
      width: 3,
      hideable: true,
      render: (row) => (
        <FolderLink folders={folders} id={row.entry === 'folder' ? row.folder.parentId : row.file.folderId} />
      ),
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

// The filters of the favorites (the owners: those there are).
const filtersOf = (owners: readonly string[]) => defineFilters({ kind: fileKindFilter, owner: ownerFilter(owners) });

// What the actions of the favorites need: the entries' actions, where a folder opens, and the toasts.
type FavoriteContext = { entries: EntryActions; navigate: NavigateFunction; toasts: ReturnType<typeof useToast> };

// The actions of the favorites: open (the default action: a folder opens, a file shows its details), details, remove
// from the favorites.
const actionsOf = ({ entries, navigate, toasts }: FavoriteContext) =>
  defineActions<EntryRow>([
    openAction((row) => (row.entry === 'folder' ? navigate(folderPath(row.id)) : entries.showDetails(row))),
    singleRowAction('info', entries.showDetails, { icon: appIcons.info, tip: 'Details', show: 'both' }),
    multiRowAction(
      'favorite-remove',
      (rows) =>
        entries.setFavorite(rows, false).then(() =>
          toasts.success(`${countText(rows.map((row) => row.name), 'items')} removed from favorites`)
        ),
      { label: 'Remove from favorites', icon: appIcons.star },
    ),
  ]);

// The module "Favorites" (2026-10-08): the folders and files marked as favorites, from all folders; the folders first.
// A double click (or the arrow) opens a folder or shows a file's details; a star (or "Remove from favorites") unmarks
// one, and it leaves the list.
function FavoritesPage(): ReactElement {
  const service = useBrowserService();
  const nav = useDataTableController<EntryRow>();
  const savedFilters = useSavedFilters('file-center:saved-filters:favorites', COLLEAGUES_FILTERS);
  const { data: folders = [] } = useQuery({
    queryKey: browserKeys.folders(),
    queryFn: ({ signal }) => service.folders(signal),
  });
  const { data: owners = [] } = useQuery({
    queryKey: browserKeys.owners(),
    queryFn: ({ signal }) => service.owners(signal),
  });
  const ctx = { entries: useEntryActions(folders), navigate: useNavigate(), toasts: useToast() };

  const source = useQuerySource<EntryRow>(
    (query) => browserKeys.favoritePage(toCriteria(query), toSort(query), toPaging(query)),
    async (query, signal) => {
      const page = await service.favorites(toCriteria(query), toSort(query), toPaging(query), signal);

      return { rows: page.items, total: page.total };
    },
    browserKeys.favorites(),
    nav.reload,
  );

  return (
    <DataTable
      controller={nav}
      title="Favorites"
      subtitle="The folders and files marked with a star, from all folders. A double click opens a folder or shows a file's details."
      source={source}
      rowKey="key"
      columns={columnsOf(ctx.entries, folders)}
      filters={filtersOf(owners)}
      actions={actionsOf(ctx)}
      searchable
      reloadable
      pageSizeOptions={[25, 50, 100]}
      savedFilters={savedFilters}
      defaultSort={{ key: 'name', direction: 'asc' }}
      empty="No favorites yet. Mark folders and files with their star."
    />
  );
}

// The folder an entry is in: its path from the storage on ("Company share › Projects"), a link that opens it. None
// for a storage (it is in the root).
function FolderLink({ folders, id }: { folders: readonly Folder[]; id: string | null }): ReactElement | null {
  const path = id === null ? [] : ancestorsOf(folders, id).slice(1);

  return id === null || path.length === 0 ? null : (
    <Anchor component={Link} to={folderPath(id)} size="sm" truncate>
      {path.map((ancestor) => ancestor.name).join(' › ')}
    </Anchor>
  );
}
