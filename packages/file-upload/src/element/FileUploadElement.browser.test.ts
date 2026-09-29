import { afterEach, describe, expect, it, vi } from 'vitest';
import type * as Spec from '../api';
import { createFileUploadClass } from './createFileUploadClass';

// Form association runs in a real browser (jsdom lacks it).

type Pending = {
  context: Spec.UploadContext;
  resolve: (result?: string) => void;
  reject: (error: unknown) => void;
};

const TAG = 'form-upload';

customElements.define(TAG, class extends createFileUploadClass() {});

afterEach(() => {
  document.body.replaceChildren();
});

const file = (name: string, type = 'text/plain') => new File(['x'], name, { type });

// Lets pending promises settle.
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

// A form with one element, whose uploads the test ends itself.
function mount(options: Partial<Pick<Spec.Element, 'name' | 'required' | 'multiple' | 'accept' | 'disabled'>> = {}) {
  const pending: Pending[] = [];
  const form = document.createElement('form');
  const fieldset = document.createElement('fieldset');
  const element = document.createElement(TAG) as Spec.Element;

  Object.assign(element, {
    multiple: true,
    ...options,
    upload: (_file: File, context: Spec.UploadContext) =>
      new Promise<string | void>((resolve, reject) => pending.push({ context, resolve, reject })),
  });
  fieldset.append(element);
  form.append(fieldset);
  document.body.append(form);

  const shadow = element.shadowRoot!;

  const choose = (...files: File[]) => {
    const input = shadow.querySelector<HTMLInputElement>('input[type="file"]')!;
    const transfer = new DataTransfer();

    for (const added of files) {
      transfer.items.add(added);
    }

    input.files = transfer.files;
    input.dispatchEvent(new Event('change'));
  };

  const remove = (name: string) => {
    const row = [...shadow.querySelectorAll('li')].find((li) => li.textContent?.includes(name));

    row?.querySelector<HTMLButtonElement>('button[data-action="remove"]')?.click();
  };

  const values = () => new FormData(form).getAll(element.name ?? '');

  return { form, fieldset, element, pending, shadow, choose, remove, values };
}

describe('form association', () => {
  describe('value', () => {
    it('submits the result of every done file under the name', async () => {
      const { choose, pending, values } = mount({ name: 'attachments' });

      choose(file('a.txt'), file('b.txt'), file('c.txt'));
      pending[0]!.resolve('id-a');
      pending[1]!.resolve('id-b');
      await flush();

      expect(values()).toEqual(['id-a', 'id-b']);
    });

    it('drops the result of a removed file', async () => {
      const { choose, pending, remove, values } = mount({ name: 'attachments' });

      choose(file('a.txt'), file('b.txt'));
      pending[0]!.resolve('id-a');
      pending[1]!.resolve('id-b');
      await flush();
      remove('a.txt');

      expect(values()).toEqual(['id-b']);
    });

    it('submits nothing for a file without a result, and nothing without a name', async () => {
      const { form, element, choose, pending, values } = mount({ name: 'attachments' });

      choose(file('a.txt'), file('b.txt'));
      pending[0]!.resolve();
      pending[1]!.resolve('id-b');
      await flush();

      expect(values()).toEqual(['id-b']);

      element.name = undefined;

      expect([...new FormData(form).keys()]).toEqual([]);
    });
  });

  describe('validity', () => {
    it('is invalid while files are unfinished', async () => {
      const { element, choose, pending } = mount();

      choose(file('a.txt'));

      expect(element.checkValidity()).toBe(false);
      expect(element.validity.badInput).toBe(true);
      expect(element.validationMessage).toBe('Wait until all uploads are finished.');

      pending[0]!.resolve('id');
      await flush();

      expect(element.checkValidity()).toBe(true);
    });

    it('is invalid with failed or aborted files, and that message wins', async () => {
      const { element, choose, pending } = mount();

      choose(file('a.txt'), file('b.txt'));
      pending[0]!.reject(new Error('boom'));
      await flush();

      expect(element.validity.badInput).toBe(true);
      expect(element.validationMessage).toBe('Retry or remove the files that failed.');
    });

    it('needs a done file with required', async () => {
      const { element, choose, pending } = mount({ required: true });

      expect(element.validity.valueMissing).toBe(true);
      expect(element.validationMessage).toBe('Please add a file.');

      choose(file('a.txt'));
      pending[0]!.resolve();
      await flush();

      expect(element.validity.valid).toBe(true);
    });

    it('ignores rejected files', () => {
      const { element, choose } = mount({ accept: '.pdf' });

      choose(file('a.txt'));

      expect(element.items[0]!.status).toBe('rejected');
      expect(element.validity.valid).toBe(true);
    });

    it('prefers the message of setCustomValidity', () => {
      const { element } = mount({ required: true });

      element.setCustomValidity('Choose your invoice');

      expect(element.validity.customError).toBe(true);
      expect(element.validity.valueMissing).toBe(true);
      expect(element.validationMessage).toBe('Choose your invoice');

      element.setCustomValidity('');

      expect(element.validationMessage).toBe('Please add a file.');
    });

    it('blocks the submit of its form', () => {
      const { form } = mount({ required: true });
      const submit = vi.fn((event: Event) => event.preventDefault());

      form.addEventListener('submit', submit);
      form.requestSubmit();

      expect(submit).not.toHaveBeenCalled();
    });

    it('has the form members of an input', () => {
      const { form, element } = mount();

      expect(element.form).toBe(form);
      expect(element.willValidate).toBe(true);
      expect(element.reportValidity()).toBe(true);
    });
  });

  it('empties the list and aborts the uploads on a form reset', () => {
    const { form, element, choose, pending } = mount({ name: 'attachments' });
    const change = vi.fn();

    choose(file('a.txt'));
    element.addEventListener('change', change);
    form.reset();

    expect(element.items).toEqual([]);
    expect(pending[0]!.context.signal.aborted).toBe(true);
    expect(change).toHaveBeenCalledTimes(1);
  });

  describe('disabled', () => {
    it('is disabled by a disabled fieldset, like an input', async () => {
      const { fieldset, element, shadow, choose, pending, values } = mount({ name: 'attachments' });

      choose(file('a.txt'));
      pending[0]!.resolve('id-a');
      await flush();
      fieldset.disabled = true;

      expect(shadow.querySelector('[part="root"]')!.hasAttribute('inert')).toBe(true);
      expect(element.disabled).toBe(false);
      expect(element.willValidate).toBe(false);
      expect(values()).toEqual([]);

      choose(file('b.txt'));

      expect(element.items).toHaveLength(1);

      fieldset.disabled = false;

      expect(shadow.querySelector('[part="root"]')!.hasAttribute('inert')).toBe(false);
      expect(values()).toEqual(['id-a']);
    });

    it('is neither submitted nor validated with its own disabled', () => {
      const { element } = mount({ required: true, disabled: true });

      expect(element.willValidate).toBe(false);
      expect(element.checkValidity()).toBe(true);
    });
  });
});

// The layout needs a real browser too. The React wrapper's placeholder has these heights (see createFileUploadComponent).
describe('density', () => {
  it.each(
    [
      ['compact', 3.018],
      ['normal', 3.59],
      ['comfortable', 4.734],
    ] as const,
  )('gives the empty element (%s) the height of the placeholder', async (density, em) => {
    const element = document.createElement(TAG) as Spec.Element;

    element.style.fontSize = '14px';
    element.density = density;
    document.body.append(element);
    await flush();

    expect(element.getBoundingClientRect().height).toBeCloseTo(em * 14 + 4, 0);
  });
});
