import { computePosition, flip, offset, shift } from '@floating-ui/dom';
import { html, LitElement, nothing } from 'lit';
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
import { defineAppTaskbar } from './createAppTaskbarClass';
import {
  checkIcon,
  chevronIcon,
  closeIcon,
  gridIcon,
  groupIcon,
  initialsIcon,
  initialsOf,
  itemIcon,
  kebabIcon,
  menuIcon,
  panelIcon,
  searchIcon,
  selectorIcon,
} from './icons';
import { Menu } from './menu';
import type { MenuOptions } from './menu';
import { layoutStyles, styles } from './styles';

export { AppCockpitElement };

type Status = 'loading' | 'ready' | 'failed';

// An entry of the topbar's line: an item, a group (with more than one group, or with pinned items: a two-pane menu), or
// a subgroup (a dropdown of its items).
type Entry =
  | { kind: 'item'; item: Spec.NavItem }
  | { kind: 'group'; group: Group }
  | { kind: 'subgroup'; parent: string; group: Group };

// A pane of a two-pane menu of the topbar: a subgroup (`key` its name), or a
// group's items without a subgroup (`key` '', no heading).
type Pane = { key: string; heading?: string; icon?: string | undefined; items: readonly Spec.NavItem[] };

// The sidebar adapts to the number of items: up to `FEW` every item is listed, the groups are plain headings, no
// "Recent"; more: "Recent" on top and the groups collapsible (closed by default above `MANY`, except the open item's).
const FEW = 8;
const MANY = 30;
// Narrower than this (the cockpit's own width), the sidebar is always a rail.
const NARROW = 768;
// How many items "Recent" keeps.
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

// Whether any of the items has an icon (a menu of them then has an icon slot).
const hasIcons = (items: readonly Spec.NavItem[]) => items.some((item) => item.icon !== undefined);

const clamp = (value: number) => Math.round(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, value)));
const isMac = () => /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent);

let instances = 0;

// The cockpit, a Lit element. Its own UI in its shadow root (styled by `STYLES`); the mini-apps are its light-DOM
// children, shown through the default slot (their CSS is often global, which would not reach into a shadow root).
// The menus and the group select are `Menu`s (`menu.ts`), positioned by Floating UI; the search and the bottom bar's
// sheet are modal `<dialog>`s; the tooltips are one element positioned by Floating UI.
//
// - The first segment of the URL hash is the id of the open item (`#board-manager/…`; the rest belongs to the item). No
//   hash, or an unknown first segment at the start: `defaultItem`, else the first item. Opening an item pushes a history
//   entry.
// - An item is created when it is opened the first time (after its `load()`), and then kept: the others get `hidden`.
//   Its element gets `data-hash-segment` (its id), so tabs inside it know their level.
class AppCockpitElement extends LitElement implements Spec.Element {
  static override properties = {
    nav: { reflect: true },
    navScheme: { attribute: 'nav-scheme', reflect: true },
    density: { reflect: true },
    startPage: { attribute: 'start-page', type: Boolean, reflect: true },
    theme: { attribute: false },
  };

  // The attribute `nav`: `side` (the default), `top` (one line, two-pane menus), `top-switcher` (one line,
  // one dropdown with the open item), `bottom` (a bar at the bottom) or `auto` (the sidebar, the bottom bar when
  // narrow). An unknown value is the sidebar.
  declare nav: Spec.Nav;
  // The attribute `nav-scheme`: the navigation always dark (the default), or like the page (only CSS: `:host([nav-scheme])`).
  declare navScheme: Spec.NavScheme;
  // The attribute `density`: the sidebar's rows and gaps, `compact`, `normal` (the default) or `comfortable` (only CSS:
  // `:host([density])`).
  declare density: Spec.Density;
  // The attribute `start-page` (2026-10-08): a start page while no item is open; its first value the config's
  // `startPage`, switchable live. Switched off on the start page: `defaultItem`, else the first item, opens.
  declare startPage: boolean;
  // The theme (2026-10-10): its first value the config's `theme`, switchable live (a new object). The stylesheet is
  // built from it (`styles()`, `#themeSheet`); the values only known at run time (the resized sidebar, the switcher's
  // panel) are in a second one (`layoutStyles()`, `#layoutSheet`). No custom properties.
  declare theme: Spec.Theme;
  readonly #themeSheet = new CSSStyleSheet();
  readonly #layoutSheet = new CSSStyleSheet();
  #layoutText = '';

  readonly #config: Spec.Config;
  readonly #id = `cockpit${++instances}`;
  // The menus, by key (`#menu`).
  readonly #menuByKey = new Map<string, Menu>();
  readonly #elements = new Map<string, HTMLElement>();
  readonly #status = new Map<string, Status>();
  readonly #key: string;

  #active: string | undefined;
  // The open items (created, or being loaded), the one used last first: closing the open one shows the next.
  #used: string[] = [];
  // The same, in the order they were opened: the taskbar's entries.
  #opened: string[] = [];
  #recent: string[];
  #collapsed: boolean;
  #width: number | undefined;
  #openGroups: Record<string, boolean>;
  #narrow = false;
  #resizing = false;
  #paletteOpen = false;
  // The bottom bar's sheet with the whole navigation (the sidebar), open.
  #sheetOpen = false;
  // The search was opened with the sidebar expanded: its layer moves along while the sidebar collapses.
  #paletteFromExpanded = false;
  // The left edge of the switcher's button, where its panel opens (px from the frame's left).
  #switcherLeft: number | undefined;
  // The search slides out (sidebar layout): its dialog stays open until the animation ends.
  #paletteClosing: ReturnType<typeof setTimeout> | undefined;
  #query = '';
  #index = 0;
  // The start page's filter (`startPage`).
  #startPageQuery = '';
  // The group of the select (`groupDisplay: 'select'`): the open item's, and the user may look into another one.
  #selectedGroup: string | undefined;
  #tip: { text: string; target: Element; side: 'right' | 'top' | 'bottom' } | undefined;
  #tipTarget: Element | undefined;
  #tipTimer: ReturnType<typeof setTimeout> | undefined;
  #resizeObserver: ResizeObserver | undefined;
  #langObserver: MutationObserver | undefined;
  // How many entries of each line of the topbar do not fit (they go into its "More" menu), by the line's key.
  readonly #overflow = new Map<string, number>();
  // The group of the top line whose two-pane menu is open (`nav="top"`), by its key (`#entryKey`).
  #panelOpen: string | undefined;
  // The two-pane menu: the subgroup shown in its right pane (`#paneKey`); undefined: the open item's, else the first.
  #paneShown: string | undefined;
  #paneTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(config: Spec.Config) {
    super();
    this.nav = 'side';
    this.navScheme = 'dark';
    this.density = 'normal';
    this.startPage = config.startPage === true;
    this.theme = config.theme ?? {};
    this.#config = config;
    this.#key = config.storageKey ?? 'app-cockpit';
    this.#recent = readStored<string[]>(`${this.#key}:recent`, []);
    this.#collapsed = readStored(`${this.#key}:collapsed`, false);
    this.#width = readStored<number | undefined>(`${this.#key}:width`, undefined);
    this.#openGroups = readStored(`${this.#key}:groups`, {});

