import type { PropertyValues, TemplateResult } from 'lit';
import { html, LitElement, nothing, svg } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import type { Group } from '../core/groups.js';
import { groupsOf, subgroupsOf } from '../core/groups.js';
import { readStored, writeStored } from '../core/storage.js';
import { textsOf } from '../core/texts.js';
import { checkIcon, selectorIcon } from '../element/icons.js';
import { Menu } from '../element/menu.js';
import type {
  I18nAdapter,
  NavDensity,
  NavGroup,
  NavTreeClassConfig,
  NavTreeElement,
  NavTreeGroupDisplay,
  NavTreeItem,
  NavTreeNavigateDetail,
  NavTreeTheme,
} from '../index.js';
import { navTreeStyles } from './nav-tree-styles.js';

export { NavTreeElementBase };

// Above this many items, collapsible groups start closed (but the active item's and the one without a name).
const MANY = 30;

let instances = 0;

// The navigation tree, a Lit element (see `NavTreeElement`). The grouping is the cockpit's (`core/groups.ts`).
class NavTreeElementBase extends LitElement implements NavTreeElement {
  static override properties = {
    items: { attribute: false },
    groups: { attribute: false },
    active: {},
    marked: { attribute: false },
    collapsibleGroups: { type: Boolean, attribute: 'collapsible-groups', reflect: true },
    groupDisplay: { attribute: 'group-display', reflect: true },
    density: { reflect: true },
    theme: { attribute: false },
  };

  declare items: readonly NavTreeItem[];
  declare groups: readonly NavGroup[];
  declare active: string;
  declare marked: readonly string[];
  declare collapsibleGroups: boolean;
  declare groupDisplay: NavTreeGroupDisplay;
  declare density: NavDensity;
  declare theme: NavTreeTheme;

  readonly #sheet = new CSSStyleSheet();
  readonly #adapter: I18nAdapter | undefined;
  readonly #storageKey: string | undefined;
  #unsubscribe: (() => void) | undefined;
  // The groups and folders opened or closed by the user (`group`, `group/folder`), remembered per browser.
  #open: Record<string, boolean> = {};
  // The group shown with `group-display="select"`: the user's choice, else the active item's (remembered per browser).
  #chosen: string | undefined;
  // The group select's list (a `Menu` of the cockpit: a listbox, its keys, placed by CSS anchor positioning; its
  // positioner a popover, in the top layer).
  readonly #select: Menu;

