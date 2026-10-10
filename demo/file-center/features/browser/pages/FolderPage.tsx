import { Anchor, Stack, Text } from '@mantine/core';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
  dateRangeColumnFilter,
  selectColumnFilter,
  useDataTableController,
} from '../../../../../packages/data-table/src/react';
import type { DataTableComponent } from '../../../../../packages/data-table/src/react';
import { createDemoI18n } from '../../../../../packages/file-upload/demo/i18n';
import type { FileUpload } from '../../../../../packages/file-upload/src';
import { createFileUploadComponent } from '../../../../../packages/file-upload/src/react';
import { useDialogs, useToast } from '../../../../../packages/overlays/src/main/bindings/react';
import { FILE_KINDS, ROOT_ID } from '../../../domain';
import type { FileKind, FileSortKey, Folder, MediaFile } from '../../../domain';
import { countText, formatDateTime, formatSize } from '../../../shared/lib/format';
import { useQuerySource } from '../../../shared/lib/useQuerySource';
import { DataTable } from '../../../shared/ui/dataTable';
import { appIcons } from '../../../shared/ui/icons';
import { EntryName } from '../components/EntryName';
import { MoveForm } from '../components/MoveForm';
import { NameForm } from '../components/NameForm';
import { confirmAndRun } from '../confirmAndRun';
import { folderPath, useBrowserService } from '../context';
import { browserKeys } from '../keys';
import { KIND_LABELS } from '../labels';
import type { EntryCriteria, EntryRow } from '../service';
import { useEntryActions } from '../useEntryActions';

export { FolderPage };

const uploadI18n = createDemoI18n();

// The file upload in Mantine's look: its theme values are Mantine's variables (inherited into its shadow DOM from the
// scope), like the data table's `mantineTheme`.
const MANTINE_UPLOAD_THEME: FileUpload.Theme = {
  accentColor: 'var(--mantine-primary-color-filled)',
  accentTextColor: 'var(--mantine-primary-color-contrast)',
  textColor: 'var(--mantine-color-text)',
  mutedColor: 'var(--mantine-color-dimmed)',
  borderColor: 'var(--mantine-color-default-border)',
  surfaceColor: 'var(--mantine-color-default-hover)',
  successColor: 'var(--mantine-color-green-text)',
  dangerColor: 'var(--mantine-color-error)',
  borderRadius: 'var(--mantine-radius-default)',
  buttonBorderRadius: 'var(--mantine-radius-default)',
  fontFamily: 'var(--mantine-font-family)',
  fontSize: 'var(--mantine-font-size-sm)',
};

const MediaUpload = createFileUploadComponent({
  i18n: { type: 'factory', getAdapter: () => uploadI18n },
  theme: MANTINE_UPLOAD_THEME,
});

const SORT_KEYS: readonly FileSortKey[] = ['name', 'type', 'size', 'modified', 'owner'];

