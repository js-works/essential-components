import { autoUpdate, computePosition, flip, offset, shift, size } from '@floating-ui/dom';
import type { LitElement } from 'lit';

export { Menu };
export type { MenuOptions, MenuPlacement };

type MenuPlacement = 'right-start' | 'right-end' | 'top-start' | 'bottom-start' | 'bottom-end';

type MenuOptions = {
  placement: MenuPlacement;
  // Where it opens, if not at its trigger (e.g. at the sidebar's edge): a rect from the trigger.
  anchor?: (trigger: Element) => DOMRect;
  // As wide as the anchor.
  sameWidth?: boolean;
  // The gap to the anchor, in px.
  gutter?: number;
  // A list to choose from (the group select): the value of the chosen item, highlighted when it opens.
  selected?: () => string | undefined;
  onSelect: (value: string) => void;
};

// A menu (or a list to choose from, like the group select): a trigger button and a popup with items. Our own code
// (2026-10-08; Zag.js before). The element renders them with the ids and attributes below; the menu keeps the state
// (open, the highlighted item), handles the keys, the pointer and a click outside, and places the popup (Floating UI).
//
// - The trigger (`id=${menu.triggerId}`): a click toggles it (from the keyboard, Enter or Space: at the first item);
//   Down opens it at the first item, Up at the last.
// - The positioner (`id=${menu.positionerId}`, hidden while closed): placed at the trigger (or `anchor`), `position:
//   fixed`; its `max-height` is the room left in the window (a popup that scrolls takes it with `max-height: inherit`).
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
  // The trigger it was placed at, and how to stop following it (Floating UI's `autoUpdate`).
  #placedAt: Element | undefined;
  #stopPlacing: (() => void) | undefined;
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
    const values = this.#values();

    this.highlighted = this.options.selected?.()
      ?? (at === 'first' ? values[0] : at === 'last' ? values.at(-1) : undefined);
    this.open = true;
    document.addEventListener('pointerdown', this.#onPointerDownOutside, true);
    this.#host.requestUpdate();

    void this.#host.updateComplete.then(() => {
      if (this.open) {
        this.#popup()?.focus({ preventScroll: true });
        this.#startPlacing();
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
    this.#stopPlacing?.();
    this.#stopPlacing = undefined;
    this.#placedAt = undefined;
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

  // Places the positioner now, and again whenever the trigger, the window or a scroll container changes.
  #startPlacing(): void {
    const trigger = this.#trigger();
    const positioner = this.#find(this.positionerId);

    if (trigger === null || positioner === null) {
      this.close();
      return;
    }

    const anchor = this.options.anchor;
    const reference = anchor === undefined
      ? trigger
      : { getBoundingClientRect: () => anchor(trigger), contextElement: trigger };

    this.#placedAt = trigger;
    this.#stopPlacing = autoUpdate(reference, positioner, () => void this.#place(reference, positioner));
  }

  async #place(reference: Element | { getBoundingClientRect: () => DOMRect }, positioner: HTMLElement): Promise<void> {
    const { placement, sameWidth = false, gutter = 0 } = this.options;
    const result = await computePosition(reference, positioner, {
      placement,
      strategy: 'fixed',
      middleware: [
        offset(gutter),
        flip(),
        shift(),
        size({
          apply: ({ availableHeight, rects }) => {
            Object.assign(positioner.style, {
              width: sameWidth ? `${rects.reference.width}px` : '',
              minWidth: sameWidth ? '' : 'max-content',
              maxHeight: `${Math.max(0, Math.floor(availableHeight))}px`,
            });
          },
        }),
      ],
    });

    Object.assign(positioner.style, { left: `${result.x}px`, top: `${result.y}px` });

    const popup = this.#popup();

    if (popup !== null) {
      popup.style.transformOrigin = originOf(result.placement);
    }
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

// Where a popup grows from (its open animation): the side and the corner at its anchor, e.g. `bottom-start`: `left top`.
function originOf(placement: string): string {
  const [side = 'bottom', align] = placement.split('-');
  const opposite = ({ top: 'bottom', bottom: 'top', left: 'right', right: 'left' } as Record<string, string>)[side];
  const vertical = side === 'top' || side === 'bottom';
  const corner = align === 'start'
    ? (vertical ? 'left' : 'top')
    : align === 'end'
    ? (vertical ? 'right' : 'bottom')
    : 'center';

  return vertical ? `${corner} ${opposite}` : `${opposite} ${corner}`;
}
