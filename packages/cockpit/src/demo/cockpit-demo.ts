import type { AppHeaderElement, AppHeaderLink, AppHeaderTheme } from '../main/index.js';
import { createAppHeaderClass } from '../main/index.js';
import { wireAppHeader } from './app-header-demo.js';
import { DEMO_I18N } from './i18n.js';
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
const OWN_THEME: AppHeaderTheme = Object.freeze({
  fontFamily: 'Georgia, serif',
  iconBackgroundColor: 'light-dark(#0f766e, #5eead4)',
  tabActiveBackgroundColor: 'light-dark(#ccfbf1, #134e4a)',
  tabActiveTextColor: 'light-dark(#0f766e, #5eead4)',
  linkTextColor: 'light-dark(#0f766e, #5eead4)',
  focusRingColor: 'light-dark(#0f766e, #5eead4)',
  borderRadius: '999px',
});

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

    this.#cleanups = [setupUi(this)];
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
      <p class="ui-note">The cockpit (<code>createCockpitClass()</code>) is this page: the navigation (sidebar, topbar,
        app switcher or bottom bar: the footer's "Navigation"), the search (Ctrl K), the taskbar, the start page. It owns
        the first segment of the URL hash, so it does not run a second time in here. Its own demo, with 3, 30 or 100
        made-up apps: <code>npm run dev</code> in <code>packages/cockpit</code>.</p>
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
  }
}

// The headers' classes, registered once under tags of the demo.
function defineHeaders(): { plain: string; themed: string } {
  const tags = { plain: 'cockpit-demo-header', themed: 'cockpit-demo-header-themed' };

  if (customElements.get(tags.plain) === undefined) {
    customElements.define(tags.plain, createAppHeaderClass({ i18n: DEMO_I18N }));
    customElements.define(tags.themed, createAppHeaderClass({ theme: OWN_THEME, i18n: DEMO_I18N }));
  }

  return tags;
}
