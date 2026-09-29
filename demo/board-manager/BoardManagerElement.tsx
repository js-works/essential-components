import { StrictMode } from 'react';
import type { ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { createAppRouter } from './App';
import { BoardManagerApp } from './BoardManagerDemo';
import { setSchemeHost, useScheme } from './shared';

export { BoardManagerElement };

// `<board-manager>`: the whole board manager in a shadow root, for a host page (e.g. XWiki) that knows nothing of it.
// The entry of `npm run build:board-manager`, which bundles it with everything it needs (React, Mantine, the packages)
// into one module, its styles included:
//
//   <script type="module" src="board-manager.js"></script>
//   <board-manager scheme="dark"></board-manager>
//
// - `scheme` (`light`, `dark`): the color scheme; without it, the page's `<html data-scheme>`, else the system's.
// - The language follows `<html lang>` (the i18n adapters of the packages read it there).
// - The routes are in memory only: the host page owns its URL (no hash, unlike the demo tab).
// - The dialogs and toasts are in the shadow root too (the overlays provider's mount point).

// All CSS of the bundle (Mantine, the packages' CSS modules, the app's own): the build puts it in place of this marker
// (`vite.board-manager.config.ts`), so none of it reaches the host page.
const STYLES = '__BOARD_MANAGER_STYLES__';

const HOST_STYLES = ':host { display: block; } :host([hidden]) { display: none; }';

// The color scheme on the root: `light-dark()` of the toasts follows it, like the page's `<html>` in the demo.
function SchemeRoot({ router }: { router: ReturnType<typeof createAppRouter>['router'] }): ReactElement {
  return (
    <div style={{ colorScheme: useScheme() }}>
      <BoardManagerApp router={router} />
    </div>
  );
}

class BoardManagerElement extends HTMLElement {
  #root: Root | undefined;
  #disposeRouter: (() => void) | undefined;

  connectedCallback(): void {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    const container = document.createElement('div');

    style.textContent = `${HOST_STYLES}\n${STYLES}`;
    shadow.replaceChildren(style, container);
    setSchemeHost(this);

    const { router, dispose } = createAppRouter();

    this.#disposeRouter = dispose;
    this.#root = createRoot(container);
    this.#root.render(
      <StrictMode>
        <SchemeRoot router={router} />
      </StrictMode>,
    );
  }

  disconnectedCallback(): void {
    this.#root?.unmount();
    this.#disposeRouter?.();
    this.#root = undefined;
    this.#disposeRouter = undefined;
    setSchemeHost(null);
  }
}

if (customElements.get('board-manager') === undefined) {
  customElements.define('board-manager', BoardManagerElement);
}
