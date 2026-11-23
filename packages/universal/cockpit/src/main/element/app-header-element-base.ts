import { computePosition, flip, offset, shift } from '@floating-ui/dom';
import type { PropertyValues, TemplateResult } from 'lit';
import { html, LitElement, nothing } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import { textsOf } from '../core/texts.js';
import type {
  AppHeaderClassConfig,
  AppHeaderCrumb,
  AppHeaderElement,
  AppHeaderLink,
  AppHeaderNavigateDetail,
  AppHeaderStep,
  AppHeaderTheme,
  CockpitTexts,
  I18nAdapter,
} from '../index.js';
import { appHeaderStyles } from './app-header-styles.js';
import { arrowLeftIcon, arrowRightIcon, checkIcon, chevronDownIcon, homeIcon } from './icons.js';
import { Menu } from './menu.js';

export { AppHeaderElementBase };

let instances = 0;

// The header of an app, a Lit element (see `AppHeaderElement`). It never changes the URL by itself: its links are
// real `<a href>`, and a plain click on one (or a choice in a menu) fires the cancelable `navigate` first; Back and
// Forward fire `back` and `forward`. A router adapter cancels them and moves its router; else the browser does it
// (follows the link, `history.back()`).
//
// Slots: `icon` (in place of the `icon` markup, e.g. a framework's icon), `end` (the host's parts, e.g. a user menu),
// `crumb-<index>` (in place of a crumb's `label`), `back-page` and `forward-page` (their text in place of the step's
// `page`, read when the tooltip shows).
class AppHeaderElementBase extends LitElement implements AppHeaderElement {
  static override properties = {
    icon: {},
    heading: {},
    switcher: { attribute: false },
    activeSwitcherItem: { attribute: 'active-switcher-item' },
    modules: { attribute: false },
    activeModule: { attribute: 'active-module' },
    homeHref: { attribute: 'home-href' },
    crumbs: { attribute: false },
    back: { attribute: false },
    forward: { attribute: false },
    theme: { attribute: false },
  };

  declare icon: string;
  declare heading: string;
  declare switcher: readonly AppHeaderLink[];
  declare activeSwitcherItem: string;
  declare modules: readonly AppHeaderLink[];
  declare activeModule: string;
  declare homeHref: string;
  declare crumbs: readonly AppHeaderCrumb[];
  declare back: AppHeaderStep | null;
  declare forward: AppHeaderStep | null;
  // Its first value the config's; the stylesheet is built from it (`appHeaderStyles()`): no custom properties.
  declare theme: AppHeaderTheme;

