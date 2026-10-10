import { fireEvent, within } from '@testing-library/dom';
import { describe, expect, it, vi } from 'vitest';
import type * as Spec from '../api';
import { createFileUploadClass } from './createFileUploadClass';

type Pending = {
  file: File;
  context: Spec.UploadContext;
  resolve: (result?: string) => void;
  reject: (error: unknown) => void;
};

type Options = Partial<Omit<Spec.Element, 'items' | keyof HTMLElement>>;

const TAG = 'test-upload';

customElements.define(TAG, class extends createFileUploadClass() {});

const file = (name: string, size = 10, type = 'text/plain') => new File(['x'.repeat(size)], name, { type });

// Lets pending promises settle.
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

// An upload function that never finishes on its own: the test decides when and how each upload ends.
function createUpload() {
  const pending: Pending[] = [];

  const upload = vi.fn((uploaded: File, context: Spec.UploadContext) =>
    new Promise<string | void>((resolve, reject) => {
      pending.push({ file: uploaded, context, resolve, reject });
    })
  );

  return { upload, pending };
}

function queries(element: Spec.Element) {
  // Testing Library types its container as an element, but a shadow root works the same for the queries.
  const shadow = element.shadowRoot!;
  const ui = within(shadow as unknown as HTMLElement);
  const input = shadow.querySelector<HTMLInputElement>('input[type="file"]')!;

  return {
    shadow,
    ui,
    input,
    root: shadow.querySelector<HTMLElement>('[part="root"]')!,
    dropArea: shadow.querySelector<HTMLElement>('[part="drop-area"]')!,
    choose: (...files: File[]) => fireEvent.change(input, { target: { files } }),
    rowOf: (name: string) => ui.getByText(name).closest('li')!,
  };
}

function mount(options: Options = {}, markup = '') {
  const { upload, pending } = createUpload();
  const element = document.createElement(TAG) as Spec.Element;

  element.innerHTML = markup;
  Object.assign(element, { upload, ...options });
  document.body.append(element);

  return { element, upload, pending, ...queries(element) };
}

