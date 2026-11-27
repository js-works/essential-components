import { useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { NavTreeItem, StatusViewKind } from '../main/index.js';
import { createNavTreeComponent, createStatusViewComponent } from '../main/react/index.js';
import { DEMO_I18N } from './i18n.js';

export { mountReactDemo };

const ITEMS: readonly NavTreeItem[] = Object.freeze([
  { id: 'overview', title: 'Overview', href: '/overview' },
  { id: 'projects', title: 'Projects', href: '/projects', group: 'Work' },
  { id: 'tasks', title: 'Tasks', href: '/tasks', group: 'Work' },
  { id: 'invoices', title: 'Invoices', href: '/invoices', group: 'Finance' },
]);

// The components of `@local/cockpit/react`, made once (the demo's adapter through the hook).
const NavTree = createNavTreeComponent({ useI18n: () => DEMO_I18N });
const StatusView = createStatusViewComponent({ useI18n: () => DEMO_I18N });

// A made-up router: a click on an item is canceled and makes it the active one; the status view says what it is.
function ReactDemo() {
  const [active, setActive] = useState('projects');
  const [kind, setKind] = useState<StatusViewKind>('empty');
  const title = ITEMS.find((item) => item.id === active)?.title ?? '';

  return (
    <div className="cockpit-demo__react">
      <nav className="cockpit-demo__tree" aria-label="React demo navigation">
        <NavTree
          data-tree
          items={ITEMS}
          active={active}
          onNavigate={(event) => {
            event.preventDefault();
            setActive(event.detail.id);
          }}
          top={<strong className="cockpit-demo__tree-top">React</strong>}
        />
      </nav>
      <div className="cockpit-demo__frame ui-stack">
        <label className="ui-field">
          Kind
          <select
            className="ui-select"
            value={kind}
            onChange={(event) => setKind(event.target.value as StatusViewKind)}
          >
            <option value="empty">Empty</option>
            <option value="no-results">No results</option>
            <option value="forbidden">No access</option>
          </select>
        </label>
        <StatusView kind={kind} heading={kind === 'empty' ? `No ${title.toLowerCase()} yet` : ''} actionLabel="Add" />
      </div>
    </div>
  );
}

// Renders the demo into a container; returns what removes it.
function mountReactDemo(container: HTMLElement): () => void {
  const root = createRoot(container);

  root.render(<ReactDemo />);

  return () => root.unmount();
}
