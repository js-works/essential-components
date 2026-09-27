import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { App } from './App';
import { mountElementDemo } from './ElementDemo';
import { setupUi } from './ui/ui';

export { DataNavigatorDemo };

// The whole demo of the data navigator, as a light DOM custom element without attributes, so a page can show it alone
// (index.html) or together with the demos of other components. It is exported and not registered: the page registers
// it under a tag name of its choice. The global switches (language, color scheme) belong to the page, not to the demo:
// the demo's I18nAdapter follows `<html lang>`.
// Two tabs: the React component (`@local/data-navigator/react`) and the custom element (`@local/data-navigator`).
class DataNavigatorDemo extends HTMLElement {
  #rendered = false;
  #root: Root | undefined;
  #cleanupElementDemo: (() => void) | undefined;
  #cleanupUi: (() => void) | undefined;

  connectedCallback(): void {
    if (!this.#rendered) {
      this.#rendered = true;
      this.innerHTML = `
        <div class="ui-stack">
          <nav class="ui-tabs" aria-label="Variants">
            <button class="ui-tabs__tab" type="button">React component</button>
            <button class="ui-tabs__tab" type="button">Custom element</button>
          </nav>
          <section class="ui-tabs__panel" data-react-demo></section>
          <section class="ui-tabs__panel" data-element-demo hidden></section>
        </div>
      `;
    }

    const reactPanel = this.querySelector<HTMLElement>('[data-react-demo]');
    const elementPanel = this.querySelector<HTMLElement>('[data-element-demo]');

    if (reactPanel !== null) {
      this.#root = createRoot(reactPanel);
      this.#root.render(
        <StrictMode>
          <App />
        </StrictMode>,
      );
    }

    if (elementPanel !== null) {
      this.#cleanupElementDemo = mountElementDemo(elementPanel);
    }

    this.#cleanupUi = setupUi(this);
  }

  disconnectedCallback(): void {
    this.#cleanupUi?.();
    this.#cleanupElementDemo?.();
    this.#root?.unmount();
    this.#cleanupUi = undefined;
    this.#cleanupElementDemo = undefined;
    this.#root = undefined;
  }
}
