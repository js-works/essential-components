import type { AppHeaderElement, AppHeaderLink } from '../main/index.js';
import { wireAppHeader } from './app-header-demo.js';

export { DEMO_APP_HEADER_TAG, DemoApp };

// The tag of the app header the page registers (`main.ts`).
const DEMO_APP_HEADER_TAG = 'demo-app-header';

const MODULES: readonly AppHeaderLink[] = Object.freeze([
  { id: '/', label: 'Overview', href: '/' },
  { id: '/entries', label: 'Entries', href: '/entries' },
  { id: '/settings', label: 'Settings', href: '/settings' },
]);

const ENTRIES: Readonly<Record<string, string>> = Object.freeze({ e1: 'First entry', e2: 'Second entry' });

const svg = (paths: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

// Tabler's `file-text`, `template` and `mail` (MIT).
const SWITCHER_ICONS = Object.freeze({
  contracts: svg(
    '<path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2"/><path d="M9 9l1 0"/><path d="M9 13l6 0"/><path d="M9 17l6 0"/>',
  ),
  templates: svg(
    '<path d="M4 4m0 1a1 1 0 0 1 1 -1h14a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-14a1 1 0 0 1 -1 -1z"/><path d="M4 12m0 1a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1z"/><path d="M14 12l6 0"/><path d="M14 16l6 0"/><path d="M14 20l6 0"/>',
  ),
  letters: svg(
    '<path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z"/><path d="M3 7l9 6l9 -6"/>',
  ),
});

// An app made of very different ones (the title's switcher), by the app's title.
const SWITCHERS: Readonly<Record<string, readonly AppHeaderLink[]>> = Object.freeze({
  Documents: [
    {
      id: 'contracts',
      label: 'Contracts',
      description: 'Contracts with suppliers and customers',
      href: '/apps/contracts',
      icon: SWITCHER_ICONS.contracts,
    },
    {
      id: 'templates',
      label: 'Templates',
      description: 'Templates for letters and offers',
      href: '/apps/templates',
      icon: SWITCHER_ICONS.templates,
    },
    {
      id: 'letters',
      label: 'Letters',
      description: 'Letters sent and received',
      href: '/apps/letters',
      icon: SWITCHER_ICONS.letters,
    },
  ],
});

// A stand-in for a real mini-app: its app header (the cockpit's `createAppHeaderClass()`, answered by a made-up
// router), the page of the header's route, its description and two cards. Light DOM, styled by `ui.css`.
class DemoApp extends HTMLElement {
  connectedCallback(): void {
    if (this.childElementCount > 0) {
      return;
    }

    const title = this.getAttribute('app-title') ?? '';
    const switcher = SWITCHERS[title];
    const header = document.createElement(DEMO_APP_HEADER_TAG) as AppHeaderElement;
    const body = document.createElement('div');
    const page = document.createElement('div');
    const note = document.createElement('p');
    const columns = document.createElement('div');

    body.className = 'ui-stack demo-app__body';
    note.className = 'ui-note';
    note.textContent = `${this.getAttribute('description') ?? ''}. A stand-in for a real mini-app.`;
    columns.className = 'ui-columns';
    columns.append(card('Today', `Nothing to do in ${title}.`), card('Recent', 'No recent changes.'));
    body.append(page, note, columns);
    this.append(header, body);

    header.icon = switcher?.[0]?.icon ?? this.getAttribute('icon') ?? '';
    header.heading = switcher?.[0]?.label ?? title;
    header.activeSwitcherItem = switcher?.[0]?.id ?? '';
    wireAppHeader(header, page, {
      modules: MODULES,
      records: { '/entries': ENTRIES },
      ...(switcher === undefined ? {} : { switcher }),
    });
  }
}

function card(heading: string, text: string): HTMLElement {
  const section = document.createElement('section');
  const h2 = document.createElement('h2');
  const p = document.createElement('p');

  section.className = 'ui-stack ui-stack--tight';
  h2.className = 'ui-heading';
  h2.textContent = heading;
  p.textContent = text;
  section.append(h2, p);

  return section;
}
