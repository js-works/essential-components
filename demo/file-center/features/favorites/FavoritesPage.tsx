import { Anchor } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { Link, useNavigate } from 'react-router';
import { selectColumnFilter, useDataTableController } from '../../../../packages/data-table/src/react';
import type { DataTableComponent } from '../../../../packages/data-table/src/react';
import { useToast } from '../../../../packages/overlays/src/main/bindings/react';
import { ancestorsOf, FILE_KINDS } from '../../domain';
import type { FileKind, FileSortKey, Folder } from '../../domain';
import { countText, formatDateTime, formatSize } from '../../shared/lib/format';
import { useQuerySource } from '../../shared/lib/useQuerySource';
import { DataTable } from '../../shared/ui/dataTable';
import { appIcons } from '../../shared/ui/icons';
import { browserKeys, EntryName, folderPath, KIND_LABELS, useBrowserService, useEntryActions } from '../browser';
import type { EntryCriteria, EntryRow } from '../browser';

export { FavoritesPage };

const SORT_KEYS: readonly FileSortKey[] = ['name', 'type', 'size', 'modified', 'owner'];

// The table's state as the service's query: its search and filters, its sort, its page as a window.
function toCriteria(query: DataTableComponent.Query): EntryCriteria {
  const { kind, owner } = query.filters as Record<string, unknown>;

  return {
    ...(query.search.trim() === '' ? {} : { text: query.search }),
    ...(Array.isArray(kind) && kind.length > 0 ? { kinds: kind as FileKind[] } : {}),
    ...(Array.isArray(owner) && owner.length > 0 ? { owners: owner as string[] } : {}),
  };
}

function toSort(query: DataTableComponent.Query) {
  const key = query.sort?.key as FileSortKey | undefined;

  return query.sort !== undefined && key !== undefined && SORT_KEYS.includes(key)
    ? { key, direction: query.sort.direction }
    : undefined;
}

const toPaging = (query: DataTableComponent.Query) => ({
  offset: (query.page - 1) * query.pageSize,
  limit: query.pageSize,
});

// The module "Favorites" (2026-10-08): the folders and files marked as favorites, from all folders; the folders first.
// A double click (or the arrow) opens a folder or shows a file's details; a star (or "Remove from favorites") unmarks
// one, and it leaves the list.
function FavoritesPage(): ReactElement {
  const service = useBrowserService();
  const navigate = useNavigate();
  const toasts = useToast();
  const nav = useDataTableController<EntryRow>();
  const { data: folders = [] } = useQuery({
    queryKey: browserKeys.folders(),
    queryFn: ({ signal }) => service.folders(signal),
  });
  const { data: owners = [] } = useQuery({
    queryKey: browserKeys.owners(),
    queryFn: ({ signal }) => service.owners(signal),
  });
  const { setFavorite, showDetails } = useEntryActions(folders);

  const source = useQuerySource<EntryRow>(
    (query) => browserKeys.favoritePage(toCriteria(query), toSort(query), toPaging(query)),
    async (query, signal) => {
      const page = await service.favorites(toCriteria(query), toSort(query), toPaging(query), signal);

      return { rows: page.items, total: page.total };
    },
    browserKeys.favorites(),
    nav.reload,
  );

  const columns = useMemo((): readonly DataTableComponent.Column<EntryRow>[] => [
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
      filter: selectColumnFilter({
        options: FILE_KINDS.map((kind) => ({ value: kind, label: KIND_LABELS[kind] })),
        multiple: true,
      }),
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
      filter: selectColumnFilter({ options: owners.map((owner) => ({ value: owner, label: owner })), multiple: true }),
    },
  ], [folders, owners, setFavorite]);

  const actions = useMemo((): readonly DataTableComponent.Action<EntryRow>[] => [
    // The default action (a double click): a folder opens, a file shows its details.
    {
      type: 'singleRow',
      key: 'open',
      icon: appIcons.open,
      tip: 'Open',
      show: 'column',
      default: true,
      onClick: (row) => void (row.entry === 'folder' ? navigate(folderPath(row.id)) : showDetails(row)),
    },
    {
      type: 'singleRow',
      key: 'info',
      icon: appIcons.info,
      tip: 'Details',
      show: 'both',
      onClick: (row) => void showDetails(row),
    },
    {
      type: 'multiRow',
      key: 'favorite-remove',
      label: 'Remove from favorites',
      icon: appIcons.star,
      onClick: (rows) =>
        void setFavorite(rows, false).then(() =>
          toasts.success(`${countText(rows.map((row) => row.name), 'items')} removed from favorites`)
        ),
    },
  ], [navigate, showDetails, setFavorite, toasts]);

  return (
    <DataTable
      controller={nav}
      title="Favorites"
      subtitle="The folders and files marked with a star, from all folders. A double click opens a folder or shows a file's details."
      source={source}
      rowKey="key"
      columns={columns}
      actions={actions}
      searchable
      reloadable
      pageSizeOptions={[25, 50, 100]}
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
