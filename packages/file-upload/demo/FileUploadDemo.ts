import { createFileUploadClass } from '../src';
import './demo.css';
import { submitted, summarize } from './format';
import { createDemoI18n } from './i18n';
import { mountReactDemo } from './react/ReactDemo';
import { setupUi } from './ui/ui';
import { createUpload, isUploadBehavior } from './upload';

export { FileUploadDemo };

const ACCEPT: Readonly<Record<string, string>> = {
  images: 'image/*',
  documents: '.pdf,.doc,.docx,.txt',
};

const MAX_FILE_SIZE: Readonly<Record<string, number>> = {
  '100 KB': 100 * 1024,
  '5 MB': 5 * 1024 * 1024,
};

const MAX_FILES: Readonly<Record<string, number>> = { '3': 3, '5': 5 };

let counter = 0;

// The whole demo of the file upload, as a light DOM custom element without attributes, so a page can show it alone
// (index.html) or together with the demos of other components. Like our components, it is exported and not registered:
// the page registers it under a tag name of its choice. The global switches (language, color scheme) belong to the page,
// not to the demo: the elements follow `<html lang>` through the demo's i18n adapter.
class FileUploadDemo extends HTMLElement {
  #rendered = false;
  #cleanups: (() => void)[] = [];

  connectedCallback(): void {
    if (!this.#rendered) {
      this.#rendered = true;
      this.#render();
    }

    const reactRoot = this.querySelector('[data-react-root]');

    this.#cleanups = [setupUi(this), ...(reactRoot === null ? [] : [mountReactDemo(reactRoot)])];
  }

  disconnectedCallback(): void {
    for (const cleanup of this.#cleanups) {
      cleanup();
    }

    this.#cleanups = [];
  }

  #render(): void {
    defineComponents();

    // The id of the element that a label of the page names (unique, even with the demo twice on one page).
    const id = `file-upload-demo-${++counter}`;

    this.innerHTML = `
  <div class="ui-stack">
    <nav class="ui-tabs" aria-label="File upload">
      <button class="ui-tabs__tab" type="button">Custom element</button>
      <button class="ui-tabs__tab" type="button">React</button>
    </nav>
    <section class="ui-tabs__panel ui-stack">
      <form class="ui-toolbar" data-switches>
        <label class="ui-field">Server
          <select class="ui-select" name="server">
            <option value="works">works</option>
            <option value="slow">slow</option>
            <option value="flaky">flaky</option>
            <option value="fails">fails</option>
          </select>
        </label>
        <label class="ui-field">Accept
          <select class="ui-select" name="accept">
            <option value="any">any</option>
            <option value="images">images</option>
            <option value="documents">documents</option>
          </select>
        </label>
        <label class="ui-field">Max. file size
          <select class="ui-select" name="maxFileSize">
            <option value="none">none</option>
            <option value="100 KB">100 KB</option>
            <option value="5 MB">5 MB</option>
          </select>
        </label>
        <label class="ui-field">Max. files
          <select class="ui-select" name="maxFiles">
            <option value="none">none</option>
            <option value="3">3</option>
            <option value="5">5</option>
          </select>
        </label>
        <label class="ui-field">Parallel uploads
          <select class="ui-select" name="maxParallel">
            <option value="1">1</option>
            <option value="3" selected>3</option>
          </select>
        </label>
        <label class="ui-field">Multiple
          <select class="ui-select" name="multiple">
            <option value="off">off</option>
            <option value="on" selected>on</option>
          </select>
        </label>
        <label class="ui-field">Manual upload
          <select class="ui-select" name="manualUpload">
            <option value="off">off</option>
            <option value="on">on</option>
          </select>
        </label>
        <label class="ui-field">Previews
          <select class="ui-select" name="previews">
            <option value="off">off</option>
            <option value="on" selected>on</option>
          </select>
        </label>
        <label class="ui-field">Required
          <select class="ui-select" name="required">
            <option value="off">off</option>
            <option value="on">on</option>
          </select>
        </label>
        <label class="ui-field">Disabled
          <select class="ui-select" name="disabled">
            <option value="off">off</option>
            <option value="on">on</option>
          </select>
        </label>
      </form>
      <div class="ui-columns">
        <section class="ui-stack">
          <h2 class="ui-heading">Default look</h2>
          <form class="upload-form ui-stack ui-stack--tight">
            <label class="ui-label" for="${id}">Attachments (a label of the page)</label>
            <file-upload id="${id}" name="attachments"></file-upload>
            <p class="ui-note" data-state></p>
            <div class="ui-toolbar">
              <button class="ui-button">Submit</button>
              <output class="ui-result"></output>
            </div>
          </form>
        </section>
        <section class="ui-stack">
          <h2 class="ui-heading">Own theme, styles, part and slot</h2>
          <form class="upload-form ui-stack ui-stack--tight">
            <acme-upload name="attachments" label="Invoices (its own label)">
              <span slot="prompt">Drop your invoices here or</span>
            </acme-upload>
            <p class="ui-note" data-state></p>
            <div class="ui-toolbar">
              <button class="ui-button">Submit</button>
              <output class="ui-result"></output>
            </div>
          </form>
        </section>
      </div>
    </section>
    <section class="ui-tabs__panel" hidden>
      <div data-react-root></div>
    </section>
  </div>
    `;

