import { StrictMode } from 'react';
import type { ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { parseColor, shades } from '../shared/lib/colors';
import { setSchemeHost, useScheme } from '../shared/shared';
import { createAppRouter } from './App';
import { BoardManagerApp, createLook } from './BoardManagerDemo';
import type { Look } from './BoardManagerDemo';

export { BoardManagerElement };

// `<board-manager>`: the whole board manager in a shadow root, for a host page (e.g. XWiki) that knows nothing of it.
// The entry of `npm run build:board-manager`, which bundles it with everything it needs (React, Mantine, the packages)
// into one module, its styles included:
//
//   <script type="module" src="board-manager.js"></script>
//   <board-manager></board-manager>
//   board-manager { color-scheme: dark; --board-manager-accent-color: #0b7285; }
//
// - The color scheme is the CSS `color-scheme` of the element (set on it, or inherited from the page): `dark` or
//   `light`, else the system's.
// - The custom properties `--board-manager-accent-color`, `--board-manager-danger-color`,
//   `--board-manager-success-color`, `--board-manager-warning-color` (any CSS color, set by the host page's CSS): the
//   primary, danger, success and warning colors (see `#look()`).
// - `--board-manager-font-family`, `--board-manager-font-size` (the normal text, 14px by default): the font and the text
//   size; Mantine's other sizes follow in proportion (see `createLook()`). Live: CSS only.
// - `--board-manager-scale` (a number, 1 by default): Mantine's scale, all its sizes (and the text, unless
//   `--board-manager-font-size` is set). Live: CSS only.
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

  // The custom properties of the host page's CSS (any CSS color; a `var()` in them is resolved by the browser):
  // `--board-manager-accent-color` is Mantine's primary color, `--board-manager-danger-color` the danger buttons, errors
  // and error toasts, `--board-manager-success-color` and `--board-manager-warning-color` the states of the meetings and
  // their minutes (held, approved; a draft) and the warning toasts. Without them (or with an invalid color), Mantine's
  // indigo, red, green and orange. Read once, on connect: there is no event for a changed custom property.
  #look(): Look {
    const style = getComputedStyle(this);
    const accent = parseColor(style.getPropertyValue('--board-manager-accent-color').trim());
    const danger = parseColor(style.getPropertyValue('--board-manager-danger-color').trim());
    const success = parseColor(style.getPropertyValue('--board-manager-success-color').trim());
    const warning = parseColor(style.getPropertyValue('--board-manager-warning-color').trim());

    return createLook({
      accent: accent && shades(accent),
      danger: danger && shades(danger),
      success: success && shades(success),
      warning: warning && shades(warning),
    });
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
