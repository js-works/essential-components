import type { AnyRouter, RouterHistory } from '@tanstack/react-router';

export { mirrorInHash, pathFromHash };

// What a micro-app writes into the state of each browser history entry that is its own: which router wrote it (`id`: a
// reload or a reopened app starts a new one, and the old marks are ignored), the index of the router's entry, and its
// run (the entries the browser has one after another without any of another app between them).
type Mark = { id: string; index: number; run: number };

let instances = 0;

// The route in the hash after a prefix (`#user-manager/users/u3` gives `/users/u3`), or none for a hash with another
// start (another app, the page's tabs, a host page's anchors).
function pathFromHash(prefix: string): string | undefined {
  const { hash } = location;

  return hash === prefix ? '/' : hash.startsWith(`${prefix}/`) ? hash.slice(prefix.length) : undefined;
}

// Mirrors a router on a memory history in the URL hash after a prefix, and keeps the browser's history in step with it,
// so the browser's Back and Forward step through the micro-app's pages too:
// - A new page is a new browser entry (`pushState`), a replaced one replaces it.
// - The browser's Back and Forward move the router by as many entries; an entry that is not the router's own (a typed
//   hash, an older run) is opened by path.
// - The app's own Back and Forward move the browser too (`history.go`), unless the entry they go to is not next to the
//   current one in the browser's history (another app was used in between): then the current one is replaced.
// - Written only while the element is shown (not inside `[hidden]`), and again when it is shown (a cockpit's app or a
//   tab panel), which starts a new run unless the browser went back to one of the app's entries.
// The router's history keeps its index in each entry's state (`__TSR_index`).
function mirrorInHash(router: AnyRouter, element: HTMLElement, prefix: string): () => void {
  const routerHistory: RouterHistory = router.history;
  const id = `${Date.now()}-${++instances}`;
  const indexOf = () => routerHistory.location.state.__TSR_index ?? 0;
  let index = indexOf();
  const pathAt: string[] = [];
  const runAt: number[] = [];
  let run = 0;
  let runs = 0;

  pathAt[index] = routerHistory.location.pathname;
  runAt[index] = 0;

  const isHidden = () => element.closest('[hidden]') !== null;
  const hashOf = (path: string) => (path === '/' ? prefix : `${prefix}${path}`);

  const markOf = (state: unknown): Mark | undefined => {
    const mark = (state as Record<string, Mark | undefined> | null)?.[prefix];

    return mark?.id === id ? mark : undefined;
  };

  const write = (push: boolean) => {
    const url = `${location.pathname}${location.search}${hashOf(routerHistory.location.pathname)}`;
    const state = { [prefix]: { id, index, run } satisfies Mark };

    if (push) {
      history.pushState(state, '', url);
    } else {
      history.replaceState(state, '', url);
    }
  };

  const unsubscribe = routerHistory.subscribe(({ location: routerLocation, action }) => {
    const before = index;
    const moved = action.type === 'BACK' || action.type === 'FORWARD' || action.type === 'GO';

    index = indexOf();

    if (!moved) {
      if (action.type === 'PUSH') {
        pathAt.length = index;
        runAt.length = index;
      }

      pathAt[index] = routerLocation.pathname;
      runAt[index] = run;
    }

    if (isHidden()) {
      return;
    }

    const mark = markOf(history.state);

    if (location.hash === hashOf(routerLocation.pathname)) {
      // The browser is there already (it moved first, or the hash was typed): only its mark.
      if (mark?.index !== index) {
        write(false);
      }
    } else if (moved && mark?.index === before && runAt[index] === run) {
      history.go(index - before);
    } else {
      write(action.type === 'PUSH');
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
        routerHistory.go(mark.index - index);
      }
    } else if (path !== routerHistory.location.pathname) {
      routerHistory.push(path);
    }
  };

  // The tab's panel, or the cockpit's micro-app (`data-hash-segment`), is shown (`hidden` removed) when it is chosen:
  // then the tabs or the cockpit have just written the bare prefix.
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
