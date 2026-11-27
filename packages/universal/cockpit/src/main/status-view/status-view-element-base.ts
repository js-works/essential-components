import type { TemplateResult } from 'lit';
import { html, LitElement, nothing, svg } from 'lit';

import { I18nController } from '../core/i18n-controller.js';
import type { Texts } from '../core/texts.js';
import { textsOf } from '../core/texts.js';
import { gridIcon } from '../element/icons.js';
import type { StatusViewClassConfig, StatusViewElement, StatusViewKind, StatusViewLayout } from '../index.js';

export { StatusViewElementBase };

const LAYOUTS = Object.freeze(['inline', 'screen'] as const);

const KINDS = Object.freeze(
  ['default', 'empty', 'no-results', 'not-found', 'forbidden', 'expired', 'maintenance', 'error'] as const,
);

type Preset = Exclude<StatusViewKind, 'default'>;

// The icon of each preset (Tabler's, MIT: `inbox`, `search`, `file-unknown`, `lock`, `clock`, `tool`,
// `alert-triangle`).
const KIND_ICONS = Object.freeze(
  {
    empty: svg`<path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
      <path d="M4 13h3l3 3h4l3-3h3" />`,
    'no-results': svg`<path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0-14 0" /><path d="M21 21l-6-6" />`,
    'not-found': svg`<path d="M14 3v4a1 1 0 0 0 1 1h4" />
      <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
      <path d="M12 17v.01" /><path d="M12 14a1.5 1.5 0 1 0-1.14-2.474" />`,
    forbidden: svg`<path d="M5 13a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6z" />
      <path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0-2 0" /><path d="M8 11V7a4 4 0 1 1 8 0v4" />`,
    expired: svg`<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0" /><path d="M12 7v5l3 3" />`,
    maintenance: svg`<path d="M7 10h3V7L6.5 3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1-3 3l-6-6a6 6 0 0 1-8-8L7 10" />`,
    error: svg`<path d="M12 9v4" /><path d="M12 16h.01" />
      <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636-2.87L13.637 3.59a1.914 1.914 0 0 0-3.274 0z" />`,
  } as const satisfies Record<Preset, unknown>,
);

// The default heading and message of each preset.
const KIND_TEXTS = Object.freeze(
  {
    empty: ['statusViewEmpty', 'statusViewEmptyMessage'],
    'no-results': ['statusViewNoResults', 'statusViewNoResultsMessage'],
    'not-found': ['statusViewNotFound', 'statusViewNotFoundMessage'],
    forbidden: ['statusViewForbidden', 'statusViewForbiddenMessage'],
    expired: ['statusViewExpired', 'statusViewExpiredMessage'],
    maintenance: ['statusViewMaintenance', 'statusViewMaintenanceMessage'],
    error: ['statusViewError', 'statusViewErrorMessage'],
  } as const satisfies Record<Preset, readonly [keyof Texts, keyof Texts]>,
);

const isLayout = (value: unknown): value is StatusViewLayout => LAYOUTS.includes(value as StatusViewLayout);
const isKind = (value: unknown): value is StatusViewKind => KINDS.includes(value as StatusViewKind);

// Whether a slot has content (an element, or text that is not only white space).
const filled = (slot: HTMLSlotElement) =>
  slot.assignedNodes().some((node) => node.nodeType === Node.ELEMENT_NODE || (node.textContent ?? '').trim() !== '');

// The status view, a Lit element (see `StatusViewElement`): in its layout (`inline`, `screen`), the parts that are
// given. Only a shadow root: the element never adds children of its own.
class StatusViewElementBase extends LitElement implements StatusViewElement {
  static override properties = {
    layout: { noAccessor: true, reflect: true },
    kind: { noAccessor: true },
    headline: {},
    subheadline: {},
    heading: {},
    message: {},
    actionLabel: { attribute: 'action-label' },
  };

  declare headline: string;
  declare subheadline: string;
  declare heading: string;
  declare message: string;
  declare actionLabel: string;

  readonly #sheet: CSSStyleSheet;
  readonly #i18n: I18nController;
  #layout: StatusViewLayout = 'inline';
  #kind: StatusViewKind = 'default';
  // Whether the slots `icon` and `footer` have content: the icon's ground and the footer's line only then.
  #hasIcon = false;
  #hasFooter = false;

