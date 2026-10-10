import { StrictMode } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { App } from './App';
import { mountElementDemo } from './ElementDemo';
import { GroupedReorderDemo } from './GroupedReorderDemo';
import { GroupingDemo } from './GroupingDemo';
import { ReorderDemo } from './ReorderDemo';
import { setupUi } from './ui/ui';

export { DataTableDemo };

// The further examples of the React component, one tab each (after the two main tabs): the tab's text and the
// example. A new example is one more entry.
const EXAMPLES: readonly { readonly tab: string; readonly Example: ComponentType }[] = [
  { tab: 'Row reordering', Example: ReorderDemo },
  { tab: 'Row grouping', Example: GroupingDemo },
  { tab: 'Grouped reordering', Example: GroupedReorderDemo },
];

// The whole demo of the data table, as a light DOM custom element without attributes, so a page can show it alone
// (index.html) or together with the demos of other components. It is exported and not registered: the page registers
// it under a tag name of its choice. The global switches (language, color scheme) belong to the page, not to the demo:
// the demo's I18nAdapter follows `<html lang>`.
// Tabs: the React component (`@local/data-table/react`), the custom element (`@local/data-table`), and the
// further examples of the React component (`EXAMPLES`), each in a React root of its own.
class DataTableDemo extends HTMLElement {
  #rendered = false;
  #roots: Root[] = [];
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
            ${EXAMPLES.map(({ tab }) => `<button class="ui-tabs__tab" type="button">${tab}</button>`).join('')}
          </nav>
          <section class="ui-tabs__panel" data-react-demo></section>
          <section class="ui-tabs__panel" data-element-demo hidden></section>
          ${EXAMPLES.map(() => '<section class="ui-tabs__panel" data-example-demo hidden></section>').join('')}
        </div>
      `;
    }

    const reactPanel = this.querySelector<HTMLElement>('[data-react-demo]');
    const elementPanel = this.querySelector<HTMLElement>('[data-element-demo]');

    if (reactPanel !== null) {
      this.#mount(reactPanel, <App />);
    }

    if (elementPanel !== null) {
      this.#cleanupElementDemo = mountElementDemo(elementPanel);
    }

    this.querySelectorAll<HTMLElement>('[data-example-demo]').forEach((panel, index) => {
      const example = EXAMPLES[index];

      if (example !== undefined) {
        this.#mount(panel, <example.Example />);
      }
    });

    this.#cleanupUi = setupUi(this);
  }

  disconnectedCallback(): void {
    this.#cleanupUi?.();
    this.#cleanupElementDemo?.();
    this.#roots.forEach((root) => root.unmount());
    this.#cleanupUi = undefined;
    this.#cleanupElementDemo = undefined;
    this.#roots = [];
  }

  #mount(panel: HTMLElement, content: ReactNode): void {
    const root = createRoot(panel);

    root.render(<StrictMode>{content}</StrictMode>);
    this.#roots.push(root);
  }
}
