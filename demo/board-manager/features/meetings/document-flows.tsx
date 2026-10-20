import type { FileItem } from '@local/file-upload';

import type { Meeting, MeetingDocument } from '../../domain/index.js';
import { DocumentForm, UploadForm } from '../../shared/forms.js';
import { useFlowKit } from '../../shared/lib/flows.js';
import { useMeetingService } from './meeting-data.js';

export { useDeleteDocumentsFlow, useDownloadDocumentFlow, useRenameDocumentFlow, useUploadDocumentsFlow };

// The flows of a meeting's documents, one hook per use case. A flow changes the data through the service (which says
// so: every read loads again); it knows no table.

// "Upload": a drawer with the file upload. Every file is uploaded (staged) at once, "Apply" adds them, "Cancel"
// discards them.
function useUploadDocumentsFlow(meeting: Meeting): () => Promise<void> {
  const { formFlow, t } = useFlowKit();
  const service = useMeetingService();

  return async () => {
    let items: readonly FileItem[] = [];
    let committed: readonly MeetingDocument[] = [];
    const done = await formFlow({
      surface: 'drawer',
      title: t('meetings.documents.uploadTitle'),
      subtitle: meeting.title,
      content: (
        <UploadForm
          upload={service.uploadDocument(meeting.id)}
          onChange={(next) => {
            items = next;
          }}
          save={async ({ files }) => {
            committed = await service.commitDocuments(
              files.flatMap((file) => file.result === undefined ? [] : [file.result]),
            );
          }}
        />
      ),
      buttons: { confirm: t('meetings.sections.apply') },
      success: () => t('meetings.documents.uploaded', { count: committed.length, name: committed[0]?.name ?? '' }),
    });

    if (!done) {
      service.discardDocuments(items.flatMap((item) => (item.result === undefined ? [] : [item.result])));
    }
  };
}

// "Download": not in the demo, a note says so.
function useDownloadDocumentFlow(): () => void {
  const { dialogs, t } = useFlowKit();

  return () => {
    void dialogs.warn({ title: t('meetings.documents.download'), content: t('meetings.documents.notAvailable') });
  };
}

// "Rename": the name in a form dialog (the fake server trims it and refuses an empty one; the dialog shows its
// message), then a toast.
function useRenameDocumentFlow(): (document: MeetingDocument) => Promise<boolean> {
  const { formFlow, t } = useFlowKit();
  const service = useMeetingService();

  return (document) => {
    let renamed = document.name;

    return formFlow({
      title: t('meetings.documents.renameTitle'),
      content: (
        <DocumentForm
          document={document}
          save={async (values) => {
            renamed = (await service.renameDocument(document.id, values.name)).name;
          }}
        />
      ),
      buttons: { confirm: t('common.save') },
      success: () => t('meetings.documents.renamed', { name: renamed }),
    });
  };
}

// "Delete" of documents: a critical confirmation that deletes them before it closes, then a toast.
function useDeleteDocumentsFlow(): (documents: readonly MeetingDocument[]) => Promise<boolean> {
  const { confirmFlow, t } = useFlowKit();
  const service = useMeetingService();

  return (documents) => {
    const count = documents.length;
    const name = documents[0]?.name ?? '';

    return confirmFlow({
      critical: true,
      title: t('meetings.documents.deleteTitle', { count }),
      content: t('meetings.documents.deleteContent', { count, name }),
      buttons: { confirm: t('common.delete') },
      run: () => service.deleteDocuments(documents.map((document) => document.id)),
      success: t('meetings.documents.deleted', { count, name }),
    });
  };
}