  constructor(config: StatusViewClassConfig, sheet: CSSStyleSheet) {
    super();
    this.headline = '';
    this.subheadline = '';
    this.heading = '';
    this.message = '';
    this.actionLabel = '';
    this.#i18n = new I18nController(this, config.i18n);
    this.#sheet = sheet;
  }

  get layout(): StatusViewLayout {
    return this.#layout;
  }

  // An invalid value throws; an invalid attribute is the default (`attributeChangedCallback` below).
  set layout(value: StatusViewLayout) {
    if (!isLayout(value)) {
      throw new RangeError(`Unknown layout: ${String(value)}`);
    }

    const old = this.#layout;

    this.#layout = value;
    this.requestUpdate('layout', old);
  }

  get kind(): StatusViewKind {
    return this.#kind;
  }

  set kind(value: StatusViewKind) {
    if (!isKind(value)) {
      throw new RangeError(`Unknown kind: ${String(value)}`);
    }

    const old = this.#kind;

    this.#kind = value;
    this.requestUpdate('kind', old);
  }

  override attributeChangedCallback(name: string, old: string | null, value: string | null): void {
    if (name === 'layout') {
      this.layout = isLayout(value) ? value : 'inline';
    } else if (name === 'kind') {
      this.kind = isKind(value) ? value : 'default';
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

  #slotChange(event: Event): void {
    const slot = event.target as HTMLSlotElement;
    const has = filled(slot);

    if (slot.name === 'icon' ? has !== this.#hasIcon : has !== this.#hasFooter) {
      if (slot.name === 'icon') {
        this.#hasIcon = has;
      } else {
        this.#hasFooter = has;
      }

      this.requestUpdate();
    }
  }

  #action(): void {
    this.dispatchEvent(new Event('action', { bubbles: true }));
  }

  protected override render(): TemplateResult {
    const body = this.#body();
    const hint = html`<slot name="hint"></slot>`;

    return this.#layout === 'screen'
      ? html`<div class="screen"><div class="column"><div class="card">${body}</div>${hint}</div></div>`
      : html`<div class="inline">${body}${hint}</div>`;
  }

  // The brand, the status (icon, heading, message, the host's extras), the button, the footer: each only when given.
  #body(): TemplateResult {
    const t = textsOf(this.#i18n.adapter);
    const kind = this.#kind;
    const texts = kind === 'default' ? undefined : KIND_TEXTS[kind];
    const heading = this.heading !== '' ? this.heading : texts === undefined ? '' : t[texts[0]];
    const message = this.message !== '' ? this.message : texts === undefined ? '' : t[texts[1]];
    const icon = kind === 'default'
      ? nothing
      : html`<svg viewBox="0 0 24 24" width="1em" height="1em">${KIND_ICONS[kind]}</svg>`;

    return html`
      ${this.headline === '' ? nothing : this.#brand()}
      <div class="status" data-kind=${kind}>
        <span class="status-icon" aria-hidden="true" ?hidden=${kind === 'default' && !this.#hasIcon}>
          <slot name="icon" @slotchange=${this.#slotChange}>${icon}</slot>
        </span>
        ${
      heading === ''
        ? nothing
        : this.#layout === 'screen'
        ? html`<h2 class="heading">${heading}</h2>`
        : html`<p class="heading">${heading}</p>`
    }
        ${message === '' ? nothing : html`<p class="message">${message}</p>`}
        <slot></slot>
      </div>
      ${
      this.actionLabel === ''
        ? nothing
        : html`<button class="primary" type="button" @click=${this.#action}>${this.actionLabel}</button>`
    }
      <div class="footer" ?hidden=${!this.#hasFooter}>
        <slot name="footer" @slotchange=${this.#slotChange}></slot>
      </div>
    `;
  }

  #brand(): TemplateResult {
    return html`
      <div class="brand">
        <span class="logo" aria-hidden="true"><slot name="logo">${gridIcon()}</slot></span>
        <div>
          <p class="title">${this.headline}</p>
          ${this.subheadline === '' ? nothing : html`<p class="subtitle">${this.subheadline}</p>`}
        </div>
      </div>
    `;
  }
}
