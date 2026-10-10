import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import './demo.css';
import { FormDemo } from './FormDemo';

export { FormValidationDemo };

// The demo of the form validation, as a light DOM custom element without attributes (see "Demo element" in the
// `CLAUDE.md` of the file upload): exported and not registered, the page registers it under a tag name of its choice.
// The language follows `<html lang>`. A React form with the demo's own field components.
class FormValidationDemo extends HTMLElement {
  #root: Root | undefined;

  connectedCallback(): void {
    this.classList.add('form-validation-demo');
    this.#root = createRoot(this);
    this.#root.render(createElement(FormDemo));
  }

  disconnectedCallback(): void {
    const root = this.#root;

    this.#root = undefined;
    // After the current render: React does not allow unmounting a root while it renders.
    queueMicrotask(() => root?.unmount());
  }
}
