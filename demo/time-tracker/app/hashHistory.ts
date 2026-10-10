import type { createMemoryRouter } from 'react-router';

export { mirrorInHash, pathFromHash };

type Router = ReturnType<typeof createMemoryRouter>;

// What an app writes into the state of each browser history entry that is its own: which router wrote it (`id`: a
// reload or a reopened app starts a new one, and the old marks are ignored), the index of the memory router's entry,
// and its run (the entries the browser has one after another without any of another app between them).
type Mark = { id: string; index: number; run: number };

let instances = 0;

// The same file in each of the root's apps (Board Manager, File Center, User Manager, Time Tracker, Human
// Resources): a change goes into all five.

// The route in the hash after a prefix (`#time-tracker/employees/e3` gives `/employees/e3`), or none for a hash with
// another start (another app, the page's tabs, a host page's anchors).
function pathFromHash(prefix: string): string | undefined {
  const { hash } = location;

  return hash === prefix ? '/' : hash.startsWith(`${prefix}/`) ? hash.slice(prefix.length) : undefined;
}

// Mirrors a memory router in the URL hash after a prefix, and keeps the browser's history in step with it, so the
// browser's Back and Forward step through the app's pages too (2026-10-07, the user's wish; only replaced before):
// - A new page of the app is a new browser entry (`pushState`), a replaced one replaces it.
// - The browser's Back and Forward move the memory router by as many entries (its own Back and Forward buttons and
//   their tooltips stay right); an entry that is not the router's own (a typed hash, an older run) is opened by path.
// - The app's own Back and Forward move the browser too (`history.go`), unless the entry they go to is not next to
//   the current one in the browser's history (another app was used in between): then the current one is replaced.
// - Written only while the element is shown (not inside `[hidden]`), and again when it is shown (a cockpit's app or
//   a tab panel), which starts a new run unless the browser went back to one of the app's entries.
function mirrorInHash(router: Router, element: HTMLElement, prefix: string): () => void {
  const id = `${Date.now()}-${++instances}`;
  const indexOfKey = new Map<string, number>([[router.state.location.key, 0]]);
  const pathAt = [router.state.location.pathname];
  const runAt = [0];
  let index = 0;
  let run = 0;
  let runs = 0;
  let lastKey = router.state.location.key;

  const isHidden = () => element.closest('[hidden]') !== null;
  const hashOf = (path: string) => path === '/' ? prefix : `${prefix}${path}`;

  const markOf = (state: unknown): Mark | undefined => {
    const mark = (state as Record<string, Mark | undefined> | null)?.[prefix];

    return mark?.id === id ? mark : undefined;
  };

  const write = (push: boolean) => {
    const url = `${location.pathname}${location.search}${hashOf(router.state.location.pathname)}`;
    const state = { [prefix]: { id, index, run } satisfies Mark };

    if (push) {
      history.pushState(state, '', url);
    } else {
      history.replaceState(state, '', url);
    }
  };

  const unsubscribe = router.subscribe((state) => {
    const { key, pathname } = state.location;

    if (key === lastKey) {
      return;
    }

    const before = index;
    lastKey = key;

    if (state.historyAction === 'POP') {
      index = indexOfKey.get(key) ?? index;
    } else {
      if (state.historyAction === 'PUSH') {
        index += 1;
        pathAt.length = index;
        runAt.length = index;
      }

      indexOfKey.set(key, index);
      pathAt[index] = pathname;
      runAt[index] = run;
    }

    if (isHidden()) {
      return;
    }

    const mark = markOf(history.state);

    if (location.hash === hashOf(pathname)) {
      // The browser is there already (it moved first, or the hash was typed): only its mark.
      if (mark?.index !== index) {
        write(false);
      }
    } else if (state.historyAction === 'POP' && mark?.index === before && runAt[index] === run) {
      history.go(index - before);
    } else {
      write(state.historyAction === 'PUSH');
    }
  });

  const onPopState = () => {
    const path = pathFromHash(prefix);

    if (path === undefined) {
      return;
    }

    const mark = markOf(history.state);

    if (mark !== undefined && pathAt[mark.index] === path) {
      run = mark.run;
      runAt[mark.index] = mark.run;

      if (mark.index !== index) {
        void router.navigate(mark.index - index);
      }
    } else if (path !== router.state.location.pathname) {
      void router.navigate(path);
    }
  };

  // The tab's panel, or the cockpit's mini-app (`data-hash-segment`), is shown (`hidden` removed) when it is chosen:
  // then the tabs or the cockpit have just written the bare prefix (e.g. `#time-tracker`).
  let hidden = isHidden();
  const observer = new MutationObserver(() => {
    const shown = hidden && !isHidden();
    hidden = isHidden();

    if (shown && markOf(history.state)?.index !== index) {
      run = ++runs;
      runAt[index] = run;
      write(false);
    }
  });
  const panel = element.closest('.ui-tabs__panel, [data-hash-segment]');

  if (panel !== null) {
    observer.observe(panel, { attributes: true, attributeFilter: ['hidden'] });
  }

  // Shown at once: the current entry is the app's (also without a hash, where the cockpit shows its default app).
  if (!hidden) {
    write(false);
  }

  window.addEventListener('popstate', onPopState);

  return () => {
    unsubscribe();
    observer.disconnect();
    window.removeEventListener('popstate', onPopState);
  };
}
