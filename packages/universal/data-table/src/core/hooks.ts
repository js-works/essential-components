import { useEffect, useLayoutEffect, useState } from 'react';

export { useDelayedFlag, useElementHeight, useNarrowerThan, useScrollbarWidth, useScrollEdges, useStickyOffsets };

function useDelayedFlag(active: boolean, delay: number): boolean {
  const [elapsed, setElapsed] = useState(false);

  useEffect(() => {
    if (!active) {
      setElapsed(false);
      return;
    }

    const timer = setTimeout(() => setElapsed(true), delay);

    return () => clearTimeout(timer);
  }, [active, delay]);

  return active && elapsed;
}

// The height of an element, kept up to date. Returns a callback ref for the element and the height in pixels.
function useElementHeight<T extends HTMLElement>(): readonly [(element: T | null) => void, number, T | null] {
  const [element, setElement] = useState<T | null>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (element === null) {
      return;
    }

    const update = () => setHeight(element.offsetHeight);
    const observer = new ResizeObserver(update);

    update();
    observer.observe(element);

    return () => observer.disconnect();
  }, [element]);

  return [setElement, height, element];
}

// Is the element narrower than `limit` (in pixels)? Measured before the first paint and kept up to date. `false` while
// it has no width (not laid out yet, or a test environment without layout).
function useNarrowerThan(element: HTMLElement | null, limit: number): boolean {
  const [narrow, setNarrow] = useState(false);

  useLayoutEffect(() => {
    if (element === null) {
      return;
    }

    const update = () => {
      const width = element.getBoundingClientRect().width;

      setNarrow(width > 0 && width < limit);
    };
    const observer = new ResizeObserver(update);

    update();
    observer.observe(element);

    return () => observer.disconnect();
  }, [element, limit]);

  return narrow;
}

// The width of the vertical scrollbar of an element (the space it reserves, also with `scrollbar-gutter: stable`),
// kept up to date. Returns a callback ref for the element, the width in pixels and the element itself (once set).
function useScrollbarWidth<T extends HTMLElement>(): readonly [(element: T | null) => void, number, T | null] {
  const [element, setElement] = useState<T | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (element === null) {
      return;
    }

    const update = () => setWidth(element.offsetWidth - element.clientWidth);
    const observer = new ResizeObserver(update);

    update();
    observer.observe(element);

    return () => observer.disconnect();
  }, [element]);

  return [setElement, width, element];
}

// Where the fixed columns start: the inline offsets of the sticky cells in a row (each one after the widths of the
// ones before it), read from the cells of `row` marked `data-sticky="start"`, and kept up to date. Their widths come from
// their content (`max-content` tracks), so they are only known after layout.
function useStickyOffsets(row: HTMLElement | null, count: number): readonly number[] {
  const [offsets, setOffsets] = useState<readonly number[]>([]);

  useEffect(() => {
    if (row === null || count === 0) {
      setOffsets((current) => (current.length === 0 ? current : []));
      return;
    }

    const cells = [...row.querySelectorAll<HTMLElement>(':scope > [data-sticky="start"]')];
    const update = () => {
      let offset = 0;
      const next = cells.map((cell) => {
        const start = offset;

        offset += cell.getBoundingClientRect().width;

        return Math.round(start);
      });

      setOffsets((
        current,
      ) => (current.length === next.length && current.every((v, i) => v === next[i]) ? current : next));
    };
    const observer = new ResizeObserver(update);

    update();
    cells.forEach((cell) => observer.observe(cell));

    return () => observer.disconnect();
  }, [row, count]);

  return offsets;
}

// Whether the content of a scroller is scrolled away at its start and at its end (horizontally): there is something
// hidden behind the fixed columns on that side.
function useScrollEdges(scroller: HTMLElement | null): { start: boolean; end: boolean } {
  const [edges, setEdges] = useState({ start: false, end: false });

  useEffect(() => {
    if (scroller === null) {
      return;
    }

    const update = () => {
      const position = Math.abs(scroller.scrollLeft);
      const start = position > 1;
      const end = position + scroller.clientWidth < scroller.scrollWidth - 1;

      setEdges((current) => (current.start === start && current.end === end ? current : { start, end }));
    };
    const observer = new ResizeObserver(update);

    update();
    scroller.addEventListener('scroll', update, { passive: true });
    observer.observe(scroller);
    // The table inside changes its width with the columns.
    scroller.firstElementChild !== null && observer.observe(scroller.firstElementChild);

    return () => {
      scroller.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [scroller]);

  return edges;
}
