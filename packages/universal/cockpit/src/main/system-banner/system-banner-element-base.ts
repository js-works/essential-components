import type { TemplateResult } from 'lit';
import { html, LitElement, nothing, svg } from 'lit';

import { I18nController } from '../core/i18n-controller.js';
import { textsOf } from '../core/texts.js';
import type { SystemBannerClassConfig, SystemBannerElement, SystemBannerTone } from '../index.js';

export { SystemBannerElementBase };

const TONES = Object.freeze(['info', 'warning', 'danger', 'success'] as const);

// The icon of each tone (Tabler's, MIT: `info-circle`, `alert-triangle`, `alert-octagon`, `circle-check`).
const TONE_ICONS = Object.freeze(
  {
    info: svg`<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0" /><path d="M12 9h.01" /><path d="M11 12h1v4h1" />`,
    warning: svg`<path d="M12 9v4" /><path d="M12 16h.01" />
      <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636-2.87L13.637 3.59a1.914 1.914 0 0 0-3.274 0z" />`,
    danger:
      svg`<path d="M12.802 2.165l5.575 2.389c.48 .206 .863 .589 1.07 1.07l2.388 5.574c.22 .512 .22 1.092 0 1.604l-2.389 5.575c-.206 .48 -.589 .863 -1.07 1.07l-5.574 2.388c-.512 .22 -1.092 .22 -1.604 0l-5.575 -2.389a2.036 2.036 0 0 1 -1.07 -1.07l-2.388 -5.574a2.036 2.036 0 0 1 0 -1.604l2.389 -5.575c.206 -.48 .589 -.863 1.07 -1.07l5.574 -2.388a2.036 2.036 0 0 1 1.604 0z" />
      <path d="M12 8v4" /><path d="M12 16h.01" />`,
    success: svg`<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0" /><path d="M9 12l2 2l4-4" />`,
  } as const satisfies Record<SystemBannerTone, unknown>,
);

const isTone = (value: unknown): value is SystemBannerTone => TONES.includes(value as SystemBannerTone);

// The system banner, a Lit element (see `SystemBannerElement`). Only a shadow root: the element never adds children of
// its own.
class SystemBannerElementBase extends LitElement implements SystemBannerElement {
  static override properties = {
    tone: { noAccessor: true, reflect: true },
    message: {},
    actionLabel: { attribute: 'action-label' },
    dismissible: { type: Boolean, reflect: true },
  };

  declare message: string;
  declare actionLabel: string;
  declare dismissible: boolean;

  readonly #sheet: CSSStyleSheet;
  readonly #i18n: I18nController;
  #tone: SystemBannerTone = 'info';

  constructor(config: SystemBannerClassConfig, sheet: CSSStyleSheet) {
    super();
    this.message = '';
    this.actionLabel = '';
    this.dismissible = false;
    this.#i18n = new I18nController(this, config.i18n);
    this.#sheet = sheet;
  }

  get tone(): SystemBannerTone {
    return this.#tone;
  }

  // An invalid value throws; an invalid attribute is the default (`attributeChangedCallback` below).
  set tone(value: SystemBannerTone) {
    if (!isTone(value)) {
      throw new RangeError(`Unknown tone: ${String(value)}`);
    }

    const old = this.#tone;

    this.#tone = value;
    this.requestUpdate('tone', old);
  }

  override attributeChangedCallback(name: string, old: string | null, value: string | null): void {
    if (name === 'tone') {
      this.tone = isTone(value) ? value : 'info';
    } else {
      super.attributeChangedCallback(name, old, value);
    }
  }

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    const root = super.createRenderRoot();

    if (root instanceof ShadowRoot) {
      root.adoptedStyleSheets = [this.#sheet];
    }

    return root;
  }

  #action(): void {
    this.dispatchEvent(new Event('action', { bubbles: true }));
  }

  // Not canceled: the banner hides itself.
  #dismiss(): void {
    if (this.dispatchEvent(new Event('dismiss', { bubbles: true, cancelable: true }))) {
      this.hidden = true;
    }
  }

  protected override render(): TemplateResult {
    const t = textsOf(this.#i18n.adapter);

    return html`
      <div class="banner" role=${this.#tone === 'danger' ? 'alert' : 'status'}>
        <span class="icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="1em" height="1em">${TONE_ICONS[this.#tone]}</svg>
        </span>
        <span class="message">${this.message === '' ? html`<slot></slot>` : this.message}</span>
        ${
      this.actionLabel === ''
        ? nothing
        : html`<button class="action" type="button" @click=${this.#action}>${this.actionLabel}</button>`
    }
        ${
      this.dismissible
        ? html`<button class="close" type="button" aria-label=${t.systemBannerDismiss} @click=${this.#dismiss}>
            <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>`
        : nothing
    }
      </div>
    `;
  }
}
