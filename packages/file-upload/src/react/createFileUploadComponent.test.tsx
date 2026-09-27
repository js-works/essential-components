import { within } from '@testing-library/dom';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { createContext, createRef, useContext, useMemo } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type * as Spec from '../api';
import type * as ReactSpec from './api';
import { createFileUploadComponent } from './createFileUploadComponent';

afterEach(cleanup);

const file = (name: string) => new File(['x'], name, { type: 'text/plain' });

// The element, once the placeholder was replaced.
async function elementIn(container: HTMLElement, tag = 'internal-file-upload-'): Promise<Spec.Element> {
  const found = await waitFor(() => {
    const element = [...container.querySelectorAll('*')].find((node) => node.localName.startsWith(tag));

    expect(element).toBeDefined();

    return element;
  });

  return found as Spec.Element;
}

function choose(element: Spec.Element, ...files: File[]) {
  const input = element.shadowRoot!.querySelector<HTMLInputElement>('input[type="file"]')!;

  Object.defineProperty(input, 'files', { value: files, configurable: true });
  act(() => {
    input.dispatchEvent(new Event('change'));
  });
}

// An adapter with German texts for `browse`, when the locale is German.
const adapterFor = (locale: string): Spec.I18nAdapter => ({
  currentLocale: () => locale,
  resolveText: (_namespace, key, _params, defaultValue) =>
    locale === 'de' && key === 'browse' ? 'Durchsuchen' : defaultValue,
});

describe('createFileUploadComponent', () => {
  it('renders a placeholder first, then the element under a generated tag name', async () => {
    const Upload = createFileUploadComponent();
    const { container } = render(<Upload />);

    expect(container.firstElementChild?.localName).toBe('div');
    expect(container.firstElementChild?.getAttribute('aria-busy')).toBe('true');

    const element = await elementIn(container);

    expect(element.localName).toMatch(/^internal-file-upload-\d+$/);
    expect(customElements.get(element.localName)).toBeDefined();
  });

  it('registers each component once, under its own tag name', async () => {
    const First = createFileUploadComponent();
    const Second = createFileUploadComponent({ tagName: 'acme-react-upload' });
    const { container } = render(
      <>
        <First />
        <First />
        <Second />
      </>,
    );

    await elementIn(container, 'acme-react-upload');

    const tags = [...container.children].map((child) => child.localName);

    expect(tags[0]).toBe(tags[1]);
    expect(tags[2]).toBe('acme-react-upload');
  });

  it('sets the props as properties, and back to the default when a prop goes away', async () => {
    const Upload = createFileUploadComponent();
    const upload = vi.fn(() => new Promise<void>(() => {}));
    const { container, rerender } = render(
      <Upload
        upload={upload}
        accept=".txt"
        maxFiles={3}
        maxParallel={1}
        multiple
        name="files"
        required
        density="compact"
      />,
    );
    const element = await elementIn(container);

    expect(element.upload).toBe(upload);
    expect(element.getAttribute('accept')).toBe('.txt');
    expect(element.maxFiles).toBe(3);
    expect(element.maxParallel).toBe(1);
    expect(element.multiple).toBe(true);
    expect(element.name).toBe('files');
    expect(element.required).toBe(true);
    expect(element.density).toBe('compact');

    rerender(<Upload upload={upload} />);

    expect(element.accept).toBeUndefined();
    expect(element.maxFiles).toBeUndefined();
    expect(element.hasAttribute('max-parallel')).toBe(false);
    expect(element.multiple).toBe(false);
    expect(element.name).toBeUndefined();
    expect(element.required).toBe(false);
    expect(element.density).toBe('normal');
  });

  it('calls onChange with the items', async () => {
    const Upload = createFileUploadComponent();
    const onChange = vi.fn((_items: readonly Spec.FileItem[]) => {});
    const { container } = render(<Upload upload={() => new Promise<void>(() => {})} onChange={onChange} />);
    const element = await elementIn(container);

    choose(element, file('a.txt'));

    expect(onChange).toHaveBeenLastCalledWith(element.items);
    expect(onChange.mock.lastCall?.[0].map((item) => item.file.name)).toEqual(['a.txt']);
  });

  it('points the ref to the element', async () => {
    const Upload = createFileUploadComponent();
    const ref = createRef<Spec.Element>();
    const { container, unmount } = render(<Upload ref={ref} />);
    const element = await elementIn(container);

    expect(ref.current).toBe(element);

    unmount();

    expect(ref.current).toBeNull();
  });

  it('passes the slots, the attributes and lang to the element', async () => {
    const Upload = createFileUploadComponent();
    const props: ReactSpec.Props = {
      prompt: <b>Drop invoices</b>,
      label: (
        <>
          Invoices <i>(PDF)</i>
        </>
      ),
      id: 'files',
      className: 'upload',
      style: { margin: '1px' },
      lang: 'de',
      'aria-describedby': 'help',
      'data-testid': 'upload',
    };
    const { container } = render(<Upload {...props} />);
    const element = await elementIn(container);

    expect(element.querySelector('[slot="prompt"]')?.textContent).toBe('Drop invoices');
    expect(element.querySelector('[slot="label"]')?.textContent).toBe('Invoices (PDF)');
    expect(element.hasAttribute('label')).toBe(false);
    expect(element.querySelector('[slot="icon"]')).toBeNull();
    expect(element.id).toBe('files');
    expect(element.className).toBe('upload');
    expect(element.style.margin).toBe('1px');
    expect(element.lang).toBe('de');
    expect(element.getAttribute('aria-describedby')).toBe('help');
    expect(element.getAttribute('data-testid')).toBe('upload');
  });

  it('passes an adapter factory on to the element', async () => {
    const getAdapter = vi.fn((element: Spec.Element) => adapterFor(element.lang));
    const Upload = createFileUploadComponent({ i18n: { type: 'factory', getAdapter } });
    const { container } = render(<Upload lang="de" />);
    const element = await elementIn(container);

    expect(getAdapter).toHaveBeenCalledWith(element);
    expect(within(element.shadowRoot as unknown as HTMLElement).getByRole('button', { name: 'Durchsuchen' }))
      .toBeTruthy();
  });

  it('follows the nearest provider with an adapter hook', async () => {
    const Locale = createContext('en');
    const Upload = createFileUploadComponent({
      i18n: {
        type: 'hook',
        useAdapter: () => {
          const locale = useContext(Locale);

          return useMemo(() => adapterFor(locale), [locale]);
        },
      },
    });
    const app = (second: string) => (
      <>
        <Locale value="de">
          <Upload data-testid="first" />
        </Locale>
        <Locale value={second}>
          <Upload data-testid="second" />
        </Locale>
      </>
    );
    const { container, rerender } = render(app('en'));

    await elementIn(container);
    await waitFor(() => expect(container.querySelector('[data-testid="second"]')).not.toBeNull());

    const browseOf = (testId: string) => {
      const element = container.querySelector(`[data-testid="${testId}"]`)!;

      return within(element.shadowRoot as unknown as HTMLElement).getByRole('button').textContent;
    };

    expect(browseOf('first')).toBe('Durchsuchen');
    expect(browseOf('second')).toBe('Browse');

    rerender(app('de'));

    expect(browseOf('second')).toBe('Durchsuchen');
  });

  it('throws a TypeError for an unknown i18n type', () => {
    // A cast config, as plain JavaScript would pass it.
    const config = { i18n: { type: 'other', useAdapter: () => adapterFor('en') } } as unknown as ReactSpec.Config;

    expect(() => createFileUploadComponent(config)).toThrow(TypeError);
  });
});
