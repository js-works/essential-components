import { StrictMode } from 'react';
import type { ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { createAppRouter } from './App';
import { BoardManagerApp, createLook } from './BoardManagerDemo';
import type { Look } from './BoardManagerDemo';
import { dangerFor, parseColor, shades } from './colors';
import { setSchemeHost, useScheme } from './shared';

export { BoardManagerElement };

// `<board-manager>`: the whole board manager in a shadow root, for a host page (e.g. XWiki) that knows nothing of it.
// The entry of `npm run build:board-manager`, which bundles it with everything it needs (React, Mantine, the packages)
// into one module, its styles included:
//
//   <script type="module" src="board-manager.js"></script>
//   <board-manager scheme="dark" accent-color="#0b7285"></board-manager>
//
// - `scheme` (`light`, `dark`): the color scheme; without it, the page's `<html data-scheme>`, else the system's.
// - `accent-color`, `danger-color` (any CSS color): the primary and the danger color (see `#look()`).
// - `hash` (a prefix, `hash="bm"`): the route is mirrored in the URL hash (`#bm/boards/b1`).
// - The language follows `<html lang>` (the i18n adapters of the packages read it there).
// - Without `hash`, the routes are in memory only: the host page owns its URL.
// - The dialogs and toasts are in the shadow root too (the overlays provider's mount point).

// All CSS of the bundle (Mantine, the packages' CSS modules, the app's own): the build puts it in place of this marker
// (`vite.board-manager.config.ts`), so none of it reaches the host page.
const STYLES = '__BOARD_MANAGER_STYLES__';

const HOST_STYLES = ':host { display: block; } :host([hidden]) { display: none; }';

// Keyboard and input events are composed: they would bubble out of the shadow root to the host page (e.g. XWiki's
// keyboard shortcuts). They are stopped at the shadow root, in the bubble phase, so everything inside still gets them.
// Mouse and focus events do pass: a host page closes its menus on a click outside of them.
const SWALLOWED_EVENTS = [
  'keydown',
  'keyup',
  'keypress',
  'beforeinput',
  'input',
  'compositionstart',
  'compositionupdate',
  'compositionend',
];

function stopPropagation(event: Event): void {
  event.stopPropagation();
}

// The color scheme on the root: `light-dark()` of the toasts follows it, like the page's `<html>` in the demo.
function SchemeRoot(
  { router, look }: { router: ReturnType<typeof createAppRouter>['router']; look: Look },
): ReactElement {
  return (
    <div style={{ colorScheme: useScheme() }}>
      <BoardManagerApp router={router} look={look} />
    </div>
  );
}

class BoardManagerElement extends HTMLElement {
  #root: Root | undefined;
  #disposeRouter: (() => void) | undefined;

  connectedCallback(): void {
    let shadow = this.shadowRoot;

    if (shadow === null) {
      shadow = this.attachShadow({ mode: 'open' });

      for (const type of SWALLOWED_EVENTS) {
        shadow.addEventListener(type, stopPropagation);
      }
    }

    const style = document.createElement('style');
    const container = document.createElement('div');

    style.textContent = `${HOST_STYLES}\n${STYLES}`;
    shadow.replaceChildren(style, container);
    setSchemeHost(this);

    // `hash="bm"`: the route is mirrored in the URL hash (`#bm/boards/b1`); without it, in memory only. Read once.
    const hashPrefix = this.getAttribute('hash')?.replace(/^#/, '').trim() || undefined;
    const { router, dispose } = createAppRouter(this, hashPrefix);

    this.#disposeRouter = dispose;
    this.#root = createRoot(container);
    this.#root.render(
      <StrictMode>
        <SchemeRoot router={router} look={this.#look()} />
      </StrictMode>,
    );
  }

  // `accent-color` (any CSS color): Mantine's primary color; `danger-color`: the danger buttons, errors and error
  // toasts, by default a red that goes with the accent (`dangerFor()`). Without them (or with an invalid color),
  // Mantine's indigo and red. Read once.
  #look(): Look {
    const accent = parseColor(this.getAttribute('accent-color'));
    const danger = parseColor(this.getAttribute('danger-color')) ?? (accent && dangerFor(accent));

    return createLook({ accent: accent && shades(accent), danger: danger && shades(danger) });
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
