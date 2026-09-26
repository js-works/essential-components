import { useEffect, useState } from 'react';

export { useDelayedFlag, useElementHeight };

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
function useElementHeight<T extends HTMLElement>(): readonly [(element: T | null) => void, number] {
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

  return [setElement, height];
}
