import type { ReactiveController, ReactiveControllerHost } from 'lit';

import type { I18nAdapter } from '../index.js';

export { I18nController, setElementI18nAdapter };

const CONTROLLERS = new WeakMap<HTMLElement, I18nController>();

// An element's i18n adapter: the class config's, or one set for this element (the React wrappers' `useI18n`, through
// `setElementI18nAdapter`), which replaces it. Subscribed to its `onChange` while the element is connected; a change
// (also a new adapter) renders the element again.
class I18nController implements ReactiveController {
  readonly #host: ReactiveControllerHost & HTMLElement;
  readonly #config: I18nAdapter | undefined;
  #own: I18nAdapter | undefined;
  #unsubscribe: (() => void) | undefined;
  #connected = false;

  constructor(host: ReactiveControllerHost & HTMLElement, config: I18nAdapter | undefined) {
    this.#host = host;
    this.#config = config;
    host.addController(this);
    CONTROLLERS.set(host, this);
  }

  get adapter(): I18nAdapter | undefined {
    return this.#own ?? this.#config;
  }

  set(adapter: I18nAdapter | undefined): void {
    if (adapter === this.#own) {
      return;
    }

    this.#unsubscribe?.();
    this.#own = adapter;

    if (this.#connected) {
      this.#subscribe();
    }

    this.#host.requestUpdate();
  }

  hostConnected(): void {
    this.#connected = true;
    this.#subscribe();
  }

  hostDisconnected(): void {
    this.#connected = false;
    this.#unsubscribe?.();
    this.#unsubscribe = undefined;
  }

  #subscribe(): void {
    this.#unsubscribe = this.adapter?.onChange?.(() => this.#host.requestUpdate());
  }
}

// Internal, not part of the public API: an adapter for one element of the package (`undefined`: back to its class
// config's). The React wrappers set their hook's adapter with it.
function setElementI18nAdapter(element: HTMLElement, adapter: I18nAdapter | undefined): void {
  CONTROLLERS.get(element)?.set(adapter);
}
