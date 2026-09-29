import { StrictMode, useMemo } from 'react';
import type { ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { i18n as navigatorI18n } from '../../packages/data-navigator/demo/i18n';
import { icons } from '../../packages/data-navigator/demo/icons';
import {
  createDataNavigatorComponent,
  dateRangeColumnFilter,
  selectColumnFilter,
  textColumnFilter,
  useDataNavigatorController,
} from '../../packages/data-navigator/src/react';
import type { DataNavigatorComponent } from '../../packages/data-navigator/src/react';
import { defaultTheme } from '../../packages/data-navigator/src/themes';
import { createDemoI18n } from '../../packages/file-upload/demo/i18n';
import type { FileUpload } from '../../packages/file-upload/src';
import { createFileUploadComponent } from '../../packages/file-upload/src/react';
import { OverlaysProvider, useDialogs, useToast } from '../../packages/overlays/src/main/bindings/react';
import { setupUi } from '../ui/ui';
import {
  commitUploads,
  deleteAttachments,
  discardUploads,
  fetchAttachments,
  getDetails,
  SIZES,
  TYPES,
  uploadAttachment,
  USERS,
} from './attachments';
import type { Attachment, Details } from './attachments';

export { MediaManagerDemo };

// Three packages working together: a data navigator lists the attachments, the dialogs and toasts of the overlays
// package ask, inform and report, and a file upload in a drawer adds new files: they are uploaded (staged) there and
// added to the list on "Apply". The server is fake (attachments.ts).
//
// Both follow `<html lang>` through the i18n adapters of their own demos.

const AttachmentNavigator = createDataNavigatorComponent({ i18n: navigatorI18n, theme: defaultTheme });

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

// Every column but the filename can be hidden with the column toggle menu of the toolbar.
const columns: readonly DataNavigatorComponent.Column<Attachment>[] = [
  { key: 'name', header: 'Filename', width: 3, sortable: true, filter: textColumnFilter() },
  {
    key: 'user',
    header: 'User',
    width: 2,
    sortable: true,
    hideable: true,
    filter: selectColumnFilter({ options: USERS, multiple: true }),
  },
  {
    key: 'type',
    header: 'Type',
    width: 1.5,
    sortable: true,
    hideable: true,
    filter: selectColumnFilter({ options: TYPES, multiple: true }),
  },
  {
    key: 'size',
    header: 'Size',
    width: 1.5,
    sortable: true,
    hideable: true,
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
    hideable: true,
    render: (row) => formatDate(row.uploaded),
    filter: dateRangeColumnFilter(),
  },
];

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
      <table className="attachment-details">
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

// The styles of the details table (the drawer's content is light DOM).
const DETAILS_STYLES = `
  .attachment-details { border-collapse: collapse; font-size: 0.9rem; }
  .attachment-details th, .attachment-details td { padding: 0.3rem 0; vertical-align: top; }
  /* A long value (e.g. a file name) wraps instead of making the dialog wider than it can show. */
  .attachment-details td { overflow-wrap: anywhere; }
  .attachment-details th { padding-inline-end: 1.5rem; font-weight: 500; text-align: start; white-space: nowrap; }
`;

function MediaManager(): ReactElement {
  const nav = useDataNavigatorController<Attachment>();
  const dialogs = useDialogs();
  const toasts = useToast();

  // A reload after a delete also clears the selection (like every new load).
  const actions = useMemo<
    readonly (DataNavigatorComponent.Action<Attachment> | DataNavigatorComponent.ActionMenu<Attachment>)[]
  >(() => {
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
          // Several files are not listed: the table shows which ones are selected.
          content: single
            ? `Delete "${first.name}"?\nThis cannot be undone.`
            : `Delete the ${rows.length} selected files?\nThis cannot be undone.`,
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

    // An info dialog on the drawer surface: only an "OK" button, and no icon (the title is the file name).
    const showDetails = async (attachment: Attachment) => {
      const details = await getDetails(attachment);

      await dialogs.info({
        surface: 'drawer',
        icon: false,
        title: attachment.name,
        content: <DetailsTable attachment={attachment} details={details} />,
        styles: DETAILS_STYLES,
      });
    };

    // The file upload in a form dialog on the drawer surface. Each file is uploaded (staged on the server) as soon as it is added; "Apply"
    // adds the uploaded files to the list, "Cancel" discards them. The upload is a form control of the drawer's form:
    // its value is the ids of the uploaded files, and the native validation blocks "Apply" while a file is unfinished
    // or failed, and (`required`) while there is none.
    const uploadFiles = async () => {
      // The latest list of the upload, so a cancel knows which staged files to discard.
      let items: readonly FileUpload.FileItem[] = [];
      let committed: readonly Attachment[] = [];

      const drawer = dialogs.form({
        surface: 'drawer',
        title: 'Upload files',
        content: (
          <AttachmentUpload
            name="files"
            multiple
            previews
            required
            upload={uploadAttachment}
            onChange={(next) => {
              items = next;
            }}
          />
        ),
        buttons: { confirm: 'Apply' },
      });

      for await (const attempt of drawer) {
        const ids = attempt.data.getAll('files').filter((value) => typeof value === 'string');

        committed = await commitUploads(ids);
        attempt.accept();
      }

      const result = await drawer;

      if (result.canceled) {
        discardUploads(items.flatMap((item) => (item.result === undefined ? [] : [item.result])));

        return;
      }

      nav.reload();
      toasts.success(`${filesText(committed.map((attachment) => attachment.name))} uploaded`);
    };

    // Downloading is not part of the demo: every download entry only says so, in a warning dialog.
    const download = () => {
      void dialogs.warn({
        title: 'Download',
        content: 'Downloading is not available in this demo.\nThere is no real content behind the files.',
      });
    };

    // The last action in the toolbar, a menu: the selected file (a row action, only while exactly one row is
    // selected) and the selected ones (rows actions, only while rows are selected).
    const downloadMenu: DataNavigatorComponent.ActionMenu<Attachment> = {
      type: 'menu',
      key: 'download',
      label: 'Download',
      actions: [
        { type: 'singleRow', key: 'download-file', label: 'Selected file', show: 'toolbar', onClick: download },
        { type: 'separator' },
        { type: 'multiRow', key: 'download-selected-zip', label: 'Selected files as zip', onClick: download },
        { type: 'multiRow', key: 'download-selected-tgz', label: 'Selected files as tar.gz', onClick: download },
      ],
    };

    return [
      // In the toolbar, always there (no selection needed).
      {
        type: 'general',
        key: 'upload',
        label: 'Upload',
        icon: icons.upload,
        onClick: () => void uploadFiles(),
      },
      // The details in a drawer: in the action column of every row and in the selection bar while exactly one row is
      // selected, in both places only its icon (an icon-only action: no label), with "Information" as the tooltip. One
      // action, so one entry in the context menu.
      {
        type: 'singleRow',
        key: 'info',
        icon: icons.info,
        tip: 'Information',
        show: 'both',
        onClick: (attachment) => void showDetails(attachment),
      },
      // In the toolbar, for the selected rows: this rows action is what makes the selection multiple.
      {
        type: 'multiRow',
        key: 'delete-selected',
        label: 'Delete',
        icon: icons.remove,
        onClick: (rows) => void remove(rows),
      },
      // In the action column of every row: delete.
      {
        type: 'singleRow',
        key: 'delete',
        icon: icons.remove,
        tip: 'Delete file',
        show: 'column',
        // Not in the context menu: there, "Delete" (for the selection, which is the clicked row) does the same.
        contextMenu: false,
        onClick: (attachment) => void remove([attachment]),
      },
      downloadMenu,
    ];
  }, [nav, dialogs, toasts]);

  return (
    <AttachmentNavigator
      controller={nav}
      title="Media Manager"
      subtitle="Upload files with the upload button in the toolbar."
      density="compact"
      striped
      selectionAppearance="neutral"
      searchable
      reloadable
      source={fetchAttachments}
      rowKey="id"
      columns={columns}
      actions={actions}
      pageSize={10}
      pageSizeOptions={[10, 25, 50]}
      defaultSort={{ key: 'name', direction: 'asc' }}
    />
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
