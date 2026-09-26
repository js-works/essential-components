export { setupUi };

// The behavior of ui.css (see its header for the purpose and the rules).
//
// `setupUi(root)` sets up every `.ui-tabs` inside `root` (default: the whole document) that is not set up yet, and
// returns a cleanup. A part of the page that is added later (e.g. a custom element) calls it for itself when it is
// connected, and the cleanup when it is disconnected.
//
// Tabs (WAI-ARIA tabs pattern):
// - The markup needs no ids and no ARIA (nor `data-label`, the label for the width reserve of the CSS): the tabs are the `.ui-tabs__tab` buttons in a `.ui-tabs`, its panels are the
//   `.ui-tabs__panel` siblings of that `.ui-tabs`, in the same order. Ids, roles, `aria-controls`, `aria-labelledby`,
//   `aria-selected` and `tabindex` are set here, so several parts of one page never clash.
// - A click or the arrow keys (Left and Right, or Up and Down for `.ui-tabs--vertical`, which also gets
//   `aria-orientation`; Home, End) select a tab and show its panel, the others get `hidden`.
// - The URL hash keeps the selection, one segment per level of nested tabs (`#settings/advanced`), so a reload stays
//   on it. A segment is the text of the tab in kebab case. Trailing first tabs are left out, so the default is no hash.

type Tabs = {
  readonly tablist: HTMLElement;
  readonly tabs: readonly HTMLElement[];
  // How many tab panels the tablist is nested in.
  readonly level: number;
  readonly selected: () => HTMLElement | undefined;
  readonly selectFromHash: () => void;
};

const allTabs = new Set<Tabs>();
let counter = 0;

function setupUi(root: ParentNode = document): () => void {
  const cleanups = [...root.querySelectorAll<HTMLElement>('.ui-tabs')]
    .filter((tablist) => ![...allTabs].some((tabs) => tabs.tablist === tablist))
    .map(setupTabs);

  return () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
  };
}

function setupTabs(tablist: HTMLElement): () => void {
  const tabs = [...tablist.querySelectorAll<HTMLElement>('.ui-tabs__tab')];
  const panels = [...(tablist.parentElement?.children ?? [])].filter((child): child is HTMLElement =>
    child instanceof HTMLElement && child.classList.contains('ui-tabs__panel')
  );
  let level = 0;

  for (let parent = tablist.parentElement; parent !== null; parent = parent.parentElement) {
    level += parent.classList.contains('ui-tabs__panel') ? 1 : 0;
  }

  const vertical = tablist.classList.contains('ui-tabs--vertical');

  tablist.setAttribute('role', 'tablist');

  if (vertical) {
    tablist.setAttribute('aria-orientation', 'vertical');
  }

  for (const [index, tab] of tabs.entries()) {
    const panel = panels[index];
    const id = ++counter;

    tab.id ||= `ui-tab-${id}`;
    tab.setAttribute('role', 'tab');
    // For the CSS: the bold label reserves its width, so selecting never changes the width.
    tab.dataset['label'] = (tab.textContent ?? '').trim();

    if (panel !== undefined) {
      panel.id ||= `ui-tabpanel-${id}`;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      tab.setAttribute('aria-controls', panel.id);
    }
  }

  const select = (tab: HTMLElement) => {
    for (const [index, other] of tabs.entries()) {
      const selected = other === tab;

      other.setAttribute('aria-selected', String(selected));
      other.tabIndex = selected ? 0 : -1;

      const panel = panels[index];

      if (panel !== undefined) {
        panel.hidden = !selected;
      }
    }
  };

  const entry: Tabs = {
    tablist,
    tabs,
    level,
    selected: () => tabs.find((tab) => tab.getAttribute('aria-selected') === 'true'),
    selectFromHash: () => {
      const segment = location.hash.slice(1).split('/')[level];
      const tab = tabs.find((candidate) => segmentOf(candidate) === segment) ?? tabs[0];

      if (tab !== undefined) {
        select(tab);
      }
    },
  };

  for (const [index, tab] of tabs.entries()) {
    tab.addEventListener('click', () => {
      select(tab);
      updateHash();
    });
    tab.addEventListener('keydown', (event) => {
      const targets: Readonly<Record<string, HTMLElement | undefined>> = {
        [vertical ? 'ArrowDown' : 'ArrowRight']: tabs[(index + 1) % tabs.length],
        [vertical ? 'ArrowUp' : 'ArrowLeft']: tabs[(index - 1 + tabs.length) % tabs.length],
        Home: tabs[0],
        End: tabs.at(-1),
      };
      const next = targets[event.key];

      if (next !== undefined) {
        event.preventDefault();
        select(next);
        next.focus();
        updateHash();
      }
    });
  }

  allTabs.add(entry);
  entry.selectFromHash();
  window.addEventListener('hashchange', entry.selectFromHash);

  return () => {
    allTabs.delete(entry);
    window.removeEventListener('hashchange', entry.selectFromHash);
  };
}

// The text of a tab in kebab case: "Custom element" is `custom-element`.
function segmentOf(tab: HTMLElement): string {
  return (tab.textContent ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// The hash from the selected tab of every visible tablist, one segment per level. Trailing first tabs are left out.
function updateHash(): void {
  const levels: { segment: string; first: boolean }[] = [];

  for (const { tablist, tabs, level, selected } of allTabs) {
    const tab = selected();

    if (tab !== undefined && tablist.isConnected && tablist.closest('[hidden]') === null) {
      levels[level] = { segment: segmentOf(tab), first: tab === tabs[0] };
    }
  }

  while (levels.length > 0 && (levels.at(-1)?.first ?? true)) {
    levels.pop();
  }

  const hash = levels.length === 0 ? '' : `#${[...levels].map((entry) => entry?.segment ?? '').join('/')}`;

  if (location.hash !== hash) {
    history.replaceState(null, '', `${location.pathname}${location.search}${hash}`);
  }
}
