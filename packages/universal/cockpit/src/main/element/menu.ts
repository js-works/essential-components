import type { LitElement } from 'lit';

import { addAnchorName, MENU_ANCHOR, MENU_EDGE, removeAnchorName } from './anchors.js';

export type { MenuOptions, MenuPlacement };
export { Menu };

type MenuPlacement = 'right-start' | 'right-end' | 'top-start' | 'bottom-start' | 'bottom-end';

type MenuOptions = {
  placement: MenuPlacement;
  // What it opens at, if not at its trigger: the closest element around the trigger that matches (e.g. the footer).
  anchor?: string;
  // The edge it touches in place of its anchor's: the closest element around the trigger that matches; its right edge
  // for a placement `right-…` (the sidebar), its bottom for `bottom-…` (the topbar's line).
  edge?: string;
  // As wide as the anchor.
  sameWidth?: boolean;
  // A list to choose from (the group select): the value of the chosen item, highlighted when it opens.
  selected?: () => string | undefined;
  onSelect: (value: string) => void;
};

// A menu (or a list to choose from, like the group select): a trigger button and a popup with items. Our own code
// (2026-10-08; Zag.js before). The element renders them with the ids and attributes below; the menu keeps the state
// (open, the highlighted item), handles the keys, the pointer and a click outside, and names the anchors of the popup
// (CSS anchor positioning places it: `placement-styles.ts`).
//
// - The trigger (`id=${menu.triggerId}`): a click toggles it (from the keyboard, Enter or Space: at the first item);
//   Down opens it at the first item, Up at the last.
// - The positioner (`id=${menu.positionerId}`, hidden while closed): `data-placement=${menu.options.placement}`,
//   `?data-edge=${menu.options.edge !== undefined}`, `?data-same-width=${menu.options.sameWidth === true}`; placed by
//   CSS at the trigger (or `anchor`), its panel at most as high as the room on its side (a panel that scrolls shrinks).
// - The popup (`id=${menu.popupId}`, its first child): has the focus while open, the highlighted item by
//   `aria-activedescendant`. Up and Down (Home, End) move, typing jumps to an item by its first letters, Enter or Space
//   choose, Escape and Tab close it (the focus back on the trigger), so does a pointer down outside.
// - An item: an element with `data-value` and `id=${menu.itemId(value)}` inside the popup; `data-highlighted` on the
//   highlighted one.
class Menu {
  open = false;
  highlighted: string | undefined;
  // Set by the element on every render (the latest callbacks).
  options: MenuOptions;

  readonly triggerId: string;
  readonly positionerId: string;
  readonly popupId: string;

  readonly #host: LitElement;
  // The trigger it was opened at, and the elements it gave an anchor name (removed when it closes).
  #placedAt: Element | undefined;
  #named: [ElementCSSInlineStyle, string][] = [];
  #typed = '';
  #typedAt = 0;

  constructor(host: LitElement, id: string, options: MenuOptions) {
    this.#host = host;
    this.triggerId = `${id}-trigger`;
    this.positionerId = `${id}-positioner`;
    this.popupId = `${id}-popup`;
    this.options = options;
  }

  itemId(value: string): string {
    return `${this.popupId}-${value.replace(/\s+/g, '-')}`;
  }

