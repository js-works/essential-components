import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { App } from './App';
import { setupUi } from './ui/ui';

export { DataNavigatorDemo };

// The whole demo of the data navigator, as a light DOM custom element without attributes, so a page can show it alone
// (index.html) or together with the demos of other components. It is exported and not registered: the page registers
// it under a tag name of its choice. The global switches (language, color scheme) belong to the page, not to the demo:
// the demo's I18nAdapter follows `<html lang>`.
class DataNavigatorDemo extends HTMLElement {
  #root: Root | undefined;
  #cleanupUi: (() => void) | undefined;

  connectedCallback(): void {
    this.#root = createRoot(this);
    this.#root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    this.#cleanupUi = setupUi(this);
  }

  disconnectedCallback(): void {
    this.#cleanupUi?.();
    this.#root?.unmount();
    this.#cleanupUi = undefined;
    this.#root = undefined;
  }
}
