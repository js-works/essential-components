import { useRef } from 'react';
import type { PointerEvent, ReactElement } from 'react';
import { MIN_COLUMN_WIDTH } from '../utils';
import * as classes from './classes';

export { ColumnResizer };

// The handle at the end edge of a column header: drag it to set the column's width (pixels), double-click to give the
// column its own width back. Pointer only and hidden from assistive technology (no keyboard yet): a labeled handle
// would become part of the header's accessible name. A click on it must not reach the header (it would sort the column).
function ColumnResizer({ onStart, onResize }: {
  onStart: () => void;
  onResize: (width: number | undefined) => void;
}): ReactElement {
  const drag = useRef<{ x: number; width: number } | undefined>(undefined);

  // The header cell's width, and which way "wider" is on the screen (the end edge is on the left in a right-to-left
  // table).
  const cellOf = (handle: HTMLElement) => {
    const cell = handle.parentElement as HTMLElement;

    return { width: cell.getBoundingClientRect().width, sign: getComputedStyle(cell).direction === 'rtl' ? -1 : 1 };
  };

  const down = (event: PointerEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, width: cellOf(event.currentTarget).width };
    event.currentTarget.dataset.dragging = '';
    onStart();
  };

  const move = (event: PointerEvent<HTMLElement>) => {
    if (drag.current !== undefined) {
      const { sign } = cellOf(event.currentTarget);

      onResize(Math.max(MIN_COLUMN_WIDTH, Math.round(drag.current.width + sign * (event.clientX - drag.current.x))));
    }
  };

  const up = (event: PointerEvent<HTMLElement>) => {
    drag.current = undefined;
    delete event.currentTarget.dataset.dragging;
  };

  return (
    <span
      aria-hidden="true"
      className={classes.resizer}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={() => onResize(undefined)}
    />
  );
}
