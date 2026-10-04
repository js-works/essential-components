import { computePosition, flip, offset, shift } from '@floating-ui/dom';
import * as dialog from '@zag-js/dialog';
import * as menu from '@zag-js/menu';
import * as select from '@zag-js/select';
import { html, LitElement, nothing, unsafeCSS } from 'lit';
import type { PropertyValues, TemplateResult } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import type * as Spec from '../api';
import { groupsOf, search, subgroupsOf } from '../core/search';
import type { Group, Match } from '../core/search';
import { readStored, writeStored } from '../core/storage';
import { textsFor } from '../core/texts';
import type { Texts } from '../core/texts';
import {
  appIcon,
  checkIcon,
  chevronIcon,
  gridIcon,
  groupIcon,
  initialsOf,
  kebabIcon,
  panelIcon,
  searchIcon,
  selectorIcon,
} from './icons';
import { STYLES } from './styles';
import { spread, ZagMachines } from './zag';

export { AppCockpitElement };

type Status = 'loading' | 'ready' | 'failed';

// An entry of a line of the topbar: an app, a group (the top line, with more than one group), or a subgroup (a
// dropdown of its apps).
type Entry =
  | { kind: 'app'; app: Spec.MiniApp }
  | { kind: 'group'; group: Group }
  | { kind: 'subgroup'; parent: string; group: Group };

// The sidebar adapts to the number of apps: up to `FEW` every app is listed, the groups are plain headings, no
// "Recent"; more: "Recent" on top and the groups collapsible (closed by default above `MANY`, except the open app's).
const FEW = 12;
const MANY = 30;
// Narrower than this (the cockpit's own width), the sidebar is always a rail.
const NARROW = 768;
// How many apps "Recent" keeps.
const RECENT = 5;
// The sidebar's width when resized: between these, in px.
const MIN_WIDTH = 200;
const MAX_WIDTH = 420;

// The sections of a menu with their items, the empty ones left out.
const sectionsOf = (sections: readonly Spec.MenuSection[]) =>
  sections
    .map((section) =>
      ('items' in section ? section : { label: undefined, items: section }) as {
        label?: string | undefined;
        items: readonly Spec.MenuItem[];
      }
    )
    .filter((section) => section.items.length > 0);

const clamp = (value: number) => Math.round(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, value)));
const isMac = () => /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent);

let instances = 0;

// The cockpit, a Lit element. Its own UI in its shadow root (styled by `STYLES`); the mini-apps are its light-DOM
// children, shown through the default slot (their CSS is often global, which would not reach into a shadow root).
// The popups (menus, the group select, the search) are Zag.js machines (`ZagMachines`), positioned by Floating UI
// (inside Zag); the tooltips are one element positioned by Floating UI directly.
//
// - The first segment of the URL hash is the id of the open app (`#board-manager/…`; the rest belongs to the app). No
//   hash, or an unknown first segment at the start: `defaultApp`, else the first app. Opening an app pushes a history
//   entry.
// - An app is created when it is opened the first time (after its `load()`), and then kept: the others get `hidden`.
//   Its element gets `data-hash-segment` (its id), so tabs inside it know their level.
class AppCockpitElement extends LitElement implements Spec.Element {
  static override styles = unsafeCSS(STYLES);
  static override properties = {
    nav: { reflect: true },
    navScheme: { attribute: 'nav-scheme', reflect: true },
  };

  // The attribute `nav`: `sidebar` (the default), `topbar` (two lines), `topbar-compact` (one line) or `switcher` (one
  // line, one dropdown with the open app). An unknown value is the sidebar.
  declare nav: Spec.Nav;
  // The attribute `nav-scheme`: the navigation always dark (the default), or like the page (only CSS: `:host([nav-scheme])`).
  declare navScheme: Spec.NavScheme;

  readonly #config: Spec.Config;
  readonly #id = `cockpit${++instances}`;
  readonly #zag = new ZagMachines(() => this.requestUpdate());
  readonly #elements = new Map<string, HTMLElement>();
  readonly #status = new Map<string, Status>();
  readonly #key: string;

  #active: string | undefined;
  #recent: string[];
  #collapsed: boolean;
  #width: number | undefined;
  #openGroups: Record<string, boolean>;
  #narrow = false;
  #resizing = false;
  #paletteOpen = false;
  // The search was opened with the sidebar expanded: its layer moves along while the sidebar collapses.
  #paletteFromExpanded = false;
  // The left edge of the switcher's button, where its panel opens (px from the frame's left).
  #switcherLeft: number | undefined;
  // The search slides out (sidebar layout): it stays shown until its animation ends (Zag would hide it at once).
  #paletteClosing: ReturnType<typeof setTimeout> | undefined;
  #query = '';
  #index = 0;
  // The group of the select (`groupDisplay: 'select'`): the open app's, and the user may look into another one.
  #selectedGroup: string | undefined;
  #tip: { text: string; target: Element; side: 'right' | 'top' | 'bottom' } | undefined;
  #tipTarget: Element | undefined;
  #tipTimer: ReturnType<typeof setTimeout> | undefined;
  #resizeObserver: ResizeObserver | undefined;
  #langObserver: MutationObserver | undefined;
  // How many entries of each line of the topbar do not fit (they go into its "More" menu), by the line's key.
  readonly #overflow = new Map<string, number>();

  constructor(config: Spec.Config) {
    super();
    this.nav = 'sidebar';
    this.navScheme = 'dark';
    this.#config = config;
    this.#key = config.storageKey ?? 'app-cockpit';
    this.#recent = readStored<string[]>(`${this.#key}:recent`, []);
    this.#collapsed = readStored(`${this.#key}:collapsed`, false);
    this.#width = readStored<number | undefined>(`${this.#key}:width`, undefined);
    this.#openGroups = readStored(`${this.#key}:groups`, {});
  }

  get activeApp(): Spec.MiniApp | undefined {
    return this.#app(this.#active);
  }

  // Opens an app (from the navigation, the search, or the host's code).
  open(id: string): void {
    if (this.#app(id) === undefined) {
      return;
    }

    if (this.#segment() !== id) {
      history.pushState(null, '', `${location.pathname}${location.search}#${id}`);
    }

    this.#show(id);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#langObserver = new MutationObserver(() => this.requestUpdate());
    this.#langObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    window.addEventListener('hashchange', this.#onHashChange);
    document.addEventListener('keydown', this.#onShortcut);
    this.#show(this.#app(this.#segment())?.id ?? this.#defaultApp);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#closed();
    window.removeEventListener('hashchange', this.#onHashChange);
    document.removeEventListener('keydown', this.#onShortcut);
    this.#langObserver?.disconnect();
    this.#resizeObserver?.disconnect();
    this.#zag.stopAll();
  }

  protected override firstUpdated(_changed: PropertyValues): void {
    const frame = this.renderRoot.querySelector('.frame');

    if (frame !== null) {
      this.#resizeObserver = new ResizeObserver(() => {
        const narrow = (frame as HTMLElement).offsetWidth < NARROW;

        if (narrow !== this.#narrow) {
          this.#narrow = narrow;
          this.requestUpdate();
        }

        this.#measure();
        this.#placeNotch();
      });
      this.#resizeObserver.observe(frame);
    }
  }

  protected override updated(): void {
    this.#placeTip();
    this.#measure();
    this.#placeNotch();
  }

  // Two lines: the triangle (the second line's `::before`) points at the middle of the active group's text: its x, from
  // the left edge of the topbar, goes into `--app-cockpit-notch-x` (see the CSS).
  #placeNotch(): void {
    const topbar = this.#el('.topbar');
    const tab = this.#el('.top-line .tab[aria-pressed="true"]');

    if (topbar === null) {
      return;
    }

    if (tab === null || !topbar.hasAttribute('data-two-lines')) {
      topbar.style.removeProperty('--app-cockpit-notch-x');
      return;
    }

    // The middle of the tab's text (the tab has an icon before it: its own middle would be left of the text's).
    const box = (tab.querySelector('.tab-title') ?? tab).getBoundingClientRect();

    topbar.style.setProperty('--app-cockpit-notch-x', `${box.left + box.width / 2 - topbar.getBoundingClientRect().left}px`);
  }

