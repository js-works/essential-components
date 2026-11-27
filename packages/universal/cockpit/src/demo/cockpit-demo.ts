import type {
  AppearanceAccent,
  AppearancePickerElement,
  AppHeaderElement,
  AppHeaderLink,
  CockpitTheme,
  NavDensity,
  NavTreeElement,
  NavTreeItem,
  StatusViewElement,
  StatusViewKind,
  SystemBannerElement,
  SystemBannerTone,
} from '../main/index.js';
import {
  createAppearancePickerClass,
  createAppHeaderClass,
  createNavTreeClass,
  createStatusViewClass,
  createSystemBannerClass,
} from '../main/index.js';
import { wireAppHeader } from './app-header-demo.js';
import { DEMO_I18N } from './i18n.js';
import { mountReactDemo } from './react-demo.js';
import './cockpit-demo.css';
import { setupUi } from './ui/ui.js';

export { CockpitDemo };

const svg = (paths: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

const ICON = svg('<path d="M3 21l18 0"/><path d="M5 21v-14l8 -4v18"/><path d="M19 21v-10l-6 -4"/><path d="M9 9v.01"/>');

// The other apps of a made-up app made of very different ones (the title's switcher).
const SWITCHER: readonly AppHeaderLink[] = Object.freeze([
  {
    id: 'projects',
    label: 'Projects',
    description: 'Projects, their tasks and the people on them',
    href: '/apps/projects',
    icon: ICON,
  },
  {
    id: 'invoices',
    label: 'Invoices',
    description: 'Invoices to customers, their payments and reminders',
    href: '/apps/invoices',
    icon: svg('<path d="M5 21v-16a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v16l-3 -2l-2 2l-2 -2l-2 2l-2 -2l-3 2"/>'),
  },
  {
    id: 'contracts',
    label: 'Contracts',
    description: 'Contracts with suppliers, their terms and renewals',
    href: '/apps/contracts',
    icon: svg(
      '<path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2"/>',
    ),
  },
]);

const MODULES: readonly AppHeaderLink[] = Object.freeze([
  { id: '/', label: 'Overview', href: '/' },
  { id: '/projects', label: 'Projects', href: '/projects' },
  { id: '/people', label: 'People', href: '/people' },
]);

const PROJECTS: Readonly<Record<string, string>> = Object.freeze({ p1: 'Website relaunch', p2: 'New office' });

// An own theme: teal, round tabs, a serif title font.
const OWN_THEME: CockpitTheme = Object.freeze({
  accentColor: '#0f766e',
  fontFamily: 'Georgia, serif',
  headerTabActiveBackgroundColor: 'light-dark(#ccfbf1, #134e4a)',
  headerBorderRadius: '999px',
});

// The nav tree's made-up items: one without a group, two groups, folders with and without an icon.
const TREE_ITEMS: readonly NavTreeItem[] = Object.freeze([
  {
    id: 'dashboard',
    title: 'Dashboard',
    href: '/dashboard',
    icon: svg('<path d="M4 4h6v8h-6z"/><path d="M4 16h6v4h-6z"/><path d="M14 12h6v8h-6z"/><path d="M14 4h6v4h-6z"/>'),
  },
  {
    id: 'projects',
    title: 'Projects',
    href: '/projects',
    icon: ICON,
    group: 'Work',
    description: 'Projects and their tasks',
  },
  { id: 'tasks', title: 'Tasks', href: '/tasks', group: 'Work', subgroup: 'Planning' },
  { id: 'calendar', title: 'Calendar', href: '/calendar', group: 'Work', subgroup: 'Planning' },
  { id: 'timesheets', title: 'Timesheets', href: '/timesheets', group: 'Work', subgroup: 'Planning' },
  { id: 'invoices', title: 'Invoices', href: '/invoices', group: 'Finance', subgroup: 'Billing' },
  { id: 'payments', title: 'Payments', href: '/payments', group: 'Finance', subgroup: 'Billing' },
  { id: 'reports', title: 'Reports', href: '/reports', group: 'Finance' },
]);

// The folders' icons (only "Billing" has one).
const TREE_GROUPS = Object.freeze([
  {
    name: 'Finance',
    subgroups: [{
      name: 'Billing',
      icon: svg(
        '<path d="M3 5m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3z"/><path d="M3 10l18 0"/>',
      ),
    }],
  },
]);

// The appearance picker's accents: a few of Mantine's colors.
const APPEARANCE_ACCENTS: readonly AppearanceAccent[] = Object.freeze([
  { id: 'indigo', label: 'Indigo', color: '#4c6ef5' },
  { id: 'blue', label: 'Blue', color: '#228be6' },
  { id: 'violet', label: 'Violet', color: '#7950f2' },
  { id: 'pink', label: 'Pink', color: '#e64980' },
  { id: 'orange', label: 'Orange', color: '#fd7e14' },
  { id: 'teal', label: 'Teal', color: '#12b886' },
]);

let counter = 0;

// The demo of the cockpit package, as a light DOM custom element without attributes (exported, not registered: the
// page registers it). The app header with a made-up router: its own history of paths, which answers the header's
// events, and a log of them. The cockpit itself is the page around it (it owns the URL hash, so it cannot run a second
// time inside).
class CockpitDemo extends HTMLElement {
  #rendered = false;
  #cleanups: (() => void)[] = [];

  connectedCallback(): void {
    if (!this.#rendered) {
      this.#rendered = true;
      this.#render();
    }

    this.#cleanups = [setupUi(this), mountReactDemo(this.querySelector<HTMLElement>('[data-react]')!)];
  }

  disconnectedCallback(): void {
    for (const cleanup of this.#cleanups) {
      cleanup();
    }

    this.#cleanups = [];
  }

  #render(): void {
    const tags = defineHeaders();
    const id = ++counter;

    this.innerHTML = `
  <div class="ui-stack">
    <nav class="ui-tabs" aria-label="Cockpit">
      <button class="ui-tabs__tab" type="button">App header</button>
      <button class="ui-tabs__tab" type="button">Nav tree</button>
      <button class="ui-tabs__tab" type="button">Status view</button>
      <button class="ui-tabs__tab" type="button">System banner</button>
      <button class="ui-tabs__tab" type="button">Appearance</button>
      <button class="ui-tabs__tab" type="button">React</button>
      <button class="ui-tabs__tab" type="button">Cockpit</button>
    </nav>
    <section class="ui-tabs__panel ui-stack">
      <p class="ui-note">The header of an app (<code>createAppHeaderClass()</code>): the title (here a switcher), the
        modules as tabs (a menu when narrow), the breadcrumb, Back and Forward. It never changes the URL: it fires
        <code>navigate</code>, <code>back</code> and <code>forward</code>, which a router answers (here a made-up one).
        Its texts follow the page's language.</p>
      <form class="ui-toolbar" data-switches>
        <label class="ui-field"><input class="ui-checkbox" type="checkbox" name="switcher" checked> Switcher</label>
        <label class="ui-field"><input class="ui-checkbox" type="checkbox" name="descriptions" checked> Descriptions</label>
        <label class="ui-field">Width
          <select class="ui-select" name="width">
            <option value="">full</option>
            <option value="760px">760px (the tabs a menu)</option>
            <option value="560px">560px (no Back and Forward)</option>
          </select>
        </label>
      </form>
      <h2 class="ui-heading">Default look</h2>
      <div class="cockpit-demo__frame" data-frame>
        <${tags.plain} data-header="${id}-plain"></${tags.plain}>
        <div class="cockpit-demo__page" data-page></div>
      </div>
      <h2 class="ui-heading">Own theme</h2>
      <div class="cockpit-demo__frame" data-frame>
        <${tags.themed} data-header="${id}-themed"></${tags.themed}>
        <div class="cockpit-demo__page" data-page></div>
      </div>
      <h2 class="ui-heading">Events</h2>
      <output class="ui-result cockpit-demo__log" data-log></output>
    </section>
    <section class="ui-tabs__panel ui-stack" hidden>
      <p class="ui-note">The navigation tree of the cockpit's sidebar on its own (<code>createNavTreeClass()</code>): the
        groups as headings, the folders (collapsible), the items as links. A click fires
        <code>navigate</code>, which a router cancels to navigate itself (here: the item becomes the active one); a middle
        click opens a new tab. The host gives the width and wraps it in a <code>&lt;nav&gt;</code>; with a height (here
        420px), the list scrolls between the slots <code>top</code> and <code>bottom</code>.</p>
      <form class="ui-toolbar" data-tree-switches>
        <label class="ui-field">Groups
          <select class="ui-select" name="display">
            <option value="sections" selected>As sections</option>
            <option value="select">One at a time (a dropdown)</option>
          </select>
        </label>
        <label class="ui-field"><input class="ui-checkbox" type="checkbox" name="collapsible"> Collapsible groups</label>
        <label class="ui-field"><input class="ui-checkbox" type="checkbox" name="marked" checked> Marked items</label>
        <label class="ui-field"><input class="ui-checkbox" type="checkbox" name="slots" checked> Top and bottom</label>
        <label class="ui-field">Density
          <select class="ui-select" name="density">
            <option value="compact">Compact</option>
            <option value="normal" selected>Normal</option>
            <option value="comfortable">Comfortable</option>
          </select>
        </label>
      </form>
      <nav class="cockpit-demo__tree" aria-label="Demo navigation">
        <${tags.tree} data-tree></${tags.tree}>
      </nav>
      <h2 class="ui-heading">Events</h2>
      <output class="ui-result cockpit-demo__log" data-tree-log></output>
    </section>
    <section class="ui-tabs__panel ui-stack" hidden>
      <p class="ui-note">Why there is nothing (else) to show (<code>createStatusViewClass()</code>): inline in a page
        (an empty list, no results), or as a screen of its own (not found, no access, an error). Every part only when
        given: a kind's icon, heading and message (each replaceable), the brand, the button (it fires
        <code>action</code>), the footer, the hint. Its texts follow the page's language.</p>
      <form class="ui-toolbar" data-status-switches>
        <label class="ui-field">Layout
          <select class="ui-select" name="layout">
            <option value="inline" selected>Inline</option>
            <option value="screen">Screen (a frame of 560px)</option>
          </select>
        </label>
        <label class="ui-field">Kind
          <select class="ui-select" name="kind">
            <option value="default">Default (none)</option>
            <option value="empty" selected>Empty</option>
            <option value="no-results">No results</option>
            <option value="not-found">Not found</option>
            <option value="forbidden">No access</option>
            <option value="expired">Session expired</option>
            <option value="maintenance">Maintenance</option>
            <option value="error">Error</option>
          </select>
        </label>
        <label class="ui-field"><input class="ui-checkbox" type="checkbox" name="action" checked> Button</label>
        <label class="ui-field"><input class="ui-checkbox" type="checkbox" name="brand"> Brand</label>
        <label class="ui-field"><input class="ui-checkbox" type="checkbox" name="own"> Own texts and icon</label>
        <label class="ui-field"><input class="ui-checkbox" type="checkbox" name="extras"> Extras (slots)</label>
      </form>
      <div class="cockpit-demo__frame" data-status-frame>
        <${tags.status} data-status></${tags.status}>
      </div>
      <h2 class="ui-heading">Events</h2>
      <output class="ui-result cockpit-demo__log" data-status-log></output>
    </section>
    <section class="ui-tabs__panel ui-stack" hidden>
      <p class="ui-note">A strip for what every user must see (<code>createSystemBannerClass()</code>): maintenance, a
        test environment, acting as another user. In the cockpit its slot <code>banner</code>, above everything (the
        package's own demo shows one). The button fires <code>action</code>, the close button <code>dismiss</code>
        (not canceled, the banner hides itself; here it comes back after a second).</p>
      <form class="ui-toolbar" data-banner-switches>
        <label class="ui-field">Tone
          <select class="ui-select" name="tone">
            <option value="info" selected>Info</option>
            <option value="warning">Warning</option>
            <option value="danger">Danger</option>
            <option value="success">Success</option>
          </select>
        </label>
        <label class="ui-field"><input class="ui-checkbox" type="checkbox" name="action" checked> Button</label>
        <label class="ui-field"><input class="ui-checkbox" type="checkbox" name="dismissible" checked> Close button</label>
      </form>
      <div class="cockpit-demo__frame">
        <${tags.banner} data-banner></${tags.banner}>
        <div class="cockpit-demo__page">The page below the banner.</div>
      </div>
      <h2 class="ui-heading">Events</h2>
      <output class="ui-result cockpit-demo__log" data-banner-log></output>
    </section>
    <section class="ui-tabs__panel ui-stack" hidden>
      <p class="ui-note">The user's choice of the look (<code>createAppearancePickerClass()</code>): the color scheme
        and, with <code>accents</code>, the accent color; no density (most UI libraries have none). It applies nothing
        itself: it fires <code>change</code>, and the host applies it, here to the preview on the right (its
        <code>color-scheme</code>, the nav tree's <code>theme</code>, the button's color). Arrow keys choose within a
        group.</p>
      <div class="cockpit-demo__appearance">
        <div class="cockpit-demo__frame cockpit-demo__appearance-picker">
          <${tags.appearance} data-appearance></${tags.appearance}>
        </div>
        <div class="cockpit-demo__frame cockpit-demo__appearance-preview" data-preview>
          <nav class="cockpit-demo__tree" aria-label="Preview navigation">
            <${tags.tree} data-preview-tree></${tags.tree}>
          </nav>
          <div class="cockpit-demo__appearance-page">
            <h3>Projects</h3>
            <p>A preview: the colors follow the picker.</p>
            <button type="button" class="cockpit-demo__appearance-button" data-preview-button>New project</button>
          </div>
        </div>
      </div>
      <h2 class="ui-heading">Events</h2>
      <output class="ui-result cockpit-demo__log" data-appearance-log></output>
    </section>
    <section class="ui-tabs__panel ui-stack" hidden>
      <p class="ui-note">The React components of <code>@local/cockpit/react</code>
        (<code>createNavTreeComponent()</code>, <code>createStatusViewComponent()</code>, …): the elements' properties
        as props, their slots as nodes (<code>top</code>), their events as callbacks (<code>onNavigate</code>), the
        texts through a hook (<code>useI18n</code>). A click on an item makes it the active one; the status view's
        heading follows it.</p>
      <div data-react></div>
    </section>
    <section class="ui-tabs__panel ui-stack" hidden>
      <p class="ui-note">The cockpit (<code>createCockpitClass()</code>) is this page: the navigation (sidebar, topbar,
        app switcher or bottom bar: the footer's "Navigation"), the search (Ctrl K), the taskbar, the start page. It owns
        the first segment of the URL hash, so it does not run a second time in here. Its own demo, with 3, 30 or 100
        made-up apps: <code>npm run dev</code> in <code>packages/universal/cockpit</code>.</p>
    </section>
  </div>`;

    const log = this.querySelector<HTMLOutputElement>('[data-log]')!;
    const write = (line: string) => {
      log.textContent = `${line}\n${log.textContent ?? ''}`.split('\n').slice(0, 8).join('\n');
    };
    const switches = this.querySelector<HTMLFormElement>('[data-switches]')!;
    const headers = [...this.querySelectorAll<AppHeaderElement>('[data-header]')];

    for (const header of headers) {
      header.icon = ICON;
      header.heading = 'Projects';
      header.activeSwitcherItem = 'projects';
      wireAppHeader(header, header.nextElementSibling as HTMLElement, {
        modules: MODULES,
        records: { '/projects': PROJECTS },
        onEvent: write,
      });
    }

    const applySwitches = () => {
      const data = new FormData(switches);
      const descriptions = data.get('descriptions') !== null;
      const switcher = data.get('switcher') === null
        ? []
        : SWITCHER.map((link) => (descriptions ? link : { ...link, description: undefined }));

      for (const header of headers) {
        header.switcher = switcher;
      }

      for (const frame of this.querySelectorAll<HTMLElement>('[data-frame]')) {
        frame.style.maxWidth = String(data.get('width') ?? '');
      }
    };

    switches.addEventListener('change', applySwitches);
    applySwitches();
    this.#wireTree();
    this.#wireStatus();
    this.#wireBanner();
    this.#wireAppearance();
  }

  // The appearance picker: its choice applied to the preview (its color scheme, the nav tree's accent, the button).
  #wireAppearance(): void {
    const picker = this.querySelector<AppearancePickerElement>('[data-appearance]')!;
    const preview = this.querySelector<HTMLElement>('[data-preview]')!;
    const tree = this.querySelector<NavTreeElement>('[data-preview-tree]')!;
    const button = this.querySelector<HTMLElement>('[data-preview-button]')!;
    const log = this.querySelector<HTMLOutputElement>('[data-appearance-log]')!;

    picker.accents = APPEARANCE_ACCENTS;
    picker.accent = 'indigo';
    tree.items = TREE_ITEMS.slice(0, 5);
    tree.active = 'projects';
    tree.addEventListener('navigate', (event) => {
      event.preventDefault();
      tree.active = (event as CustomEvent<{ id: string }>).detail.id;
    });

    const apply = () => {
      const color = APPEARANCE_ACCENTS.find((accent) => accent.id === picker.accent)?.color;

      preview.style.colorScheme = picker.scheme === 'system' ? 'light dark' : picker.scheme;
      tree.theme = color === undefined ? {} : { accentColor: color };
      button.style.backgroundColor = color ?? '';
    };

    picker.addEventListener('change', () => {
      log.textContent = `change (scheme: ${picker.scheme}, accent: ${picker.accent})\n${log.textContent ?? ''}`
        .split('\n').slice(0, 8).join('\n');
      apply();
    });
    apply();
  }

  // The system banner: the switches set its tone, its button and its close button; a dismissed banner comes back after
  // a second (the demo's).
  #wireBanner(): void {
    const banner = this.querySelector<SystemBannerElement>('[data-banner]')!;
    const log = this.querySelector<HTMLOutputElement>('[data-banner-log]')!;
    const switches = this.querySelector<HTMLFormElement>('[data-banner-switches]')!;
    const messages: Readonly<Record<SystemBannerTone, string>> = Object.freeze({
      info: 'A new version is available. Reload to get it.',
      warning: 'Maintenance on Sunday, 8 to 10 am: the apps will not be available.',
      danger: 'You are acting as Jane Doe. Everything you do is done in her name.',
      success: 'All systems are running again.',
    });
    const write = (line: string) => {
      log.textContent = `${line}\n${log.textContent ?? ''}`.split('\n').slice(0, 8).join('\n');
    };

    banner.addEventListener('action', () => write(`action (${banner.tone})`));
    banner.addEventListener('dismiss', () => {
      write(`dismiss (${banner.tone})`);
      setTimeout(() => {
        banner.hidden = false;
      }, 1000);
    });

    const apply = () => {
      const data = new FormData(switches);

      banner.tone = String(data.get('tone')) as SystemBannerTone;
      banner.message = messages[banner.tone];
      banner.actionLabel = data.get('action') === null ? '' : banner.tone === 'danger' ? 'Stop' : 'Details';
      banner.dismissible = data.get('dismissible') !== null;
    };

    switches.addEventListener('change', apply);
    apply();
  }

  // The status view: the switches set its layout, kind, button and brand, the host's texts and icon (the slot `icon`) and
  // its extras (the default slot, the footer, the hint).
  #wireStatus(): void {
    const view = this.querySelector<StatusViewElement>('[data-status]')!;
    const frame = this.querySelector<HTMLElement>('[data-status-frame]')!;
    const log = this.querySelector<HTMLOutputElement>('[data-status-log]')!;
    const switches = this.querySelector<HTMLFormElement>('[data-status-switches]')!;
    const labels: Readonly<Record<StatusViewKind, string>> = Object.freeze({
      default: 'New project',
      empty: 'New project',
      'no-results': 'Clear filters',
      'not-found': 'Back to start',
      forbidden: 'Request access',
      expired: 'Sign in again',
      maintenance: 'Try again',
      error: 'Try again',
    });

    view.addEventListener('action', () => {
      log.textContent = `action (${view.kind})\n${log.textContent ?? ''}`.split('\n').slice(0, 8).join('\n');
    });

    const apply = () => {
      const data = new FormData(switches);
      const own = data.get('own') !== null;
      const extras = data.get('extras') !== null;

      view.layout = data.get('layout') === 'screen' ? 'screen' : 'inline';
      view.kind = String(data.get('kind')) as StatusViewKind;
      view.actionLabel = data.get('action') === null ? '' : labels[view.kind];
      view.headline = data.get('brand') === null ? '' : 'Back Office';
      view.subheadline = data.get('brand') === null ? '' : 'Acme Corporate';
      view.heading = own ? 'No projects yet' : '';
      view.message = own ? 'Projects group the tasks and the people working on them.' : '';
      view.innerHTML = (own ? ICON.replace('<svg ', '<svg slot="icon" ') : '') + (extras
        ? `<p class="cockpit-demo__status-id">Error id: 7f3a-91c2</p>
          <span slot="footer">Need help? <a href="mailto:support@example.com">Contact support</a></span>
          <span slot="hint">© Acme Corporate</span>`
        : '');
      frame.classList.toggle('cockpit-demo__status', view.layout === 'screen');
    };

    switches.addEventListener('change', apply);
    apply();
  }

  // The nav tree with a made-up router: `navigate` canceled, the item becomes the active one; the switches set its
  // attributes.
  #wireTree(): void {
    const tree = this.querySelector<NavTreeElement>('[data-tree]')!;
    const log = this.querySelector<HTMLOutputElement>('[data-tree-log]')!;
    const switches = this.querySelector<HTMLFormElement>('[data-tree-switches]')!;

    tree.items = TREE_ITEMS;
    tree.groups = TREE_GROUPS;
    tree.active = 'projects';
    tree.addEventListener('navigate', (event) => {
      const { id, href } = (event as CustomEvent<{ id: string; href: string }>).detail;

      event.preventDefault();
      tree.active = id;
      log.textContent = `navigate ${href} (canceled: the router's)\n${log.textContent ?? ''}`.split('\n').slice(0, 8)
        .join('\n');
    });

    const apply = () => {
      const data = new FormData(switches);

      tree.groupDisplay = data.get('display') === 'select' ? 'select' : 'sections';
      tree.collapsibleGroups = data.get('collapsible') !== null;
      tree.marked = data.get('marked') === null ? [] : ['tasks', 'invoices'];
      tree.density = String(data.get('density')) as NavDensity;
      tree.innerHTML = data.get('slots') === null
        ? ''
        : `<strong slot="top" class="cockpit-demo__tree-top">Acme Projects</strong>
          <a slot="bottom" class="cockpit-demo__tree-bottom" href="mailto:support@example.com">Help and support</a>`;
    };

    switches.addEventListener('change', apply);
    apply();
  }
}

// The classes of the headers, the nav tree, the status view, the system banner and the appearance picker, registered once under tags of the demo.
function defineHeaders(): {
  plain: string;
  themed: string;
  tree: string;
  status: string;
  banner: string;
  appearance: string;
} {
  const tags = {
    plain: 'cockpit-demo-header',
    themed: 'cockpit-demo-header-themed',
    tree: 'cockpit-demo-nav-tree',
    status: 'cockpit-demo-status-view',
    banner: 'cockpit-demo-system-banner',
    appearance: 'cockpit-demo-appearance-picker',
  };

  if (customElements.get(tags.plain) === undefined) {
    customElements.define(tags.plain, createAppHeaderClass({ i18n: DEMO_I18N }));
    customElements.define(tags.themed, createAppHeaderClass({ theme: OWN_THEME, i18n: DEMO_I18N }));
    customElements.define(tags.tree, createNavTreeClass({ i18n: DEMO_I18N }));
    customElements.define(tags.status, createStatusViewClass({ i18n: DEMO_I18N }));
    customElements.define(tags.banner, createSystemBannerClass({ i18n: DEMO_I18N }));
    customElements.define(tags.appearance, createAppearancePickerClass({ i18n: DEMO_I18N }));
  }

  return tags;
}
