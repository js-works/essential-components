import { html, LitElement, nothing } from 'lit';
import type { PropertyValues, TemplateResult } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import type * as Spec from '../api';
import { textsFor } from '../core/texts';
import { closeIcon, initialsIcon } from './icons';
import { taskbarStyles } from './taskbarStyles';

export { AppTaskbarElement };

// A pressed task. `slots`: every task's place when the drag started (empty until it has moved far enough); `from`, `to`:
// its old and its new index; `gap`: the room between two tasks.
type Drag = {
  id: string;
  task: HTMLElement;
  pointerId: number;
  startX: number;
  from: number;
  to: number;
  slots: { element: HTMLElement; left: number; width: number }[];
  gap: number;
};

// The taskbar (`<app-taskbar>`, 2026-10-07): the open apps in a row, to switch between them and close them. It keeps
// no state: the host sets `tasks` (in the order to show) and `active`, and gets `task-select` and `task-close` (a
// `CustomEvent<{ id }>`, bubbling, not composed). The cockpit uses it below the open item (`taskbar: true`).
//
// - A toolbar: one tab stop (the active task), Left and Right (Home, End) move between its buttons; Delete closes the
//   focused task, so does a middle click.
// - Reordering (2026-10-07): a task is dragged sideways (pointer events: mouse, touch, pen; after 4px, so a click still
//   selects; the others slide aside; Escape cancels), or moved by Ctrl+Shift+Left/Right; then `task-move`.
// - Its look: its `theme` (the cockpit passes its own), else the defaults (the design language's values; its `--ui-*`
//   tokens are for demos only).
class AppTaskbarElement extends LitElement implements Spec.TaskbarElement {
  static override properties = {
    tasks: { attribute: false },
    active: {},
    theme: { attribute: false },
  };

  declare tasks: readonly Spec.Task[];
  declare active: string | undefined;
  // The look (2026-10-10): the cockpit passes its own; alone, the defaults. Its stylesheet is built from it.
  declare theme: Spec.Theme;
  readonly #themeSheet = new CSSStyleSheet();

  // A task was closed from inside: the focus goes to the active task once the host has removed it.
  #refocus = false;
  // A task moved by the keys: its button gets the focus back once the host has reordered (moving the node loses it).
  #refocusId: string | undefined;
  // A press on a task, until it is released: a drag once it has moved far enough.
  #drag: Drag | undefined;
  // The click that ends a drag does not select.
  #dragged = false;
  #langObserver: MutationObserver | undefined;

  constructor() {
    super();
    this.tasks = [];
    this.active = undefined;
    this.theme = {};
  }

  // The theme's stylesheet (see `theme`).
  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    const root = super.createRenderRoot();