  // Opens it; `at`: the item highlighted first (from the keyboard), else none (a list: its chosen item).
  show(at?: 'first' | 'last'): void {
    const trigger = this.#trigger();

    if (trigger === null) {
      return;
    }

    const values = this.#values();

    this.highlighted = this.options.selected?.()
      ?? (at === 'first' ? values[0] : at === 'last' ? values.at(-1) : undefined);
    this.open = true;
    this.#nameAnchors(trigger);
    document.addEventListener('pointerdown', this.#onPointerDownOutside, true);
    this.#host.requestUpdate();

    void this.#host.updateComplete.then(() => {
      if (this.open) {
        this.#popup()?.focus({ preventScroll: true });
      }
    });
  }

  // Closes it; `focusTrigger`: the focus goes back to the trigger (Escape, Tab, a choice).
  close(focusTrigger = false): void {
    if (!this.open) {
      return;
    }

    this.open = false;
    this.highlighted = undefined;
    this.#placedAt = undefined;

    for (const [element, name] of this.#named) {
      removeAnchorName(element, name);
    }

    this.#named = [];
    document.removeEventListener('pointerdown', this.#onPointerDownOutside, true);
    this.#host.requestUpdate();

    if (focusTrigger) {
      this.#trigger()?.focus();
    }
  }

  choose(value: string): void {
    this.close(true);
    this.options.onSelect(value);
  }

  // After each render of the element: open, but its trigger is gone or another one (e.g. another layout): it closes.
  rendered(): void {
    if (this.open && this.#placedAt !== undefined && this.#trigger() !== this.#placedAt) {
      this.close();
    }
  }

  // A click from the keyboard (Enter, Space) has no pointer details: it opens at the first item.
  readonly toggle = (event: MouseEvent) => {
    if (this.open) {
      this.close();
    } else {
      this.show(event.detail === 0 ? 'first' : undefined);
    }
  };

  readonly onTriggerKeyDown = (event: KeyboardEvent) => {
    const at = ({ ArrowDown: 'first', ArrowUp: 'last' } as Record<string, 'first' | 'last' | undefined>)[event.key];

    if (at !== undefined) {
      event.preventDefault();
      this.show(at);
    }
  };

  readonly onPopupKeyDown = (event: KeyboardEvent) => {
    const values = this.#values();
    const index = this.highlighted === undefined ? -1 : values.indexOf(this.highlighted);

    switch (event.key) {
      case 'ArrowDown':
        this.#highlight(values[(index + 1) % values.length]);
        break;
      case 'ArrowUp':
        this.#highlight(values[index <= 0 ? values.length - 1 : index - 1]);
        break;
      case 'Home':
        this.#highlight(values[0]);
        break;
      case 'End':
        this.#highlight(values.at(-1));
        break;
      case 'Enter':
      case ' ':
        if (this.highlighted !== undefined) {
          this.choose(this.highlighted);
        }
        break;
      case 'Escape':
        this.close(true);
        break;
      case 'Tab':
        // Not prevented: the focus moves on from the trigger.
        this.close(true);
        return;
      default:
        if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) {
          return;
        }

        this.#typeahead(event.key);
    }

    event.preventDefault();
  };

  readonly onPopupPointerMove = (event: PointerEvent) => {
    this.#highlight(this.#valueAt(event), false);
  };

  readonly onPopupPointerLeave = () => {
    this.#highlight(undefined, false);
  };

  readonly onPopupClick = (event: MouseEvent) => {
    const value = this.#valueAt(event);

    if (value !== undefined) {
      this.choose(value);
    }
  };

  readonly #onPointerDownOutside = (event: PointerEvent) => {
    const path = event.composedPath();
    const trigger = this.#trigger();
    const positioner = this.#find(this.positionerId);

    if ((trigger === null || !path.includes(trigger)) && (positioner === null || !path.includes(positioner))) {
      this.close();
    }
  };

  // `scroll`: from the keyboard, the item is scrolled into view.
  #highlight(value: string | undefined, scroll = true): void {
    if (value === this.highlighted) {
      return;
    }

    this.highlighted = value;
    this.#host.requestUpdate();

    if (scroll && value !== undefined) {
      void this.#host.updateComplete.then(() => this.#find(this.itemId(value))?.scrollIntoView({ block: 'nearest' }));
    }
  }

  // The next item whose text starts with the letters typed (within half a second of each other).
  #typeahead(key: string): void {
    const now = Date.now();

    this.#typed = now - this.#typedAt < 500 ? this.#typed + key.toLowerCase() : key.toLowerCase();
    this.#typedAt = now;

    const items = this.#items();
    const index = items.findIndex((item) => item.dataset['value'] === this.highlighted);
    // A first letter looks from the next item on; more letters from the highlighted one (it may still match).
    const from = this.#typed.length > 1 ? Math.max(index, 0) : index + 1;
    const found = [...items.slice(from), ...items.slice(0, from)].find((item) =>
      (item.textContent ?? '').trim().toLowerCase().startsWith(this.#typed)
    );

    if (found !== undefined) {
      this.#highlight(found.dataset['value']);
    }
  }

  // The anchor names of the popup's CSS: its anchor (the trigger, or the element of `anchor`), and its edge.
  #nameAnchors(trigger: HTMLElement): void {
    const { anchor, edge } = this.options;
    const anchorElement = anchor === undefined ? trigger : trigger.closest<HTMLElement>(anchor) ?? trigger;
    const edgeElement = edge === undefined ? null : trigger.closest<HTMLElement>(edge);

    this.#named = [[anchorElement, MENU_ANCHOR]];

    if (edgeElement !== null) {
      this.#named.push([edgeElement, MENU_EDGE]);
    }

    for (const [element, name] of this.#named) {
      addAnchorName(element, name);
    }

    this.#placedAt = trigger;
  }

  readonly #valueAt = (event: Event) =>
    (event.target as Element).closest<HTMLElement>('[data-value]')?.dataset['value'];

  #items(): HTMLElement[] {
    return [...(this.#popup()?.querySelectorAll<HTMLElement>('[data-value]') ?? [])];
  }

  #values(): string[] {
    return this.#items().flatMap((item) => item.dataset['value'] ?? []);
  }

  #trigger(): HTMLElement | null {
    return this.#find(this.triggerId);
  }

  #popup(): HTMLElement | null {
    return this.#find(this.popupId);
  }

  #find(id: string): HTMLElement | null {
    return this.#host.renderRoot.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
  }
}