    const switches = this.querySelector<HTMLFormElement>('[data-switches]');
    const elements = [...this.querySelectorAll<DefaultUpload | AcmeUpload>('file-upload, acme-upload')];

    for (const element of elements) {
      const state = element.parentElement?.querySelector('[data-state]');

      if (state !== null && state !== undefined) {
        state.textContent = summarize(element.items);
        element.addEventListener('change', () => {
          state.textContent = summarize(element.items);
        });
      }
    }

    // Each element sits in a form. A submit shows what the form sends: the ids of the uploaded files. While the element
    // is invalid (unfinished or failed uploads, `required`), the browser blocks the submit and shows the message.
    for (const form of this.querySelectorAll<HTMLFormElement>('.upload-form')) {
      const output = form.querySelector('output');

      form.addEventListener('submit', (event) => {
        event.preventDefault();

        if (output !== null) {
          output.value = submitted(new FormData(form));
        }
      });
    }

    if (switches !== null) {
      switches.addEventListener('change', () => apply(switches, elements));
      apply(switches, elements);
    }
  }
}

// The switches set the attributes and properties of both elements.
function apply(switches: HTMLFormElement, elements: readonly (DefaultUpload | AcmeUpload)[]): void {
  const data = new FormData(switches);
  const value = (name: string) => String(data.get(name) ?? '');
  const server = value('server');
  const upload = createUpload(isUploadBehavior(server) ? server : 'works');

  for (const element of elements) {
    element.upload = upload;
    element.accept = ACCEPT[value('accept')];
    element.maxFileSize = MAX_FILE_SIZE[value('maxFileSize')];
    element.maxFiles = MAX_FILES[value('maxFiles')];
    element.maxParallel = Number(value('maxParallel'));
    element.multiple = value('multiple') === 'on';
    element.manualUpload = value('manualUpload') === 'on';
    element.previews = value('previews') === 'on';
    element.required = value('required') === 'on';
    element.disabled = value('disabled') === 'on';
  }
}

const i18n = createDemoI18n();
const factory = { type: 'factory', getAdapter: () => i18n } as const;

class DefaultUpload extends createFileUploadClass({ i18n: factory }) {}

class AcmeUpload extends createFileUploadClass({
  i18n: factory,
  theme: {
    accentColor: { light: '#0ca678', dark: '#20c997' },
    surfaceColor: { light: '#e6fcf5', dark: '#0b3b2e' },
    borderRadius: '2px',
    fontFamily: 'Georgia, serif',
    fontSize: '0.9375rem',
  },
  styles: '.root { border-style: dashed; }',
}) {}

// The components under test, registered once (the demo may be on a page twice).
function defineComponents(): void {
  if (customElements.get('file-upload') === undefined) {
    customElements.define('file-upload', DefaultUpload);
    customElements.define('acme-upload', AcmeUpload);
  }
}