  readonly #sheet = new CSSStyleSheet();
  readonly #id = `app-header${++instances}`;
  readonly #switcherMenu: Menu;
  readonly #modulesMenu: Menu;
  readonly #getAdapter: ((element: HTMLElement) => I18nAdapter) | undefined;
  #adapter: I18nAdapter | undefined;
  #unsubscribe: (() => void) | undefined;
  #tip: { text: string; target: HTMLElement } | undefined;
  #tipTarget: HTMLElement | undefined;
  #tipTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(config: AppHeaderClassConfig) {
    super();
    this.icon = '';
    this.heading = '';
    this.switcher = [];
    this.activeSwitcherItem = '';
    this.modules = [];
    this.activeModule = '';
    this.homeHref = '#';
    this.crumbs = [];
    this.back = null;
    this.forward = null;
    this.theme = config.theme ?? {};
    this.#getAdapter = config.i18n?.getAdapter;
    this.#switcherMenu = new Menu(this, `${this.#id}-switcher`, {
      placement: 'bottom-start',
      gutter: 4,
      selected: () => this.activeSwitcherItem || undefined,
      onSelect: (id) => this.#follow(this.switcher.find((link) => link.id === id)?.href),
    });
    this.#modulesMenu = new Menu(this, `${this.#id}-modules`, {
      placement: 'bottom-start',
      gutter: 4,
      selected: () => this.activeModule || undefined,
      onSelect: (id) => this.#follow(this.modules.find((link) => link.id === id)?.href),
    });
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#adapter ??= this.#getAdapter?.(this);
    this.#unsubscribe = this.#adapter?.onChange?.(() => this.requestUpdate());
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#unsubscribe?.();
    this.#switcherMenu.close();
    this.#modulesMenu.close();
    this.#hideTip();
  }

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    const root = super.createRenderRoot();

    if (root instanceof ShadowRoot) {
      root.adoptedStyleSheets = [this.#sheet];
    }

    return root;
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('theme')) {
      this.#sheet.replaceSync(appHeaderStyles(this.theme));
    }
  }

  protected override updated(): void {
    for (const menu of [this.#switcherMenu, this.#modulesMenu]) {
      this.#syncPopover(menu);
      menu.rendered();
    }

    this.#placeTip();
  }

  // A menu's positioner is a popover, in the top layer: above everything of the page (another sticky header, a frame
  // that cuts its content), shown while the menu is open.
  #syncPopover(menu: Menu): void {
    const positioner = this.renderRoot.querySelector<HTMLElement>(`#${CSS.escape(menu.positionerId)}`);

    if (positioner === null || positioner.matches(':popover-open') === menu.open) {
      return;
    }

    if (menu.open) {
      positioner.showPopover();
    } else {
      positioner.hidePopover();
    }
  }

  // The `icon` markup, or an icon in the slot `icon`.
  get #hasIcon(): boolean {
    return this.icon !== '' || this.querySelector(':scope > [slot=\'icon\']') !== null;
  }

  get #texts(): CockpitTexts {
    return textsOf(this.#adapter);
  }

  // --- Navigation ----------------------------------------------------------------------------------------------------

  // Fires `navigate`; not canceled, the browser goes there.
  #navigate(href: string): boolean {
    const detail: AppHeaderNavigateDetail = { href };

    return this.dispatchEvent(new CustomEvent('navigate', { detail, cancelable: true }));
  }

  // A choice in a menu (no link to follow): the browser goes there unless `navigate` is canceled.
  #follow(href: string | undefined): void {
    if (href !== undefined && this.#navigate(href)) {
      location.assign(href);
    }
  }

  // A plain click on a link (not a middle click, not with a modifier: those open it elsewhere, as the browser does).
  readonly #onLinkClick = (event: MouseEvent) => {
    const link = event.currentTarget as HTMLAnchorElement;

    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    if (!this.#navigate(link.getAttribute('href') ?? '')) {
      event.preventDefault();
    }
  };

  readonly #onBack = () => {
    this.#hideTip();

    if (this.dispatchEvent(new CustomEvent('back', { cancelable: true }))) {
      history.back();
    }
  };

  readonly #onForward = () => {
    this.#hideTip();

    if (this.dispatchEvent(new CustomEvent('forward', { cancelable: true }))) {
      history.forward();
    }
  };

  // --- Tooltips ------------------------------------------------------------------------------------------------------

  // Back and Forward: after a short delay on hover, at once on focus. Their text is read when it shows (the slotted
  // page may have changed since the last render).
  readonly #onTipEnter = (event: Event) => {
    const target = (event.target as Element).closest<HTMLElement>('[data-tip]');

    if (target === this.#tipTarget) {
      return;
    }

    this.#hideTip();

    if (target === null || target.matches(':disabled')) {
      return;
    }

    this.#tipTarget = target;
    this.#tipTimer = setTimeout(() => {
      this.#tip = { text: this.#tipText(target.dataset['tip'] as 'back' | 'forward'), target };
      this.requestUpdate();
    }, event.type === 'focusin' ? 0 : 400);
  };

  readonly #onTipOut = (event: Event) => {
    const next = (event as PointerEvent | FocusEvent).relatedTarget as Element | null;

    if (this.#tipTarget !== undefined && next !== null && this.#tipTarget.contains(next)) {
      return;
    }

    this.#hideTip();
  };

  #hideTip(): void {
    clearTimeout(this.#tipTimer);
    this.#tipTarget = undefined;

    if (this.#tip !== undefined) {
      this.#tip = undefined;
      this.requestUpdate();
    }
  }

  // "Back to <page>", the page from the slot (`back-page`), else the step's `page`; without one "Back".
  #tipText(key: 'back' | 'forward'): string {
    const texts = this.#texts;
    const slotted = this.querySelector(`:scope > [slot='${key}-page']`)?.textContent?.trim() ?? '';
    const page = slotted || ((key === 'back' ? this.back : this.forward)?.page ?? '');

    return page === '' ? texts[key] : key === 'back' ? texts.backTo({ page }) : texts.forwardTo({ page });
  }

  #placeTip(): void {
    const tooltip = this.renderRoot.querySelector<HTMLElement>('.tooltip');

    if (this.#tip === undefined || tooltip === null || !this.#tip.target.isConnected) {
      return;
    }

    if (!tooltip.matches(':popover-open')) {
      tooltip.showPopover();
    }

    void computePosition(this.#tip.target, tooltip, {
      placement: 'bottom',
      strategy: 'fixed',
      middleware: [offset(6), flip(), shift({ padding: 4 })],
    }).then(({ x, y }) => {
      Object.assign(tooltip.style, { left: `${x}px`, top: `${y}px` });
    });
  }

  // --- Render --------------------------------------------------------------------------------------------------------

  protected override render(): TemplateResult {
    const texts = this.#texts;

    // The popups after the header: the header is the container of the container queries, which makes it the
    // containing block of `position: fixed` inside it.
    return html`<header
      class="header"
      @pointerover=${this.#onTipEnter}
      @pointerout=${this.#onTipOut}
      @focusin=${this.#onTipEnter}
      @focusout=${this.#onTipOut}
    >
      <div class="line">
        <span class="app-icon" aria-hidden="true" ?hidden=${!this.#hasIcon}><slot
          name="icon"
          @slotchange=${() => this.requestUpdate()}
        >${this.icon === '' ? nothing : unsafeHTML(this.icon)}</slot></span>
        ${this.#title()}
        <nav class="modules" aria-label=${texts.modules}>${this.#tabs()}</nav>
        ${this.#modulesTrigger(texts)}
        <div class="end">
          <slot name="end"></slot>
          ${this.#history(texts)}
        </div>
      </div>
      ${this.#crumbs(texts)}
    </header>
    ${this.#switcherPopup()} ${this.#modulesPopup()}
    ${
      this.#tip === undefined
        ? nothing
        : html`<div class="tooltip" role="tooltip" popover="manual">${this.#tip.text}</div>`
    }`;
  }

  // The title; with a switcher a button that opens it (the title and a chevron).
  #title(): TemplateResult {
    const menu = this.#switcherMenu;

    if (this.switcher.length === 0) {
      return html`<span class="title">${this.heading}</span>`;
    }

    return html`<button
      type="button"
      class="title title--switcher"
      id=${menu.triggerId}
      aria-haspopup="menu"
      aria-expanded=${menu.open ? 'true' : 'false'}
      aria-controls=${menu.popupId}
      title=${this.#texts.switchApp}
      data-state=${menu.open ? 'open' : 'closed'}
      @click=${menu.toggle}
      @keydown=${menu.onTriggerKeyDown}
    >${this.heading}${chevronDownIcon()}</button>`;
  }

  #tabs(): TemplateResult[] {
    return this.modules.map((module) => {
      const active = module.id === this.activeModule;

      return html`<a
        class="tab"
        href=${module.href}
        aria-current=${ifDefined(active ? 'page' : undefined)}
        ?data-active=${active}
        @click=${this.#onLinkClick}
      >${module.label}</a>`;
    });
  }

  // The modules as a menu on a narrow header (CSS shows it in place of the tabs): the current one and a chevron.
  #modulesTrigger(texts: CockpitTexts): TemplateResult | typeof nothing {
    const menu = this.#modulesMenu;

    if (this.modules.length === 0) {
      return nothing;
    }

    return html`<button
      type="button"
      class="modules-trigger"
      id=${menu.triggerId}
      aria-haspopup="menu"
      aria-expanded=${menu.open ? 'true' : 'false'}
      aria-controls=${menu.popupId}
      aria-label=${texts.modules}
      data-state=${menu.open ? 'open' : 'closed'}
      @click=${menu.toggle}
      @keydown=${menu.onTriggerKeyDown}
    >${
      this.modules.find((module) => module.id === this.activeModule)?.label ?? texts.modules
    }${chevronDownIcon()}</button>`;
  }

  #history(texts: CockpitTexts): TemplateResult {
    return html`<div class="history">
      <button
        type="button"
        class="history-button"
        aria-label=${texts.back}
        data-tip="back"
        ?disabled=${this.back === null}
        @click=${this.#onBack}
      >${arrowLeftIcon()}</button>
      <button
        type="button"
        class="history-button"
        aria-label=${texts.forward}
        data-tip="forward"
        ?disabled=${this.forward === null}
        @click=${this.#onForward}
      >${arrowRightIcon()}</button>
    </div>`;
  }

  // "Home" (a link to the start page), then the crumbs; the last one is the current page (no link). Without crumbs,
  // "Home" is the current page.
  #crumbs(texts: CockpitTexts): TemplateResult {
    const home = html`${homeIcon()}<span>${texts.home}</span>`;
    const last = this.crumbs.length - 1;

    return html`<nav class="crumbs" aria-label=${texts.breadcrumb}>
      <ol class="crumb-list">
        <li class="crumb crumb--home">${
      last < 0
        ? html`<span class="crumb-current" aria-current="page">${home}</span>`
        : html`<a class="crumb-link" href=${this.homeHref} @click=${this.#onLinkClick}>${home}</a>`
    }</li>
        ${
      this.crumbs.map((crumb, index) => {
        const label = html`<slot name=${`crumb-${index}`}>${crumb.label}</slot>`;

        return html`<li class="crumb"><span class="crumb-separator" aria-hidden="true">›</span>${
          index === last || crumb.href === undefined
            ? html`<span class="crumb-current" aria-current=${
              ifDefined(index === last ? 'page' : undefined)
            }>${label}</span>`
            : html`<a class="crumb-link" href=${crumb.href} @click=${this.#onLinkClick}>${label}</a>`
        }</li>`;
      })
    }
      </ol>
    </nav>`;
  }

  #switcherPopup(): TemplateResult | typeof nothing {
    return this.switcher.length === 0
      ? nothing
      : this.#menuPopup(this.#switcherMenu, this.switcher, this.activeSwitcherItem, true);
  }

  #modulesPopup(): TemplateResult | typeof nothing {
    return this.modules.length === 0
      ? nothing
      : this.#menuPopup(this.#modulesMenu, this.modules, this.activeModule, false);
  }

  // A menu of links (the switcher, the modules): the current one checked; with `details`, each link's icon and
  // description.
  #menuPopup(menu: Menu, links: readonly AppHeaderLink[], current: string, details: boolean): TemplateResult {
    return html`<div class="menu-positioner" id=${menu.positionerId} popover="manual">
      <div
        class="menu-popup"
        id=${menu.popupId}
        role="menu"
        tabindex="-1"
        aria-labelledby=${menu.triggerId}
        aria-activedescendant=${ifDefined(menu.highlighted === undefined ? undefined : menu.itemId(menu.highlighted))}
        @keydown=${menu.onPopupKeyDown}
        @pointermove=${menu.onPopupPointerMove}
        @pointerleave=${menu.onPopupPointerLeave}
        @click=${menu.onPopupClick}
      >${
      links.map((link) =>
        html`<div
          class="menu-item"
          role="menuitemradio"
          aria-checked=${link.id === current ? 'true' : 'false'}
          id=${menu.itemId(link.id)}
          data-value=${link.id}
          ?data-highlighted=${menu.highlighted === link.id}
        >
          ${
          details
            ? html`<span class="menu-icon" aria-hidden="true">${
              link.icon === undefined ? nothing : unsafeHTML(link.icon)
            }</span>`
            : nothing
        }
          ${
          details && link.description !== undefined
            ? html`<span class="menu-text"><span class="menu-label">${link.label}</span><span class="menu-description">${link.description}</span></span>`
            : html`<span class="menu-label">${link.label}</span>`
        }
          <span class="menu-check">${link.id === current ? checkIcon() : nothing}</span>
        </div>`
      )
    }</div>
    </div>`;
  }
}
