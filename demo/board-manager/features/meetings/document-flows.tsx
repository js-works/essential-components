import type { FileItem } from '@local/file-upload';
import { useDialogs, useToast } from '@local/overlays/react';
import type { Meeting, MeetingDocument } from '../../domain/index.js';
import {
  commitDocuments,
  deleteDocuments,
  discardDocuments,
  renameDocument,
  uploadDocument,
} from '../../infra/in-memory/index.js';

import { DocumentForm, UploadForm } from '../../shared/forms.js';
import { confirmAndRun } from '../../shared/lib/flows.js';
import { useTranslate } from '../../shared/lib/i18n/index.js';

export { useDeleteDocumentsFlow, useDownloadDocumentFlow, useRenameDocumentFlow, useUploadDocumentsFlow };

// The flows of a meeting's documents, one hook per use case. The documents table follows the data itself.

// "Upload": a drawer with the file upload. Every file is uploaded (staged) at once, "Apply" adds them, "Cancel"
// discards them.
function useUploadDocumentsFlow(meeting: Meeting): () => Promise<void> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const t = useTranslate();

  return async () => {
    let items: readonly FileItem[] = [];
    let committed: readonly MeetingDocument[] = [];
    const result = await dialogs.form({
      surface: 'drawer',
      title: t('meetings.documents.uploadTitle'),
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
      buttons: { confirm: t('meetings.sections.apply') },
    });

    if (result.canceled) {
      discardDocuments(items.flatMap((item) => (item.result === undefined ? [] : [item.result])));
      return;
    }

    toasts.success(t('meetings.documents.uploaded', { count: committed.length, name: committed[0]?.name ?? '' }));
  };
}

// "Download": not in the demo, a note says so.
function useDownloadDocumentFlow(): () => void {
  const dialogs = useDialogs();
  const t = useTranslate();

  return () => {
    void dialogs.warn({ title: t('meetings.documents.download'), content: t('meetings.documents.notAvailable') });
  };
}

// "Rename": the name in a form dialog (the fake server trims it and refuses an empty one; the dialog shows its
// message), then a toast.
function useRenameDocumentFlow(): (document: MeetingDocument) => Promise<void> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const t = useTranslate();

  return async (document) => {
    let renamed = document.name;
    const result = await dialogs.form({
      title: t('meetings.documents.renameTitle'),
      content: (
        <DocumentForm
          document={document}
          save={async (values) => {
            renamed = (await renameDocument(document.id, values.name)).name;
          }}
        />
      ),
      buttons: { confirm: t('common.save') },
    });

    if (result.canceled) {
      return;
    }

    toasts.success(t('meetings.documents.renamed', { name: renamed }));
  };
}

// "Delete" of documents: a critical confirmation that deletes them before it closes, then a toast.
function useDeleteDocumentsFlow(): (documents: readonly MeetingDocument[]) => Promise<void> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const t = useTranslate();

  return async (documents) => {
    const [first] = documents;
    const done = await confirmAndRun(
      dialogs,
      {
        title: t('meetings.documents.deleteTitle', { count: documents.length }),
        content: t('meetings.documents.deleteContent', { count: documents.length, name: first?.name ?? '' }),
        buttons: { confirm: t('common.delete') },
      },
      () => deleteDocuments(documents.map((document) => document.id)),
    );

    if (!done) {
      return;
    }

    toasts.success(t('meetings.documents.deleted', { count: documents.length, name: first?.name ?? '' }));
  };
}
