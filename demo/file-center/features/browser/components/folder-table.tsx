import { useNavigate } from '@tanstack/react-router';

import type { RowSource, TableActions, TableColumns, TableFilters } from '@local/data-table/react';
import { criteriaOf, dateRangeFilter, generalAction, multiRowAction, singleRowAction } from '@local/data-table/react';
import { useFindSource } from '@local/data-table/react-query';
import { DataTable, useSavedTableFilters, useTableActions } from '@local/micro-app';

import type { Folder } from '../../../domain/index.js';
import { FILE_SORT_KEYS, ROOT_ID } from '../../../domain/index.js';
import { formatDateTime, formatSize } from '../../../shared/lib/format.js';
import { appIcons } from '../../../shared/ui/icons.js';
import { folderLink, useBrowserService } from '../context.js';
import { useSetFavoriteFlow, useShowDetailsFlow } from '../entry-flows.js';
import { fileKindFilter, ownerFilter } from '../folder-filters.js';
import {
  useDownloadFlow,
  useMarkFavoritesFlow,
  useMoveEntriesFlow,
  useNewFolderFlow,
  useRenameEntryFlow,
  useTrashEntriesFlow,
  useUploadFilesFlow,
} from '../folder-flows.js';
import { browserKeys } from '../keys.js';
import { KIND_LABELS } from '../labels.js';
import type { EntryCriteria, EntryRow } from '../service.js';
import { EntryName } from './entry-name.js';

export { FolderTable };

function useSource(folder: Folder): RowSource<EntryRow> {
  const service = useBrowserService();

  return useFindSource(
    [...browserKeys.entries(), folder.id],
    FILE_SORT_KEYS,
    criteriaOf<EntryCriteria>('text'),
    (...args) => service.entries(folder.id, ...args),
  );
}

function useColumns(): TableColumns<EntryRow> {
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
  ];
}

function useFilters(owners: readonly string[]): TableFilters {
  return {
    kinds: { label: 'Kind', filter: fileKindFilter },
    modified: dateRangeFilter(),
    owners: { label: 'Owner', filter: ownerFilter(owners) },
  };
}

function useActions(folder: Folder, folders: readonly Folder[]): TableActions<EntryRow> {
  const { deleteAction, newAction, openAction } = useTableActions();
  const navigate = useNavigate();
  const showDetails = useShowDetailsFlow(folders);
  const markFavorites = useMarkFavoritesFlow();
  const newFolder = useNewFolderFlow(folder);
  const renameEntry = useRenameEntryFlow();
  const moveEntries = useMoveEntriesFlow(folder, folders);
  const trashEntries = useTrashEntriesFlow();
  const uploadFiles = useUploadFilesFlow(folder);
  const download = useDownloadFlow();
  const parent = folders.find((candidate) => candidate.id === folder.parentId);
  const list: TableActions<EntryRow> = [
    // To the parent folder: not in the root; pinned, so it stays while files are selected.
    ...(parent === undefined ? [] : [
      generalAction('up', () => navigate(folderLink(parent.id)), {
        label: 'Up',
        icon: appIcons.up,
        tip: `Up to "${parent.name}"`,
        pinned: true,
      }),
    ]),
    newAction('New folder', newFolder, { key: 'new-folder' }),
    generalAction('upload', uploadFiles, { label: 'Upload', icon: appIcons.upload, variant: 'tertiary' }),
    // The default actions (a double click): a folder opens, a file shows its details; "Open" only for folders.
    openAction((row) => navigate(folderLink(row.id)), { visible: (row) => row.entry === 'folder' }),
    singleRowAction('info', showDetails, {
      variant: 'tertiary',
      icon: appIcons.info,
      tip: 'Details',
      show: 'both',
      default: true,
    }),
    singleRowAction('rename', renameEntry, { label: 'Rename', icon: appIcons.rename, show: 'both' }),
    multiRowAction('move', moveEntries, { label: 'Move', icon: appIcons.move }),
    deleteAction(trashEntries),
    {
      type: 'menu',
      key: 'favorites',
      tip: 'Favorites',
      variant: 'tertiary',
      icon: appIcons.star,
      actions: [
        multiRowAction('favorite-add', (rows) => markFavorites(rows, true), { label: 'Add to favorites' }),
        multiRowAction('favorite-remove', (rows) => markFavorites(rows, false), { label: 'Remove from favorites' }),
      ],
    },
    {
      type: 'menu',
      key: 'download',
      tip: 'Download',
      variant: 'tertiary',
      icon: appIcons.download,
      actions: [
        multiRowAction('download-zip', download, { label: 'Selected items as zip' }),
        multiRowAction('download-tgz', download, { label: 'Selected items as tar.gz' }),
      ],
    },
  ];

  return folder.id === ROOT_ID
    ? list.filter((action) => !['new-folder', 'upload', 'rename', 'move', 'delete'].includes(action.key))
    : list;
}

function FolderTable({ folder, folders, owners }: {
  folder: Folder;
  folders: readonly Folder[];
  owners: readonly string[];
}) {
  const source = useSource(folder);
  const columns = useColumns();
  const filters = useFilters(owners);
  const actions = useActions(folder, folders);
  const savedFilters = useSavedTableFilters('files');

  return (
    <DataTable
      title={folder.name}
      subtitle={folder.id === ROOT_ID
        ? 'The storages where the folders and files are kept. A double click opens one.'
        : 'Folders first, then files. A double click opens a folder or shows a file\'s details.'}
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
      empty="This folder is empty. Create a folder or upload files."
    />
  );
}
