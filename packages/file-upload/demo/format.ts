import type { FileUpload } from '../src';

export { submitted, summarize };

// The state of the list, as the `change` event reports it.
function summarize(items: readonly FileUpload.FileItem[]): string {
  if (items.length === 0) {
    return 'No files yet';
  }

  const counts = new Map<FileUpload.FileStatus, number>();

  for (const { status } of items) {
    counts.set(status, (counts.get(status) ?? 0) + 1);
  }

  return `${items.length} files: ${[...counts].map(([status, count]) => `${count} ${status}`).join(', ')}`;
}

// What a demo form sent: the values of its `attachments`, the ids of the uploaded files.
function submitted(data: FormData): string {
  const ids = data.getAll('attachments').map(String);

  return `Sent: ${ids.length === 0 ? 'nothing' : ids.join(', ')}`;
}