  // The lines of the topbar wrap their entries into a hidden second row: those are counted, and shown in a "More" menu.
  #measure(): void {
    let changed = false;

    for (const line of this.renderRoot.querySelectorAll<HTMLElement>('[data-overflow]')) {
      const items = [...line.children] as HTMLElement[];
      const top = items[0]?.offsetTop ?? 0;
      const hidden = items.filter((item) => item.offsetTop > top + 1).length;
      const key = line.dataset['overflow'] ?? '';

      if ((this.#overflow.get(key) ?? 0) !== hidden) {
        this.#overflow.set(key, hidden);
        changed = true;
      }
    }

    if (changed) {
      this.requestUpdate();
    }
  }

  // --- Apps and routing ----------------------------------------------------------------------------------------------

  readonly #onHashChange = () => {
    const app = this.#app(this.#segment());

    if (app !== undefined) {
      this.#show(app.id);
    } else if (location.hash === '') {
      this.#show(this.#defaultApp);
    }
  };

  #segment(): string {
    return decodeURIComponent(location.hash.slice(1).split('/')[0] ?? '');
  }

  // The app opened without a hash: the config's `defaultApp`, else the first app.
  get #defaultApp(): string | undefined {
    return this.#app(this.#config.defaultApp)?.id ?? this.#config.apps[0]?.id;
  }

  #app(id: string | undefined): Spec.MiniApp | undefined {
    return id === undefined ? undefined : this.#config.apps.find((app) => app.id === id);
  }

  #show(id: string | undefined): void {
    const app = this.#app(id);

    if (app === undefined) {
      this.requestUpdate();
      return;
    }

    this.#active = app.id;
    this.#selectedGroup = app.group ?? '';
    this.#recent = [app.id, ...this.#recent.filter((other) => other !== app.id)].slice(0, RECENT);
    writeStored(`${this.#key}:recent`, this.#recent);

    for (const [other, element] of this.#elements) {
      element.hidden = other !== app.id;
    }

    if (!this.#elements.has(app.id)) {
      void this.#create(app);
    }

    this.requestUpdate();
  }

  async #create(app: Spec.MiniApp): Promise<void> {
    if (this.#status.get(app.id) === 'loading') {
      return;
    }

    this.#status.set(app.id, 'loading');
    this.requestUpdate();

    try {
      await app.load?.();

      const element = document.createElement(app.element);

      for (const [name, value] of Object.entries(app.attributes ?? {})) {
        element.setAttribute(name, value);
      }

      element.setAttribute('data-hash-segment', app.id);
      element.hidden = this.#active !== app.id;
      this.#elements.set(app.id, element);
      this.append(element);
      this.#status.set(app.id, 'ready');
    } catch (error) {
      console.error(`app-cockpit: the app "${app.id}" could not be loaded.`, error);
      this.#status.set(app.id, 'failed');
    }

    this.requestUpdate();
  }

  // --- State helpers -------------------------------------------------------------------------------------------------

  get #texts(): Texts {
    return textsFor(document.documentElement.lang);
  }

  get #many(): boolean {
    return this.#config.apps.length > FEW;
  }

  // The search panel: by the config, else with more than `FEW` apps; always with the app switcher (it is its list).
  get #searchable(): boolean {
    return this.#switcher || (this.#config.search ?? this.#many);
  }

  // The app switcher (`nav="switcher"`, in the topbar): one dropdown with the open app in the top line; it opens
  // the search panel, which lists all apps, at the button.
  get #switcher(): boolean {
    return this.#topbar && this.nav === 'switcher';
  }

  // The topbar: by the attribute, unless too narrow (then the sidebar's rail).
  get #topbar(): boolean {
    return (this.nav === 'topbar' || this.nav === 'topbar-compact' || this.nav === 'switcher') && !this.#narrow;
  }

  // The rail: collapsed by the user, too narrow, or while the search is open (it takes the sidebar's place).
  get #rail(): boolean {
    return !this.#topbar && (this.#collapsed || this.#narrow || this.#paletteOpen);
  }

  get #recentApps(): Spec.MiniApp[] {
    return this.#recent.flatMap((id) => this.#app(id) ?? []);
  }

  #groupIcon(name: string): string | undefined {
    return this.#config.groups?.find((group) => group.name === name)?.icon;
  }

  #subgroupIcon(group: string, subgroup: string): string | undefined {
    return this.#config.groups?.find((candidate) => candidate.name === group)?.subgroups?.find((candidate) =>
      candidate.name === subgroup
    )?.icon;
  }

  #labelOf(group: Group): string {
    return group.name === '' ? this.#texts.other : group.name;
  }

  #setOpenGroup(key: string, open: boolean): void {
    this.#openGroups = { ...this.#openGroups, [key]: open };
    writeStored(`${this.#key}:groups`, this.#openGroups);
    this.requestUpdate();
  }

  #toggleCollapsed = () => {
    this.#collapsed = !this.#collapsed;
    writeStored(`${this.#key}:collapsed`, this.#collapsed);
    this.requestUpdate();
  };

  // With the sidebar expanded, it collapses to the rail while the search slides in (both at once).
  #openPalette = () => {
    if (this.#paletteOpen) {
      return;
    }

    // The switcher's panel opens at its button (its left edge, from the frame's).
    this.#switcherLeft = this.#switcher
      ? Math.max(
        0,
        (this.#el('.switcher')?.getBoundingClientRect().left ?? 0)
          - (this.#el('.frame')?.getBoundingClientRect().left ?? 0),
      )
      : undefined;

    this.#paletteFromExpanded = !this.#rail && !this.#topbar;
    this.#closed();
    this.#paletteOpen = true;
    this.#query = '';
    this.#index = Math.max(0, this.#recentApps.findIndex((app) => app.id === this.#active));
    this.requestUpdate();
  };

  #closePalette = () => {
    this.#paletteOpen = false;

    // A fallback, in case its animation does not end (e.g. not running in a hidden tab).
    if (!this.#topbar) {
      clearTimeout(this.#paletteClosing);
      this.#paletteClosing = setTimeout(this.#closed, 600);
    }

    this.requestUpdate();
  };

  // The search's slide out has ended.
  readonly #closed = () => {
    if (this.#paletteClosing !== undefined) {
      clearTimeout(this.#paletteClosing);
      this.#paletteClosing = undefined;
      this.requestUpdate();
    }
  };

  // Ctrl+K (⌘K on a Mac) opens the search, wherever the focus is.
  readonly #onShortcut = (event: KeyboardEvent) => {
    if (
      this.#searchable && (event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'k'
    ) {
      event.preventDefault();
      this.#openPalette();
    }
  };

  #el(selector: string): HTMLElement | null {
    return this.renderRoot.querySelector<HTMLElement>(selector);
  }

  // A rect for Floating UI: from the sidebar's right edge, as high as `element` (a popup to the right touches the
  // sidebar, level with its button).
  #besideSidebar(element: () => Element | null): () => DOMRect {
    return () => {
      const rect = element()?.getBoundingClientRect() ?? new DOMRect();
      const right = this.#el('.sidebar')?.getBoundingClientRect().right ?? rect.right;

      return new DOMRect(right, rect.top, 0, rect.height);
    };
  }

  // A rect for Floating UI: as wide as `element`, at the bottom of its line of the topbar (a dropdown touches the line).
  #belowLine(element: () => Element | null): () => DOMRect {
    return () => {
      const target = element();
      const rect = target?.getBoundingClientRect() ?? new DOMRect();
      const bottom = target?.closest('.top-line, .sub-line')?.getBoundingClientRect().bottom ?? rect.bottom;

      return new DOMRect(rect.left, bottom, rect.width, 0);
    };
  }

  // The trigger of a dropdown of the topbar, by its key.
  #dropTrigger(key: string): () => Element | null {
    return () => this.#el(`[data-drop="${key.replace(/[^a-z0-9]+/gi, '-')}"]`);
  }

  // The anchor of a menu that is not at its trigger: one virtual element per menu, kept (Floating UI starts over for a
  // new one, which renders again, endlessly), whose rect comes from the latest render.
  readonly #anchorRects = new Map<string, () => DOMRect>();
  readonly #anchors = new Map<string, { getBoundingClientRect: () => DOMRect; contextElement?: Element }>();

  #anchor(key: string, rect: () => DOMRect) {
    this.#anchorRects.set(key, rect);

    let anchor = this.#anchors.get(key);

    if (anchor === undefined) {
      anchor = { getBoundingClientRect: () => this.#anchorRects.get(key)?.() ?? new DOMRect() };
      this.#anchors.set(key, anchor);
    }

    anchor.contextElement = this.#el('.sidebar') ?? undefined;

    return anchor;
  }

  // --- Tooltips ------------------------------------------------------------------------------------------------------

  // One tooltip for every element with `data-tip` (its text; `data-tip-side`: where), after a short delay on hover or
  // focus. Positioned by Floating UI.
  readonly #onTipEnter = (event: Event) => {
    const target = (event.target as Element).closest?.('[data-tip]') ?? null;

    // Moving inside the same element (e.g. onto its icon) changes nothing.
    if (target === this.#tipTarget) {
      return;
    }

    this.#onTipLeave();

    // Not for a button whose popup is open (it would cover it).
    if (target === null || target.getAttribute('data-state') === 'open') {
      return;
    }

    this.#tipTarget = target;
    this.#tipTimer = setTimeout(() => {
      this.#tip = {
        text: target.getAttribute('data-tip') ?? '',
        target,
        side: (target.getAttribute('data-tip-side') as 'right' | 'top' | 'bottom' | null) ?? 'right',
      };
      this.requestUpdate();
    }, event.type === 'focusin' ? 0 : 300);
  };

  readonly #onTipOut = (event: Event) => {
    const next = (event as PointerEvent | FocusEvent).relatedTarget as Element | null;

    if (this.#tipTarget !== undefined && next !== null && this.#tipTarget.contains(next)) {
      return;
    }

    this.#onTipLeave();
  };

  readonly #onTipLeave = () => {
    clearTimeout(this.#tipTimer);
    this.#tipTarget = undefined;

    if (this.#tip !== undefined) {
      this.#tip = undefined;
      this.requestUpdate();
    }
  };

  #placeTip(): void {
    const tooltip = this.#el('.tooltip');

    if (this.#tip === undefined || tooltip === null || !this.#tip.target.isConnected) {
      return;
    }

    void computePosition(this.#tip.target, tooltip, {
      placement: this.#tip.side,
      strategy: 'fixed',
      middleware: [offset(this.#tip.side === 'right' ? 10 : 8), flip(), shift({ padding: 4 })],
    }).then(({ x, y }) => {
      Object.assign(tooltip.style, { left: `${x}px`, top: `${y}px` });
      tooltip.setAttribute('data-open', '');
    });
  }

  // --- Render --------------------------------------------------------------------------------------------------------

  protected override render(): TemplateResult {
    const texts = this.#texts;
    const topbar = this.#topbar;
    const rail = this.#rail;
    const active = this.#app(this.#active);
    const status = active === undefined ? 'ready' : this.#status.get(active.id) ?? 'loading';
    const style = {
      ...(this.#width === undefined ? {} : { '--app-cockpit-sidebar-width': `${this.#width}px` }),
      ...(this.#switcherLeft === undefined ? {} : { '--app-cockpit-switcher-left': `${this.#switcherLeft}px` }),
    };

    return html`
      <div
        class="mount"
        data-layout=${topbar ? 'topbar' : 'sidebar'}
        data-nav-style=${this.#switcher ? 'switcher' : 'tabs'}
        ?data-palette-from-expanded=${this.#paletteFromExpanded}
        ?data-palette-closing=${this.#paletteClosing !== undefined}
        style=${styleMap(style)}
        @pointerover=${this.#onTipEnter}
        @pointerout=${this.#onTipOut}
        @focusin=${this.#onTipEnter}
        @focusout=${this.#onTipOut}
        @pointerdown=${{ handleEvent: this.#onTipLeave, capture: true }}
      >
        <div
          class="frame"
          ?data-rail=${rail}
          ?data-resizing=${this.#resizing}
        >
          ${topbar ? this.#topbarParts(texts) : this.#sidebar(texts, rail)}
          <main class="main">
            <slot></slot>
            ${
      status === 'loading'
        ? html`<div class="state" role="status"><span class="spinner" aria-hidden="true"></span>${texts.loading}</div>`
        : status === 'failed'
        ? html`<div class="state" role="alert">
          <p>${texts.loadFailed}</p>
          <button type="button" class="retry-button" @click=${() => {
          if (active !== undefined) {
            this.#status.delete(active.id);
            void this.#create(active);
          }
        }}>${texts.retry}</button>
        </div>`
        : nothing
    }
          </main>
        </div>
        ${this.#searchable ? this.#palette(texts) : nothing}
        ${
      this.#tip === undefined
        ? nothing
        : html`<div class="tooltip" role="tooltip" data-side=${this.#tip.side}>${this.#tip.text}</div>`
    }
      </div>
    `;
  }

  #sidebar(texts: Texts, rail: boolean): TemplateResult {
    return html`<aside class="sidebar">
            ${rail ? nothing : this.#resizeHandle(texts)}
            <div class="brand">
              ${this.#brand(texts, rail)}
              ${this.#searchable && !rail ? this.#searchButton(texts, rail) : nothing}
            </div>
            ${this.#searchable && rail ? this.#searchButton(texts, rail) : nothing} ${this.#navigation(texts, rail)}
            <div class="sidebar-end"><slot name="sidebar-end"></slot></div>
            ${this.#config.user === undefined ? nothing : this.#userRow(texts, rail, this.#config.user)}
            ${this.#footer(texts, rail)}
          </aside>`;
  }

  // The logo (the slot `logo`), the title and the subtitle.
  // In the sidebar (not when it is always a rail, below 768px), the logo is a button that toggles the sidebar, like the
  // footer's toggle.
  #brand(texts: Texts, rail?: boolean): TemplateResult {
    const logo = html`<slot name="logo"><span class="brand-logo" aria-hidden="true">${gridIcon()}</span></slot>`;
    const label = rail ? texts.expand : texts.collapse;

    return html`${
      rail === undefined || this.#narrow
        ? logo
        : html`<button
          type="button"
          class="brand-toggle"
          aria-label=${label}
          aria-expanded=${!rail}
          data-tip=${label}
          data-tip-side=${rail ? 'right' : 'bottom'}
          @click=${this.#toggleCollapsed}
        >${logo}</button>`
    }
      <span class="brand-text">
        <span class="brand-title">${this.#config.title ?? 'Apps'}</span>
        ${
      this.#config.subtitle === undefined ? nothing : html`<span class="brand-subtitle">${this.#config.subtitle}</span>`
    }
      </span>`;
  }

  // The search: an icon button with a tooltip ("Search apps (Ctrl K)"); next to the title, or below the logo in the rail.
  #searchButton(texts: Texts, rail: boolean): TemplateResult {
    return html`<button
      type="button"
      class="search-button"
      aria-label=${texts.search}
      data-tip="${texts.search} (${isMac() ? '⌘K' : 'Ctrl K'})"
      data-tip-side=${rail ? 'right' : 'bottom'}
      @click=${this.#openPalette}
    >${searchIcon()}</button>`;
  }

  // The handle on the sidebar's right edge: drag it to resize the sidebar; Left and Right (Shift: more) do it from the
  // keyboard; a double click goes back to the default width.
  #resizeHandle(texts: Texts): TemplateResult {
    const current = () => this.#el('.sidebar')?.getBoundingClientRect().width ?? MIN_WIDTH;
    const set = (width: number | undefined, done: boolean) => {
      this.#width = width;

      if (done) {
        writeStored(`${this.#key}:width`, width);
      }

      this.requestUpdate();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) {
        return;
      }

      event.preventDefault();

      const handle = event.currentTarget as HTMLElement;
      const startX = event.clientX;
      const startWidth = current();
      let last = startWidth;

      handle.setPointerCapture(event.pointerId);
      this.#resizing = true;

      const move = (moveEvent: PointerEvent) => {
        last = clamp(startWidth + moveEvent.clientX - startX);
        set(last, false);
      };
      const up = () => {
        handle.removeEventListener('pointermove', move);
        handle.removeEventListener('pointerup', up);
        handle.removeEventListener('pointercancel', up);
        this.#resizing = false;
        set(last, true);
      };

      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', up);
      handle.addEventListener('pointercancel', up);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const step = event.shiftKey ? 48 : 16;
      const delta = ({ ArrowLeft: -step, ArrowRight: step } as Record<string, number | undefined>)[event.key];

      if (delta !== undefined) {
        event.preventDefault();
        set(clamp(current() + delta), true);
      }
    };

    return html`<div
      class="resize-handle"
      role="separator"
      aria-orientation="vertical"
      aria-label=${texts.resize}
      aria-valuemin=${MIN_WIDTH}
      aria-valuemax=${MAX_WIDTH}
      aria-valuenow=${ifDefined(this.#width)}
      tabindex="0"
      @pointerdown=${onPointerDown}
      @keydown=${onKeyDown}
      @dblclick=${() => set(undefined, true)}
    ></div>`;
  }

  // --- Navigation ----------------------------------------------------------------------------------------------------

  // Up and Down move between the buttons of the navigation, Home and End to the first and the last.
  readonly #onNavKeyDown = (event: KeyboardEvent) => {
    const nav = event.currentTarget as HTMLElement;
    const buttons = [...nav.querySelectorAll<HTMLButtonElement>('button')].filter((button) =>
      button.offsetParent !== null
    );
    const index = buttons.indexOf(event.composedPath()[0] as HTMLButtonElement);
    const next = ({
      ArrowDown: buttons[index + 1],
      ArrowUp: buttons[index - 1],
      Home: buttons[0],
      End: buttons.at(-1),
    } as Record<string, HTMLButtonElement | undefined>)[event.key];

    if (index >= 0 && next !== undefined) {
      event.preventDefault();
      next.focus();
    }
  };

  #item(app: Spec.MiniApp, rail: boolean): TemplateResult {
    const current = app.id === this.#active;

    return html`<button
      type="button"
      class="item"
      aria-current=${ifDefined(current ? 'page' : undefined)}
      aria-label=${ifDefined(rail ? app.title : undefined)}
      title=${ifDefined(rail ? undefined : app.description)}
      data-tip=${ifDefined(rail ? app.title : undefined)}
      @click=${() => this.open(app.id)}
    >${appIcon(app, rail)}<span class="item-title">${app.title}</span></button>`;
  }

  #section(label: string, items: TemplateResult[]): TemplateResult {
    return html`<section class="section">
      ${label === '' ? html`<hr class="section-rule" />` : html`<h2 class="section-label">${label}</h2>`}
      <ul class="list">${items}</ul>
    </section>`;
  }

  // The apps of a group as a tree: the apps without a subgroup, then each subgroup (collapsible, open by default) with
  // its apps. In the rail: the apps without a subgroup as icons, each subgroup as one button with a flyout.
  #tree(group: Group, rail: boolean): TemplateResult[] {
    const { loose, subgroups } = subgroupsOf(group.apps);
    const looseItems = loose.map((app) => html`<li>${this.#item(app, rail)}</li>`);

    if (rail) {
      return [
        ...looseItems,
        ...subgroups.map((subgroup) =>
          html`<li>${
            this.#flyout(
              `sub:${group.name}/${subgroup.name}`,
              { name: subgroup.name, apps: subgroup.apps.map(({ subgroup: _subgroup, ...app }) => app) },
              subgroup.name,
              this.#subgroupIcon(group.name, subgroup.name),
            )
          }</li>`
        ),
      ];
    }

    return [
      ...looseItems,
      ...subgroups.map((subgroup) => {
        const key = `${group.name}/${subgroup.name}`;
        const open = this.#openGroups[key] ?? true;
        const icon = this.#subgroupIcon(group.name, subgroup.name);

        return html`<li>
          <div class="subgroup">
            <button
              type="button"
              class="subgroup-trigger"
              aria-expanded=${open}
              ?data-panel-open=${open}
              @click=${() => this.#setOpenGroup(key, !open)}
            >
              ${chevronIcon()} ${icon === undefined ? nothing : groupIcon(icon)}
              <span class="subgroup-name">${subgroup.name}</span>
              <span class="subgroup-count">${subgroup.apps.length}</span>
            </button>
            <div class="group-panel" ?hidden=${!open}>
              <ul class="list subgroup-list">${subgroup.apps.map((app) => html`<li>${this.#item(app, rail)}</li>`)}</ul>
            </div>
          </div>
        </li>`;
      }),
    ];
  }

  #navigation(texts: Texts, rail: boolean): TemplateResult {
    const apps = this.#config.apps;
    const many = this.#many;
    const groups = groupsOf(apps);
    const nav = (content: unknown) =>
      html`<nav class="nav" aria-label=${texts.navigation} @keydown=${this.#onNavKeyDown}>${content}</nav>`;

    // The rail of many apps: with groups, one button per group with a flyout; without, the recent apps and the open
    // one (the search finds the rest).
    if (rail && many) {
      if (groups.length > 1) {
        return nav(html`<ul class="list">${
          repeat(
            groups,
            (group) => group.name,
            (group) =>
              html`<li>${
                this.#flyout(`group:${group.name}`, group, this.#labelOf(group), this.#groupIcon(group.name))
              }</li>`,
          )
        }</ul>`);
      }

      const shown = this.#recentApps;
      const active = this.#app(this.#active);

      if (active !== undefined && !shown.some((app) => app.id === active.id)) {
        shown.unshift(active);
      }

      return nav(html`<ul class="list">${shown.map((app) => html`<li>${this.#item(app, rail)}</li>`)}</ul>`);
    }

    // One group at a time: the select on top, the apps of the chosen group below it.
    if (this.#config.groupDisplay === 'select' && !rail && groups.length > 1) {
      const group = groups.find((candidate) => candidate.name === this.#selectedGroup) ?? groups[0];

      return html`${this.#groupSelect(texts, groups, group?.name ?? '')}
      ${nav(group === undefined ? nothing : html`<ul class="list">${this.#tree(group, rail)}</ul>`)}`;
    }

    const recent = this.#recentApps;

    return nav(html`
      ${
      many && recent.length > 0
        ? this.#section(texts.recent, recent.map((app) => html`<li>${this.#item(app, rail)}</li>`))
        : nothing
    }
      ${
      groups.map((group) => {
        const label = group.name === '' ? (groups.length > 1 && many ? texts.other : '') : group.name;
        const list = this.#tree(group, rail);

        if (rail || !many || label === '') {
          return this.#section(rail ? '' : label, list);
        }

        const open = this.#openGroups[group.name]
          ?? (apps.length <= MANY || group.name === (this.#app(this.#active)?.group ?? '') || group.name === '');
        const icon = this.#groupIcon(group.name);

        return html`<div class="group">
          <button
            type="button"
            class="group-trigger"
            aria-expanded=${open}
            ?data-panel-open=${open}
            @click=${() => this.#setOpenGroup(group.name, !open)}
          >
            ${chevronIcon()} ${icon === undefined ? nothing : groupIcon(icon)}
            <span class="group-name">${label}</span>
            <span class="group-count">${group.apps.length}</span>
          </button>
          <div class="group-panel" ?hidden=${!open}><ul class="list">${list}</ul></div>
        </div>`;
      })
    }
    `);
  }

  // --- Topbar --------------------------------------------------------------------------------------------------------

  // The topbar (`nav="topbar"`): a dark top line with the logo and the title, the groups (more than one), and on
  // the right the search, the footer's actions and menu, and the user; below it a light line with the apps of the
  // chosen group (its subgroups as dropdowns). With one group (or none), its apps are in the top line, and there is no
  // second line. Entries that do not fit go into a "More" menu at the end of their line.
  #topbarParts(texts: Texts): TemplateResult {
    const groups = groupsOf(this.#config.apps);
    const many = groups.length > 1;
    const group = groups.find((candidate) => candidate.name === this.#selectedGroup) ?? groups[0];
    // One line (`nav="topbar-compact"`, with several groups): a select for the group in the top line, then its apps as tabs.
    const switcher = this.#switcher;
    const oneLine = many && this.nav === 'topbar-compact' && group !== undefined && !switcher;
    const top: Entry[] = many && !oneLine
      ? groups.map((candidate) => ({ kind: 'group', group: candidate }))
      : group === undefined
      ? []
      : this.#entries(group);
    const user = this.#config.user;

    return html`<header class="topbar" ?data-two-lines=${many && !oneLine && !switcher && group !== undefined}>
      <div class="top-line">
        <div class="brand">${this.#brand(texts)}</div>
        ${
      switcher ? this.#switcherButton(texts) : oneLine ? this.#groupSelect(texts, groups, group.name, true) : nothing
    }
        ${
      switcher
        ? html`<div class="line"></div>`
        : html`<nav class="line" aria-label=${texts.navigation} @keydown=${this.#onLineKeyDown}>${
          this.#line(oneLine ? `top:${group.name}` : 'top', top, texts, !oneLine)
        }</nav>`
    }
        ${this.#searchable && !switcher ? this.#searchButton(texts, false) : nothing} ${
      this.#footer(texts, false, true)
    }
        ${user === undefined ? nothing : this.#topUser(texts, user)}
      </div>
      ${
      many && !oneLine && !switcher && group !== undefined
        ? html`<nav class="sub-line line" aria-label=${this.#labelOf(group)} @keydown=${this.#onLineKeyDown}>${
          this.#line(`sub:${group.name}`, this.#entries(group), texts)
        }</nav>`
        : nothing
    }
    </header>`;
  }

  // The app switcher: the open app (its icon and title) as a dropdown button; it opens the search panel at it.
  #switcherButton(texts: Texts): TemplateResult {
    const active = this.#app(this.#active);
    const label = `${texts.switchApp} (${isMac() ? '⌘K' : 'Ctrl K'})`;

    return html`<button
      type="button"
      class="switcher"
      aria-haspopup="dialog"
      aria-expanded=${this.#paletteOpen}
      aria-label=${active === undefined ? label : `${active.title}: ${label}`}
      data-tip=${label}
      data-tip-side="bottom"
      @click=${this.#openPalette}
    >
      ${active === undefined ? nothing : appIcon(active)}
      <span class="switcher-title">${active?.title ?? texts.switchApp}</span>
      ${selectorIcon()}
    </button>`;
  }

  // The entries of a group: its apps without a subgroup, then its subgroups.
  #entries(group: Group): Entry[] {
    const { loose, subgroups } = subgroupsOf(group.apps);

    return [
      ...loose.map((app) => ({ kind: 'app' as const, app })),
      ...subgroups.map((subgroup) => ({ kind: 'subgroup' as const, parent: group.name, group: subgroup })),
    ];
  }

  // A line of entries; Left and Right (Home, End) move between them. Those that wrap are hidden (the line is one row
  // high) and listed in the "More" menu.
  // `icons`: the tabs with their icons (none in the one line of `nav="topbar-compact"`, 2026-10-04).
  #line(key: string, entries: Entry[], texts: Texts, icons = true): TemplateResult {
    const hidden = Math.min(this.#overflow.get(key) ?? 0, entries.length);

    return html`<ul class="line-list" data-overflow=${key}>${
      repeat(entries, (entry) => this.#entryKey(entry), (entry) => html`<li>${this.#entry(entry, icons)}</li>`)
    }</ul>
      ${hidden > 0 ? this.#lineMore(key, entries.slice(entries.length - hidden), texts) : nothing}`;
  }

  #entryKey(entry: Entry): string {
    return entry.kind === 'app'
      ? `app:${entry.app.id}`
      : entry.kind === 'group'
      ? `group:${entry.group.name}`
      : `sub:${entry.parent}/${entry.group.name}`;
  }

  readonly #onLineKeyDown = (event: KeyboardEvent) => {
    const nav = event.currentTarget as HTMLElement;
    const list = nav.querySelector<HTMLElement>(':scope > .line-list');

    if (list === null) {
      return;
    }

    const top = (list.firstElementChild as HTMLElement | null)?.offsetTop ?? 0;
    // The entries that fit, then the "More" button after the list.
    const buttons = [
      ...[...list.querySelectorAll<HTMLButtonElement>(':scope > li')].filter((item) => item.offsetTop <= top + 1)
        .map((item) => item.querySelector<HTMLButtonElement>('.tab')),
      nav.querySelector<HTMLButtonElement>(':scope > .tab--more'),
    ].filter((button) => button != null);
    const index = buttons.indexOf(event.composedPath()[0] as HTMLButtonElement);
    const next = ({
      ArrowRight: buttons[index + 1],
      ArrowLeft: buttons[index - 1],
      Home: buttons[0],
      End: buttons.at(-1),
    } as Record<string, HTMLButtonElement | undefined>)[event.key];

    if (index >= 0 && next !== undefined) {
      event.preventDefault();
      next.focus();
    }
  };

  #entry(entry: Entry, icons = true): TemplateResult {
    if (entry.kind === 'app') {
      const { app } = entry;

      return html`<button
        type="button"
        class="tab"
        aria-current=${ifDefined(app.id === this.#active ? 'page' : undefined)}
        title=${ifDefined(app.description)}
        @click=${() => this.open(app.id)}
      >${icons ? appIcon(app) : nothing}<span class="tab-title">${app.title}</span></button>`;
    }

    if (entry.kind === 'group') {
      const { group } = entry;
      const shown = group.name === (this.#selectedGroup ?? '');
      const current = group.apps.some((app) => app.id === this.#active);
      const icon = this.#groupIcon(group.name);

      return html`<button
        type="button"
        class="tab"
        aria-pressed=${shown}
        aria-current=${ifDefined(current ? 'true' : undefined)}
        @click=${() => {
        this.#selectedGroup = group.name;
        this.requestUpdate();
      }}
      >${icon === undefined || !icons ? nothing : groupIcon(icon)}<span class="tab-title">${
        this.#labelOf(group)
      }</span></button>`;
    }

    // A subgroup: a dropdown of its apps.
    const { parent, group } = entry;
    const key = `tab:${parent}/${group.name}`;
    const api = this.#menu(key, {
      placement: 'bottom-start',
      anchor: this.#belowLine(this.#dropTrigger(key)),
      onSelect: (value) => this.open(value.slice('app:'.length)),
    });
    const icon = this.#subgroupIcon(parent, group.name);
    const current = group.apps.some((app) => app.id === this.#active);

    return html`<button
        class="tab tab--menu"
        data-drop=${key.replace(/[^a-z0-9]+/gi, '-')}
        aria-current=${ifDefined(current ? 'true' : undefined)}
        ${spread(api.getTriggerProps())}
      >${
      icon === undefined || !icons ? nothing : groupIcon(icon)
    }<span class="tab-title">${group.name}</span>${chevronIcon()}</button>
      <div class="menu-positioner" ${spread(api.getPositionerProps())}>
        <div class="menu-popup" data-drop ${spread(api.getContentProps())}>
          ${group.apps.map((app) => this.#appMenuItem(api, app))}
        </div>
      </div>`;
  }

  #appMenuItem(api: menu.Api, app: Spec.MiniApp): TemplateResult {
    return html`<div class="menu-item" ?data-current=${app.id === this.#active} ${
      spread(api.getItemProps({ value: `app:${app.id}` }))
    }><span class="menu-label">${app.title}</span></div>`;
  }

  // The "More" menu of a line: its hidden entries (a group chooses it, a subgroup lists its apps under its name).
  #lineMore(key: string, entries: Entry[], texts: Texts): TemplateResult {
    const api = this.#menu(`more:${key}`, {
      placement: 'bottom-end',
      anchor: this.#belowLine(this.#dropTrigger(`more:${key}`)),
      onSelect: (value) => {
        const [kind, ...rest] = value.split(':');
        const id = rest.join(':');

        if (kind === 'group') {
          this.#selectedGroup = id;
          this.requestUpdate();
        } else {
          this.open(id);
        }
      },
    });
    const current = entries.some((entry) =>
      entry.kind === 'app' ? entry.app.id === this.#active : entry.group.apps.some((app) => app.id === this.#active)
    );

    return html`<button class="tab tab--more" data-drop=${`more:${key}`.replace(/[^a-z0-9]+/gi, '-')} aria-current=${
      ifDefined(current ? 'true' : undefined)
    } ${spread(api.getTriggerProps())}><span class="tab-title">${texts.more}</span>${chevronIcon()}</button>
      <div class="menu-positioner" ${spread(api.getPositionerProps())}>
        <div class="menu-popup" data-drop ${spread(api.getContentProps())}>
          ${
      entries.map((entry) =>
        entry.kind === 'app'
          ? this.#appMenuItem(api, entry.app)
          : entry.kind === 'group'
          ? html`<div class="menu-item" ?data-current=${entry.group.name === this.#selectedGroup} ${
            spread(api.getItemProps({ value: `group:${entry.group.name}` }))
          }><span class="menu-label">${this.#labelOf(entry.group)}</span></div>`
          : html`<div class="menu-group-label">${entry.group.name}</div>
            ${entry.group.apps.map((app) => this.#appMenuItem(api, app))}`
      )
    }
        </div>
      </div>`;
  }

  // The user in the top line: the avatar (the name as the tooltip); with `userMenu` a button that opens it below,
  // with the name and the second line on top.
  #topUser(texts: Texts, user: Spec.User): TemplateResult {
    const sections = this.#config.userMenu ?? [];
    const avatar = user.avatar === undefined
      ? html`<span class="avatar" aria-hidden="true">${initialsOf(user.name).toUpperCase()}</span>`
      : html`<img class="avatar" src=${user.avatar} alt="" />`;

    if (sectionsOf(sections).length === 0) {
      return html`<div class="top-user" aria-label=${user.name} data-tip=${user.name} data-tip-side="bottom">${avatar}</div>`;
    }

    const api = this.#menu('user', {
      placement: 'bottom-end',
      anchor: this.#belowLine(() => this.#el('.top-user')),
      onSelect: (value) => this.#select(sections, value),
    });

    return html`<button
        class="top-user"
        aria-label="${texts.account}: ${user.name}"
        data-tip=${user.name}
        data-tip-side="bottom"
        ${spread(api.getTriggerProps())}
      >${avatar}</button>
      <div class="menu-positioner" ${spread(api.getPositionerProps())}>
        <div class="menu-popup" data-drop ${spread(api.getContentProps())}>
          <div class="menu-user">
            <span class="user-name">${user.name}</span>
            ${user.detail === undefined ? nothing : html`<span class="user-detail">${user.detail}</span>`}
          </div>
          <div class="menu-separator"></div>
          ${this.#menuItems(api, sections)}
        </div>
      </div>`;
  }

  // --- Zag menus -----------------------------------------------------------------------------------------------------

  // A menu (Zag): `key` for its machine, where it opens, and what choosing an item does.
  #menu(
    key: string,
    options: {
      placement: 'right-start' | 'right-end' | 'top-start' | 'bottom-start' | 'bottom-end';
      anchor?: () => DOMRect;
      sameWidth?: boolean;
      onSelect: (value: string) => void;
    },
  ): menu.Api {
    return this.#zag.use(`menu:${key}`, menu, {
      id: `${this.#id}-${key.replace(/[^a-z0-9]+/gi, '-')}`,
      getRootNode: () => this.renderRoot as ShadowRoot,
      positioning: {
        placement: options.placement,
        strategy: 'fixed',
        gutter: 0,
        overflowPadding: 0,
        sameWidth: options.sameWidth ?? false,
        ...(options.anchor === undefined ? {} : (() => {
          const anchor = this.#anchor(key, options.anchor);

          return { getAnchorElement: () => anchor };
        })()),
      },
      onSelect: ({ value }: { value: string }) => options.onSelect(value),
    } as menu.Props);
  }

  // The sections of a menu, separated by lines, each with its label. An item with `checked` is a radio option (a check
  // in place of its icon, on the checked one).
  #menuItems(api: menu.Api, sections: readonly Spec.MenuSection[]): TemplateResult[] {
    return sectionsOf(sections).flatMap((section, index) => [
      ...(index > 0 ? [html`<div class="menu-separator" ${spread(api.getSeparatorProps())}></div>`] : []),
      ...(section.label === undefined ? [] : [html`<div class="menu-group-label">${section.label}</div>`]),
      ...section.items.map((item) => {
        if (item.checked !== undefined) {
          const checked = item.checked();

          return html`<div class="menu-item" ?data-checked=${checked} ${
            spread(api.getOptionItemProps({ type: 'radio', value: item.id, checked, onCheckedChange: () => {} }))
          }>
            <span class="menu-icon menu-check" ?data-checked=${checked}>${checkIcon()}</span>
            <span class="menu-label">${item.label}</span>
          </div>`;
        }

        return html`<div class="menu-item" ${spread(api.getItemProps({ value: item.id }))}>
          <span class="menu-icon" aria-hidden="true">${item.icon === undefined ? nothing : unsafeHTML(item.icon)}</span>
          <span class="menu-label">${item.label}</span>
          ${item.shortcut === undefined ? nothing : html`<kbd class="key">${item.shortcut}</kbd>`}
        </div>`;
      }),
    ]);
  }

  // The item `value` was chosen: its `onSelect`, and the menu renders again (a choice's check moves).
  #select(sections: readonly Spec.MenuSection[], value: string): void {
    for (const section of sectionsOf(sections)) {
      section.items.find((item) => item.id === value)?.onSelect?.();
    }

    this.requestUpdate();
  }

  // A group (or a subgroup) in the rail: its button (its name as the tooltip), and a panel with its apps (the apps
  // without a subgroup first, then each subgroup with its name as a heading), at the button, touching the sidebar.
  #flyout(key: string, group: Group, label: string, icon: string | undefined): TemplateResult {
    const id = key.replace(/[^a-z0-9]+/gi, '-');
    const api = this.#menu(key, {
      placement: 'right-start',
      anchor: this.#besideSidebar(() => this.#el(`[data-flyout="${id}"]`)),
      onSelect: (value) => this.open(value),
    });
    const { loose, subgroups } = subgroupsOf(group.apps);
    const current = group.apps.some((app) => app.id === this.#active);
    const entry = (app: Spec.MiniApp) =>
      html`<div class="flyout-item" ?data-current=${app.id === this.#active} ${
        spread(api.getItemProps({ value: app.id }))
      }>${app.title}</div>`;

    return html`
      <button
        type="button"
        class="item"
        data-flyout=${id}
        aria-label=${label}
        aria-current=${ifDefined(current ? 'true' : undefined)}
        data-tip=${label}
        ${spread(api.getTriggerProps())}
      >${
      icon === undefined ? html`<span class="tile" aria-hidden="true">${initialsOf(label)}</span>` : groupIcon(icon)
    }</button>
      <div class="menu-positioner" ${spread(api.getPositionerProps())}>
        <div class="flyout" ${spread(api.getContentProps())}>
          <div class="flyout-title">${label}</div>
          ${loose.map(entry)}
          ${
      subgroups.map((subgroup) =>
        html`<div ${spread(api.getItemGroupProps({ id: `${id}-${subgroup.name}` }))}>
          <div class="flyout-label" ${spread(api.getItemGroupLabelProps({ htmlFor: `${id}-${subgroup.name}` }))}>
            ${subgroup.name}
          </div>
          ${subgroup.apps.map(entry)}
        </div>`
      )
    }
        </div>
      </div>
    `;
  }

  // --- Group select --------------------------------------------------------------------------------------------------

  // `top`: in the top line of the topbar (`nav="topbar-compact"`): a compact button, its popup a plain panel below the line.
  #groupSelect(texts: Texts, groups: Group[], value: string, top = false): TemplateResult {
    const collection = select.collection({
      items: groups,
      itemToValue: (group: Group) => group.name,
      itemToString: (group: Group) => this.#labelOf(group),
    });
    const api = this.#zag.use('select:group', select, {
      id: `${this.#id}-group`,
      getRootNode: () => this.renderRoot as ShadowRoot,
      collection,
      value: [value],
      positioning: top
        ? {
          placement: 'bottom-start',
          strategy: 'fixed',
          gutter: 0,
          sameWidth: false,
          getAnchorElement: (() => {
            const anchor = this.#anchor('group-select', this.#belowLine(() => this.#el('.group-select--top')));

            return () => anchor;
          })(),
        }
        : { placement: 'bottom-start', strategy: 'fixed', gutter: 4, sameWidth: true },
      onValueChange: ({ value: next }: { value: string[] }) => {
        this.#selectedGroup = next[0] ?? '';
        this.requestUpdate();
      },
    } as select.Props);
    const current = groups.find((group) => group.name === value);
    const icons = groups.some((group) => this.#groupIcon(group.name) !== undefined);

    return html`
      <button class=${top ? 'group-select group-select--top' : 'group-select'} aria-label=${texts.group} ${
      spread(api.getTriggerProps())
    }>
        ${icons && current !== undefined && !top ? groupIcon(this.#groupIcon(current.name)) : nothing}
        <span class="group-select-value">${current === undefined ? '' : this.#labelOf(current)}</span>
        ${current === undefined ? nothing : html`<span class="group-count">${current.apps.length}</span>`}
        <span class="group-select-icon">${selectorIcon()}</span>
      </button>
      <div class="select-positioner" ${spread(api.getPositionerProps())}>
        <div class="select-popup" ?data-drop=${top} ${spread(api.getContentProps())}>
          <div class="select-list">
            ${
      groups.map((group) =>
        html`<div class="select-item" ${spread(api.getItemProps({ item: group }))}>
          <span class="select-indicator" ${spread(api.getItemIndicatorProps({ item: group }))}>${checkIcon()}</span>
          ${icons ? groupIcon(this.#groupIcon(group.name)) : nothing}
          <span class="select-item-text">${this.#labelOf(group)}</span>
          <span class="select-item-count">${group.apps.length}</span>
        </div>`
      )
    }
          </div>
        </div>
      </div>
    `;
  }

  // --- User row ------------------------------------------------------------------------------------------------------

  // The signed-in user, above the footer: the avatar, the name and a second line. With a menu (`userMenu`), the row is a
  // button that opens it to the right of the sidebar, touching it; in the rail only the avatar (the name as the tooltip).
  #userRow(texts: Texts, rail: boolean, user: Spec.User): TemplateResult {
    const sections = this.#config.userMenu ?? [];
    const avatar = user.avatar === undefined
      ? html`<span class="avatar" aria-hidden="true">${initialsOf(user.name).toUpperCase()}</span>`
      : html`<img class="avatar" src=${user.avatar} alt="" />`;
    const content = html`
      ${avatar}
      <span class="user-text">
        <span class="user-name">${user.name}</span>
        ${user.detail === undefined ? nothing : html`<span class="user-detail">${user.detail}</span>`}
      </span>
    `;

    if (sectionsOf(sections).length === 0) {
      return html`<div class="user-row">
        <div class="user-button" aria-label=${ifDefined(rail ? user.name : undefined)} data-tip=${
        ifDefined(rail ? user.name : undefined)
      }>${content}</div>
      </div>`;
    }

    const api = this.#menu('user', {
      placement: 'right-end',
      anchor: this.#besideSidebar(() => this.#el('.user-button')),
      onSelect: (value) => this.#select(sections, value),
    });

    return html`<div class="user-row">
      <button
        class="user-button"
        aria-label="${texts.account}: ${user.name}"
        data-tip=${ifDefined(rail ? user.name : undefined)}
        ${spread(api.getTriggerProps())}
      >
        ${content}
        <svg class="icon icon--chevron-right" viewBox="0 0 24 24" aria-hidden="true"><path d="m10 7 5 5-5 5" /></svg>
      </button>
      <div class="menu-positioner" ${spread(api.getPositionerProps())}>
        <div class="menu-popup" data-flush ${spread(api.getContentProps())}>${this.#menuItems(api, sections)}</div>
      </div>
    </div>`;
  }

  // --- Footer --------------------------------------------------------------------------------------------------------

  // The footer of the sidebar: a dark bar of segments: the sidebar's toggle, the host's actions (icon buttons; with
  // `choices` a menu of options), and a kebab button with the host's menu. Its menus are plain panels: with the sidebar
  // expanded a sheet on top of the footer, as wide as the sidebar; in the rail to the right, touching the sidebar.
  // In the topbar, the same segments (without the toggle) at the right end of the top line, their menus below them.
  #footer(texts: Texts, rail: boolean, topbar = false): TemplateResult {
    const footer = this.#config.footer ?? {};
    const actions = footer.actions ?? [];
    const sections = footer.menu ?? [];
    const side = topbar ? 'bottom' : rail ? 'right' : 'top';
    const where = (button: string) =>
      topbar
        ? { placement: 'bottom-end' as const, anchor: this.#belowLine(() => this.#el(`.top-actions ${button}`)) }
        : rail
        ? {
          placement: 'right-end' as const,
          anchor: this.#besideSidebar(() => this.#el(button)),
        }
        : {
          placement: 'top-start' as const,
          anchor: () => this.#el('.footer')?.getBoundingClientRect() ?? new DOMRect(),
          sameWidth: true,
        };

    // An action with a menu of sections: like the kebab's menu, at this button.
    const sectionMenu = (action: Spec.Action, sections: readonly Spec.MenuSection[]) => {
      const api = this.#menu(`action:${action.id}`, {
        ...where(`[data-action="${action.id}"]`),
        onSelect: (value) => this.#select(sections, value),
      });

      return html`
        <button
          class="footer-button"
          data-action=${action.id}
          aria-label=${action.label}
          data-tip=${action.label}
          data-tip-side=${side}
          ${spread(api.getTriggerProps())}
        >${this.#actionIcon(action)}</button>
        <div class="menu-positioner" ${spread(api.getPositionerProps())}>
          <div class="menu-popup menu-popup--choices" ?data-flush=${!topbar} ?data-sheet=${
        !rail && !topbar
      } ?data-drop=${topbar} ${spread(api.getContentProps())}>${this.#menuItems(api, sections)}</div>
        </div>
      `;
    };

    const choiceMenu = (action: Spec.Action, choices: Spec.Choices) => {
      const button = `[data-action="${action.id}"]`;
      const api = this.#menu(`choice:${action.id}`, {
        ...where(button),
        onSelect: (value) => {
          choices.onChange(value);
          this.requestUpdate();
        },
      });
      const current = choices.options.find((option) => option.value === choices.value());
      const label = current === undefined ? action.label : `${action.label}: ${current.label}`;

      return html`
        <button
          class="footer-button"
          data-action=${action.id}
          aria-label=${label}
          data-tip=${label}
          data-tip-side=${side}
          ${spread(api.getTriggerProps())}
        >${this.#actionIcon(action)}</button>
        <div class="menu-positioner" ${spread(api.getPositionerProps())}>
          <div class="menu-popup menu-popup--choices" ?data-flush=${!topbar} ?data-sheet=${
        !rail && !topbar
      } ?data-drop=${topbar} ${spread(api.getContentProps())}>
            <div class="menu-group-label">${action.label}</div>
            ${
        choices.options.map((option) => {
          const checked = option.value === choices.value();

          return html`<div class="menu-item" ?data-checked=${checked} ${
            spread(api.getItemProps({ value: option.value }))
          }>
              <span class="menu-icon menu-check" ?data-checked=${checked}>${checkIcon()}</span>
              <span class="menu-label">${option.label}</span>
            </div>`;
        })
      }
          </div>
        </div>
      `;
    };

    const more = sectionsOf(sections).length === 0 ? undefined : this.#menu('more', {
      ...where('.footer-more'),
      onSelect: (value) => this.#select(sections, value),
    });

    return html`<div class=${
      topbar ? 'top-actions' : 'footer'
    } role="toolbar" aria-label=${texts.footer} aria-orientation=${rail ? 'vertical' : 'horizontal'}>
      ${
      this.#narrow || topbar
        ? nothing
        : html`<button
          type="button"
          class="footer-button footer-toggle"
          aria-label=${rail ? texts.expand : texts.collapse}
          aria-expanded=${!rail}
          data-tip=${rail ? texts.expand : texts.collapse}
          data-tip-side=${side}
          @click=${this.#toggleCollapsed}
        >${panelIcon()}</button>`
    }
      <div class="footer-actions">
        ${
      actions.map((action) =>
        action.menu !== undefined
          ? sectionMenu(action, action.menu)
          : action.choices === undefined
          ? html`<button
            type="button"
            class="footer-button"
            aria-label=${action.label}
            data-tip=${action.label}
            data-tip-side=${side}
            @click=${() => action.onSelect?.()}
          >${this.#actionIcon(action)}</button>`
          : choiceMenu(action, action.choices)
      )
    }
      </div>
      ${
      more === undefined ? nothing : html`
        <button
          class="footer-button footer-more"
          aria-label=${texts.more}
          data-tip=${texts.more}
          data-tip-side=${side}
          ${spread(more.getTriggerProps())}
        >${kebabIcon()}</button>
        <div class="menu-positioner" ${spread(more.getPositionerProps())}>
          <div class="menu-popup" ?data-flush=${!topbar} ?data-sheet=${!rail && !topbar} ?data-drop=${topbar} ${
        spread(more.getContentProps())
      }>
            ${this.#menuItems(more, sections)}
          </div>
        </div>
      `
    }
    </div>`;
  }

  #actionIcon(action: Spec.Action): TemplateResult {
    return html`<span class="footer-icon" aria-hidden="true">${unsafeHTML(action.icon)}</span>${
      action.badge === true ? html`<span class="footer-badge" aria-hidden="true"></span>` : nothing
    }`;
  }

  // --- Search --------------------------------------------------------------------------------------------------------

  // The search for apps: a dark panel as high as the cockpit, right next to the rail (the sidebar collapses while it
  // is open), over the open app (darkened). Without a query: the recent apps, then all apps by group. Up and Down
  // choose, Enter opens, Escape closes. The dialog's behavior (focus, Escape, outside clicks) is Zag's.
  #palette(texts: Texts): TemplateResult {
    const apps = this.#config.apps;
    const recent = this.#recentApps;
    const api = this.#zag.use('dialog:search', dialog, {
      id: `${this.#id}-search`,
      getRootNode: () => this.renderRoot as ShadowRoot,
      open: this.#paletteOpen,
      onOpenChange: ({ open }: { open: boolean }) => {
        if (!open) {
          this.#closePalette();
        }
      },
      initialFocusEl: () => this.#el('.palette-input'),
    } as dialog.Props);
    const sections: { label: string; matches: readonly Match[] }[] = this.#query.trim() !== ''
      ? [{ label: '', matches: search(apps, this.#query) }]
      : [
        ...(recent.length > 0 ? [{ label: texts.recent, matches: recent.map((app) => ({ app })) }] : []),
        ...groupsOf(apps).flatMap((group) => {
          const label = group.name === '' ? texts.other : group.name;

          if (!this.#switcher) {
            return [{ label, matches: group.apps.map((app) => ({ app })) }];
          }

          // The switcher's list: also by subgroup ("Group › Subgroup").
          const { loose, subgroups } = subgroupsOf(group.apps);

          return [
            ...(loose.length > 0 ? [{ label, matches: loose.map((app) => ({ app })) }] : []),
            ...subgroups.map((subgroup) => ({
              label: `${label} › ${subgroup.name}`,
              matches: subgroup.apps.map((app) => ({ app })),
            })),
          ];
        }),
      ];
    const flat = sections.flatMap((section) => section.matches);
    const current = flat[Math.min(this.#index, flat.length - 1)];
    const listId = `${this.#id}-results`;
    const choose = (id: string) => {
      this.#closePalette();
      this.open(id);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const step = ({ ArrowDown: 1, ArrowUp: -1, PageDown: 8, PageUp: -8 } as Record<string, number | undefined>)[
        event.key
      ];

      if (step !== undefined && flat.length > 0) {
        event.preventDefault();
        this.#index = Math.max(0, Math.min(flat.length - 1, this.#index + step));
        this.requestUpdate();
        void this.updateComplete.then(() =>
          this.#el('.palette-option[data-current]')?.scrollIntoView({ block: 'nearest' })
        );
      } else if (event.key === 'Enter' && current !== undefined) {
        event.preventDefault();
        choose(current.app.id);
      }
    };

    let position = -1;
    // Open, or sliding out.
    const shown = this.#paletteOpen || this.#paletteClosing !== undefined;

    return html`
      <div class="backdrop" ${spread({ ...api.getBackdropProps(), hidden: !shown })}></div>
      <div class="palette-layer" ?hidden=${!shown} ${spread(api.getPositionerProps())}>
        <div
          class="palette"
          @animationend=${(event: AnimationEvent) => {
      if (event.target === event.currentTarget) {
        this.#closed();
      }
    }}
          ${spread({ ...api.getContentProps(), hidden: !shown })}
        >
          <h2 class="visually-hidden" ${spread(api.getTitleProps())}>${texts.search}</h2>
          <div class="palette-field">
            ${searchIcon()}
            <input
              class="palette-input"
              type="text"
              role="combobox"
              aria-expanded="true"
              aria-controls=${listId}
              aria-activedescendant=${ifDefined(current === undefined ? undefined : `${listId}-${current.app.id}`)}
              aria-autocomplete="list"
              autocomplete="off"
              spellcheck="false"
              placeholder=${texts.searchPlaceholder}
              .value=${this.#query}
              @input=${(event: InputEvent) => {
      this.#query = (event.target as HTMLInputElement).value;
      this.#index = 0;
      this.requestUpdate();
    }}
              @keydown=${onKeyDown}
            />
            <kbd class="key">Esc</kbd>
          </div>
          <div id=${listId} class="palette-list" role="listbox" aria-label=${texts.search}>
            ${flat.length === 0 ? html`<p class="palette-empty">${texts.noResults}</p>` : nothing}
            ${
      sections.map((section) =>
        section.matches.length === 0
          ? nothing
          : html`<div role="group" aria-label=${ifDefined(section.label || undefined)}>
          ${section.label === '' ? nothing : html`<div class="palette-section">${section.label}</div>`}
          ${
            section.matches.map((match) => {
              position += 1;

              const at = position;
              const isCurrent = match === current;
              const { title, group, subgroup } = match.app;

              return html`<div
              id=${ifDefined(isCurrent ? `${listId}-${match.app.id}` : undefined)}
              class="palette-option"
              role="option"
              aria-selected=${isCurrent}
              ?data-current=${isCurrent}
              @mousemove=${() => {
                if (this.#index !== at) {
                  this.#index = at;
                  this.requestUpdate();
                }
              }}
              @click=${() => choose(match.app.id)}
            >
              ${appIcon(match.app)}
              <span class="palette-text">
                <span class="palette-title">${
                match.title === undefined
                  ? title
                  : html`${title.slice(0, match.title.start)}<mark>${
                    title.slice(match.title.start, match.title.end)
                  }</mark>${title.slice(match.title.end)}`
              }</span>
                ${
                match.app.description === undefined
                  ? nothing
                  : html`<span class="palette-description">${match.app.description}</span>`
              }
              </span>
              ${
                group !== undefined && section.label === ''
                  ? html`<span class="palette-group">${
                    subgroup === undefined ? group : `${group} › ${subgroup}`
                  }</span>`
                  : nothing
              }
              ${match.app.id === this.#active ? html`<span class="palette-dot" aria-hidden="true"></span>` : nothing}
            </div>`;
            })
          }
        </div>`
      )
    }
          </div>
          <footer class="palette-footer">
            <span><kbd class="key">↑</kbd><kbd class="key">↓</kbd> ${texts.move}</span>
            <span><kbd class="key">↵</kbd> ${texts.open}</span>
            <span><kbd class="key">Esc</kbd> ${texts.close}</span>
            <span class="palette-count">${texts.apps(this.#query.trim() === '' ? apps.length : flat.length)}</span>
          </footer>
        </div>
      </div>
    `;
  }
}
