import type { CockpitElement, CockpitNavigateDetail } from '../index.js';

export { routeByHash };

// The first segment of the URL's hash (the rest belongs to the open item, e.g. its own pages).
const segmentOf = (hash: string) => decodeURIComponent(hash.slice(1).split('/')[0] ?? '');

// The cockpit's open item in the URL's hash, for a host without a router of its own: the first segment of the hash is
// the item's id (none: the start page, or the default item at the start). The cockpit's `navigate` becomes a history
// entry (Back and Forward go through the items), and a change of the hash (Back, Forward, a link) sets `active`; a
// segment that is no item (e.g. a host's anchor) is left alone after the start. Called once the cockpit has its
// `items`; returns the function that stops it. The element itself never touches the URL.
function routeByHash(cockpit: CockpitElement): () => void {
  const fromHash = (start: boolean) => {
    const id = segmentOf(location.hash);

    if (start || id === '' || cockpit.items.some((item) => item.id === id)) {
      cockpit.active = id;
    }
  };
  const onNavigate = (event: Event) => {
    const { id } = (event as CustomEvent<CockpitNavigateDetail>).detail;

    event.preventDefault();

    if (segmentOf(location.hash) !== id) {
      history.pushState(null, '', `${location.pathname}${location.search}${id === '' ? '' : `#${id}`}`);
    }

    cockpit.active = id;
  };
  const onHashChange = () => fromHash(false);

  fromHash(true);
  cockpit.addEventListener('navigate', onNavigate);
  window.addEventListener('hashchange', onHashChange);
  window.addEventListener('popstate', onHashChange);

  return () => {
    cockpit.removeEventListener('navigate', onNavigate);
    window.removeEventListener('hashchange', onHashChange);
    window.removeEventListener('popstate', onHashChange);
  };
}
