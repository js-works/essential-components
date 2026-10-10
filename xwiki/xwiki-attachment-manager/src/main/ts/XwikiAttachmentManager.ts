import { css, html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { dateRangeColumnFilter, selectColumnFilter, textColumnFilter } from '../../../../../packages/data-table/src';
import type { DataTable } from '../../../../../packages/data-table/src';
import { authorOf, formatDate, formatSize, queryAttachments, rowsOf, SIZES } from './attachments';
import type { AttachmentRow } from './attachments';
import { icons } from './icons';
import { createTableController, dialogs, toasts } from './setup';
import { attachmentsUrlOf, deleteAttachment, listAttachments, uploadAttachment } from './xwiki/rest';

export { XwikiAttachmentManager };

type Controller = ReturnType<typeof createTableController<AttachmentRow>>;

// "report.pdf" or "3 files".
const filesText = (names: readonly string[]) => (names.length === 1 ? `"${names[0]}"` : `${names.length} files`);

// The attachments of an XWiki page, like the File Center of the demo (the Media Manager before 2026-10-08): the data table (search, sorting, paging,
// column filters, selection), an upload drawer with the file upload, delete with a confirmation, details in a drawer,
// and toasts. The data comes from the REST API of XWiki (see xwiki/rest.ts).
class XwikiAttachmentManager extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
  `;

  // The XWiki page reference whose attachments are shown (`Space.Page`, `wiki:A.B.Page`); without it, the current page.
  @property()
  page?: string;

  // The title above the table; without it, none. Not `title`: that is the native attribute of every element (a tooltip
  // over the whole element).
  @property()
  heading?: string;

  // Created after a first load, so a page that cannot be read shows an error instead of the table.
  @state()
  controller: Controller | undefined;
  @state()
  error: string | undefined;

  // The REST URL of the attachments of the page.
  get #url(): string {
    return attachmentsUrlOf(this.page);
  }

  override willUpdate(changed: Map<PropertyKey, unknown>): void {
    if (!this.hasUpdated || changed.has('page')) {
      void this.#setup();
    }
  }

  async #setup(): Promise<void> {
    this.error = undefined;

    try {
      await listAttachments(this.#url);

      this.controller = this.#createController();
    } catch (error) {
      this.error = error instanceof Error ? error.message : String(error);
    }
  }

  #createController(): Controller {
    // Every load asks XWiki again (the list may have changed), then filters, sorts and pages in memory.
    const source: DataTable.Source<AttachmentRow> = async (query, signal) =>
      queryAttachments(rowsOf(await listAttachments(this.#url, signal)), query);

    return createTableController<AttachmentRow>({
      source,
      rowKey: 'name',
      title: () => this.heading ?? '',
      defaultSort: { key: 'name', direction: 'asc' },
      columns: [
        {
          key: 'name',
          header: 'Filename',
          width: 3,
          sortable: true,
          filter: textColumnFilter(),
        },
        {
          key: 'size',
          header: 'Size',
          width: 1.5,
          sortable: true,
          align: 'end',
          render: (row) => formatSize(row.size),
          filter: selectColumnFilter({ options: SIZES.map(({ value, label }) => ({ value, label })), multiple: true }),
        },
        {
          key: 'date',
          header: 'Date',
          width: 2,
          sortable: true,
          // Wraps when the column is narrow: the time goes to a second line.
          wrap: true,
          render: (row) => formatDate(row.date),
          filter: dateRangeColumnFilter(),
        },
        {
          key: 'author',
          header: 'Posted by',
          width: 2,
          sortable: true,
          render: (row) => authorOf(row.author),
          filter: textColumnFilter(),
        },
      ],
      actions: [
        { type: 'general', key: 'upload', label: 'Upload', icon: icons.upload, onClick: () => void this.#upload() },
        { type: 'rows', key: 'delete', label: 'Delete', icon: icons.trash, onClick: (rows) => void this.#delete(rows) },
        {
          type: 'row',
          key: 'info',
          icon: icons.info,
          tip: 'More information',
          show: 'column',
          onClick: (row) => void this.#details(row),
        },
        { type: 'row', key: 'download', icon: icons.download, tip: 'Download', show: 'column', onClick: download },
        {
          type: 'row',
          key: 'delete-one',
          icon: icons.trash,
          tip: 'Delete file',
          show: 'column',
          onClick: (row) => void this.#delete([row]),
        },
      ],
    });
  }

  // A drawer with the file upload. The files go to XWiki at once (there is no staging on the XWiki side); "Done" closes
  // the drawer, and the list is loaded again. Closing it cancels the uploads still running.
  async #upload(): Promise<void> {
    const uploaded: string[] = [];
    const upload = async (file: File, options: { signal: AbortSignal; onProgress: (fraction: number) => void }) => {
      await uploadAttachment(this.#url, file, options.signal, options.onProgress);
      uploaded.push(file.name);
    };

    await dialogs.info({
      surface: 'drawer',
      icon: false,
      title: 'Upload files',
      content: html`<xam-file-upload multiple previews .upload=${upload}></xam-file-upload>`,
      buttons: { ok: 'Done' },
    });

    this.controller?.reload();

    if (uploaded.length > 0) {
      toasts.success(`${filesText(uploaded)} uploaded`);
    }
  }

  // Asks first (a critical confirmation: no confirm on Enter); the dialog stays open, with a spinner on its button,
  // until the files are deleted (a scope).
  async #delete(rows: readonly AttachmentRow[]): Promise<void> {
    const names = rows.map((row) => row.name);
    const scope = dialogs.open();
    let failed: string | undefined;

    try {
      const result = await scope.confirmCritical({
        title: names.length === 1 ? 'Delete file' : 'Delete files',
        content: names.length === 1
          ? `Delete "${names[0]}"?\nThis cannot be undone.`
          : html`<p>Delete these ${names.length} files?<br />This cannot be undone.</p>
              <ul>${names.map((name) => html`<li>${name}</li>`)}</ul>`,
        buttons: { confirm: 'Delete' },
      });

      if (result.canceled) {
        return;
      }

      await Promise.all(names.map((name) => deleteAttachment(this.#url, name)));
    } catch (error) {
      failed = error instanceof Error ? error.message : String(error);
    } finally {
      scope.dispose();
    }

    this.controller?.reload();

    if (failed === undefined) {
      toasts.success(`${filesText(names)} deleted`);
    } else {
      toasts.error(`Could not delete: ${failed}`);
    }
  }

  async #details(row: AttachmentRow): Promise<void> {
    const entries: readonly (readonly [string, string])[] = [
      ['Filename', row.name],
      ['Type', `${row.type} (${row.mimeType})`],
      ['Size', formatSize(row.size)],
      ['Posted by', row.author],
      ['Date', formatDate(row.date)],
      ['Version', row.version],
    ];

    await dialogs.info({
      surface: 'drawer',
      icon: false,
      title: row.name,
      content: html`
        <table class="details">
          <tbody>
            ${entries.map(([label, value]) => html`<tr><th scope="row">${label}</th><td>${value}</td></tr>`)}
          </tbody>
        </table>
        <p><a href=${row.url} download>Download</a></p>
      `,
      styles: `
        .details { border-collapse: collapse; }
        .details th, .details td { padding: 0.3rem 0; vertical-align: top; text-align: start; }
        .details th { padding-inline-end: 1.5rem; font-weight: 500; white-space: nowrap; }
        .details td { overflow-wrap: anywhere; }
      `,
    });
  }

  override render() {
    if (this.error !== undefined) {
      return html`<p role="alert">Could not load the attachments: ${this.error}</p>`;
    }

    return this.controller === undefined
      ? html`<p>Loading …</p>`
      : html`<xam-data-table .controller=${this.controller} density="compact" striped searchable reloadable page-size="10">
        </xam-data-table>`;
  }
}

// Downloads an attachment: a link with `download`, clicked by script.
function download(row: AttachmentRow): void {
  const link = document.createElement('a');

  link.href = row.url;
  link.download = row.name;
  link.click();
}
