export { attachmentsUrlOf, deleteAttachment, listAttachments, uploadAttachment };
export type { Attachment };

// The XWiki REST API for the attachments of one page (XWiki 17.10). The requests go to the same server as the page and
// carry the session cookie of the logged-in user, so XWiki checks that user's rights. Writing requests also need the
// CSRF token of the page (`<html data-xwiki-form-token>`).

type Attachment = {
  name: string;
  size: number;
  mimeType: string;
  // The user who uploaded the current version, e.g. "XWiki.Admin".
  author: string;
  // The time of the current version, in milliseconds since 1970.
  date: number;
  version: string;
  // The download URL of the current version.
  url: string;
};

// What the REST API answers for one attachment (only the fields we use).
type RestAttachment = {
  name: string;
  longSize: number;
  mimeType: string;
  author: string;
  date: number;
  version: string;
  xwikiAbsoluteUrl: string;
};

const root = document.documentElement;

// The REST URL of the attachments of a page. Without a reference: the current page (`<html data-xwiki-rest-url>`).
// A reference is written as in XWiki: `Space.Page`, nested spaces `A.B.Page`, dots in names escaped as `\.`, and an
// optional wiki prefix `wiki:Space.Page` (without it: the current wiki).
function attachmentsUrlOf(reference?: string): string {
  const current = root.dataset['xwikiRestUrl'] ?? '';

  if (reference === undefined || reference === '') {
    return `${current}/attachments`;
  }

  // The REST base (e.g. "/xwiki/rest") and the current wiki, from the URL of the current page.
  const base = current.slice(0, current.indexOf('/wikis/'));
  const currentWiki = root.dataset['xwikiWiki'] ?? 'xwiki';
  const colon = reference.indexOf(':');
  const wiki = colon >= 0 ? reference.slice(0, colon) : currentWiki;
  const names = splitEscaped(colon >= 0 ? reference.slice(colon + 1) : reference);
  const page = names.pop() ?? 'WebHome';
  const spaces = names.map((space) => `/spaces/${encodeURIComponent(space)}`).join('');

  return `${base}/wikis/${encodeURIComponent(wiki)}${spaces}/pages/${encodeURIComponent(page)}/attachments`;
}

// "A.B\.C.Page" → ["A", "B.C", "Page"].
function splitEscaped(reference: string): string[] {
  const names: string[] = [];
  let name = '';

  for (let index = 0; index < reference.length; index++) {
    const char = reference[index];

    if (char === '\\' && index + 1 < reference.length) {
      name += reference[++index];
    } else if (char === '.') {
      names.push(name);
      name = '';
    } else {
      name += char;
    }
  }

  names.push(name);

  return names;
}

const formToken = () => root.dataset['xwikiFormToken'] ?? '';

async function check(response: Response): Promise<Response> {
  if (!response.ok) {
    throw new Error(`XWiki answered ${response.status} ${response.statusText}`);
  }

  return response;
}

async function listAttachments(url: string, signal?: AbortSignal): Promise<readonly Attachment[]> {
  const response = await check(
    await fetch(url, { headers: { Accept: 'application/json' }, credentials: 'same-origin', signal }),
  );
  const json = (await response.json()) as { attachments?: readonly RestAttachment[] };

  return (json.attachments ?? []).map((attachment) => ({
    name: attachment.name,
    size: attachment.longSize,
    mimeType: attachment.mimeType,
    author: attachment.author,
    date: attachment.date,
    version: attachment.version,
    url: attachment.xwikiAbsoluteUrl,
  }));
}

// Adds a file, or a new version of an attachment with the same name. With XMLHttpRequest instead of fetch, because
// fetch cannot report the progress of an upload.
function uploadAttachment(
  url: string,
  file: File,
  signal?: AbortSignal,
  onProgress?: (fraction: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open('PUT', `${url}/${encodeURIComponent(file.name)}`);
    request.withCredentials = true;
    request.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    request.setRequestHeader('XWiki-Form-Token', formToken());
    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        onProgress?.(event.loaded / event.total);
      }
    });
    request.addEventListener('load', () => {
      if (request.status >= 200 && request.status < 300) {
        resolve();
      } else {
        reject(new Error(`XWiki answered ${request.status} ${request.statusText}`));
      }
    });
    request.addEventListener('error', () => reject(new Error('The upload failed (network error).')));
    request.addEventListener('abort', () => reject(new DOMException('The upload was canceled.', 'AbortError')));
    signal?.addEventListener('abort', () => request.abort(), { once: true });
    request.send(file);
  });
}

async function deleteAttachment(url: string, name: string): Promise<void> {
  await check(
    await fetch(`${url}/${encodeURIComponent(name)}`, {
      method: 'DELETE',
      credentials: 'same-origin',
      headers: { 'XWiki-Form-Token': formToken() },
    }),
  );
}