  constructor(config: NavTreeClassConfig) {
    super();
    this.items = [];
    this.groups = [];
    this.active = '';
    this.marked = [];
    this.collapsibleGroups = false;
    this.groupDisplay = 'sections';
    this.density = 'normal';
    this.theme = config.theme ?? {};
    this.#adapter = config.i18n;
    this.#storageKey = config.storageKey;
    this.#select = new Menu(this, `nav-tree${++instances}-group`, {
      placement: 'bottom-start',
      sameWidth: true,
      onSelect: () => {},
    });
  }

  override connectedCallback(): void {
    super.connectedCallback();
    // Read again on every connect: another tree of the same key (e.g. the cockpit's sidebar and its sheet) may have
    // changed it.
    this.#open = this.#storageKey === undefined ? {} : readStored(`${this.#storageKey}:groups`, {});
    this.#chosen = this.#storageKey === undefined
      ? undefined
      : readStored<string | undefined>(`${this.#storageKey}:group`, undefined);
    this.#unsubscribe = this.#adapter?.onChange?.(() => this.requestUpdate());
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#unsubscribe?.();
    this.#select.close();
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
      this.#sheet.replaceSync(navTreeStyles(this.theme));
    }

    // A new active item in another group: the select shows its group.
    if (changed.has('active')) {
      const group = this.items.find((item) => item.id === this.active)?.group;

      if (group !== undefined || this.items.some((item) => item.id === this.active)) {
        this.#choose(group ?? '', false);
      }
    }
  }

  // The select's popup is a popover: shown while the menu is open.
  protected override updated(): void {
    const positioner = this.renderRoot.querySelector<HTMLElement>(`#${CSS.escape(this.#select.positionerId)}`);

    if (positioner !== null && positioner.matches(':popover-open') !== this.#select.open) {
      if (this.#select.open) {
        positioner.showPopover();
      } else {
        positioner.hidePopover();
      }
    }

    this.#select.rendered();
  }

  #choose(group: string, render = true): void {
    this.#chosen = group;

    if (this.#storageKey !== undefined) {
      writeStored(`${this.#storageKey}:group`, group);
    }

    if (render) {
      this.requestUpdate();
    }
  }

  #setOpen(key: string, open: boolean): void {
    this.#open = { ...this.#open, [key]: open };

    if (this.#storageKey !== undefined) {
      writeStored(`${this.#storageKey}:groups`, this.#open);
    }

    this.requestUpdate();
  }

  #folderIcon(group: string, folder: string): string | undefined {
    return this.groups.find((each) => each.name === group)?.subgroups?.find((each) => each.name === folder)?.icon;
  }

  // A plain click (no modifier, the main button) fires `navigate`; canceled, the browser does not follow the link.
  #click(event: MouseEvent, item: NavTreeItem): void {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const detail: NavTreeNavigateDetail = { id: item.id, href: item.href };
    const go = this.dispatchEvent(
      new CustomEvent('navigate', { detail, bubbles: true, composed: true, cancelable: true }),
    );

    if (!go) {
      event.preventDefault();
    }
  }

  // Up and Down (Home, End) move between the links and the toggles that are shown. At an end the key is left alone (not
  // prevented), so a host can go on (the cockpit: to its next tree).
  readonly #onKeyDown = (event: KeyboardEvent) => {
    const targets = [...this.renderRoot.querySelectorAll<HTMLElement>('.item, button')].filter((target) =>
      target.offsetParent !== null
    );
    const index = targets.indexOf(event.composedPath()[0] as HTMLElement);
    const next = ({
      ArrowDown: targets[index + 1],
      ArrowUp: targets[index - 1],
      Home: targets[0],
      End: targets.at(-1),
    } as Record<string, HTMLElement | undefined>)[event.key];

    if (index >= 0 && next !== undefined && next !== targets[index]) {
      event.preventDefault();
      next.focus();
    }
  };

  protected override render(): TemplateResult {
    const other = textsOf(this.#adapter).other;
    const groups = groupsOf(this.items);
    const activeGroup = this.items.find((item) => item.id === this.active)?.group ?? '';

    // One group at a time: the select on top, the chosen group's items below it (without its heading).
    if (this.groupDisplay === 'select' && groups.length > 1) {
      const chosen = groups.find((group) => group.name === this.#chosen) ?? groups[0]!;

      return html`<div class="tree" @keydown=${this.#onKeyDown}>
        ${this.#groupSelect(groups, chosen, other)}
        <section class="section"><ul class="list">${this.#folders(chosen)}</ul></section>
      </div>`;
    }

    return html`<div class="tree" @keydown=${this.#onKeyDown}>${
      groups.map((group) => {
        const label = group.name === '' ? (groups.length > 1 && this.collapsibleGroups ? other : '') : group.name;
        const list = this.#folders(group);

        if (!this.collapsibleGroups || label === '') {
          return html`<section class="section">
            ${label === '' ? html`<hr class="section-rule" />` : html`<h2 class="section-label">${label}</h2>`}
            <ul class="list">${list}</ul>
          </section>`;
        }

        const open = this.#open[group.name]
          ?? (this.items.length <= MANY || group.name === activeGroup || group.name === '');

        return html`<div class="group">
          <button type="button" class="group-trigger" aria-expanded=${open} @click=${() =>
          this.#setOpen(group.name, !open)}>
            ${chevron()}
            <span class="group-name">${label}</span>
            <span class="group-count">${group.items.length}</span>
          </button>
          <ul class="list" ?hidden=${!open}>${list}</ul>
        </div>`;
      })
    }</div>`;
  }

  // The select of `group-display="select"`: the chosen group and its count; its list all groups with theirs.
  #groupSelect(groups: readonly Group<NavTreeItem>[], chosen: Group<NavTreeItem>, other: string): TemplateResult {
    const menu = this.#select;
    const labelOf = (group: Group<NavTreeItem>) => (group.name === '' ? other : group.name);

    menu.options = {
      ...menu.options,
      selected: () => chosen.name,
      onSelect: (name) => this.#choose(name),
    };

    return html`
      <button
        type="button"
        class="group-select"
        aria-label=${textsOf(this.#adapter).group}
        id=${menu.triggerId}
        aria-haspopup="listbox"
        aria-expanded=${menu.open}
        aria-controls=${menu.popupId}
        data-state=${menu.open ? 'open' : 'closed'}
        @click=${menu.toggle}
        @keydown=${menu.onTriggerKeyDown}
      >
        <span class="group-select-value">${labelOf(chosen)}</span>
        <span class="group-count">${chosen.items.length}</span>
        <span class="group-select-icon">${selectorIcon()}</span>
      </button>
      <div
        class="select-positioner"
        id=${menu.positionerId}
        popover="manual"
        data-placement=${menu.options.placement}
        data-same-width
      >
        <div
          class="select-popup"
          id=${menu.popupId}
          role="listbox"
          tabindex="-1"
          aria-labelledby=${menu.triggerId}
          aria-activedescendant=${ifDefined(menu.highlighted === undefined ? undefined : menu.itemId(menu.highlighted))}
          @keydown=${menu.onPopupKeyDown}
          @pointermove=${menu.onPopupPointerMove}
          @pointerleave=${menu.onPopupPointerLeave}
          @click=${menu.onPopupClick}
        >
          <div class="select-list">${
      groups.map((group) => {
        const selected = group.name === chosen.name;

        return html`<div
              class="select-item"
              role="option"
              aria-selected=${selected}
              id=${menu.itemId(group.name)}
              data-value=${group.name}
              ?data-highlighted=${menu.highlighted === group.name}
            >
              <span class="select-indicator" ?hidden=${!selected}>${checkIcon()}</span>
              <span class="select-item-text">${labelOf(group)}</span>
              <span class="select-item-count">${group.items.length}</span>
            </div>`;
      })
    }</div>
        </div>
      </div>
    `;
  }

  // The items of a group: those without a folder, then each folder (collapsible, open by default) with its items.
  #folders(group: Group<NavTreeItem>): TemplateResult[] {
    const { loose, subgroups } = subgroupsOf(group.items);

    return [
      ...loose.map((item) => html`<li>${this.#item(item)}</li>`),
      ...subgroups.map((folder) => {
        const key = `${group.name}/${folder.name}`;
        const open = this.#open[key] ?? true;
        const icon = this.#folderIcon(group.name, folder.name);

        return html`<li>
          <button type="button" class="subgroup-trigger" aria-expanded=${open} @click=${() =>
          this.#setOpen(key, !open)}>
            ${chevron()}
            ${
          icon === undefined ? nothing : html`<span class="group-icon" aria-hidden="true">${unsafeHTML(icon)}</span>`
        }
            <span class="subgroup-name">${folder.name}</span>
            <span class="subgroup-count">${folder.items.length}</span>
          </button>
          <ul class="list subgroup-list" ?hidden=${!open}>${
          folder.items.map((item) => html`<li>${this.#item(item)}</li>`)
        }</ul>
        </li>`;
      }),
    ];
  }

  #item(item: NavTreeItem): TemplateResult {
    return html`<a
      class="item"
      href=${item.href}
      aria-current=${ifDefined(item.id === this.active ? 'page' : undefined)}
      title=${ifDefined(item.description)}
      @click=${(event: MouseEvent) => this.#click(event, item)}
    >${
      item.icon === undefined ? nothing : html`<span class="tile" aria-hidden="true">${unsafeHTML(item.icon)}</span>`
    }<span class="item-title">${item.title}</span>${
      this.marked.includes(item.id) ? html`<span class="dot" aria-hidden="true"></span>` : nothing
    }</a>`;
  }
}

// Tabler's `chevron-right` (MIT): turned down while open.
const chevron = () =>
  html`<svg class="chevron" viewBox="0 0 24 24" aria-hidden="true">${svg`<path d="m9 6 6 6-6 6" />`}</svg>`;