    if (config.taskbar === true) {
      defineAppTaskbar();
    }
  }

  get activeItem(): Spec.NavItem | undefined {
    return this.#itemOf(this.#active);
  }

  // Opens an item (from the navigation, the search, or the host's code).
  open(id: string): void {
    if (this.#itemOf(id) === undefined) {
      return;
    }

    if (this.#segment() !== id) {
      history.pushState(null, '', `${location.pathname}${location.search}#${id}`);
    }

    this.#show(id);
  }

  // Closes an open item: its element is removed (its state is lost). The open one: the one used before it is shown. The
  // last open item stays (the cockpit always shows one), except with a start page (`startPage`): then that is shown.
  close(id: string): void {
    if (!this.#used.includes(id) || (this.#used.length < 2 && !this.startPage)) {
      return;
    }

    this.#used = this.#used.filter((other) => other !== id);
    this.#opened = this.#opened.filter((other) => other !== id);
    this.#elements.get(id)?.remove();
    this.#elements.delete(id);
    this.#status.delete(id);

    if (this.#active === id && this.#used[0] !== undefined) {
      this.open(this.#used[0]);
    } else if (this.#active === id) {
      this.#openStartPage();
    } else {
      this.requestUpdate();
    }
  }

  // The start page (`startPage`): no item open; the hash goes (a history entry, like opening an item). Its filter gets the
  // focus.
  #openStartPage(): void {
    if (!this.startPage) {
      return;
    }

    if (location.hash !== '') {
      history.pushState(null, '', `${location.pathname}${location.search}`);
    }

    this.#show(undefined);
    void this.updateComplete.then(() => this.#el('.start-page-search-input')?.focus());
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#langObserver = new MutationObserver(() => this.requestUpdate());
    this.#langObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    window.addEventListener('hashchange', this.#onHashChange);
    document.addEventListener('keydown', this.#onShortcut);
    document.addEventListener('pointerdown', this.#onPointerDownOutside, true);
    window.addEventListener('resize', this.#fitDialogs);
    window.addEventListener('scroll', this.#fitDialogs, { capture: true, passive: true });
    this.#show(this.#itemOf(this.#segment())?.id ?? this.#defaultItem);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#closed();
    window.removeEventListener('hashchange', this.#onHashChange);
    document.removeEventListener('keydown', this.#onShortcut);
    document.removeEventListener('pointerdown', this.#onPointerDownOutside, true);
    window.removeEventListener('resize', this.#fitDialogs);
    window.removeEventListener('scroll', this.#fitDialogs, { capture: true });
    this.#langObserver?.disconnect();
    this.#resizeObserver?.disconnect();
    this.#closeMenus();
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
        this.#fitDialogs();
      });
      this.#resizeObserver.observe(frame);
    }
  }

  // The theme's stylesheet, then the layout's (see `theme`).
  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    const root = super.createRenderRoot();

    if (root instanceof ShadowRoot) {
      root.adoptedStyleSheets = [this.#themeSheet, this.#layoutSheet];
    }

    return root;
  }

  // The start page switched off while it is shown (after the start: `connectedCallback` chose already): an item opens.
  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('theme')) {
      this.#themeSheet.replaceSync(styles(this.theme));
    }

    const layout = layoutStyles(this.#width, this.#switcherLeft);

    if (layout !== this.#layoutText) {
      this.#layoutText = layout;
      this.#layoutSheet.replaceSync(layout);
    }

    if (changed.has('startPage') && !this.startPage && this.hasUpdated && this.#active === undefined) {
      const id = this.#defaultItem;

      if (id !== undefined) {
        this.open(id);
      }
    }
  }

  protected override updated(): void {
    this.#syncDialog(
      '.sheet-dialog',
      this.#bottom && this.#sheetOpen,
      () => this.#el('.sheet .item[aria-current]') ?? this.#el('.sheet-close'),
    );
    this.#syncDialog(
      '.palette-dialog',
      this.#paletteOpen || this.#paletteClosing !== undefined,
      () => this.#el('.palette-input'),
    );
    this.#placeTip();
    this.#measure();

    for (const menu of this.#menuByKey.values()) {
      menu.rendered();
    }
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

  // --- Dialogs -------------------------------------------------------------------------------------------------------

  // The search and the bottom bar's sheet are modal `<dialog>`s (2026-10-08; Zag.js before): the browser keeps the focus
  // inside, makes the rest of the page inert and gives the focus back when it closes. A modal dialog lies in the top
  // layer, placed against the window: it is set to the cockpit's rectangle (`#fitDialogs`), so its parts lie in the
  // cockpit as before. Escape, and a pointer down outside its panel, close it (`#dialogEvents`).
  #syncDialog(selector: string, open: boolean, focus: () => HTMLElement | null): void {
    const dialog = this.renderRoot.querySelector<HTMLDialogElement>(selector);

    if (dialog === null || dialog.open === open) {
      return;
    }

    if (open) {
      dialog.showModal();
      this.#fitDialogs();
      focus()?.focus();
    } else {
      dialog.close();
    }
  }

  // The open dialogs are as big as the cockpit, where it is (again on a resize or a scroll).
  readonly #fitDialogs = () => {
    const rect = this.#el('.mount')?.getBoundingClientRect();

    if (rect === undefined) {
      return;
    }

    for (const dialog of this.renderRoot.querySelectorAll<HTMLDialogElement>('dialog[open]')) {
      Object.assign(dialog.style, {
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      });
    }
  };

  // The events of a dialog: `close` runs on Escape (the browser's `cancel`, prevented: the cockpit closes it itself,
  // e.g. after an animation), a pointer down outside `panel`, and when the browser has closed it anyway.
  #dialogEvents(panel: string, isOpen: () => boolean, close: () => void) {
    return {
      cancel: (event: Event) => {
        event.preventDefault();
        close();
      },
      close: () => {
        if (isOpen()) {
          close();
        }
      },
      pointerdown: (event: PointerEvent) => {
        if ((event.target as Element).closest(panel) === null) {
          close();
        }
      },
    };
  }

  // --- Apps and routing ----------------------------------------------------------------------------------------------

  readonly #onHashChange = () => {
    const item = this.#itemOf(this.#segment());

    if (item !== undefined) {
      this.#show(item.id);
    } else if (location.hash === '') {
      this.#show(this.#defaultItem);
    }
  };

  #segment(): string {
    return decodeURIComponent(location.hash.slice(1).split('/')[0] ?? '');
  }

  // The item opened without a hash: the config's `defaultItem`, else the first item; with a start page (`startPage`), that.
  get #defaultItem(): string | undefined {
    return this.#itemOf(this.#config.defaultItem)?.id
      ?? (this.startPage ? undefined : this.#shownItems[0]?.id);
  }

  #itemOf(id: string | undefined): Spec.NavItem | undefined {
    return id === undefined ? undefined : this.#config.items.find((item) => item.id === id);
  }

  // Shows an item; none (an unknown id), with a start page (`startPage`): that.
  #show(id: string | undefined): void {
    const item = this.#itemOf(id);

    if (item === undefined) {
      if (this.startPage) {
        this.#active = undefined;
        this.#sheetOpen = false;
        this.#panelOpen = undefined;

        for (const element of this.#elements.values()) {
          element.hidden = true;
        }
      }

      this.requestUpdate();
      return;
    }

    this.#active = item.id;
    this.#selectedGroup = item.group ?? '';
    // The start page is whole again next time.
    this.#startPageQuery = '';
    // An item chosen in the bottom bar's sheet closes it, one chosen in a two-pane menu that.
    this.#sheetOpen = false;
    this.#panelOpen = undefined;
    this.#recent = [item.id, ...this.#recent.filter((other) => other !== item.id)].slice(0, RECENT);
    writeStored(`${this.#key}:recent`, this.#recent);
    this.#used = [item.id, ...this.#used.filter((other) => other !== item.id)];

    if (!this.#opened.includes(item.id)) {
      this.#opened = [...this.#opened, item.id];
    }

    for (const [other, element] of this.#elements) {
      element.hidden = other !== item.id;
    }

    if (!this.#elements.has(item.id)) {
      void this.#create(item);
    }

    this.requestUpdate();
  }

  async #create(item: Spec.NavItem): Promise<void> {
    if (this.#status.get(item.id) === 'loading') {
      return;
    }

    this.#status.set(item.id, 'loading');
    this.requestUpdate();

    try {
      await item.load?.();

      // Closed meanwhile (the taskbar), or created by a second load after a close and a new open.
      if (this.#status.get(item.id) !== 'loading' || this.#elements.has(item.id)) {
        return;
      }

      const element = document.createElement(item.element);

      for (const [name, value] of Object.entries(item.attributes ?? {})) {
        element.setAttribute(name, value);
      }

      element.setAttribute('data-hash-segment', item.id);
      element.hidden = this.#active !== item.id;
      this.#elements.set(item.id, element);
      this.append(element);
      this.#status.set(item.id, 'ready');
    } catch (error) {
      console.error(`app-cockpit: the item "${item.id}" could not be loaded.`, error);
      this.#status.set(item.id, 'failed');
    }

    this.requestUpdate();
  }

  // --- State helpers -------------------------------------------------------------------------------------------------

  get #texts(): Texts {
    return textsFor(document.documentElement.lang);
  }

  get #many(): boolean {
    return this.#shownItems.length > FEW;
  }

  // The items of the navigation, the search and the start page: all but the hidden ones (`placement`).
  get #shownItems(): readonly Spec.NavItem[] {
    return this.#config.items.filter((item) => item.placement !== 'hidden');
  }

  // The pinned items (`placement: 'pinned'`): entries of their own, first.
  get #pinnedItems(): readonly Spec.NavItem[] {
    return this.#config.items.filter((item) => item.placement === 'pinned');
  }

  // The items neither hidden nor pinned themselves (the start page's folders).
  get #unpinnedItems(): readonly Spec.NavItem[] {
    return this.#config.items.filter((item) => item.placement === undefined);
  }

  // The items in the groups of the topbar and the rail: neither hidden nor pinned, nor in a pinned folder.
  get #groupedItems(): readonly Spec.NavItem[] {
    return this.#unpinnedItems.filter((item) =>
      item.subgroup === undefined || this.#subgroupOf(item.group ?? '', item.subgroup)?.placement !== 'pinned'
    );
  }

  // The pinned folders (`groups[].subgroups[].placement`, 2026-10-08), with their items (not the pinned ones), in the
  // order of the items: in the topbar and the rail after the pinned items, each one entry.
  get #pinnedFolders(): Array<{ parent: string; group: Group }> {
    return groupsOf(this.#unpinnedItems).flatMap((group) =>
      subgroupsOf(group.items).subgroups
        .filter((subgroup) => this.#subgroupOf(group.name, subgroup.name)?.placement === 'pinned')
        .map((subgroup) => ({ parent: group.name, group: subgroup }))
    );
  }

  // The search panel: by the config, else with more than `FEW` items; always with the item switcher (it is its list).
  get #searchable(): boolean {
    return this.#switcher || (this.#config.search ?? this.#many);
  }

  // The item switcher (`nav="top-switcher"`): one dropdown with the open item in the top line; it opens the search
  // panel, which lists all items, at the button.
  get #switcher(): boolean {
    return this.#topbar && this.nav === 'top-switcher';
  }

  // The topbar: by the attribute, unless too narrow (then the sidebar's rail).
  get #topbar(): boolean {
    return (this.nav === 'top' || this.nav === 'top-switcher') && !this.#narrow;
  }

  // The topbar (`nav="top"`; `top-compact` until 2026-10-08, when the topbar of two lines was removed): one line, the
  // groups as entries, each a two-pane menu (a group select and the chosen group's items before, 2026-10-08).
  get #menus(): boolean {
    return this.#topbar && this.nav === 'top';
  }

  // The bottom bar (2026-10-06): `nav="bottom"`, or `nav="auto"` in a narrow cockpit (the sidebar else).
  get #bottom(): boolean {
    return this.nav === 'bottom' || (this.nav === 'auto' && this.#narrow);
  }

  // The rail: collapsed by the user, too narrow, or while the search is open (it takes the sidebar's place).
  get #rail(): boolean {
    return !this.#topbar && !this.#bottom && (this.#collapsed || this.#narrow || this.#paletteOpen);
  }

  get #recentItems(): Spec.NavItem[] {
    return this.#recent.flatMap((id) => this.#itemOf(id) ?? []).filter((item) => item.placement !== 'hidden');
  }

  // A subgroup's extra data in the config's `groups` (its icon, its placement).
  #subgroupOf(group: string, subgroup: string): Spec.Subgroup | undefined {
    return this.#config.groups?.find((candidate) => candidate.name === group)?.subgroups?.find((candidate) =>
      candidate.name === subgroup
    );
  }

  #subgroupIcon(group: string, subgroup: string): string | undefined {
    return this.#subgroupOf(group, subgroup)?.icon;
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

  // With the sidebar expanded, it collapses to the rail first, then the search slides in.
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

    this.#paletteFromExpanded = !this.#rail && !this.#topbar && !this.#bottom;
    this.#closed();
    this.#closeMenus();
    this.#sheetOpen = false;
    this.#panelOpen = undefined;
    this.#paletteOpen = true;
    this.#query = '';
    this.#index = Math.max(0, this.#recentItems.findIndex((item) => item.id === this.#active));
    this.requestUpdate();
  };

  #closePalette = () => {
    this.#paletteOpen = false;

    // A fallback, in case its animation does not end (e.g. not running in a hidden tab).
    if (!this.#topbar && !this.#bottom) {
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

  // Ctrl+K (⌘K on a Mac) opens the search, wherever the focus is. Escape closes an open two-pane menu, wherever the focus
  // is (inside the cockpit, it goes back to its entry).
  readonly #onShortcut = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.#panelOpen !== undefined) {
      event.preventDefault();
      this.#closePanel(this.matches(':focus-within'));
      return;
    }

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

  // A menu's anchor: from the sidebar's right edge, as high as its trigger (a popup to the right touches the sidebar,
  // level with its button).
  readonly #besideSidebar = (trigger: Element): DOMRect => {
    const rect = trigger.getBoundingClientRect();
    const right = this.#el('.sidebar')?.getBoundingClientRect().right ?? rect.right;

    return new DOMRect(right, rect.top, 0, rect.height);
  };

  // A menu's anchor: as wide as its trigger, at the bottom of its line of the topbar (a dropdown touches the line).
  readonly #belowLine = (trigger: Element): DOMRect => {
    const rect = trigger.getBoundingClientRect();
    const bottom = trigger.closest('.top-line')?.getBoundingClientRect().bottom ?? rect.bottom;

    return new DOMRect(rect.left, bottom, rect.width, 0);
  };

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

    // Not for a button whose menu is open (it would cover it).
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

    // A popover, in the top layer: also above an open dialog (the sheet's footer has tooltips).
    if (!tooltip.matches(':popover-open')) {
      tooltip.showPopover();
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
    const bottom = this.#bottom;
    const rail = this.#rail;
    const active = this.#itemOf(this.#active);
    const status = active === undefined ? 'ready' : this.#status.get(active.id) ?? 'loading';
    return html`
      <div
        class="mount"
        data-layout=${topbar ? 'topbar' : bottom ? 'bottom' : 'sidebar'}
        data-nav-style=${this.#switcher ? 'switcher' : 'tabs'}
        ?data-palette-from-expanded=${this.#paletteFromExpanded}
        ?data-palette-closing=${this.#paletteClosing !== undefined}
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
          ${topbar ? this.#topbarParts(texts) : bottom ? nothing : this.#sidebar(texts, rail)}
          <main class="main">
            <slot></slot>
            ${active === undefined && this.startPage ? this.#startPageView(texts) : nothing}
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
          ${this.#config.taskbar === true && !bottom ? this.#taskbar() : nothing}
          ${bottom ? this.#bottomBar(texts) : nothing}
        </div>
        ${bottom ? this.#sheet(texts) : nothing}
        ${this.#searchable ? this.#palette(texts) : nothing}
        ${
      this.#tip === undefined
        ? nothing
        : html`<div class="tooltip" role="tooltip" popover="manual" data-side=${this.#tip.side}>${this.#tip.text}</div>`
    }
      </div>
    `;
  }

  // The taskbar below the open item (`taskbar: true`, 2026-10-07): the open items in the order they were opened; the
  // last one cannot be closed, except with a start page (`startPage`). None open: no taskbar.
  #taskbar(): TemplateResult | typeof nothing {
    if (this.#opened.length === 0) {
      return nothing;
    }

    const closable = this.#opened.length > 1 || this.startPage;
    const tasks: Spec.Task[] = this.#opened.flatMap((id) => {
      const item = this.#itemOf(id);

      return item === undefined
        ? []
        : [{ id: item.id, title: item.title, ...(item.icon === undefined ? {} : { icon: item.icon }), closable }];
    });

    return html`<app-taskbar
      class="taskbar"
      .tasks=${tasks}
      .active=${this.#active}
      .theme=${this.theme}
      @task-select=${(event: CustomEvent<Spec.TaskEventDetail>) => this.open(event.detail.id)}
      @task-close=${(event: CustomEvent<Spec.TaskEventDetail>) => this.close(event.detail.id)}
      @task-move=${(event: CustomEvent<Spec.TaskMoveEventDetail>) =>
      this.#moveTask(event.detail.id, event.detail.index)}
    ></app-taskbar>`;
  }

  // A task dragged (or moved by the keys) to another place of the taskbar.
  #moveTask(id: string, index: number): void {
    if (!this.#opened.includes(id)) {
      return;
    }

    const others = this.#opened.filter((other) => other !== id);

    this.#opened = [...others.slice(0, index), id, ...others.slice(index)];
    this.requestUpdate();
  }

  // `sheet`: in the bottom bar's sheet (the whole sidebar, without its resize handle and toggle; a close button in
  // place of the search, which the bottom bar has).
  #sidebar(texts: Texts, rail: boolean, sheet = false): TemplateResult {
    return html`<aside class="sidebar">
            ${rail || sheet ? nothing : this.#resizeHandle(texts)}
            <div class="brand">
              ${this.#brand(texts, sheet ? undefined : rail)}
              ${
      sheet
        ? html`<button
              type="button"
              class="search-button sheet-close"
              aria-label=${texts.closeSheet}
              @click=${this.#closeSheet}
            >${closeIcon()}</button>`
        : this.#searchable && !rail
        ? this.#searchButton(texts, rail)
        : nothing
    }
            </div>
            ${this.#searchable && rail ? this.#searchButton(texts, rail) : nothing} ${this.#navigation(texts, rail)}
            <div class="sidebar-end"><slot name="sidebar-end"></slot></div>
            ${this.#config.user === undefined ? nothing : this.#userRow(texts, rail, this.#config.user)}
            ${this.#footer(texts, rail)}
          </aside>`;
  }

  // --- Start page (`startPage`, 2026-10-08) -------------------------------------------------------------------------------

  // While no item is open: the title and the subtitle, the filter (2026-10-08, the user's wish; a field that opened the
  // search panel before), and every item as a card (its icon, title and description; the dot of an open one, with the
  // taskbar), the pinned ones first, then by folder (`#folders`). In the page's scheme. No greeting.
  // The filter hides the cards that do not match (the search panel's matching, `search()`; their order stays), and the
  // folders without one; Enter opens the first card, Escape clears it, Down goes to the first card.
  #startPageView(texts: Texts): TemplateResult {
    const query = this.#startPageQuery;
    const matching = new Set(search(this.#shownItems, query).map(({ item }) => item.id));
    const sections = [
      // The pinned items (`placement`) first, without a heading.
      ...(this.#pinnedItems.length > 0 ? [{ label: undefined, icon: undefined, items: this.#pinnedItems }] : []),
      ...this.#folders(texts),
    ]
      .map((section) => ({ ...section, items: section.items.filter((item) => matching.has(item.id)) }))
      .filter((section) => section.items.length > 0);
    const setQuery = (value: string) => {
      this.#startPageQuery = value;
      this.requestUpdate();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const first = sections[0]?.items[0];

      if (event.key === 'Enter' && first !== undefined) {
        event.preventDefault();
        this.open(first.id);
      } else if (event.key === 'Escape' && query !== '') {
        event.preventDefault();
        event.stopPropagation();
        setQuery('');
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.#el('.start-page-card')?.focus();
      }
    };

    return html`<section class="start-page" aria-label=${texts.startPage}>
      <div class="start-page-inner">
        <header class="start-page-header">
          <h1 class="start-page-title">${this.#config.title ?? texts.navigation}</h1>
          ${
      this.#config.subtitle === undefined ? nothing : html`<p class="start-page-subtitle">${this.#config.subtitle}</p>`
    }
          ${
      this.#searchable
        ? html`<div class="start-page-search">
            ${searchIcon()}
            <input
              type="search"
              class="start-page-search-input"
              placeholder=${texts.searchPlaceholder}
              aria-label=${texts.search}
              autocomplete="off"
              spellcheck="false"
              .value=${query}
              @input=${(event: InputEvent) => setQuery((event.target as HTMLInputElement).value)}
              @keydown=${onKeyDown}
            />
            ${
          query === ''
            ? nothing
            : html`<button
                type="button"
                class="start-page-search-clear"
                aria-label=${texts.clearSearch}
                data-tip=${texts.clearSearch}
                data-tip-side="bottom"
                @click=${() => {
              setQuery('');
              this.#el('.start-page-search-input')?.focus();
            }}
              >${closeIcon()}</button>`
        }
          </div>`
        : nothing
    }
        </header>
        ${sections.length === 0 ? html`<p class="start-page-empty" role="status">${texts.noResults}</p>` : nothing}
        ${
      sections.map(({ label, icon, items }) =>
        html`<section class="start-page-section">
            ${
          label === undefined
            ? nothing
            : html`<h2 class="start-page-heading">${groupIcon(icon)}<span>${label}</span></h2>`
        }
            <ul class="start-page-grid">${
          items.map((item) =>
            html`<li><button type="button" class="start-page-card" @click=${() => this.open(item.id)}>
                ${itemIcon(item, 'framed')}
                <span class="start-page-card-text">
                  <span class="start-page-card-title">${item.title}${
              this.#config.taskbar === true && this.#opened.includes(item.id)
                ? html`<span class="running-dot" aria-hidden="true"></span>`
                : nothing
            }</span>
                  ${
              item.description === undefined
                ? nothing
                : html`<span class="start-page-card-description">${item.description}</span>`
            }
                </span>
              </button></li>`
          )
        }</ul>
          </section>`
      )
    }
      </div>
    </section>`;
  }

  // The folders of the start page, in the order of the groups: a group's items without a subgroup as one folder
  // ("General"), then its subgroups (their names and icons); the pinned and hidden items left out.
  #folders(texts: Texts): Array<{ label: string; icon: string | undefined; items: readonly Spec.NavItem[] }> {
    return groupsOf(this.#unpinnedItems).flatMap((group) => {
      const { loose, subgroups } = subgroupsOf(group.items);

      return [...(loose.length > 0 ? [{ name: '', items: loose }] : []), ...subgroups].map((folder) => ({
        label: folder.name === '' ? texts.general : folder.name,
        icon: folder.name === '' ? undefined : this.#subgroupIcon(group.name, folder.name),
        items: folder.items,
      }));
    });
  }

  // --- Bottom bar ----------------------------------------------------------------------------------------------------

  readonly #openSheet = () => {
    this.#sheetOpen = true;
    this.requestUpdate();
  };

  readonly #closeSheet = () => {
    this.#sheetOpen = false;
    this.requestUpdate();
  };

  // The bottom bar (`nav="bottom"`, or `auto` in a narrow cockpit; 2026-10-06): the open item takes the whole height,
  // with a bar below it: "Apps" (a sheet with the whole sidebar: the navigation, the user, the footer), the three items
  // used last (in the order of the config, so they do not move with every switch; the open one marked), and the search.
  #bottomBar(texts: Texts): TemplateResult {
    const order = (item: Spec.NavItem) => this.#config.items.indexOf(item);
    const items = this.#recentItems.slice(0, 3).sort((a, b) => order(a) - order(b));

    return html`<nav class="bottombar" aria-label=${texts.navigation}>
      <button
        type="button"
        class="bottom-item"
        aria-haspopup="dialog"
        aria-expanded=${this.#sheetOpen}
        @click=${this.#openSheet}
      >${menuIcon()}<span class="bottom-label">${texts.navigation}</span></button>
      ${
      repeat(items, (item) => item.id, (item) =>
        html`<button
          type="button"
          class="bottom-item"
          aria-current=${ifDefined(item.id === this.#active ? 'page' : undefined)}
          @click=${() => this.open(item.id)}
        >${itemIcon(item, true)}<span class="bottom-label">${item.title}</span></button>`)
    }
      ${
      this.#searchable
        ? html`<button type="button" class="bottom-item" @click=${this.#openPalette}>
          ${searchIcon()}<span class="bottom-label">${texts.searchShort}</span>
        </button>`
        : nothing
    }
    </nav>`;
  }

  // The sheet of the bottom bar: the whole sidebar (navigation, user, footer) in a panel from the bottom, a modal dialog
  // (`#syncDialog`: focus inside, on the open item; Escape and a pointer down outside close it). Choosing an item
  // closes it.
  #sheet(texts: Texts): TemplateResult {
    const open = this.#sheetOpen;
    const events = this.#dialogEvents('.sheet', () => this.#sheetOpen, this.#closeSheet);

    return html`<dialog
      class="dialog sheet-dialog"
      aria-labelledby=${`${this.#id}-sheet-title`}
      @cancel=${events.cancel}
      @close=${events.close}
      @pointerdown=${events.pointerdown}
    >
      <div class="sheet-backdrop"></div>
      <div class="sheet-layer">
        <div class="sheet">
          <h2 class="visually-hidden" id=${`${this.#id}-sheet-title`}>${texts.navigation}</h2>
          ${open ? this.#sidebar(texts, false, true) : nothing}
        </div>
      </div>
    </dialog>`;
  }

  // The logo (the slot `logo`), the title and the subtitle.
  // With a start page (`startPage`), the logo is a button that opens it, in every layout (2026-10-08, the user's wish: the
  // title for a few hours before; only a pointer, no tooltip). Else, in the sidebar (not when it is always a rail, below
  // 768px), the logo is a button that toggles the sidebar, like the footer's toggle.
  #brand(texts: Texts, rail?: boolean): TemplateResult {
    const logo = html`<slot name="logo"><span class="brand-logo" aria-hidden="true">${gridIcon()}</span></slot>`;
    const label = rail ? texts.expand : texts.collapse;

    return html`${
      this.startPage
        ? html`<button type="button" class="brand-start-page" aria-label=${texts.startPage} @click=${() =>
          this.#openStartPage()}>${logo}</button>`
        : rail === undefined || this.#narrow
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
        <span class="brand-title">${this.#config.title ?? texts.navigation}</span>
        ${
      this.#config.subtitle === undefined ? nothing : html`<span class="brand-subtitle">${this.#config.subtitle}</span>`
    }
      </span>`;
  }

  // The search: an icon button with a tooltip ("Search items (Ctrl K)"); next to the title, or below the logo in the rail.
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

  #item(item: Spec.NavItem, rail: boolean): TemplateResult {
    const current = item.id === this.#active;
    return html`<button
      type="button"
      class="item"
      aria-current=${ifDefined(current ? 'page' : undefined)}
      aria-label=${ifDefined(rail ? item.title : undefined)}
      title=${ifDefined(rail ? undefined : item.description)}
      data-tip=${ifDefined(rail ? item.title : undefined)}
      @click=${() => this.open(item.id)}
    >${this.#iconAndTitle(item, rail, html`<span class="item-title">${item.title}</span>`)}</button>`;
  }

  // An item's icon and title. With the taskbar, an open item (one of its tasks) gets a dot, like the open one in the
  // search panel: right after its title (the end of the row is kept for badges); in the rail (`rail`: no titles, the framed
  // initials without an icon) on the corner of its icon. `framed`: the framed initials without an icon (the flyouts).
  #iconAndTitle(item: Spec.NavItem, rail: boolean, title: unknown, framed = false): TemplateResult {
    const dot = this.#config.taskbar === true && this.#opened.includes(item.id)
      ? html`<span class="running-dot" aria-hidden="true"></span>`
      : nothing;

    return rail
      ? html`${itemIcon(item, 'framed', dot)}${title}`
      : html`${itemIcon(item, framed ? 'framed' : false)}${title}${dot}`;
  }

  #section(label: string, items: TemplateResult[]): TemplateResult {
    return html`<section class="section">
      ${label === '' ? html`<hr class="section-rule" />` : html`<h2 class="section-label">${label}</h2>`}
      <ul class="list">${items}</ul>
    </section>`;
  }

  // The items of a group as a tree: the items without a subgroup, then each subgroup (collapsible, open by default) with
  // its items. In the rail: the items without a subgroup as icons, each subgroup as one button with a flyout.
  #tree(group: Group, rail: boolean): TemplateResult[] {
    const { loose, subgroups } = subgroupsOf(group.items);
    const looseItems = loose.map((item) => html`<li>${this.#item(item, rail)}</li>`);

    if (rail) {
      return [
        ...looseItems,
        ...subgroups.map((subgroup) =>
          html`<li>${
            this.#flyout(
              `sub:${group.name}/${subgroup.name}`,
              { name: subgroup.name, items: subgroup.items.map(({ subgroup: _subgroup, ...item }) => item) },
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
              <span class="subgroup-count">${subgroup.items.length}</span>
            </button>
            <div class="group-panel" ?hidden=${!open}>
              <ul class="list subgroup-list">${
          subgroup.items.map((item) => html`<li>${this.#item(item, rail)}</li>`)
        }</ul>
            </div>
          </div>
        </li>`;
      }),
    ];
  }

  // The expanded sidebar (and the bottom bar's sheet) ignores pinning (2026-10-08, the user's wish: it shows every item
  // in its group anyway); the rail has the pinned items (`placement`) first, as icons, not in their subgroup's flyout,
  // then the pinned folders, each its flyout button.
  #navigation(texts: Texts, rail: boolean): TemplateResult {
    const items = this.#shownItems;
    const many = this.#many;
    const groups = groupsOf(rail ? this.#groupedItems : items);
    const pinned = rail
      ? [
        ...this.#pinnedItems.map((item) => html`<li>${this.#item(item, rail)}</li>`),
        ...this.#pinnedFolders.map(({ parent, group }) =>
          html`<li>${
            this.#flyout(
              `sub:${parent}/${group.name}`,
              { name: group.name, items: group.items.map(({ subgroup: _subgroup, ...item }) => item) },
              group.name,
              this.#subgroupIcon(parent, group.name),
            )
          }</li>`
        ),
      ]
      : [];
    const nav = (content: unknown) =>
      html`<nav class="nav" aria-label=${texts.navigation} @keydown=${this.#onNavKeyDown}>${
        pinned.length > 0 ? this.#section('', pinned) : nothing
      }${content}</nav>`;

    // The rail of many items (2026-10-07): the structure of the sidebar without the headings (a group has no icon): the
    // items as icons, each subgroup as one button with a flyout, a rule between the groups. Above `MANY` items it
    // would be too long: the recent items and the open one (the search finds the rest).
    if (rail && many) {
      if (items.length <= MANY) {
        return nav(
          html`<ul class="list">${
            groups.map((group, index) =>
              html`${index === 0 ? nothing : html`<li><hr class="section-rule" /></li>`}${this.#tree(group, rail)}`
            )
          }</ul>`,
        );
      }

      const shown = this.#recentItems.filter((item) => item.placement !== 'pinned');
      const active = this.#itemOf(this.#active);

      if (active !== undefined && !shown.some((item) => item.id === active.id)) {
        shown.unshift(active);
      }

      return nav(html`<ul class="list">${shown.map((item) => html`<li>${this.#item(item, rail)}</li>`)}</ul>`);
    }

    // One group at a time: the select on top, the items of the chosen group below it.
    if (this.#config.groupDisplay === 'select' && !rail && groups.length > 1) {
      const group = groups.find((candidate) => candidate.name === this.#selectedGroup) ?? groups[0];

      return html`${this.#groupSelect(texts, groups, group?.name ?? '')}
      ${nav(group === undefined ? nothing : html`<ul class="list">${this.#tree(group, rail)}</ul>`)}`;
    }

    const recent = this.#config.recent === false ? [] : this.#recentItems;

    return nav(html`
      ${
      many && recent.length > 0
        ? this.#section(texts.recent, recent.map((item) => html`<li>${this.#item(item, rail)}</li>`))
        : nothing
    }
      ${
      groups.map((group) => {
        const label = group.name === '' ? (groups.length > 1 && many ? texts.other : '') : group.name;
        const list = this.#tree(group, rail);

        if (rail || !many || label === '' || this.#config.collapsibleGroups === false) {
          return this.#section(rail ? '' : label, list);
        }

        const open = this.#openGroups[group.name]
          ?? (items.length <= MANY || group.name === (this.#itemOf(this.#active)?.group ?? '') || group.name === '');
        return html`<div class="group">
          <button
            type="button"
            class="group-trigger"
            aria-expanded=${open}
            ?data-panel-open=${open}
            @click=${() => this.#setOpenGroup(group.name, !open)}
          >
            ${chevronIcon()}
            <span class="group-name">${label}</span>
            <span class="group-count">${group.items.length}</span>
          </button>
          <div class="group-panel" ?hidden=${!open}><ul class="list">${list}</ul></div>
        </div>`;
      })
    }
    `);
  }

  // --- Topbar --------------------------------------------------------------------------------------------------------

  // The topbar (`nav="top"`, one line; 2026-10-08: two lines, the groups and below them the chosen group's items, until
  // then, and this one was `top-compact`): a dark line with the logo and the title, the pinned items (`placement`) as
  // tabs, the groups as entries, each opening a two-pane menu, and on the right the search, the footer's actions and
  // menu, and the user. With one group and no pinned items, its items (and subgroup dropdowns) are the entries.
  // Entries that do not fit go into a "More" menu at the end of the line. `top-switcher`: one dropdown in place of them.
  #topbarParts(texts: Texts): TemplateResult {
    const groups = groupsOf(this.#groupedItems);
    // The pinned items, then the pinned folders (each a dropdown of its items).
    const pinned: Entry[] = [
      ...this.#pinnedItems.map((item) => ({ kind: 'item' as const, item })),
      ...this.#pinnedFolders.map(({ parent, group }) => ({ kind: 'subgroup' as const, parent, group })),
    ];
    const many = groups.length > 1 || (pinned.length > 0 && groups.length > 0);
    const group = groups[0];
    const switcher = this.#switcher;
    const panes = this.#menus && many;
    const top: Entry[] = [
      ...pinned,
      ...(many
        ? groups.map((candidate) => ({ kind: 'group' as const, group: candidate }))
        : group === undefined
        ? []
        : this.#entries(group)),
    ];
    const user = this.#config.user;

    return html`<header class="topbar" ?data-panes=${panes}>
      <div class="top-line">
        <div class="brand">${this.#brand(texts)}</div>
        ${switcher ? this.#switcherButton(texts) : nothing}
        ${
      switcher
        ? html`<div class="line"></div>`
        : html`<nav class="line" aria-label=${texts.navigation} @keydown=${this.#onLineKeyDown}>${
          this.#line('top', top, texts)
        }</nav>`
    }
        ${this.#searchable && !switcher ? this.#searchButton(texts, false) : nothing} ${
      this.#footer(texts, false, true)
    }
        ${user === undefined ? nothing : this.#topUser(texts, user)}
      </div>
      ${panes ? this.#panePanel(top, texts) : nothing}
    </header>`;
  }

  // --- Two-pane menus (`nav="top"`, 2026-10-08) ---------------------------------------------------------------------

  // The disclosure pattern of site navigation (WAI): the groups in the top line are buttons (`aria-expanded`) that open
  // the group's menu. A click opens and closes; while one is open, hovering another group switches to it; Down opens it
  // and goes into it. Escape, a click outside, the focus leaving the topbar and choosing an item close it.
  #panelEntry(group: Group): TemplateResult {
    const key = this.#entryKey({ kind: 'group', group });
    const open = this.#panelOpen === key;
    const current = group.items.some((item) => item.id === this.#active);

    return html`<button
      type="button"
      class="tab tab--menu"
      data-panel-entry=${key}
      aria-expanded=${open}
      aria-controls=${`${this.#id}-panel`}
      aria-current=${ifDefined(current ? 'true' : undefined)}
      @click=${() => this.#togglePanel(key)}
      @pointerenter=${(event: PointerEvent) => {
      // Switching while one is open (the mouse only: a touch is a click).
      if (event.pointerType === 'mouse' && this.#panelOpen !== undefined && this.#panelOpen !== key) {
        this.#togglePanel(key);
      }
    }}
      @keydown=${(event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.#togglePanel(key, true);
        // Its shown subgroup (the first in the document), else (one column) its first item.
        void this.updateComplete.then(() =>
          this.#el('[data-panel] .pane-tab[aria-selected="true"], [data-panel] .panel-item')?.focus()
        );
      }
    }}
    ><span class="tab-title">${this.#labelOf(group)}</span>${chevronIcon()}</button>`;
  }

  #togglePanel(key: string, open = this.#panelOpen !== key): void {
    this.#panelOpen = open ? key : undefined;
    this.#paneShown = undefined;
    clearTimeout(this.#paneTimer);
    this.requestUpdate();
  }

  // Closes the open two-pane menu; `focus`: back to its entry (Escape).
  #closePanel(focus = false): void {
    const key = this.#panelOpen;

    if (key === undefined) {
      return;
    }

    this.#panelOpen = undefined;
    this.requestUpdate();

    if (focus) {
      this.#el(`[data-panel-entry="${CSS.escape(key)}"]`)?.focus();
    }
  }

  // A pointer down outside the panel and its entries closes it (also on the topbar's other buttons).
  readonly #onPointerDownOutside = (event: PointerEvent) => {
    if (this.#panelOpen === undefined) {
      return;
    }

    const path = event.composedPath();
    const inside = path.some((target) =>
      target instanceof Element && (target.hasAttribute('data-panel') || target.hasAttribute('data-panel-entry'))
    );

    if (!inside) {
      this.#closePanel();
    }
  };

  // The open entry of the top line (a group or a subgroup), if any.
  #openGroup(entries: Entry[]): Group | undefined {
    const entry = entries.find((candidate) =>
      candidate.kind === 'group' && this.#entryKey(candidate) === this.#panelOpen
    );

    return entry?.kind === 'group' ? entry.group : undefined;
  }

  // The panes of a group's menu: its items without a subgroup (no heading, `key` ''), then one per subgroup (its name
  // and icon).
  #panes(group: Group): Pane[] {
    const { loose, subgroups } = subgroupsOf(group.items);

    return [
      ...(loose.length > 0 ? [{ key: '', items: loose }] : []),
      ...subgroups.map((subgroup) => ({
        key: subgroup.name,
        heading: subgroup.name,
        icon: this.#subgroupIcon(group.name, subgroup.name),
        items: subgroup.items,
      })),
    ];
  }

  // The focus has left the topbar (not to nowhere: a click on a panel's free space): the panel closes.
  readonly #onPanelFocusOut = (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null;
    const topbar = this.#el('.topbar');

    if (next !== null && topbar !== null && !topbar.contains(next)) {
      this.#closePanel();
    }
  };

  // An item of a panel: its icon, its title (the dot of an open one, with the taskbar) and its description.
  #panelItem(item: Spec.NavItem): TemplateResult {
    return html`<li><button
      type="button"
      class="panel-item"
      aria-current=${ifDefined(item.id === this.#active ? 'page' : undefined)}
      @click=${() => this.open(item.id)}
    >${itemIcon(item)}<span class="panel-text"><span class="panel-title">${item.title}${
      this.#config.taskbar === true && this.#opened.includes(item.id)
        ? html`<span class="running-dot" aria-hidden="true"></span>`
        : nothing
    }</span>${
      item.description === undefined ? nothing : html`<span class="panel-description">${item.description}</span>`
    }</span></button></li>`;
  }

  #panelHeading(column: Pane): TemplateResult | typeof nothing {
    return column.heading === undefined
      ? nothing
      : html`<h3 class="panel-heading">${groupIcon(column.icon)}<span>${column.heading}</span></h3>`;
  }

  // The menu of the open group, below its entry: on the left its subgroups (its items without a subgroup first, as
  // "General"), on the right the items of the shown one, with their descriptions. The left pane is a vertical tablist,
  // the right one its tabpanel; all right panes lie in one grid cell (the hidden ones invisible), so the menu keeps its
  // height while switching. A group of one column (e.g. one subgroup): only the right pane, with its heading.
  #panePanel(entries: Entry[], texts: Texts): TemplateResult {
    const group = this.#openGroup(entries);
    const id = `${this.#id}-panel`;

    if (group === undefined) {
      return html`<div class="pane-menu" id=${id} data-panel hidden></div>`;
    }

    const columns = this.#panes(group);
    const activeColumn = columns.find((column) => column.items.some((item) => item.id === this.#active));
    const shown = columns.find((column) => column.key === this.#paneShown) ?? activeColumn ?? columns[0];
    const single = columns.length === 1;
    // Below its entry: the entry's left edge, from the topbar's (the menu's containing block).
    const left =
      (this.#el(`[data-panel-entry="${CSS.escape(this.#panelOpen ?? '')}"]`)?.getBoundingClientRect().left ?? 0)
      - (this.#el('.topbar')?.getBoundingClientRect().left ?? 0);

    return html`<div
      class="pane-menu"
      id=${id}
      data-panel
      role="group"
      aria-label=${this.#labelOf(group)}
      ?data-single=${single}
      style=${styleMap({ left: `${left}px` })}
      @keydown=${this.#onPaneKeyDown}
      @focusout=${this.#onPanelFocusOut}
    >
      ${
      single
        ? nothing
        : html`<div class="pane-tabs" role="tablist" aria-orientation="vertical">${
          columns.map((column) => {
            const selected = column === shown;
            const current = column === activeColumn;

            return html`<button
              type="button"
              class="pane-tab"
              role="tab"
              id=${`${id}-tab-${column.key.replace(/[^a-z0-9]+/gi, '-')}`}
              aria-selected=${selected}
              aria-controls=${`${id}-pane`}
              tabindex=${selected ? 0 : -1}
              ?data-current=${current}
              @click=${() => this.#showPane(column.key)}
              @focus=${() => this.#showPane(column.key)}
              @pointerenter=${(event: PointerEvent) => {
              // After a moment: a mouse on its way to the right pane does not switch.
              if (event.pointerType === 'mouse') {
                clearTimeout(this.#paneTimer);
                this.#paneTimer = setTimeout(() => this.#showPane(column.key), 120);
              }
            }}
              @pointerleave=${() => clearTimeout(this.#paneTimer)}
            >${groupIcon(column.icon)}<span class="pane-tab-title">${
              column.heading ?? texts.general
            }</span>${chevronIcon()}</button>`;
          })
        }</div>`
    }
      <div class="pane-stack">${
      columns.map((column) =>
        html`<div
            class="pane"
            id=${ifDefined(column === shown ? `${id}-pane` : undefined)}
            role=${ifDefined(single ? undefined : 'tabpanel')}
            aria-labelledby=${ifDefined(single ? undefined : `${id}-tab-${column.key.replace(/[^a-z0-9]+/gi, '-')}`)}
            ?data-shown=${column === shown}
            ?inert=${column !== shown}
          >
            ${single ? this.#panelHeading(column) : nothing}
            <ul class="panel-list">${column.items.map((item) => this.#panelItem(item))}</ul>
          </div>`
      )
    }</div>
    </div>`;
  }

  #showPane(key: string): void {
    clearTimeout(this.#paneTimer);

    if (this.#paneShown !== key) {
      this.#paneShown = key;
      this.requestUpdate();
    }
  }

  // Up and Down (Home, End) in a pane (on the left they also show the subgroup); Right from the left pane to the first
  // item on the right, Left back to the shown subgroup. Escape: `#onShortcut`.
  readonly #onPaneKeyDown = (event: KeyboardEvent) => {
    const target = event.composedPath()[0] as Element;
    const tabs = [...this.renderRoot.querySelectorAll<HTMLButtonElement>('.pane-tab')];
    const items = [...this.renderRoot.querySelectorAll<HTMLButtonElement>('.pane[data-shown] .panel-item')];
    const inTabs = target.classList.contains('pane-tab');
    const buttons = inTabs ? tabs : items;
    const index = buttons.indexOf(target as HTMLButtonElement);

    if (index < 0) {
      return;
    }

    const selectedTab = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true');
    const next = ({
      ArrowDown: buttons[index + 1],
      ArrowUp: buttons[index - 1],
      Home: buttons[0],
      End: buttons.at(-1),
      ArrowRight: inTabs ? items[0] : undefined,
      ArrowLeft: inTabs ? undefined : selectedTab,
    } as Record<string, HTMLButtonElement | undefined>)[event.key];

    if (next !== undefined) {
      event.preventDefault();
      // A tab shows its pane when focused (`@focus`); the right pane's items exist already.
      next.focus();
    }
  };

  // The item switcher: the open item (its icon and title) as a dropdown button; it opens the search panel at it.
  #switcherButton(texts: Texts): TemplateResult {
    const active = this.#itemOf(this.#active);
    const label = `${texts.switchItem} (${isMac() ? '⌘K' : 'Ctrl K'})`;

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
      ${active === undefined ? nothing : itemIcon(active)}
      <span class="switcher-title">${active?.title ?? texts.switchItem}</span>
      ${selectorIcon()}
    </button>`;
  }

  // The entries of a group: its items without a subgroup, then its subgroups.
  #entries(group: Group): Entry[] {
    const { loose, subgroups } = subgroupsOf(group.items);

    return [
      ...loose.map((item) => ({ kind: 'item' as const, item })),
      ...subgroups.map((subgroup) => ({ kind: 'subgroup' as const, parent: group.name, group: subgroup })),
    ];
  }

  // A line of entries; Left and Right (Home, End) move between them. Those that wrap are hidden (the line is one row
  // high) and listed in the "More" menu.
  #line(key: string, entries: Entry[], texts: Texts): TemplateResult {
    const hidden = Math.min(this.#overflow.get(key) ?? 0, entries.length);

    return html`<ul class="line-list" data-overflow=${key}>${
      repeat(entries, (entry) => this.#entryKey(entry), (entry) => html`<li>${this.#entry(entry)}</li>`)
    }</ul>
      ${hidden > 0 ? this.#lineMore(key, entries.slice(entries.length - hidden), texts) : nothing}`;
  }

  #entryKey(entry: Entry): string {
    return entry.kind === 'item'
      ? `item:${entry.item.id}`
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

  #entry(entry: Entry): TemplateResult {
    if (entry.kind === 'item') {
      const { item } = entry;

      return html`<button
        type="button"
        class="tab"
        aria-current=${ifDefined(item.id === this.#active ? 'page' : undefined)}
        title=${ifDefined(item.description)}
        @click=${() => this.open(item.id)}
      >${itemIcon(item)}<span class="tab-title">${item.title}</span></button>`;
    }

    if (entry.kind === 'group') {
      return this.#panelEntry(entry.group);
    }

    // A subgroup: a dropdown of its items.
    const { parent, group } = entry;
    const menu = this.#menu(`tab:${parent}/${group.name}`, {
      placement: 'bottom-start',
      anchor: this.#belowLine,
      onSelect: (id) => this.open(id),
    });
    const current = group.items.some((item) => item.id === this.#active);

    // No icon: a dropdown in the line is text only, like the groups (2026-10-08).
    return html`<button
        type="button"
        class="tab tab--menu"
        aria-current=${ifDefined(current ? 'true' : undefined)}
        id=${menu.triggerId}
        aria-haspopup="menu"
        aria-expanded=${menu.open}
        aria-controls=${menu.popupId}
        data-state=${menu.open ? 'open' : 'closed'}
        @click=${menu.toggle}
        @keydown=${menu.onTriggerKeyDown}
      ><span class="tab-title">${group.name}</span>${chevronIcon()}</button>
      ${
      this.#menuPopup(
        menu,
        { class: 'menu-popup', drop: true },
        group.items.map((item) => this.#itemMenuEntry(menu, item, hasIcons(group.items))),
      )
    }`;
  }

  // An item of a dropdown of the line; `icons`: the menu has an icon slot (some of its items have an icon), so the
  // titles stay aligned.
  #itemMenuEntry(menu: Menu, item: Spec.NavItem, icons: boolean): TemplateResult {
    return html`<div
      class="menu-item"
      role="menuitem"
      id=${menu.itemId(item.id)}
      data-value=${item.id}
      ?data-highlighted=${menu.highlighted === item.id}
      ?data-current=${item.id === this.#active}
    >${
      icons
        ? html`<span class="menu-icon menu-icon--item" aria-hidden="true">${
          item.icon === undefined ? nothing : unsafeHTML(item.icon)
        }</span>`
        : nothing
    }<span class="menu-label">${item.title}</span></div>`;
  }

  // The "More" menu of the line: its hidden entries (a group or a subgroup lists its items under its name).
  #lineMore(key: string, entries: Entry[], texts: Texts): TemplateResult {
    const menu = this.#menu(`more:${key}`, {
      placement: 'bottom-end',
      anchor: this.#belowLine,
      onSelect: (id) => this.open(id),
    });
    const current = entries.some((entry) =>
      entry.kind === 'item'
        ? entry.item.id === this.#active
        : entry.group.items.some((item) => item.id === this.#active)
    );
    const icons = hasIcons(entries.flatMap((entry) => entry.kind === 'item' ? [entry.item] : entry.group.items));

    return html`<button
        type="button"
        class="tab tab--more"
        aria-current=${ifDefined(current ? 'true' : undefined)}
        id=${menu.triggerId}
        aria-haspopup="menu"
        aria-expanded=${menu.open}
        aria-controls=${menu.popupId}
        data-state=${menu.open ? 'open' : 'closed'}
        @click=${menu.toggle}
        @keydown=${menu.onTriggerKeyDown}
      ><span class="tab-title">${texts.more}</span>${chevronIcon()}</button>
      ${
      this.#menuPopup(
        menu,
        { class: 'menu-popup', drop: true },
        entries.map((entry) =>
          entry.kind === 'item'
            ? this.#itemMenuEntry(menu, entry.item, icons)
            : html`<div class="menu-group-label">${
              entry.kind === 'group' ? this.#labelOf(entry.group) : entry.group.name
            }</div>
              ${entry.group.items.map((item) => this.#itemMenuEntry(menu, item, icons))}`
        ),
      )
    }`;
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

    const menu = this.#menu('user', {
      placement: 'bottom-end',
      anchor: this.#belowLine,
      onSelect: (value) => this.#select(sections, value),
    });

    return html`<button
        type="button"
        class="top-user"
        aria-label="${texts.account}: ${user.name}"
        data-tip=${user.name}
        data-tip-side="bottom"
        id=${menu.triggerId}
        aria-haspopup="menu"
        aria-expanded=${menu.open}
        aria-controls=${menu.popupId}
        data-state=${menu.open ? 'open' : 'closed'}
        @click=${menu.toggle}
        @keydown=${menu.onTriggerKeyDown}
      >${avatar}</button>
      ${
      this.#menuPopup(
        menu,
        { class: 'menu-popup', drop: true },
        html`<div class="menu-user">
            <span class="user-name">${user.name}</span>
            ${user.detail === undefined ? nothing : html`<span class="user-detail">${user.detail}</span>`}
          </div>
          <div class="menu-separator" role="separator"></div>
          ${this.#menuItems(menu, sections)}`,
      )
    }`;
  }

  // --- Menus ---------------------------------------------------------------------------------------------------------

  // The menu `key` (made on first use and kept: its state), with this render's options: where it opens, and what
  // choosing an item does. The templates render its trigger, `#menuPopup` and its items with its ids (`menu.ts`).
  #menu(key: string, options: MenuOptions): Menu {
    let menu = this.#menuByKey.get(key);

    if (menu === undefined) {
      menu = new Menu(this, `${this.#id}-${key.replace(/[^a-z0-9]+/gi, '-')}`, options);
      this.#menuByKey.set(key, menu);
    }

    menu.options = options;

    return menu;
  }

  #closeMenus(): void {
    for (const menu of this.#menuByKey.values()) {
      menu.close();
    }
  }

  // The popup of a menu: its positioner (placed by the menu, hidden while closed) and the panel with the items
  // (`content`). `drop`, `flush`, `sheet`: its look (`styles.ts`). A list to choose from (the group select): `listbox`.
  #menuPopup(
    menu: Menu,
    panel: { class: string; listbox?: boolean; drop?: boolean; flush?: boolean; sheet?: boolean },
    content: unknown,
  ): TemplateResult {
    return html`<div
      class=${panel.listbox === true ? 'select-positioner' : 'menu-positioner'}
      id=${menu.positionerId}
      ?hidden=${!menu.open}
    >
      <div
        class=${panel.class}
        id=${menu.popupId}
        role=${panel.listbox === true ? 'listbox' : 'menu'}
        tabindex="-1"
        aria-labelledby=${menu.triggerId}
        aria-activedescendant=${ifDefined(menu.highlighted === undefined ? undefined : menu.itemId(menu.highlighted))}
        ?data-drop=${panel.drop === true}
        ?data-flush=${panel.flush === true}
        ?data-sheet=${panel.sheet === true}
        @keydown=${menu.onPopupKeyDown}
        @pointermove=${menu.onPopupPointerMove}
        @pointerleave=${menu.onPopupPointerLeave}
        @click=${menu.onPopupClick}
      >${content}</div>
    </div>`;
  }

  // The sections of a menu, separated by lines, each with its label. An item with `checked` is a radio option (a check
  // in place of its icon, on the checked one).
  #menuItems(menu: Menu, sections: readonly Spec.MenuSection[]): TemplateResult[] {
    return sectionsOf(sections).flatMap((section, index) => [
      ...(index > 0 ? [html`<div class="menu-separator" role="separator"></div>`] : []),
      ...(section.label === undefined ? [] : [html`<div class="menu-group-label">${section.label}</div>`]),
      ...section.items.map((item) => {
        if (item.checked !== undefined) {
          const checked = item.checked();

          return html`<div
            class="menu-item"
            role="menuitemradio"
            aria-checked=${checked}
            id=${menu.itemId(item.id)}
            data-value=${item.id}
            ?data-highlighted=${menu.highlighted === item.id}
            ?data-checked=${checked}
          >
            <span class="menu-icon menu-check" ?data-checked=${checked}>${checkIcon()}</span>
            <span class="menu-label">${item.label}</span>
          </div>`;
        }

        return html`<div
          class="menu-item"
          role="menuitem"
          id=${menu.itemId(item.id)}
          data-value=${item.id}
          ?data-highlighted=${menu.highlighted === item.id}
        >
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

  // A group (or a subgroup) in the rail: its button (its name as the tooltip), and a panel with its items (the items
  // without a subgroup first, then each subgroup with its name as a heading), at the button, touching the sidebar.
  #flyout(key: string, group: Group, label: string, icon: string | undefined): TemplateResult {
    const menu = this.#menu(key, {
      placement: 'right-start',
      anchor: this.#besideSidebar,
      onSelect: (id) => this.open(id),
    });
    const { loose, subgroups } = subgroupsOf(group.items);
    const current = group.items.some((item) => item.id === this.#active);
    // Icons only on the items (2026-10-07), not on the headings: an item without one gets its framed initials.
    const entry = (item: Spec.NavItem) =>
      html`<div
        class="flyout-item"
        role="menuitem"
        id=${menu.itemId(item.id)}
        data-value=${item.id}
        ?data-highlighted=${menu.highlighted === item.id}
        ?data-current=${item.id === this.#active}
      >${this.#iconAndTitle(item, false, item.title, true)}</div>`;

    return html`
      <button
        type="button"
        class="item"
        aria-label=${label}
        aria-current=${ifDefined(current ? 'true' : undefined)}
        data-tip=${label}
        id=${menu.triggerId}
        aria-haspopup="menu"
        aria-expanded=${menu.open}
        aria-controls=${menu.popupId}
        data-state=${menu.open ? 'open' : 'closed'}
        @click=${menu.toggle}
        @keydown=${menu.onTriggerKeyDown}
      >${
      icon === undefined ? html`<span class="tile" aria-hidden="true">${initialsIcon(label)}</span>` : groupIcon(icon)
    }</button>
      ${
      this.#menuPopup(
        menu,
        { class: 'flyout' },
        html`<div class="flyout-title">${label}</div>
          ${loose.map(entry)}
          ${
          subgroups.map((subgroup, index) => {
            const labelId = `${menu.popupId}-group-${index}`;

            return html`<div role="group" aria-labelledby=${labelId}>
              <div class="flyout-label" id=${labelId}>${subgroup.name}</div>
              ${subgroup.items.map(entry)}
            </div>`;
          })
        }`,
      )
    }
    `;
  }

  // --- Group select --------------------------------------------------------------------------------------------------

  // A `Menu` as a list to choose from (`listbox`): it opens at the chosen group.
  // (Until 2026-10-08 also in the top line of the one-line topbar, `nav="top-compact"` then, which has the groups as
  // entries with two-pane menus since.)
  #groupSelect(texts: Texts, groups: Group[], value: string): TemplateResult {
    const menu = this.#menu('group-select', {
      placement: 'bottom-start',
      gutter: 4,
      sameWidth: true,
      selected: () => value,
      onSelect: (next) => {
        this.#selectedGroup = next;
        this.requestUpdate();
      },
    });
    const current = groups.find((group) => group.name === value);

    return html`
      <button
        type="button"
        class="group-select"
        aria-label=${texts.group}
        id=${menu.triggerId}
        aria-haspopup="listbox"
        aria-expanded=${menu.open}
        aria-controls=${menu.popupId}
        data-state=${menu.open ? 'open' : 'closed'}
        @click=${menu.toggle}
        @keydown=${menu.onTriggerKeyDown}
      >
        <span class="group-select-value">${current === undefined ? '' : this.#labelOf(current)}</span>
        ${current === undefined ? nothing : html`<span class="group-count">${current.items.length}</span>`}
        <span class="group-select-icon">${selectorIcon()}</span>
      </button>
      ${
      this.#menuPopup(
        menu,
        { class: 'select-popup', listbox: true },
        html`<div class="select-list">${
          groups.map((group) => {
            const selected = group.name === value;

            return html`<div
              class="select-item"
              role="option"
              aria-selected=${selected}
              id=${menu.itemId(group.name)}
              data-value=${group.name}
              ?data-highlighted=${menu.highlighted === group.name}
            >
              <span class="select-indicator" ?hidden=${!selected}>${checkIcon()}</span>
              <span class="select-item-text">${this.#labelOf(group)}</span>
              <span class="select-item-count">${group.items.length}</span>
            </div>`;
          })
        }</div>`,
      )
    }
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

    const menu = this.#menu('user', {
      // In the bottom bar's sheet (the sidebar as wide as the screen): above the user row, as wide as it.
      ...(this.#bottom
        ? { placement: 'top-start' as const, sameWidth: true }
        : { placement: 'right-end' as const, anchor: this.#besideSidebar }),
      onSelect: (value) => this.#select(sections, value),
    });

    return html`<div class="user-row">
      <button
        type="button"
        class="user-button"
        aria-label="${texts.account}: ${user.name}"
        data-tip=${ifDefined(rail ? user.name : undefined)}
        id=${menu.triggerId}
        aria-haspopup="menu"
        aria-expanded=${menu.open}
        aria-controls=${menu.popupId}
        data-state=${menu.open ? 'open' : 'closed'}
        @click=${menu.toggle}
        @keydown=${menu.onTriggerKeyDown}
      >
        ${content}
        <svg class="icon icon--chevron-right" viewBox="0 0 24 24" aria-hidden="true"><path d="m10 7 5 5-5 5" /></svg>
      </button>
      ${this.#menuPopup(menu, { class: 'menu-popup', flush: true }, this.#menuItems(menu, sections))}
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
    // Where its menus open: below the top line; to the right of the rail; on top of the footer, as wide as it.
    const where: Pick<MenuOptions, 'placement' | 'anchor' | 'sameWidth'> = topbar
      ? { placement: 'bottom-end', anchor: this.#belowLine }
      : rail
      ? { placement: 'right-end', anchor: this.#besideSidebar }
      : {
        placement: 'top-start',
        anchor: (trigger) => trigger.closest('.footer')?.getBoundingClientRect() ?? new DOMRect(),
        sameWidth: true,
      };
    const look = { drop: topbar, flush: !topbar, sheet: !rail && !topbar };

    // A button of the footer that opens `menu`.
    const menuButton = (menu: Menu, label: string, icon: unknown, more = false) =>
      html`<button
        type="button"
        class=${more ? 'footer-button footer-more' : 'footer-button'}
        aria-label=${label}
        data-tip=${label}
        data-tip-side=${side}
        id=${menu.triggerId}
        aria-haspopup="menu"
        aria-expanded=${menu.open}
        aria-controls=${menu.popupId}
        data-state=${menu.open ? 'open' : 'closed'}
        @click=${menu.toggle}
        @keydown=${menu.onTriggerKeyDown}
      >${icon}</button>`;

    // An action with a menu of sections: like the kebab's menu, at this button.
    const sectionMenu = (action: Spec.Action, sections: readonly Spec.MenuSection[]) => {
      const menu = this.#menu(`action:${action.id}`, {
        ...where,
        onSelect: (value) => this.#select(sections, value),
      });

      return html`${menuButton(menu, action.label, this.#actionIcon(action))}${
        this.#menuPopup(menu, { class: 'menu-popup menu-popup--choices', ...look }, this.#menuItems(menu, sections))
      }`;
    };

    const choiceMenu = (action: Spec.Action, choices: Spec.Choices) => {
      const menu = this.#menu(`choice:${action.id}`, {
        ...where,
        onSelect: (value) => {
          choices.onChange(value);
          this.requestUpdate();
        },
      });
      const current = choices.options.find((option) => option.value === choices.value());
      const label = current === undefined ? action.label : `${action.label}: ${current.label}`;

      return html`${menuButton(menu, label, this.#actionIcon(action))}${
        this.#menuPopup(
          menu,
          { class: 'menu-popup menu-popup--choices', ...look },
          html`<div class="menu-group-label">${action.label}</div>
            ${
            choices.options.map((option) => {
              const checked = option.value === choices.value();

              return html`<div
                class="menu-item"
                role="menuitemradio"
                aria-checked=${checked}
                id=${menu.itemId(option.value)}
                data-value=${option.value}
                ?data-highlighted=${menu.highlighted === option.value}
                ?data-checked=${checked}
              >
                <span class="menu-icon menu-check" ?data-checked=${checked}>${checkIcon()}</span>
                <span class="menu-label">${option.label}</span>
              </div>`;
            })
          }`,
        )
      }`;
    };

    const more = sectionsOf(sections).length === 0 ? undefined : this.#menu('more', {
      ...where,
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
      more === undefined
        ? nothing
        : html`${menuButton(more, texts.more, kebabIcon(), true)}${
          this.#menuPopup(more, { class: 'menu-popup', ...look }, this.#menuItems(more, sections))
        }`
    }
    </div>`;
  }

  #actionIcon(action: Spec.Action): TemplateResult {
    return html`<span class="footer-icon" aria-hidden="true">${unsafeHTML(action.icon)}</span>${
      action.badge === true ? html`<span class="footer-badge" aria-hidden="true"></span>` : nothing
    }`;
  }

  // --- Search --------------------------------------------------------------------------------------------------------

  // The search for items: a dark panel as high as the cockpit, right next to the rail (the sidebar collapses while it
  // is open), over the open item (darkened). Without a query: the recent items, then all items by group. Up and Down
  // choose, Enter opens, Escape closes. A modal dialog (`#syncDialog`: focus inside, on the field; Escape and a pointer
  // down outside close it).
  #palette(texts: Texts): TemplateResult {
    // The pinned items too, in their groups; not the hidden ones.
    const items = this.#shownItems;
    const recent = this.#config.recent === false ? [] : this.#recentItems;
    const events = this.#dialogEvents('.palette', () => this.#paletteOpen, this.#closePalette);
    const sections: { label: string; matches: readonly Match[] }[] = this.#query.trim() !== ''
      ? [{ label: '', matches: search(items, this.#query) }]
      : [
        ...(recent.length > 0 ? [{ label: texts.recent, matches: recent.map((item) => ({ item })) }] : []),
        ...groupsOf(items).flatMap((group) => {
          const label = group.name === '' ? texts.other : group.name;

          if (!this.#switcher) {
            return [{ label, matches: group.items.map((item) => ({ item })) }];
          }

          // The switcher's list: also by subgroup ("Group › Subgroup").
          const { loose, subgroups } = subgroupsOf(group.items);

          return [
            ...(loose.length > 0 ? [{ label, matches: loose.map((item) => ({ item })) }] : []),
            ...subgroups.map((subgroup) => ({
              label: `${label} › ${subgroup.name}`,
              matches: subgroup.items.map((item) => ({ item })),
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
        choose(current.item.id);
      }
    };

    let position = -1;

    return html`<dialog
      class="dialog palette-dialog"
      aria-labelledby=${`${this.#id}-search-title`}
      @cancel=${events.cancel}
      @close=${events.close}
      @pointerdown=${events.pointerdown}
    >
      <div class="backdrop"></div>
      <div class="palette-layer">
        <div
          class="palette"
          @animationend=${(event: AnimationEvent) => {
      if (event.target === event.currentTarget) {
        this.#closed();
      }
    }}
        >
          <h2 class="visually-hidden" id=${`${this.#id}-search-title`}>${texts.search}</h2>
          <div class="palette-field">
            ${searchIcon()}
            <input
              class="palette-input"
              type="text"
              role="combobox"
              aria-expanded="true"
              aria-controls=${listId}
              aria-activedescendant=${ifDefined(current === undefined ? undefined : `${listId}-${current.item.id}`)}
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
            <button
              type="button"
              class="search-button"
              aria-label=${texts.closeSheet}
              @click=${this.#closePalette}
            >${closeIcon()}</button>
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
              const { title, group, subgroup } = match.item;

              return html`<div
              id=${ifDefined(isCurrent ? `${listId}-${match.item.id}` : undefined)}
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
              @click=${() => choose(match.item.id)}
            >
              ${itemIcon(match.item)}
              <span class="palette-text">
                <span class="palette-title">${
                match.title === undefined
                  ? title
                  : html`${title.slice(0, match.title.start)}<mark>${
                    title.slice(match.title.start, match.title.end)
                  }</mark>${title.slice(match.title.end)}`
              }</span>
                ${
                match.item.description === undefined
                  ? nothing
                  : html`<span class="palette-description">${match.item.description}</span>`
              }
              </span>
              ${
                group !== undefined && section.label === ''
                  ? html`<span class="palette-group">${
                    subgroup === undefined ? group : `${group} › ${subgroup}`
                  }</span>`
                  : nothing
              }
              ${match.item.id === this.#active ? html`<span class="palette-dot" aria-hidden="true"></span>` : nothing}
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
            <span class="palette-count">${texts.items(this.#query.trim() === '' ? items.length : flat.length)}</span>
          </footer>
        </div>
      </div>
    </dialog>`;
  }
}
