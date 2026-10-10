import { useState } from 'react';
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react';

export { useRowDrag };
export type { RowDrag };

// A drag in progress: the line of the dragged row and the slot it would take (the number of the other lines above it),
// how far it is moved (px), and its height (px), by which the lines between the two make room.
type DragState = { from: number; to: number; offset: number; height: number };

// What the cells of a row show of a drag: lifted and moved with the pointer, moved aside (up or down) to make room, or
// nothing. `style` is the transform (a runtime value, set inline).
type RowLook = { state: 'dragged' | 'up' | 'down' | undefined; style: CSSProperties | undefined };

type RowDrag = {
  drag: DragState | undefined;
  lookOf: (index: number) => RowLook;
  // The handlers of the drag handle of the row of this line.
  handleProps: (index: number) => {
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void;
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  };
};

type Bounds = { top: number; bottom: number };

const NO_LOOK: RowLook = { state: undefined, style: undefined };

// The vertical extent of every line of the rows area, in the order shown: a group header, or the cells of a data row
// and of its detail row (rows are `display: contents`, so the cells are measured; the ones with the same `data-line`
// are one line).
function lineBounds(table: Element): readonly Bounds[] {
  const bounds = new Map<string, Bounds>();

  for (const row of table.querySelectorAll<HTMLElement>('[role="row"][data-line]')) {
    const key = row.getAttribute('data-line') ?? '';
    const cell = row.firstElementChild;

    if (cell === null) {
      continue;
    }

    const rect = cell.getBoundingClientRect();
    const known = bounds.get(key);

    bounds.set(key, {
      top: Math.min(known?.top ?? rect.top, rect.top),
      bottom: Math.max(known?.bottom ?? rect.bottom, rect.bottom),
    });
  }

  return [...bounds.values()];
}

// Moving rows by dragging their handle (pointer: mouse, touch, pen) or with the keyboard (Alt+ArrowUp/ArrowDown on the
// handle; a group header counts as a line, so a row passes into the next group). During a drag, the row follows the
// pointer (within the lines of the page), and the lines between its old and its new place slide aside to
// make room; nothing changes in the DOM until the release, which moves it (`move(from, slot)`). Escape and a cancelled
// pointer end the drag without a move. `count`: the number of lines; `enabled`: whether rows can be moved now.
function useRowDrag(
  count: number,
  enabled: boolean,
  move: (from: number, slot: number) => void,
): RowDrag {
  const [drag, setDrag] = useState<DragState | undefined>(undefined);

  const start = (event: PointerEvent<HTMLButtonElement>, from: number) => {
    const table = event.currentTarget.closest('[role="table"]');
    const scroller = table?.parentElement;

    if (!enabled || event.button !== 0 || table === null || scroller === null || scroller === undefined) {
      return;
    }

    // No text selection and no scrolling (touch) while dragging; the handle keeps the pointer.
    event.preventDefault();

    const handle = event.currentTarget;

    // Measured once, before anything moves (the transforms would change the measures): in the coordinates of the
    // content of the rows area, so a scroll during the drag counts too.
    const startScroll = scroller.scrollTop;
    const bounds = lineBounds(table).map(({ top, bottom }) => ({
      top: top + startScroll,
      bottom: bottom + startScroll,
    }));
    const own = bounds[from];

    if (own === undefined) {
      return;
    }

    const first = bounds[0] ?? own;
    const last = bounds[bounds.length - 1] ?? own;
    const height = own.bottom - own.top;
    const startY = event.clientY;
    let pointerY = startY;
    let to = from;

    try {
      handle.setPointerCapture(event.pointerId);
    } catch {
      // Not a pointer the browser knows of (a synthetic event): the handle gets its events all the same.
    }

    // The row follows the pointer, but is shown within the rows (never over the header or below the last row). Its new
    // index: how many of the other rows have their middle above its middle (where the pointer took it, not where it is
    // shown: so the first and the last place can be reached also when the rows differ in height).
    const update = () => {
      const moved = pointerY - startY + scroller.scrollTop - startScroll;
      const offset = Math.min(Math.max(moved, first.top - own.top), last.bottom - own.bottom);
      const middle = (own.top + own.bottom) / 2 + moved;

      to = bounds.filter((bound, index) => index !== from && (bound.top + bound.bottom) / 2 < middle).length;
      setDrag({ from, to, offset, height });
    };

    const onMove = (moved: globalThis.PointerEvent) => {
      pointerY = moved.clientY;
      update();
    };

    const finish = (commit: boolean) => {
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
      handle.removeEventListener('pointercancel', onCancel);
      scroller.removeEventListener('scroll', update);
      window.removeEventListener('keydown', onKey, true);
      setDrag(undefined);

      if (commit) {
        move(from, to);
      }
    };

    const onUp = () => finish(true);
    const onCancel = () => finish(false);
    const onKey = (key: globalThis.KeyboardEvent) => {
      if (key.key === 'Escape') {
        key.stopPropagation();
        finish(false);
      }
    };

    setDrag({ from, to, offset: 0, height });
    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
    handle.addEventListener('pointercancel', onCancel);
    scroller.addEventListener('scroll', update);
    window.addEventListener('keydown', onKey, true);
  };

  // Up and down by one line (a group header counts: past it, the row goes into the next group).
  const STEPS: Readonly<Record<string, number>> = { ArrowUp: -1, ArrowDown: 1 };

  const keyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const by = STEPS[event.key];

    if (!enabled || !event.altKey || by === undefined) {
      return;
    }

    event.preventDefault();

    const handle = event.currentTarget;

    if (index + by >= 0 && index + by < count) {
      move(index, index + by);
    }

    // The row keeps its elements, but moving a focused element in the DOM may take its focus away.
    requestAnimationFrame(() => handle.isConnected && handle.focus());
  };

  const lookOf = (index: number): RowLook => {
    if (drag === undefined) {
      return NO_LOOK;
    }

    const { from, to, offset, height } = drag;

    if (index === from) {
      return { state: 'dragged', style: { transform: `translateY(${offset}px)` } };
    }

    // Moving down, the rows it passes go up by its height; moving up, they go down.
    if (from < to && index > from && index <= to) {
      return { state: 'up', style: { transform: `translateY(${-height}px)` } };
    }

    if (to < from && index >= to && index < from) {
      return { state: 'down', style: { transform: `translateY(${height}px)` } };
    }

    return NO_LOOK;
  };

  return {
    drag,
    lookOf,
    handleProps: (index) => ({
      onPointerDown: (event) => start(event, index),
      onKeyDown: (event) => keyDown(event, index),
    }),
  };
}
