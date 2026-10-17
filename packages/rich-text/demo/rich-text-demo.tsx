import './demo.css';
import { createElement } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';

import { Demo } from './demo.js';

export { RichTextDemo };

// The demo of the rich-text editor, as a light DOM custom element without attributes (see "Demo element" in the
// `CLAUDE.md` of the file upload): exported and not registered, the page registers it under a tag name of its choice.
// The language follows `<html lang>`, the color scheme the page's.
class RichTextDemo extends HTMLElement {
  #root: Root | undefined;

  connectedCallback(): void {
    this.#root = createRoot(this);
    this.#root.render(createElement(Demo));
  }

  disconnectedCallback(): void {
    const root = this.#root;

    this.#root = undefined;
    // After the current render: React does not allow unmounting a root while it renders.
    queueMicrotask(() => root?.unmount());
  }
}