// The table's state as the service's query: its search and filters as file criteria, its sort, its page as a window.
function toCriteria(query: DataTableComponent.Query): EntryCriteria {
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

// A folder's contents: its subfolders first, then its files, in one table. A double click (or the arrow) opens a
// folder, or a file's details. New folders and uploads go into this folder.
function FolderPage(): ReactElement {
  const folderId = useParams()['folderId'] ?? ROOT_ID;
  const service = useBrowserService();
  const { data: folders } = useQuery({
    queryKey: browserKeys.folders(),
    queryFn: ({ signal }) => service.folders(signal),
  });
  const { data: owners = [] } = useQuery({
    queryKey: browserKeys.owners(),
    queryFn: ({ signal }) => service.owners(signal),
  });
  const folder = folders?.find((candidate) => candidate.id === folderId);

  if (folders === undefined) {
    return <></>;
  }

  if (folder === undefined) {
    return (
      <Stack gap={4} p="md">
        <Text fw={600}>This folder does not exist (anymore).</Text>
        <Anchor component={Link} to={folderPath(ROOT_ID)} size="sm">Back to Files</Anchor>
      </Stack>
    );
  }

  // A new table per folder: its page, search and filters start fresh.
  return <FolderTable key={folder.id} folder={folder} folders={folders} owners={owners} />;
}

function FolderTable({ folder, folders, owners }: {
  folder: Folder;
  folders: readonly Folder[];
  owners: readonly string[];
}): ReactElement {
  const service = useBrowserService();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const nav = useDataTableController<EntryRow>();
  const dialogs = useDialogs();
  const toasts = useToast();
  const { setFavorite, showDetails } = useEntryActions(folders);

  const source = useQuerySource<EntryRow>(
    (query) => browserKeys.entryPage(folder.id, toCriteria(query), toSort(query), toPaging(query)),
    async (query, signal) => {
      const page = await service.entries(folder.id, toCriteria(query), toSort(query), toPaging(query), signal);

      return { rows: page.items, total: page.total };
    },
    browserKeys.entries(),
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
      filter: dateRangeColumnFilter(),
    },
    {
      key: 'owner',
      header: 'Owner',
      width: 2,
      sortable: true,
      hideable: true,
      filter: selectColumnFilter({ options: owners.map((owner) => ({ value: owner, label: owner })), multiple: true }),
    },
  ], [owners, setFavorite]);

  const actions = useMemo(() => {
    const changed = () => queryClient.invalidateQueries({ queryKey: browserKeys.all });

    // Marks or unmarks the selected rows, then says so.
    const favorites = async (rows: readonly EntryRow[], favorite: boolean) => {
      await setFavorite(rows, favorite);
      toasts.success(
        `${countText(rows.map((row) => row.name), 'items')} ${favorite ? 'added to' : 'removed from'} favorites`,
      );
    };

    // Opens a folder (the action "Open" is only there for folders, see `visible`).
    const open = (row: EntryRow) => {
      if (row.entry === 'folder') {
        void navigate(folderPath(row.id));
      }
    };

    const newFolder = async () => {
      let created: Folder | undefined;
      const result = await dialogs.form({
        title: 'New folder',
        content: (
          <NameForm
            label="Name"
            save={async (name) => {
              created = await service.createFolder(folder.id, name);
            }}
          />
        ),
        buttons: { confirm: 'Create' },
      });

      if (!result.canceled && created !== undefined) {
        await changed();
        toasts.success(`Folder "${created.name}" created`);
      }
    };

    const rename = async (row: EntryRow) => {
      let renamed = row.name;
      const result = await dialogs.form({
        title: row.entry === 'folder' ? 'Rename folder' : 'Rename file',
        content: (
          <NameForm
            label="Name"
            initial={row.name}
            file={row.entry === 'file'}
            save={async (name) => {
              renamed = row.entry === 'folder'
                ? (await service.renameFolder(row.id, name)).name
                : (await service.renameFile(row.id, name)).name;
            }}
          />
        ),
        buttons: { confirm: 'Save' },
      });

      if (!result.canceled) {
        await changed();
        toasts.success(`"${renamed}" renamed`);
      }
    };

    const move = async (rows: readonly EntryRow[]) => {
      let target: string | undefined;
      const result = await dialogs.form({
        title: rows.length === 1 ? `Move "${rows[0]?.name ?? ''}"` : `Move ${rows.length} items`,
        content: (
          <MoveForm
            folders={folders}
            current={folder.id}
            moving={rows.flatMap((row) => (row.entry === 'folder' ? [row.id] : []))}
            save={async (targetId) => {
              await service.move(rows, targetId);
              target = targetId;
            }}
          />
        ),
        buttons: { confirm: 'Move' },
      });

      if (!result.canceled && target !== undefined) {
        const name = folders.find((candidate) => candidate.id === target)?.name ?? '';

        await changed();
        toasts.success(`${countText(rows.map((row) => row.name), 'items')} moved to "${name}"`);
      }
    };

    // Into the trash (2026-10-08; deleted for good before): a plain confirmation, and "Undo" in the toast.
    const remove = async (rows: readonly EntryRow[]) => {
      const [first] = rows;
      const withFolders = rows.some((row) => row.entry === 'folder');
      const done = await confirmAndRun(
        dialogs,
        {
          title: 'Move to trash',
          content: `${
            rows.length === 1 && first !== undefined
              ? `Move "${first.name}" to the trash?`
              : `Move the ${rows.length} selected items to the trash?`
          }${withFolders ? '\nFolders go with everything in them.' : ''}\nThey can be restored from the trash.`,
          buttons: { confirm: 'Move to trash' },
        },
        () => service.remove(rows),
        { critical: false },
      );

      if (done) {
        await changed();
        toasts.success({
          message: `${countText(rows.map((row) => row.name), 'items')} moved to the trash`,
          actions: [{
            label: 'Undo',
            onClick: async () => {
              try {
                await service.restore(rows);
                await changed();
              } catch (error) {
                toasts.error(error instanceof Error ? error.message : String(error));
              }
            },
          }],
        });
      }
    };

    // The file upload in a form drawer: each file is uploaded (staged) as soon as it is added, "Apply" adds the staged
    // files to the folder, "Cancel" discards them. The native validation blocks "Apply" while a file is unfinished or
    // failed, and while there is none (`required`).
    const upload = async () => {
      let items: readonly FileUpload.FileItem[] = [];
      let committed: readonly MediaFile[] = [];
      const drawer = dialogs.form({
        surface: 'drawer',
        title: `Upload to "${folder.name}"`,
        content: (
          <MediaUpload
            name="files"
            multiple
            previews
            required
            upload={(file, { signal, onProgress }) => service.upload(folder.id, file, onProgress, signal)}
            onChange={(next) => {
              items = next;
            }}
          />
        ),
        buttons: { confirm: 'Apply' },
      });

      for await (const attempt of drawer) {
        committed = await service.commit(attempt.data.strings('files'));
        attempt.accept();
      }

      if ((await drawer).canceled) {
        service.discard(items.flatMap((item) => (item.result === undefined ? [] : [item.result])));
        return;
      }

      await changed();
      toasts.success(`${countText(committed.map((file) => file.name), 'files')} uploaded`);
    };

    const download = () => {
      void dialogs.warn({
        title: 'Download',
        content: 'Downloading is not available in this demo.\nThere is no real content behind the files.',
      });
    };

    const parent = folders.find((candidate) => candidate.id === folder.parentId);

    const list: readonly (DataTableComponent.Action<EntryRow> | DataTableComponent.ActionMenu<EntryRow>)[] = [
      // To the parent folder (2026-10-07, the user's wish; in place of a ".." row): not in the root. Pinned (2026-10-10,
      // the user's wish): at the start of the bar, and still there while files are selected.
      ...(parent === undefined ? [] : [
        {
          type: 'general' as const,
          key: 'up',
          label: 'Up',
          icon: appIcons.up,
          tip: `Up to "${parent.name}"`,
          pinned: true,
          onClick: () => void navigate(folderPath(parent.id)),
        },
      ]),
      {
        type: 'general',
        key: 'new-folder',
        label: 'New folder',
        icon: appIcons.add,
        variant: 'primary',
        onClick: () => void newFolder(),
      },
      { type: 'general', key: 'upload', label: 'Upload', icon: appIcons.upload, onClick: () => void upload() },
      // The default actions (a double click): a folder opens, a file shows its details (the first one marked that is
      // there for the row). "Open" only for folders (2026-10-10, the user's wish: for a file it did the same as
      // "Details"; the data table's `visible`).
      {
        type: 'singleRow',
        key: 'open',
        icon: appIcons.open,
        tip: 'Open',
        show: 'column',
        default: true,
        visible: (row) => row.entry === 'folder',
        onClick: open,
      },
      {
        type: 'singleRow',
        key: 'info',
        icon: appIcons.info,
        tip: 'Details',
        show: 'both',
        default: true,
        onClick: (row) => void showDetails(row),
      },
      {
        type: 'singleRow',
        key: 'rename',
        icon: appIcons.rename,
        tip: 'Rename',
        show: 'both',
        onClick: (row) => void rename(row),
      },
      { type: 'multiRow', key: 'move', label: 'Move', icon: appIcons.move, onClick: (rows) => void move(rows) },
      {
        type: 'multiRow',
        key: 'delete',
        label: 'Delete',
        icon: appIcons.remove,
        variant: 'danger',
        onClick: (rows) => void remove(rows),
      },
      {
        type: 'menu',
        key: 'favorites',
        label: 'Favorites',
        icon: appIcons.star,
        actions: [
          {
            type: 'multiRow',
            key: 'favorite-add',
            label: 'Add to favorites',
            onClick: (rows) => void favorites(rows, true),
          },
          {
            type: 'multiRow',
            key: 'favorite-remove',
            label: 'Remove from favorites',
            onClick: (rows) => void favorites(rows, false),
          },
        ],
      },
      {
        type: 'menu',
        key: 'download',
        label: 'Download',
        icon: appIcons.download,
        actions: [
          { type: 'multiRow', key: 'download-zip', label: 'Selected items as zip', onClick: download },
          { type: 'multiRow', key: 'download-tgz', label: 'Selected items as tar.gz', onClick: download },
        ],
      },
    ];

    // The root ("Files") holds only the storages (2026-10-07): nothing is created or uploaded there, and a storage is not
    // renamed, moved or deleted (they are set up elsewhere; the server refuses it too).
    return folder.id === ROOT_ID
      ? list.filter((action) => !['new-folder', 'upload', 'rename', 'move', 'delete'].includes(action.key))
      : list;
  }, [dialogs, toasts, service, queryClient, navigate, folder, folders, setFavorite, showDetails]);

  return (
    <DataTable
      controller={nav}
      title={folder.name}
      subtitle={folder.id === ROOT_ID
        ? 'The storages where the folders and files are kept. A double click opens one.'
        : 'Folders first, then files. A double click opens a folder or shows a file\'s details.'}
      source={source}
      rowKey="key"
      columns={columns}
      actions={actions}
      searchable
      reloadable
      pageSizeOptions={[25, 50, 100]}
      defaultSort={{ key: 'name', direction: 'asc' }}
      empty="This folder is empty. Create a folder or upload files."
    />
  );
}
