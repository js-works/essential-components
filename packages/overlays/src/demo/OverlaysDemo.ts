import { mountLitDemo } from "./demo.js";
import { mountReactFormDemo } from "./react.js";
import { mountReactI18nDemo } from "./react-i18n.js";
import { setupUi } from "./ui/ui.js";

import "./demo.css";

// The whole overlays demo as a light DOM custom element without attributes, so a page can
// show it alone (index.html) or together with the demos of other components. It is exported
// and not registered: the page registers it under a tag name of its choice.
//
// Four tabs: the two Lit demos (Toasts, Dialogs) and the two React demos. The global switches
// (color scheme) belong to the page, not to the demo.
//
// Rules for the demo (the same for the demos of all components):
// - Light DOM, no shadow root: the design language (ui/ui.css) and the page reach into it.
// - No fixed ids (the demo may be on a page twice): tabs get theirs from ui.ts.
// - Connect: setupUi(this) and mounting (React); disconnect: their cleanups. The markup and
//   the Lit panels are rendered once.
// - Its CSS (demo.css) is global (light DOM), so every rule is specific to the demo's own
//   content, never a change of the design language.
export class OverlaysDemo extends HTMLElement {
  #rendered = false;
  #cleanups: (() => void)[] = [];

  connectedCallback(): void {
    if (!this.#rendered) {
      this.#rendered = true;
      this.innerHTML = `
        <div class="ui-stack overlays-demo">
          <nav class="ui-tabs" aria-label="Overlays">
            <button class="ui-tabs__tab" type="button">Toasts</button>
            <button class="ui-tabs__tab" type="button">Dialogs (Lit)</button>
            <button class="ui-tabs__tab" type="button">React form (Mantine)</button>
            <button class="ui-tabs__tab" type="button">React i18n</button>
          </nav>
          <section class="ui-tabs__panel" data-panel="toasts"></section>
          <section class="ui-tabs__panel" data-panel="dialogs" hidden></section>
          <section class="ui-tabs__panel" data-panel="react-form" hidden></section>
          <section class="ui-tabs__panel" data-panel="react-i18n" hidden></section>
        </div>
      `;
      mountLitDemo(this.#panel("toasts"), this.#panel("dialogs"));
    }

    this.#cleanups = [
      setupUi(this),
      mountReactFormDemo(this.#panel("react-form")),
      mountReactI18nDemo(this.#panel("react-i18n")),
    ];
  }

  disconnectedCallback(): void {
    for (const cleanup of this.#cleanups) {
      cleanup();
    }
    this.#cleanups = [];
  }

  #panel(name: string): HTMLElement {
    return this.querySelector<HTMLElement>(`[data-panel="${name}"]`)!;
  }
}
