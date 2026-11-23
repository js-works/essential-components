import type { RouterHistory } from '@tanstack/react-router';
import { useRouter } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

export { useHistoryPosition };

type Position = { back: string | undefined; forward: string | undefined };

// Where Back and Forward of the router's history lead (the paths, `undefined` at either end). The history keeps an index
// in each entry's state (`__TSR_index`): the paths are kept by it, and a new entry forgets the ones after it.
function useHistoryPosition(): Position {
  const history: RouterHistory = useRouter().history;
  const [position, setPosition] = useState<Position>({ back: undefined, forward: undefined });

  useEffect(() => {
    const entries: string[] = [];
    const update = (action?: string) => {
      const { pathname, state } = history.location;
      const index = state.__TSR_index ?? 0;

      if (action === 'PUSH') {
        entries.length = index;
      }

      entries[index] = pathname;
      setPosition({ back: index > 0 ? entries[index - 1] ?? '/' : undefined, forward: entries[index + 1] });
    };

    update();

    return history.subscribe(({ action }) => update(action.type));
  }, [history]);

  return position;
}