describe('file upload element', () => {
  describe('drop area', () => {
    it('shows the drop hint and a browse button that opens the file dialog', () => {
      const { ui, input } = mount();
      const click = vi.spyOn(input, 'click');

      expect(ui.getByText('Drag files here or')).toBeTruthy();

      fireEvent.click(ui.getByRole('button', { name: 'Browse' }));

      expect(click).toHaveBeenCalledTimes(1);
    });

    it('shows no list before a file is added', () => {
      const { ui } = mount();

      expect(ui.queryByRole('list')).toBeNull();
    });

    it('passes accept and multiple to the file input', () => {
      const { input } = mount({ accept: '.pdf,image/*', multiple: true });

      expect(input.getAttribute('accept')).toBe('.pdf,image/*');
      expect(input.multiple).toBe(true);
    });

    it('allows one file by default', () => {
      const { input } = mount();

      expect(input.multiple).toBe(false);
    });

    it('shows the limits as hints', () => {
      const { ui } = mount({ accept: '.pdf, image/*', maxFiles: 3, maxFileSize: 2 * 1024 * 1024 });

      expect(ui.getByText(/Allowed: \.pdf, image\/\*/)).toBeTruthy();
      expect(ui.getByText(/Maximum number of files: 3/)).toBeTruthy();
      expect(ui.getByText(/Maximum size per file: 2 MB/)).toBeTruthy();
    });

    it('adds dropped files and marks the element while dragging over it', () => {
      const { ui, upload, root, dropArea } = mount();

      fireEvent.dragEnter(dropArea);

      expect(root.hasAttribute('data-dragging')).toBe(true);

      fireEvent.dragLeave(dropArea);

      expect(root.hasAttribute('data-dragging')).toBe(false);

      fireEvent.dragEnter(dropArea);
      fireEvent.drop(dropArea, { dataTransfer: { files: [file('dropped.txt')] } });

      expect(root.hasAttribute('data-dragging')).toBe(false);
      expect(ui.getByText('dropped.txt')).toBeTruthy();
      expect(upload).toHaveBeenCalledTimes(1);
    });

    it('takes files dropped anywhere on the element, also on the list', () => {
      const { choose, rowOf, ui, upload } = mount({ multiple: true });

      choose(file('a.txt'));
      fireEvent.drop(rowOf('a.txt'), { dataTransfer: { files: [file('b.txt')] } });

      expect(ui.getByText('b.txt')).toBeTruthy();
      expect(upload).toHaveBeenCalledTimes(2);
    });

    it('does not let the input event of the file input leave the element', () => {
      const { input } = mount();
      const listener = vi.fn();

      document.addEventListener('input', listener);
      input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      document.removeEventListener('input', listener);

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('uploading', () => {
    it('uploads a chosen file at once with a signal and shows it in the list', () => {
      const { choose, rowOf, upload, ui } = mount();

      choose(file('a.txt', 2048));

      expect(ui.getByText('a.txt')).toBeTruthy();
      expect(within(rowOf('a.txt')).getByText('2 kB')).toBeTruthy();
      expect(upload).toHaveBeenCalledTimes(1);
      expect(upload.mock.calls[0]![0].name).toBe('a.txt');
      expect(upload.mock.calls[0]![1].signal.aborted).toBe(false);
      expect(within(rowOf('a.txt')).getByText('Uploading 0%')).toBeTruthy();
    });

    it('shows the progress of an upload', () => {
      const { choose, rowOf, pending } = mount();

      choose(file('a.txt'));
      pending[0]!.context.onProgress(0.42);

      expect(within(rowOf('a.txt')).getByText('Uploading 42%')).toBeTruthy();
      expect(within(rowOf('a.txt')).getByRole<HTMLProgressElement>('progressbar', { name: 'a.txt' }).value).toBe(0.42);

      pending[0]!.context.onProgress(7);

      expect(within(rowOf('a.txt')).getByText('Uploading 100%')).toBeTruthy();
    });

    it('marks a file as uploaded when the promise resolves', async () => {
      const { choose, rowOf, pending } = mount();

      choose(file('a.txt'));
      pending[0]!.resolve();
      await flush();

      expect(within(rowOf('a.txt')).getByText('Uploaded')).toBeTruthy();
      expect(within(rowOf('a.txt')).queryByRole('progressbar')).toBeNull();
      expect(rowOf('a.txt').getAttribute('data-status')).toBe('done');
      expect(rowOf('a.txt').getAttribute('part')).toBe('row row-done');
    });

    it('marks a file as failed when the promise rejects, and retries it', async () => {
      const { choose, rowOf, pending, upload } = mount();

      choose(file('a.txt'));
      pending[0]!.reject(new Error('boom'));
      await flush();

      expect(within(rowOf('a.txt')).getByText('Upload failed')).toBeTruthy();

      fireEvent.click(within(rowOf('a.txt')).getByRole('button', { name: 'Retry' }));

      expect(upload).toHaveBeenCalledTimes(2);
      expect(within(rowOf('a.txt')).getByText('Uploading 0%')).toBeTruthy();

      pending[1]!.resolve();
      await flush();

      expect(within(rowOf('a.txt')).getByText('Uploaded')).toBeTruthy();
    });

    it('treats a function that throws like a rejected promise', async () => {
      const { choose, ui } = mount({
        upload: () => {
          throw new Error('sync boom');
        },
      });

      choose(file('a.txt'));
      await flush();

      expect(ui.getByText('Upload failed')).toBeTruthy();
    });

    it('aborts the signal when the user cancels, and ignores what the upload reports afterwards', async () => {
      const { choose, rowOf, pending } = mount();

      choose(file('a.txt'));
      fireEvent.click(within(rowOf('a.txt')).getByRole('button', { name: 'Stop' }));

      expect(pending[0]!.context.signal.aborted).toBe(true);
      expect(within(rowOf('a.txt')).getByText('Canceled')).toBeTruthy();

      pending[0]!.reject(new DOMException('aborted', 'AbortError'));
      pending[0]!.context.onProgress(0.5);
      await flush();

      expect(within(rowOf('a.txt')).getByText('Canceled')).toBeTruthy();

      fireEvent.click(within(rowOf('a.txt')).getByRole('button', { name: 'Retry' }));

      expect(pending).toHaveLength(2);
      expect(pending[1]!.context.signal.aborted).toBe(false);
    });

    it('removes a finished file from the list', async () => {
      const { choose, rowOf, pending, ui } = mount();

      choose(file('a.txt'));
      pending[0]!.resolve();
      await flush();
      fireEvent.click(within(rowOf('a.txt')).getByRole('button', { name: 'Remove' }));

      expect(ui.queryByText('a.txt')).toBeNull();
      expect(ui.queryByRole('list')).toBeNull();
    });

    it('aborts running and waiting uploads when the element is removed from the page', async () => {
      const { element, choose, pending } = mount({ multiple: true, maxParallel: 1 });

      choose(file('a.txt'), file('b.txt'));
      element.remove();

      expect(pending[0]!.context.signal.aborted).toBe(false);

      await flush();

      expect(pending[0]!.context.signal.aborted).toBe(true);
      expect(element.items.map((item) => item.status)).toEqual(['aborted', 'aborted']);
    });

    it('keeps the uploads running when the element is only moved', async () => {
      const { element, choose, pending } = mount();

      choose(file('a.txt'));
      document.body.prepend(document.createElement('div'), element);
      await flush();

      expect(pending[0]!.context.signal.aborted).toBe(false);
    });

    it('uploads only a few files at a time and starts the next one when a slot is free', async () => {
      const { choose, rowOf, pending } = mount({ multiple: true, maxParallel: 2 });

      choose(file('a.txt'), file('b.txt'), file('c.txt'));

      expect(pending).toHaveLength(2);
      expect(within(rowOf('c.txt')).getByText('Waiting')).toBeTruthy();

      pending[0]!.resolve();
      await flush();

      expect(pending).toHaveLength(3);
      expect(pending[2]!.file.name).toBe('c.txt');
      expect(within(rowOf('c.txt')).getByText('Uploading 0%')).toBeTruthy();
    });

    it('can cancel a file that is still waiting', async () => {
      const { choose, rowOf, pending } = mount({ multiple: true, maxParallel: 1 });

      choose(file('a.txt'), file('b.txt'));
      fireEvent.click(within(rowOf('b.txt')).getByRole('button', { name: 'Cancel' }));

      expect(within(rowOf('b.txt')).getByText('Canceled')).toBeTruthy();

      pending[0]!.resolve();
      await flush();

      expect(pending).toHaveLength(1);
    });

    it('adds files to the list and uploads each one', () => {
      const { choose, ui, upload } = mount({ multiple: true });

      choose(file('a.txt'));
      choose(file('b.txt'), file('c.txt'));

      expect(ui.getAllByRole('listitem')).toHaveLength(3);
      expect(upload).toHaveBeenCalledTimes(3);
    });

    it('lets the same file be chosen again', () => {
      const { choose, input } = mount();

      choose(file('a.txt'));

      expect(input.value).toBe('');
    });

    it('lets the files wait until there is an upload function', () => {
      const { element, choose, rowOf } = mount({ upload: undefined });
      const { upload, pending } = createUpload();

      choose(file('a.txt'));

      expect(within(rowOf('a.txt')).getByText('Waiting')).toBeTruthy();

      element.upload = upload;

      expect(pending).toHaveLength(1);
      expect(within(rowOf('a.txt')).getByText('Uploading 0%')).toBeTruthy();
    });
  });

  describe('manual upload', () => {
    it('waits for the user with manual-upload', () => {
      const { choose, rowOf, upload } = mount({ multiple: true, manualUpload: true });

      choose(file('a.txt'), file('b.txt'));

      expect(upload).not.toHaveBeenCalled();
      expect(within(rowOf('a.txt')).getByText('Ready to upload')).toBeTruthy();
    });

    it('uploads one file with its button', () => {
      const { choose, rowOf, upload } = mount({ multiple: true, manualUpload: true });

      choose(file('a.txt'), file('b.txt'));
      fireEvent.click(within(rowOf('a.txt')).getByRole('button', { name: 'Upload' }));

      expect(upload).toHaveBeenCalledTimes(1);
      expect(upload.mock.calls[0]![0].name).toBe('a.txt');
      expect(within(rowOf('b.txt')).getByText('Ready to upload')).toBeTruthy();
    });

    it('uploads all ready files with "Upload all", which disappears afterwards', () => {
      const { choose, ui, upload } = mount({ multiple: true, manualUpload: true });

      choose(file('a.txt'), file('b.txt'));
      fireEvent.click(ui.getByRole('button', { name: 'Upload all' }));

      expect(upload).toHaveBeenCalledTimes(2);
      expect(ui.queryByRole('button', { name: 'Upload all' })).toBeNull();
    });

    it('has no "Upload all" button without manual-upload', () => {
      const { choose, ui } = mount();

      choose(file('a.txt'));

      expect(ui.queryByRole('button', { name: 'Upload all' })).toBeNull();
    });

    it('removes a ready file without uploading it', () => {
      const { choose, rowOf, ui, upload } = mount({ manualUpload: true });

      choose(file('a.txt'));
      fireEvent.click(within(rowOf('a.txt')).getByRole('button', { name: 'Remove' }));

      expect(ui.queryByText('a.txt')).toBeNull();
      expect(upload).not.toHaveBeenCalled();
    });
  });

  describe('label', () => {
    const labelOf = (shadow: ShadowRoot) => shadow.querySelector<HTMLElement>('[part="label"]')!;

    it('shows no label of its own by default', () => {
      const { shadow } = mount();

      expect(labelOf(shadow).hidden).toBe(true);
    });

    it('shows the label attribute, reflected from the property', () => {
      const { element, shadow } = mount({ label: 'Attachments' });

      expect(element.getAttribute('label')).toBe('Attachments');
      expect(labelOf(shadow).hidden).toBe(false);
      expect(labelOf(shadow).textContent).toBe('Attachments');

      element.label = undefined;

      expect(labelOf(shadow).hidden).toBe(true);
    });

    it('shows the content of the label slot instead', () => {
      const { shadow } = mount({ label: 'Attachments' }, '<span slot="label">Invoices <i>(PDF)</i></span>');
      const slot = shadow.querySelector<HTMLSlotElement>('slot[name="label"]')!;

      expect(labelOf(shadow).hidden).toBe(false);
      expect(slot.assignedNodes().map((node) => node.textContent)).toEqual(['Invoices (PDF)']);
    });

    it('focuses "Browse" on a click on its own label', () => {
      const { ui, shadow } = mount({ label: 'Attachments' });

      fireEvent.click(labelOf(shadow));

      expect(shadow.activeElement).toBe(ui.getByRole('button', { name: 'Browse' }));
    });

    it('is labelable: a <label for> is one of its labels, and a click on it focuses "Browse"', () => {
      const { ui, element, shadow } = mount();
      const label = document.createElement('label');

      element.id = 'files';
      label.htmlFor = 'files';
      label.textContent = 'Attachments';
      document.body.prepend(label);

      expect([...element.labels]).toEqual([label]);

      fireEvent.click(label);

      expect(shadow.activeElement).toBe(ui.getByRole('button', { name: 'Browse' }));
    });

    it('does not move the focus on a click inside', () => {
      const { ui, shadow, choose } = mount();

      choose(file('a.txt'));
      fireEvent.click(ui.getByRole('button', { name: 'Stop' }));

      expect(shadow.activeElement).not.toBe(ui.getByRole('button', { name: 'Browse' }));
    });
  });

  describe('error', () => {
    const errorOf = (shadow: ShadowRoot) => shadow.querySelector<HTMLElement>('[part="error"]')!;

    it('shows no error by default', () => {
      const { shadow, root } = mount();

      expect(errorOf(shadow).hidden).toBe(true);
      expect(root.hasAttribute('data-invalid')).toBe(false);
    });

    it('shows the error attribute, reflected from the property, and marks the frame and the element invalid', () => {
      const { element, shadow, root } = mount({ error: 'Add at least one file' });

      expect(element.getAttribute('error')).toBe('Add at least one file');
      expect(errorOf(shadow).hidden).toBe(false);
      expect(errorOf(shadow).textContent).toBe('Add at least one file');
      expect(errorOf(shadow).getAttribute('role')).toBe('alert');
      expect(root.hasAttribute('data-invalid')).toBe(true);

      element.error = undefined;

      expect(errorOf(shadow).hidden).toBe(true);
      expect(root.hasAttribute('data-invalid')).toBe(false);
    });

    it('shows the content of the error slot instead', () => {
      const { shadow, root } = mount({ error: 'Plain' }, '<span slot="error">Add a <b>file</b></span>');
      const slot = shadow.querySelector<HTMLSlotElement>('slot[name="error"]')!;

      expect(errorOf(shadow).hidden).toBe(false);
      expect(slot.assignedNodes().map((node) => node.textContent)).toEqual(['Add a file']);
      expect(root.hasAttribute('data-invalid')).toBe(true);
    });

    it('cancels the invalid event, so the browser shows no bubble', () => {
      const { element } = mount({ required: true });
      const event = new Event('invalid', { cancelable: true });

      element.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
    });
  });

  describe('clear', () => {
    it('is shown from one file, and empties the list', async () => {
      const { ui, element, choose, pending } = mount({ multiple: true });
      const change = vi.fn();

      expect(ui.queryByRole('button', { name: 'Clear' })).toBeNull();

      choose(file('a.txt'), file('b.txt'));
      pending[0]!.resolve();
      await flush();
      element.addEventListener('change', change);
      fireEvent.click(ui.getByRole('button', { name: 'Clear' }));

      expect(element.items).toEqual([]);
      expect(pending[1]!.context.signal.aborted).toBe(true);
      expect(change).toHaveBeenCalledTimes(1);
      expect(ui.queryByRole('button', { name: 'Clear' })).toBeNull();
    });

    it('moves the focus to "Browse"', () => {
      const { ui, shadow, choose } = mount();

      choose(file('a.txt'));
      ui.getByRole('button', { name: 'Clear' }).focus();
      fireEvent.click(ui.getByRole('button', { name: 'Clear' }));

      expect(shadow.activeElement).toBe(ui.getByRole('button', { name: 'Browse' }));
    });

    it('is shown next to "Upload all", which needs a ready file', () => {
      const { ui, choose } = mount({ manualUpload: true });

      choose(file('a.txt'));

      expect(ui.getByRole('button', { name: 'Clear' })).toBeTruthy();
      expect(ui.getByRole('button', { name: 'Upload all' })).toBeTruthy();

      fireEvent.click(ui.getByRole('button', { name: 'Upload all' }));

      expect(ui.getByRole('button', { name: 'Clear' })).toBeTruthy();
      expect(ui.queryByRole('button', { name: 'Upload all' })).toBeNull();
    });
  });

  describe('validation', () => {
    it('rejects a file of a type that is not accepted, without uploading it', () => {
      const { choose, rowOf, upload } = mount({ accept: 'image/*' });

      choose(file('a.txt'));

      expect(within(rowOf('a.txt')).getByText('This file type is not allowed')).toBeTruthy();
      expect(rowOf('a.txt').getAttribute('data-status')).toBe('rejected');
      expect(upload).not.toHaveBeenCalled();
    });

    it('accepts a file that matches an extension or a MIME type', () => {
      const { choose, upload } = mount({ multiple: true, accept: '.pdf, image/*' });

      choose(file('a.pdf', 10, 'application/pdf'), file('b.png', 10, 'image/png'));

      expect(upload).toHaveBeenCalledTimes(2);
    });

    it('rejects a file that is too large', () => {
      const { choose, rowOf, upload } = mount({ multiple: true, maxFileSize: 1024 });

      choose(file('big.txt', 2048), file('small.txt', 1024));

      expect(within(rowOf('big.txt')).getByText('The file is larger than 1 kB')).toBeTruthy();
      expect(upload).toHaveBeenCalledTimes(1);
      expect(upload.mock.calls[0]![0].name).toBe('small.txt');
    });

    it('rejects the files above the maximum number, counting the files already in the list', () => {
      const { choose, rowOf, upload } = mount({ multiple: true, maxFiles: 2 });

      choose(file('a.txt'));
      choose(file('b.txt'), file('c.txt'));

      expect(within(rowOf('c.txt')).getByText('Too many files, the maximum is 2')).toBeTruthy();
      expect(upload).toHaveBeenCalledTimes(2);
    });

    it('does not count rejected files, and gives the slot back when a file is removed', () => {
      const { choose, rowOf, upload } = mount({ multiple: true, maxFiles: 1, accept: '.txt' });

      choose(file('bad.png', 10, 'image/png'), file('a.txt'));

      expect(upload).toHaveBeenCalledTimes(1);

      fireEvent.click(within(rowOf('a.txt')).getByRole('button', { name: 'Stop' }));
      fireEvent.click(within(rowOf('a.txt')).getByRole('button', { name: 'Remove' }));
      choose(file('b.txt'));

      expect(upload).toHaveBeenCalledTimes(2);
    });

    it('lets a rejected file be removed', () => {
      const { choose, rowOf, ui } = mount({ accept: 'image/*' });

      choose(file('a.txt'));

      expect(within(rowOf('a.txt')).queryByRole('button', { name: 'Retry' })).toBeNull();

      fireEvent.click(within(rowOf('a.txt')).getByRole('button', { name: 'Remove' }));

      expect(ui.queryByText('a.txt')).toBeNull();
    });

    it('replaces the current file when only one file is allowed, and aborts its upload', () => {
      const { choose, ui, pending } = mount();

      choose(file('a.txt'));
      choose(file('b.txt'), file('c.txt'));

      expect(pending[0]!.context.signal.aborted).toBe(true);
      expect(ui.queryByText('a.txt')).toBeNull();
      expect(ui.getByText('b.txt')).toBeTruthy();
      expect(ui.queryByText('c.txt')).toBeNull();
      expect(pending).toHaveLength(2);
    });

    it('updates the hints and the status texts when a limit changes', () => {
      const { element, choose, rowOf, ui } = mount({ maxFileSize: 1024 });

      choose(file('big.txt', 2048));
      element.maxFileSize = 1536;

      expect(ui.getByText(/Maximum size per file: 1.5 kB/)).toBeTruthy();
      expect(within(rowOf('big.txt')).getByText('The file is larger than 1.5 kB')).toBeTruthy();
    });
  });

  describe('change event and items', () => {
    it('reports every change of the list, but not before something happens', async () => {
      const { element, choose, pending } = mount({ multiple: true });
      const change = vi.fn();

      element.addEventListener('change', change);
      element.maxFiles = 5;

      expect(change).not.toHaveBeenCalled();
      expect(element.items).toEqual([]);

      choose(file('a.txt'), file('b.png', 10, 'image/png'));

      expect(change).toHaveBeenCalled();
      expect(element.items.map((item) => [item.file.name, item.status])).toEqual([
        ['a.txt', 'uploading'],
        ['b.png', 'uploading'],
      ]);

      pending[0]!.resolve();
      await flush();

      expect(element.items[0]!.status).toBe('done');
      expect(element.items[0]!.progress).toBe(1);
    });

    it('bubbles like the change event of an input', () => {
      const { choose } = mount();
      const change = vi.fn();

      document.body.addEventListener('change', change);
      choose(file('a.txt'));
      document.body.removeEventListener('change', change);

      // The change event of the inner file input stays in the shadow DOM, so only ours arrives.
      expect(change).toHaveBeenCalledTimes(1);
    });

    it('keeps the string that an upload resolved with as the result', async () => {
      const { element, choose, pending } = mount({ multiple: true });

      choose(file('a.txt'), file('b.txt'));
      pending[0]!.resolve('id-a');
      pending[1]!.resolve();
      await flush();

      expect(element.items.map((item) => [item.status, item.result])).toEqual([
        ['done', 'id-a'],
        ['done', undefined],
      ]);
    });

    it('reports the rejection and the error', async () => {
      const { element, choose, pending } = mount({ multiple: true, accept: '.txt' });
      const error = new Error('boom');

      choose(file('a.txt'), file('b.png', 10, 'image/png'));
      pending[0]!.reject(error);
      await flush();

      expect(element.items[0]!.status).toBe('error');
      expect(element.items[0]!.error).toBe(error);
      expect(element.items[1]!.status).toBe('rejected');
      expect(element.items[1]!.rejection).toBe('type');
    });
  });

  describe('attributes and properties', () => {
    it('reflects the properties to attributes', () => {
      const { element } = mount();

      element.maxFiles = 3;
      element.maxFileSize = 1024;
      element.maxParallel = 2;
      element.accept = '.pdf';
      element.multiple = true;
      element.manualUpload = true;
      element.previews = true;
      element.disabled = true;
      element.name = 'files';
      element.required = true;

      expect(element.getAttribute('max-files')).toBe('3');
      expect(element.getAttribute('max-file-size')).toBe('1024');
      expect(element.getAttribute('max-parallel')).toBe('2');
      expect(element.getAttribute('accept')).toBe('.pdf');
      expect(element.getAttribute('name')).toBe('files');

      for (const name of ['multiple', 'manual-upload', 'previews', 'disabled', 'required']) {
        expect(element.hasAttribute(name)).toBe(true);
      }

      element.maxFiles = undefined;
      element.multiple = false;
      element.name = undefined;

      expect(element.hasAttribute('max-files')).toBe(false);
      expect(element.hasAttribute('name')).toBe(false);
      expect(element.hasAttribute('multiple')).toBe(false);
    });

    it('has the density normal by default, reflects it and puts it on root, without a change event', () => {
      const { element, root } = mount();
      const onChange = vi.fn();

      element.addEventListener('change', onChange);

      expect(element.density).toBe('normal');
      expect(root.dataset['density']).toBeUndefined();

      element.density = 'compact';
      expect(element.getAttribute('density')).toBe('compact');
      expect(root.dataset['density']).toBe('compact');

      element.setAttribute('density', 'huge');
      expect(element.density).toBe('normal');
      expect(root.dataset['density']).toBe('normal');

      expect(onChange).not.toHaveBeenCalled();
    });

    it('reads the attributes, with the defaults for missing or invalid values', () => {
      const { element } = mount();

      expect(element.maxParallel).toBe(3);
      expect(element.multiple).toBe(false);
      expect(element.manualUpload).toBe(false);
      expect(element.previews).toBe(false);
      expect(element.name).toBeUndefined();
      expect(element.required).toBe(false);

      element.setAttribute('max-parallel', 'many');
      element.setAttribute('max-files', '');

      expect(element.maxParallel).toBe(3);
      expect(element.maxFiles).toBeUndefined();

      element.setAttribute('max-files', '4');

      expect(element.maxFiles).toBe(4);
    });

    it('takes the properties that were set before the element was defined', () => {
      const tag = 'late-upload';
      const { upload, pending } = createUpload();
      const element = document.createElement(tag) as Spec.Element;

      Object.assign(element, { upload, multiple: true });
      document.body.append(element);
      customElements.define(tag, class extends createFileUploadClass() {});

      const { choose } = queries(element);

      expect(element.hasAttribute('multiple')).toBe(true);

      choose(file('a.txt'), file('b.txt'));

      expect(pending).toHaveLength(2);
    });
  });

  describe('slots', () => {
    it('shows the content of the app instead of the defaults', () => {
      const { shadow } = mount({}, '<span slot="prompt">Drop invoices here or</span>');
      const slot = shadow.querySelector<HTMLSlotElement>('slot[name="prompt"]')!;

      expect(slot.assignedNodes().map((node) => node.textContent)).toEqual(['Drop invoices here or']);
    });

    it('hides the limits when there is nothing to show', () => {
      const { shadow } = mount();

      expect(shadow.querySelector<HTMLElement>('[part="limits"]')!.hidden).toBe(true);
    });

    it('shows the limits slot of the app even without limits', async () => {
      const { shadow } = mount({}, '<span slot="limits">PDF only, please</span>');

      await flush();

      expect(shadow.querySelector<HTMLElement>('[part="limits"]')!.hidden).toBe(false);
    });
  });

  describe('tooltips and focus', () => {
    it('shows the label of an action button on keyboard focus and hides it on blur and Escape', () => {
      const { choose, rowOf, shadow } = mount();
      const tooltip = shadow.querySelector<HTMLElement>('[role="tooltip"]')!;

      choose(file('a.txt'));

      const cancel = within(rowOf('a.txt')).getByRole('button', { name: 'Stop' });

      // A focus that is not keyboard focus (e.g. by a click) shows none.
      cancel.focus();

      expect(tooltip.hasAttribute('data-popover-open')).toBe(false);

      cancel.blur();

      // jsdom never matches `:focus-visible` inside a shadow root: from here on, the focus counts as keyboard focus.
      const matches = Element.prototype.matches;

      vi.spyOn(cancel, 'matches').mockImplementation((selector) =>
        selector === ':focus-visible' ? cancel.matches(':focus') : matches.call(cancel, selector)
      );

      cancel.focus();

      expect(tooltip.textContent).toBe('Stop');
      expect(tooltip.hasAttribute('data-popover-open')).toBe(true);
      expect(cancel.hasAttribute('data-tooltip-anchor')).toBe(true);

      cancel.blur();

      expect(tooltip.hasAttribute('data-popover-open')).toBe(false);
      expect(cancel.hasAttribute('data-tooltip-anchor')).toBe(false);

      cancel.focus();
      fireEvent.keyDown(cancel, { key: 'Escape' });

      expect(tooltip.hasAttribute('data-popover-open')).toBe(false);
    });

    it('shows the label on hover only after a short delay', () => {
      vi.useFakeTimers();

      try {
        const { choose, rowOf, shadow } = mount();
        const tooltip = shadow.querySelector<HTMLElement>('[role="tooltip"]')!;

        choose(file('a.txt'));

        const stop = within(rowOf('a.txt')).getByRole('button', { name: 'Stop' });

        fireEvent.pointerEnter(stop);
        vi.advanceTimersByTime(499);

        expect(tooltip.hasAttribute('data-popover-open')).toBe(false);

        vi.advanceTimersByTime(1);

        expect(tooltip.hasAttribute('data-popover-open')).toBe(true);
        expect(tooltip.textContent).toBe('Stop');

        fireEvent.pointerLeave(stop);
        fireEvent.pointerEnter(stop);
        fireEvent.pointerLeave(stop);
        vi.advanceTimersByTime(500);

        expect(tooltip.hasAttribute('data-popover-open')).toBe(false);
      } finally {
        vi.useRealTimers();
      }
    });

    it('keeps the focus in the row when its buttons change', () => {
      const { choose, rowOf, shadow } = mount();

      choose(file('a.txt'));
      within(rowOf('a.txt')).getByRole('button', { name: 'Stop' }).focus();
      fireEvent.click(within(rowOf('a.txt')).getByRole('button', { name: 'Stop' }));

      expect(shadow.activeElement?.getAttribute('aria-label')).toBe('Retry');
    });

    it('moves the focus to "Browse" when the last row is removed', () => {
      const { choose, rowOf, shadow } = mount({ accept: 'image/*' });

      choose(file('a.txt'));

      const remove = within(rowOf('a.txt')).getByRole('button', { name: 'Remove' });

      remove.focus();
      fireEvent.click(remove);

      expect(shadow.activeElement?.textContent).toBe('Browse');
    });
  });

  describe('previews and disabled', () => {
    it('shows a preview of an image and releases it when the element is removed', async () => {
      const create = vi.fn(() => 'blob:preview');
      const revoke = vi.fn();

      vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke }));

      try {
        const { element, choose, rowOf } = mount({ multiple: true, previews: true });

        choose(file('photo.png', 10, 'image/png'), file('a.txt'));

        expect(rowOf('photo.png').querySelector('img')?.getAttribute('src')).toBe('blob:preview');
        expect(rowOf('a.txt').querySelector('img')).toBeNull();
        expect(create).toHaveBeenCalledTimes(1);

        element.remove();
        await flush();

        expect(revoke).toHaveBeenCalledWith('blob:preview');
      } finally {
        vi.unstubAllGlobals();
      }
    });

    it('shows the icon of the status where there is no preview', async () => {
      const { choose, rowOf, pending } = mount({ multiple: true, maxParallel: 1, maxFileSize: 100 });
      const iconOf = (name: string) => rowOf(name).querySelector('[part="thumbnail"] svg')?.getAttribute('data-icon');

      choose(file('a.txt', 10), file('b.txt', 10), file('big.txt', 200));

      expect(iconOf('a.txt')).toBe('spinner');
      expect(iconOf('b.txt')).toBe('file');
      expect(iconOf('big.txt')).toBe('warning');

      pending[0]!.resolve();
      await flush();

      expect(iconOf('a.txt')).toBe('done');
      expect(iconOf('b.txt')).toBe('spinner');

      pending[1]!.reject(new Error('Server error'));
      await flush();

      expect(iconOf('b.txt')).toBe('warning');
    });

    it('shows the state of an upload as a badge on a preview', async () => {
      vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: () => 'blob:preview', revokeObjectURL: vi.fn() }));

      try {
        const { choose, rowOf, pending } = mount({ multiple: true, previews: true });
        const badgeOf = (name: string) =>
          rowOf(name).querySelector('[part="thumbnail"] .badge')?.getAttribute('data-badge');

        choose(file('a.png', 10, 'image/png'), file('b.png', 10, 'image/png'));

        expect(rowOf('a.png').querySelector('img')).not.toBeNull();
        expect(badgeOf('a.png')).toBe('pulse');

        pending[0]!.resolve();
        pending[1]!.reject(new Error('Server error'));
        await flush();

        expect(rowOf('a.png').querySelector('img')).not.toBeNull();
        expect(badgeOf('a.png')).toBe('done');
        expect(badgeOf('b.png')).toBe('warning');
      } finally {
        vi.unstubAllGlobals();
      }
    });

    it('opens a preview large in a dialog and closes it again', () => {
      vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: () => 'blob:preview', revokeObjectURL: vi.fn() }));

      try {
        const { element, choose, rowOf, shadow } = mount({ multiple: true, previews: true });
        const dialog = shadow.querySelector('dialog')!;

        choose(file('a.png', 10, 'image/png'), file('b.txt'));

        const show = within(rowOf('a.png')).getByRole('button', { name: 'Show preview' });

        expect(within(rowOf('b.txt')).queryByRole('button', { name: /preview/ })).toBeNull();

        fireEvent.click(show);

        expect(dialog.open).toBe(true);
        expect(dialog.getAttribute('aria-label')).toBe('a.png');
        expect(dialog.querySelector('img')?.getAttribute('src')).toBe('blob:preview');

        fireEvent.click(within(dialog).getByRole('button', { name: 'Close preview' }));

        expect(dialog.open).toBe(false);

        fireEvent.click(show);
        fireEvent.click(dialog);

        expect(dialog.open).toBe(false);

        fireEvent.click(show);
        fireEvent(dialog, new Event('cancel', { cancelable: true }));

        expect(dialog.open).toBe(false);

        fireEvent.click(show);
        element.previews = false;

        expect(dialog.open).toBe(false);
        expect(within(rowOf('a.png')).queryByRole('button', { name: /preview/ })).toBeNull();
      } finally {
        vi.unstubAllGlobals();
      }
    });

    it('shows no preview by default', () => {
      const create = vi.fn(() => 'blob:preview');

      vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: create, revokeObjectURL: vi.fn() }));

      try {
        const { choose, rowOf } = mount();

        choose(file('photo.png', 10, 'image/png'));

        expect(create).not.toHaveBeenCalled();
        expect(rowOf('photo.png').querySelector('img')).toBeNull();
      } finally {
        vi.unstubAllGlobals();
      }
    });

    it('ignores dropped and chosen files when disabled', () => {
      const { choose, dropArea, shadow, ui, upload } = mount({ disabled: true });

      fireEvent.drop(dropArea, { dataTransfer: { files: [file('a.txt')] } });
      choose(file('b.txt'));

      expect(upload).not.toHaveBeenCalled();
      expect(ui.queryByRole('list', { hidden: true })?.hidden).toBe(true);
      expect(shadow.querySelector('[part="root"]')?.hasAttribute('inert')).toBe(true);
    });
  });

  describe('i18n adapter', () => {
    // A small adapter: German texts for a few keys, the locale can be switched.
    function createI18n() {
      const listeners = new Set<() => void>();
      const german: Readonly<Record<string, string>> = {
        browse: 'Durchsuchen',
        statusUploading: '{percent} % hochgeladen',
      };
      let locale = 'en-US';

      const i18n = {
        currentLocale: () => locale,
        resolveText: vi.fn((
          _namespace: string,
          key: string,
          params: Readonly<Record<string, unknown>> | null,
          defaultValue: string,
        ) => {
          const text = locale.startsWith('de') ? german[key] : undefined;

          return text?.replace(/\{(\w+)\}/g, (_, name: string) => String(params?.[name])) ?? defaultValue;
        }),
        onChange: vi.fn((listener: () => void) => {
          listeners.add(listener);

          return () => listeners.delete(listener);
        }),
      };

      const setLocale = (next: string) => {
        locale = next;
        listeners.forEach((listener) => listener());
      };

      return { i18n, listeners, setLocale };
    }

    function mountWith(i18n: Spec.I18nAdapter, options: Options = {}) {
      const tag = `i18n-upload-${crypto.randomUUID()}`;

      customElements.define(
        tag,
        class extends createFileUploadClass({ i18n: { type: 'factory', getAdapter: () => i18n } }) {},
      );

      const { upload, pending } = createUpload();
      const element = document.createElement(tag) as Spec.Element;

      Object.assign(element, { upload, ...options });
      document.body.append(element);

      return { element, upload, pending, ...queries(element) };
    }

    it('asks the adapter for every text, with the namespace, the params and the English default', () => {
      const { i18n } = createI18n();
      const { ui } = mountWith(i18n, { maxFiles: 3 });

      expect(ui.getByRole('button', { name: 'Browse' })).toBeTruthy();
      expect(i18n.resolveText).toHaveBeenCalledWith('fileUpload', 'browse', null, 'Browse');
      expect(i18n.resolveText).toHaveBeenCalledWith(
        'fileUpload',
        'hintMaxFiles',
        { count: 3 },
        'Maximum number of files: 3',
      );
    });

    it('refreshes all texts and sizes when the adapter reports a change', () => {
      const { i18n, setLocale } = createI18n();
      const { choose, rowOf, ui } = mountWith(i18n, { maxFileSize: 1536 });

      choose(file('a.txt', 1536));
      setLocale('de-DE');

      expect(ui.getByRole('button', { name: 'Durchsuchen' })).toBeTruthy();
      expect(within(rowOf('a.txt')).getByText('0 % hochgeladen')).toBeTruthy();
      expect(within(rowOf('a.txt')).getByText('1,5 kB')).toBeTruthy();
      expect(ui.getByText(/Maximum size per file: 1,5 kB/)).toBeTruthy();
      expect(within(rowOf('a.txt')).getByRole('button', { name: 'Stop' })).toBeTruthy();
    });

    it('listens only while the element is on the page', () => {
      const { i18n, listeners, setLocale } = createI18n();
      const { element, ui } = mountWith(i18n);

      expect(listeners.size).toBe(1);

      element.remove();

      expect(listeners.size).toBe(0);

      setLocale('de');
      document.body.append(element);

      expect(listeners.size).toBe(1);
      expect(ui.getByRole('button', { name: 'Durchsuchen' })).toBeTruthy();
    });

    it('asks the factory once per element, on its first connect, with the element', () => {
      const { i18n } = createI18n();
      const getAdapter = vi.fn((_element: Spec.Element) => i18n);
      const tag = `i18n-upload-${crypto.randomUUID()}`;

      customElements.define(tag, class extends createFileUploadClass({ i18n: { type: 'factory', getAdapter } }) {});

      const first = document.createElement(tag) as Spec.Element;
      const second = document.createElement(tag) as Spec.Element;

      expect(getAdapter).not.toHaveBeenCalled();

      document.body.append(first, second);
      first.remove();
      document.body.append(first);

      expect(getAdapter.mock.calls.map(([element]) => element)).toEqual([first, second]);
    });

    it('formats in en-US when the locale is invalid', () => {
      const { i18n, setLocale } = createI18n();
      const { ui } = mountWith(i18n, { maxFileSize: 1536 });

      setLocale('not a locale!');

      expect(ui.getByText(/Maximum size per file: 1.5 kB/)).toBeTruthy();
    });
  });

  describe('createFileUploadClass', () => {
    const cssOf = (element: Spec.Element) => {
      const shadow = element.shadowRoot!;
      const sheets = shadow.adoptedStyleSheets.flatMap((sheet) => [...sheet.cssRules].map((rule) => rule.cssText));

      return [...sheets, ...[...shadow.querySelectorAll('style')].map((style) => style.textContent)].join('\n');
    };

    it('creates a new class on every call, with its own theme and styles', () => {
      const Plain = class extends createFileUploadClass() {};
      const Themed = class extends createFileUploadClass({
        theme: {
          accentColor: { light: '#0ca678', dark: '#63e6be' },
          borderRadius: '3px',
          buttonBorderRadius: '11px',
          fontFamily: 'Georgia, serif',
          fontSize: '17px',
        },
        styles: '.root { border-style: dashed; }',
      }) {};

      customElements.define('plain-upload', Plain);
      customElements.define('themed-upload', Themed);

      const plain = new Plain();
      const themed = new Themed();

      expect(cssOf(plain)).not.toContain('#0ca678');
      expect(cssOf(themed)).toContain('light-dark(#0ca678, #63e6be)');
      expect(cssOf(themed)).toContain('3px');
      expect(cssOf(themed)).toMatch(/button \{[^}]*border-radius: 11px;/);
      expect(cssOf(themed)).toContain('Georgia, serif');
      expect(cssOf(themed)).toContain('17px');
      expect(cssOf(themed)).toContain('border-style: dashed');
    });

    it('shares the stylesheet between the elements of a class', () => {
      const Shared = class extends createFileUploadClass() {};

      customElements.define('shared-upload', Shared);

      const first = new Shared().shadowRoot!;
      const second = new Shared().shadowRoot!;

      if (first.adoptedStyleSheets.length > 0) {
        expect(first.adoptedStyleSheets[0]).toBe(second.adoptedStyleSheets[0]);
      }
    });
  });
});
