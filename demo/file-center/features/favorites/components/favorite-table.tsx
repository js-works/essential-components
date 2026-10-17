import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import type { RowSource, TableActions, TableColumns, TableFilters } from '@local/data-table/react';
import { criteriaOf, multiRowAction, singleRowAction } from '@local/data-table/react';
import { useFindSource } from '@local/data-table/react-query';
import { AnchorLink, DataTable, useSavedTableFilters, useTableActions } from '@local/micro-app';
import { useToast } from '@local/overlays/react';

import type { Folder } from '../../../domain/index.js';
import { ancestorsOf, FILE_SORT_KEYS } from '../../../domain/index.js';
import { countText, formatDateTime, formatSize } from '../../../shared/lib/format.js';
import { appIcons } from '../../../shared/ui/icons.js';
import type { EntryCriteria, EntryRow } from '../../browser/index.js';
import {
  browserKeys,
  EntryName,
  fileKindFilter,
  folderLink,
  KIND_LABELS,
  ownerFilter,
  useBrowserService,
  useSetFavoriteFlow,
  useShowDetailsFlow,
} from '../../browser/index.js';

export { FavoriteTable };

function useSource(): RowSource<EntryRow> {
  const service = useBrowserService();

  return useFindSource(
    browserKeys.favorites(),
    FILE_SORT_KEYS,
    criteriaOf<EntryCriteria>('text'),
    service.favorites,
  );
}

function useColumns(folders: readonly Folder[]): TableColumns<EntryRow> {
  const setFavorite = useSetFavoriteFlow();

  return [
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
  ];
}

function useFilters(owners: readonly string[]): TableFilters {
  return { kinds: { label: 'Kind', filter: fileKindFilter }, owners: { label: 'Owner', filter: ownerFilter(owners) } };
}

function useActions(folders: readonly Folder[]): TableActions<EntryRow> {
  const { openAction } = useTableActions();
  const navigate = useNavigate();
  const toasts = useToast();
  const showDetails = useShowDetailsFlow(folders);
  const setFavorite = useSetFavoriteFlow();

  return [
    openAction((row) => (row.entry === 'folder' ? navigate(folderLink(row.id)) : showDetails(row))),
    singleRowAction('info', showDetails, { icon: appIcons.info, tip: 'Details', show: 'both' }),
    multiRowAction(
      'favorite-remove',
      (rows) =>
        setFavorite(rows, false).then(() =>
          toasts.success(`${countText(rows.map((row) => row.name), 'items')} removed from favorites`)
        ),
      { label: 'Remove from favorites', icon: appIcons.star },
    ),
  ];
}

function FavoriteTable() {
  const source = useSource();
  const service = useBrowserService();
  const savedFilters = useSavedTableFilters('favorites');
  const { data: folders = [] } = useQuery({
    queryKey: browserKeys.folders(),
    queryFn: ({ signal }) => service.folders(signal),
  });
  const { data: owners = [] } = useQuery({
    queryKey: browserKeys.owners(),
    queryFn: ({ signal }) => service.owners(signal),
  });
  const columns = useColumns(folders);
  const filters = useFilters(owners);
  const actions = useActions(folders);

  return (
    <DataTable
      title="Favorites"
      subtitle="The folders and files marked with a star, from all folders. A double click opens a folder or shows a file's details."
      source={source}
      rowKey="key"
      columns={columns}
      filters={filters}
      actions={actions}
      searchable
      reloadable
      pageSizeOptions={[25, 50, 100]}
      savedFilters={savedFilters}
      defaultSort={{ key: 'name', direction: 'asc' }}
      empty="No favorites yet. Mark folders and files with their star."
    />
  );
}

function FolderLink({ folders, id }: { folders: readonly Folder[]; id: string | null }) {
  const path = id === null ? [] : ancestorsOf(folders, id).slice(1);

  return id === null || path.length === 0 ? null : (
    <AnchorLink {...folderLink(id)} size="sm" truncate>
      {path.map((ancestor) => ancestor.name).join(' › ')}
    </AnchorLink>
  );
}
