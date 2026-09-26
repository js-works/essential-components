import { StrictMode, useMemo, useRef } from 'react';
import type { ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { i18n as navigatorI18n } from '../../packages/data-navigator/demo/i18n';
import { icons } from '../../packages/data-navigator/demo/icons';
import {
  createDataNavigator,
  dateRangeColumnFilter,
  defaultTheme,
  selectColumnFilter,
  textColumnFilter,
  useDataNavigatorController,
} from '../../packages/data-navigator/src';
import type { DataNavigator } from '../../packages/data-navigator/src';
import { createDemoI18n } from '../../packages/file-upload/demo/i18n';
import type { FileUpload } from '../../packages/file-upload/src';
import { createFileUploadComponent } from '../../packages/file-upload/src/react';
import { OverlaysProvider, useDialogs, useToast } from '../../packages/overlays/src/main/bindings/react';
import { setupUi } from '../ui/ui';
import {
  deleteAttachments,
  fetchAttachments,
  getDetails,
  getStatistics,
  SIZES,
  TYPES,
  uploadAttachment,
  USERS,
} from './attachments';
import type { Attachment, Details, Statistics } from './attachments';

export { MediaManagerDemo };

// Three packages working together: a data navigator lists the attachments, a file upload below it adds new ones, and a
// dialog of the overlays package shows statistics. As soon as a file is uploaded, the table is reloaded, so the file
// shows up in it. The server is fake (attachments.ts).
//
// Both follow `<html lang>` through the i18n adapters of their own demos.

const AttachmentNavigator = createDataNavigator({ i18n: navigatorI18n, theme: defaultTheme });

const uploadI18n = createDemoI18n();

const AttachmentUpload = createFileUploadComponent({
  i18n: { type: 'factory', getAdapter: () => uploadI18n },
});

const locale = () => document.documentElement.lang || 'en-US';

const SIZE_UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte'] as const;

// A size with the unit that fits (1 kB = 1024 bytes), like the file upload shows it.
function formatSize(bytes: number): string {
  let value = bytes;
  let unit = 0;

  while (value >= 1024 && unit < SIZE_UNITS.length - 1) {
    value /= 1024;
    unit++;
  }

  return new Intl.NumberFormat(locale(), {
    style: 'unit',
    unit: SIZE_UNITS[unit] ?? 'byte',
    unitDisplay: 'short',
    maximumFractionDigits: unit === 0 ? 0 : 1,
  }).format(value);
}

// The files a toast is about: the name of a single one ("report.txt" uploaded), else the number ("3 files deleted").
function filesText(names: readonly string[]): string {
  return names.length === 1 ? `"${names[0]}"` : `${names.length} files`;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(locale(), { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}

const columns: readonly DataNavigator.Column<Attachment>[] = [
  { key: 'name', header: 'Filename', width: 4, sortable: true, filter: textColumnFilter() },
  {
    key: 'user',
    header: 'User',
    width: 2,
    sortable: true,
    filter: selectColumnFilter({ options: USERS, multiple: true }),
  },
  {
    key: 'type',
    header: 'Type',
    width: 2,
    sortable: true,
    filter: selectColumnFilter({ options: TYPES, multiple: true }),
  },
  {
    key: 'size',
    header: 'Size',
    width: 1.5,
    sortable: true,
    align: 'end',
    render: (row) => formatSize(row.size),
    filter: selectColumnFilter({
      options: SIZES.map(({ value, label }) => ({ value, label })),
      multiple: true,
    }),
  },
  {
    key: 'uploaded',
    header: 'Uploaded',
    width: 2,
    sortable: true,
    render: (row) => formatDate(row.uploaded),
    filter: dateRangeColumnFilter(),
  },
];

// The content of the statistics dialog. The dialog's content is light DOM, styled by STATISTICS_STYLES.
function StatisticsTable({ stats }: { stats: Statistics }): ReactElement {
  const file = (attachment: Attachment | undefined, detail: (a: Attachment) => string) =>
    attachment === undefined ? '–' : `${attachment.name} (${detail(attachment)})`;

  return (
    <table className="attachment-stats">
      <tbody>
        <tr>
          <th scope="row">Files</th>
          <td>{stats.count}</td>
        </tr>
        <tr>
          <th scope="row">Total size</th>
          <td>{formatSize(stats.totalSize)}</td>
        </tr>
        {stats.byType.map(({ type, count, size }) => (
          <tr key={type}>
            <th scope="row">{type}</th>
            <td>
              {count}x · {formatSize(size)}
            </td>
          </tr>
        ))}
        <tr>
          <th scope="row">Largest file</th>
          <td>{file(stats.largest, (a) => formatSize(a.size))}</td>
        </tr>
        <tr>
          <th scope="row">Latest upload</th>
          <td>{file(stats.newest, (a) => formatDate(a.uploaded))}</td>
        </tr>
      </tbody>
    </table>
  );
}

// The content of the information drawer of one attachment.
function DetailsTable({ attachment, details }: { attachment: Attachment; details: Details }): ReactElement {
  const rows: readonly (readonly [string, string])[] = [
    ['Filename', attachment.name],
    ['Type', attachment.type],
    ['Size', formatSize(attachment.size)],
    ['Uploaded by', attachment.user],
    ['Uploaded', formatDate(attachment.uploaded)],
    ['Versions', String(details.versions)],
    ['Downloads', String(details.downloads)],
    ['Tags', details.tags.join(', ')],
    ['Storage', details.storage],
    ['Checksum', details.checksum],
  ];

  return (
    <>
      <p>{details.description}</p>
      <table className="attachment-stats">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

const STATISTICS_STYLES = `
  .attachment-stats { border-collapse: collapse; font-size: 0.9rem; }
  .attachment-stats th, .attachment-stats td { padding: 0.3rem 0; vertical-align: top; }
  /* A long value (e.g. a file name) wraps instead of making the dialog wider than it can show. */
  .attachment-stats td { overflow-wrap: anywhere; }
  .attachment-stats th { padding-inline-end: 1.5rem; font-weight: 500; text-align: start; white-space: nowrap; }
`;

function MediaManager(): ReactElement {
  const nav = useDataNavigatorController<Attachment>();
  const dialogs = useDialogs();
  const toasts = useToast();
  // The files of the upload that are known to be done, so each one reloads the table only once.
  const done = useRef(new Set<string>());
  // The names of the files done since the last "uploaded" toast: one toast per batch, when nothing is uploading or
  // waiting any more.
  const uploadedSinceToast = useRef<string[]>([]);

  // A reload after a delete also clears the selection (like every new load).
  const actions = useMemo<readonly (DataNavigator.Action<Attachment> | DataNavigator.ActionMenu<Attachment>)[]>(() => {
    // Asks first, with a critical confirmation (danger button, no confirm on Enter): deleting cannot be undone.
    const remove = async (rows: readonly Attachment[]) => {
      const [first] = rows;
      const single = rows.length === 1 && first !== undefined;
      // In a scope, the dialog stays open after "Delete" until the scope is disposed: its button shows a spinner while
      // the files are deleted (one second), and the dialog closes when they are gone.
      const scope = dialogs.open();

      try {
        const result = await scope.confirmCritical({
          title: single ? 'Delete file' : 'Delete files',
          content: single ? `Delete "${first.name}"?\nThis cannot be undone.` : (
            <>
              <p>
                Delete these {rows.length} files?
                <br />
                This cannot be undone.
              </p>
              <ul>
                {rows.map((row) => <li key={row.id}>{row.name}</li>)}
              </ul>
            </>
          ),
          buttons: { confirm: 'Delete' },
        });

        if (result.canceled) {
          return;
        }

        await deleteAttachments(rows.map((row) => row.id));
      } finally {
        scope.dispose();
      }

      nav.reload();
      toasts.success(`${filesText(rows.map((row) => row.name))} deleted`);
    };

    // A drawer is a form drawer (a confirm and a cancel button, both close it here): "OK" instead of "Save".
    const showDetails = async (attachment: Attachment) => {
      const details = await getDetails(attachment);

      await dialogs.drawer({
        title: attachment.name,
        content: <DetailsTable attachment={attachment} details={details} />,
        styles: STATISTICS_STYLES,
        buttons: { confirm: 'OK' },
      });
    };

    const showStatistics = async () => {
      const stats = await getStatistics();

      await dialogs.info({
        title: 'Statistics',
        content: <StatisticsTable stats={stats} />,
        styles: STATISTICS_STYLES,
      });
    };

    // Downloading is not part of the demo: every download entry only says so, in a warning dialog.
    const download = () => {
      void dialogs.warn({
        title: 'Download',
        content: 'Downloading is not available in this demo.\nThere is no real content behind the files.',
      });
    };

    // The last action in the toolbar, a menu: the selected file (a row action, only while exactly one row is
    // selected), the selected ones (rows actions, only while rows are selected) and, last, all attachments (general
    // actions, always there).
    const downloadMenu: DataNavigator.ActionMenu<Attachment> = {
      type: 'menu',
      key: 'download',
      label: 'Download',
      actions: [
        { type: 'row', key: 'download-file', label: 'Selected file', show: 'toolbar', onClick: download },
        { type: 'separator' },
        { type: 'rows', key: 'download-selected-zip', label: 'Selected files as zip', onClick: download },
        { type: 'rows', key: 'download-selected-tgz', label: 'Selected files as tar.gz', onClick: download },
        { type: 'separator' },
        { type: 'general', key: 'download-all-zip', label: 'All files as zip', onClick: download },
        { type: 'general', key: 'download-all-tgz', label: 'All files as tar.gz', onClick: download },
      ],
    };

    return [
      // In the toolbar, always there (no selection needed).
      {
        type: 'general',
        key: 'statistics',
        label: 'Show statistics',
        icon: icons.info,
        onClick: () => void showStatistics(),
      },
      // In the toolbar, for the selected rows: this rows action is what makes the selection multiple.
      {
        type: 'rows',
        key: 'delete-selected',
        label: 'Delete',
        icon: icons.remove,
        onClick: (rows) => void remove(rows),
      },
      // In the action column of every row: more information in a drawer, and delete.
      {
        type: 'row',
        key: 'info',
        icon: icons.info,
        tip: 'More information',
        show: 'column',
        onClick: (attachment) => void showDetails(attachment),
      },
      {
        type: 'row',
        key: 'delete',
        icon: icons.remove,
        tip: 'Delete file',
        show: 'column',
        onClick: (attachment) => void remove([attachment]),
      },
      downloadMenu,
    ];
  }, [nav, dialogs, toasts]);

  const handleChange = (items: readonly FileUpload.FileItem[]) => {
    const finished = items.filter((item) => item.status === 'done' && !done.current.has(item.id));

    for (const item of finished) {
      done.current.add(item.id);
    }

    if (finished.length > 0) {
      nav.reload();
      uploadedSinceToast.current.push(...finished.map((item) => item.file.name));
    }

    const busy = items.some((item) => item.status === 'uploading' || item.status === 'queued');

    if (!busy && uploadedSinceToast.current.length > 0) {
      toasts.success(`${filesText(uploadedSinceToast.current)} uploaded`);
      uploadedSinceToast.current = [];
    }
  };

  return (
    <div className="ui-stack">
      <AttachmentNavigator
        controller={nav}
        title="Media Manager"
        subtitle="Upload files below: each one appears here as soon as its upload is done."
        density="compact"
        striped
        searchable
        source={fetchAttachments}
        rowKey="id"
        columns={columns}
        actions={actions}
        pageSize={10}
        pageSizeOptions={[10, 25, 50]}
        defaultSort={{ key: 'uploaded', direction: 'desc' }}
      />
      <AttachmentUpload multiple previews upload={uploadAttachment} onChange={handleChange} />
    </div>
  );
}

// The dialogs of the overlays package, with their icons, and its toasts small and stacked in the bottom right corner. A module constant:
// the provider compares its config.
const OVERLAYS_CONFIG = {
  dialogs: { icons: true },
  toasts: { placement: 'bottom-end', size: 'small', stacked: true },
} as const;

// The demo as a light DOM custom element without attributes, like the demos of the packages (exported, registered by
// the page).
class MediaManagerDemo extends HTMLElement {
  #root: Root | undefined;
  #cleanupUi: (() => void) | undefined;

  connectedCallback(): void {
    this.#root = createRoot(this);
    this.#root.render(
      <StrictMode>
        <OverlaysProvider config={OVERLAYS_CONFIG}>
          <MediaManager />
        </OverlaysProvider>
      </StrictMode>,
    );
    this.#cleanupUi = setupUi(this);
  }

  disconnectedCallback(): void {
    this.#cleanupUi?.();
    this.#root?.unmount();
    this.#cleanupUi = undefined;
    this.#root = undefined;
  }
}