    if (root instanceof ShadowRoot) {
      root.adoptedStyleSheets = [this.#themeSheet];
    }

    return root;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#langObserver = new MutationObserver(() => this.requestUpdate());
    this.#langObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#langObserver?.disconnect();
    this.#endDrag(false);
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has('theme')) {
      this.#themeSheet.replaceSync(taskbarStyles(this.theme));
    }
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('tasks') && this.#refocusId !== undefined) {
      this.renderRoot.querySelector<HTMLElement>(`.task-button[data-id="${CSS.escape(this.#refocusId)}"]`)?.focus();
      this.#refocusId = undefined;
    }

    if (changed.has('tasks') && this.#refocus) {
      this.#refocus = false;

      if (this.shadowRoot?.activeElement === null) {
        this.#buttons().find((button) => button.matches('.task-button[aria-pressed="true"]'))?.focus();
      }
    }

    if (changed.has('tasks') || changed.has('active')) {
      this.#reveal();
    }
  }

  // The active task scrolled into the bar's view (only the bar: `scrollIntoView` would scroll the page too).
  #reveal(): void {
    const bar = this.renderRoot.querySelector<HTMLElement>('.bar');
    const task = this.renderRoot.querySelector<HTMLElement>('.task[data-active]');

    if (bar === null || task === null) {
      return;
    }

    if (task.offsetLeft < bar.scrollLeft) {
      bar.scrollLeft = task.offsetLeft - 6;
    } else if (task.offsetLeft + task.offsetWidth > bar.scrollLeft + bar.clientWidth) {
      bar.scrollLeft = task.offsetLeft + task.offsetWidth - bar.clientWidth + 6;
    }
  }

  #buttons(): HTMLButtonElement[] {
    return [...this.renderRoot.querySelectorAll<HTMLButtonElement>('.bar button')];
  }

  #emit(type: 'task-select' | 'task-close', id: string): void {
    this.dispatchEvent(new CustomEvent<Spec.TaskEventDetail>(type, { detail: { id }, bubbles: true }));
  }

  #move(id: string, index: number): void {
    this.dispatchEvent(
      new CustomEvent<Spec.TaskMoveEventDetail>('task-move', { detail: { id, index }, bubbles: true }),
    );
  }

  // --- Dragging ------------------------------------------------------------------------------------------------------

  readonly #onPointerDown = (event: PointerEvent, id: string) => {
    if (event.button !== 0 || this.#drag !== undefined || (event.target as Element).closest('.task-close') !== null) {
      return;
    }

    const task = event.currentTarget as HTMLElement;

    this.#drag = { id, task, pointerId: event.pointerId, startX: event.clientX, from: 0, to: 0, slots: [], gap: 0 };
    addEventListener('pointermove', this.#onPointerMove);
    addEventListener('pointerup', this.#onPointerUp);
    addEventListener('pointercancel', this.#onPointerCancel);
    addEventListener('keydown', this.#onDragKey, true);
  };

  readonly #onPointerMove = (event: PointerEvent) => {
    const drag = this.#drag;

    if (drag === undefined || event.pointerId !== drag.pointerId) {
      return;
    }

    const dx = event.clientX - drag.startX;

    if (drag.slots.length === 0) {
      if (Math.abs(dx) < 4) {
        return;
      }

      // The drag starts: where every task is now.
      const tasks = [...this.renderRoot.querySelectorAll<HTMLElement>('.task')];

      drag.slots = tasks.map((element) => ({ element, left: element.offsetLeft, width: element.offsetWidth }));
      drag.from = tasks.indexOf(drag.task);
      drag.to = drag.from;
      drag.gap = (drag.slots[1]?.left ?? 0) - ((drag.slots[0]?.left ?? 0) + (drag.slots[0]?.width ?? 0));
      this.renderRoot.querySelector('.bar')?.setAttribute('data-dragging', '');
      drag.task.setAttribute('data-dragged', '');
    }

    const self = drag.slots[drag.from];
    const first = drag.slots[0];
    const last = drag.slots[drag.slots.length - 1];

    if (self === undefined || first === undefined || last === undefined) {
      return;
    }

    event.preventDefault();

    // Inside the row of tasks.
    const shift = Math.max(first.left - self.left, Math.min(last.left + last.width - self.left - self.width, dx));
    const left = self.left + shift;
    const middle = (slot: { left: number; width: number }) => slot.left + slot.width / 2;

    drag.task.style.translate = `${shift}px 0`;
    // Its new place: past every task on its right whose middle its right edge has passed, and before every task on its
    // left whose middle its left edge has passed.
    drag.to = drag.from
      + drag.slots.filter((slot, index) => index > drag.from && left + self.width > middle(slot)).length
      - drag.slots.filter((slot, index) => index < drag.from && left < middle(slot)).length;

    // The others between its old and its new place slide aside by its width.
    drag.slots.forEach((slot, index) => {
      if (index === drag.from) {
        return;
      }

      const by = index > drag.from && index <= drag.to
        ? -(self.width + drag.gap)
        : index < drag.from && index >= drag.to
        ? self.width + drag.gap
        : 0;

      slot.element.style.translate = by === 0 ? '' : `${by}px 0`;
    });
  };

  readonly #onPointerUp = (event: PointerEvent) => {
    if (event.pointerId === this.#drag?.pointerId) {
      this.#endDrag(true);
    }
  };

  readonly #onPointerCancel = (event: PointerEvent) => {
    if (event.pointerId === this.#drag?.pointerId) {
      this.#endDrag(false);
    }
  };

  readonly #onDragKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.#drag !== undefined && this.#drag.slots.length > 0) {
      event.preventDefault();
      event.stopPropagation();
      this.#endDrag(false);
    }
  };

  // `drop`: the task goes to its new place (the host reorders, before the next paint: the translations are removed
  // at once, without their transition).
  #endDrag(drop: boolean): void {
    const drag = this.#drag;

    this.#drag = undefined;
    removeEventListener('pointermove', this.#onPointerMove);
    removeEventListener('pointerup', this.#onPointerUp);
    removeEventListener('pointercancel', this.#onPointerCancel);
    removeEventListener('keydown', this.#onDragKey, true);

    if (drag === undefined || drag.slots.length === 0) {
      return;
    }

    this.renderRoot.querySelector('.bar')?.removeAttribute('data-dragging');
    drag.task.removeAttribute('data-dragged');

    for (const slot of drag.slots) {
      slot.element.style.translate = '';
    }

    // The click that follows the release (if any) does not select.
    this.#dragged = true;
    setTimeout(() => (this.#dragged = false));

    if (drop && drag.to !== drag.from) {
      this.#move(drag.id, drag.to);
    }
  }

  #close(task: Spec.Task): void {
    if (task.closable === false) {
      return;
    }

    this.#refocus = this.shadowRoot?.activeElement !== null;
    this.#emit('task-close', task.id);
  }

  readonly #onKeyDown = (event: KeyboardEvent) => {
    const buttons = this.#buttons();
    const index = buttons.indexOf(this.shadowRoot?.activeElement as HTMLButtonElement);

    if (index < 0) {
      return;
    }

    // Ctrl+Shift+Left/Right: the focused task one place to the left or right.
    if (event.ctrlKey && event.shiftKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      const id = buttons[index]?.dataset['id'];
      const from = this.tasks.findIndex((task) => task.id === id);
      const to = from + (event.key === 'ArrowLeft' ? -1 : 1);

      event.preventDefault();

      if (id !== undefined && from >= 0 && to >= 0 && to < this.tasks.length) {
        this.#refocusId = id;
        this.#move(id, to);
      }

      return;
    }

    const target = event.key === 'ArrowRight'
      ? buttons[(index + 1) % buttons.length]
      : event.key === 'ArrowLeft'
      ? buttons[(index - 1 + buttons.length) % buttons.length]
      : event.key === 'Home'
      ? buttons[0]
      : event.key === 'End'
      ? buttons[buttons.length - 1]
      : undefined;

    if (target !== undefined) {
      event.preventDefault();
      target.focus();
    } else if (event.key === 'Delete') {
      const task = this.tasks.find((candidate) => candidate.id === buttons[index]?.dataset['id']);

      if (task !== undefined) {
        event.preventDefault();
        this.#close(task);
      }
    }
  };

  protected override render(): TemplateResult {
    const texts = textsFor(document.documentElement.lang);
    // The one tab stop: the active task, else the first.
    const stop = this.tasks.some((task) => task.id === this.active) ? this.active : this.tasks[0]?.id;

    return html`
      <div class="bar" role="toolbar" aria-label=${texts.taskbar} @keydown=${this.#onKeyDown}>
        ${
      repeat(this.tasks, (task) => task.id, (task) => {
        const active = task.id === this.active;

        return html`
            <div
              class="task"
              ?data-active=${active}
              @pointerdown=${(event: PointerEvent) => this.#onPointerDown(event, task.id)}
              @mousedown=${(event: MouseEvent) => event.button === 1 && event.preventDefault()}
              @auxclick=${(event: MouseEvent) => event.button === 1 && this.#close(task)}
            >
              <button
                type="button"
                class="task-button"
                data-id=${task.id}
                aria-pressed=${active ? 'true' : 'false'}
                tabindex=${task.id === stop ? 0 : -1}
                title=${task.title}
                @click=${() => this.#dragged || this.#emit('task-select', task.id)}
              >
                ${
          task.icon === undefined
            ? html`<span class="task-icon" aria-hidden="true">${initialsIcon(task.title)}</span>`
            : html`<span class="task-icon" aria-hidden="true">${unsafeHTML(task.icon)}</span>`
        }
                <span class="task-title">${task.title}</span>
              </button>
              ${
          task.closable === false
            ? nothing
            : html`<button
                type="button"
                class="task-close"
                data-id=${task.id}
                tabindex="-1"
                aria-label=${texts.closeTask(task.title)}
                title=${texts.closeTask(task.title)}
                @click=${() => this.#close(task)}
              >${closeIcon()}</button>`
        }
            </div>
          `;
      })
    }
      </div>
    `;
  }
}
