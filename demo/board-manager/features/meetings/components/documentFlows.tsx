import type { FileItem } from '@local/file-upload';
import type { Meeting, MeetingDocument } from '../../../domain/index.js';
import {
  commitDocuments,
  deleteDocuments,
  discardDocuments,
  renameDocument,
  uploadDocument,
} from '../../../infra/in-memory/index.js';
import { DocumentForm, UploadForm } from '../../../shared/forms.js';
import { confirmAndRun } from '../../../shared/lib/flows.js';
import type { TableContext } from '../../../shared/lib/flows.js';
import { translate } from '../../../shared/lib/i18n/index.js';

export { deleteDocumentsFlow, downloadDocumentFlow, renameDocumentFlow, uploadDocumentsFlow };
export type { DocumentContext };

// What the flows of a meeting's documents need: the table's context and the meeting.
type DocumentContext = TableContext<MeetingDocument> & { meeting: Meeting };

// "Upload": a drawer with the file upload. Every file is uploaded (staged) at once, "Apply" adds them, "Cancel"
// discards them.
async function uploadDocumentsFlow({ dialogs, toasts, nav, meeting }: DocumentContext): Promise<void> {
  let items: readonly FileItem[] = [];
  let committed: readonly MeetingDocument[] = [];
  const { canceled } = await dialogs.form({
    surface: 'drawer',
    title: translate('meetings.documents.uploadTitle'),
    subtitle: meeting.title,
    content: (
      <UploadForm
        upload={uploadDocument(meeting.id)}
        onChange={(next) => {
          items = next;
        }}
        save={async ({ files }) => {
          committed = await commitDocuments(files.flatMap((file) => file.result === undefined ? [] : [file.result]));
        }}
      />
    ),
    buttons: { confirm: translate('meetings.sections.apply') },
  });

  if (canceled) {
    discardDocuments(items.flatMap((item) => (item.result === undefined ? [] : [item.result])));
    return;
  }

  nav.reload();
  toasts.success(
    translate('meetings.documents.uploaded', { count: committed.length, name: committed[0]?.name ?? '' }),
  );
}

// "Download": not in the demo, a note says so.
function downloadDocumentFlow({ dialogs }: DocumentContext): void {
  void dialogs.warn({
    title: translate('meetings.documents.download'),
    content: translate('meetings.documents.notAvailable'),
  });
}

// "Rename": the name in a form dialog (the fake server trims it and refuses an empty one; the dialog shows its
// message).
async function renameDocumentFlow({ dialogs, toasts, nav }: DocumentContext, row: MeetingDocument): Promise<void> {
  let renamed = row.name;
  const saved = !(await dialogs.form({
    title: translate('meetings.documents.renameTitle'),
    content: (
      <DocumentForm
        document={row}
        save={async (values) => {
          renamed = (await renameDocument(row.id, values.name)).name;
        }}
      />
    ),
    buttons: { confirm: translate('common.save') },
  })).canceled;

  if (saved) {
    nav.reload();
    toasts.success(translate('meetings.documents.renamed', { name: renamed }));
  }
}

// "Delete" of documents: a critical confirmation that deletes them before it closes.
async function deleteDocumentsFlow(
  { dialogs, toasts, nav }: DocumentContext,
  rows: readonly MeetingDocument[],
): Promise<void> {
  const [first] = rows;
  const done = await confirmAndRun(
    dialogs,
    {
      title: translate('meetings.documents.deleteTitle', { count: rows.length }),
      content: translate('meetings.documents.deleteContent', { count: rows.length, name: first?.name ?? '' }),
      buttons: { confirm: translate('common.delete') },
    },
    () => deleteDocuments(rows.map((row) => row.id)),
  );

  if (done) {
    nav.reload();
    toasts.success(translate('meetings.documents.deleted', { count: rows.length, name: first?.name ?? '' }));
  }
}
