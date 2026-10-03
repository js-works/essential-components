import type { AppCockpit } from '../src';

export { layoutSetting, MENU, pageSettings, USER, USER_MENU };

// The footer of the demo pages: the page's settings (language, color scheme) as actions with choices, and a made-up
// menu (its items only log). Icons after Tabler icons, MIT.
const svg = (paths: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

const log = (label: string) => () => console.info(`app-cockpit demo: "${label}" chosen`);

// The page's settings: they set `<html lang>` and `data-scheme` for everything on the page (applied at once, and
// remembered per browser).
function pageSettings(
  { schemes, scheme }: { schemes: readonly ('system' | 'light' | 'dark')[]; scheme: 'system' | 'light' | 'dark' },
): AppCockpit.Action[] {
  const root = document.documentElement;
  // Remembered per browser (a demo page may reload), if storage works.
  const stored = (key: string, fallback: string) => {
    try {
      return localStorage.getItem(`demo-page:${key}`) ?? fallback;
    } catch {
      return fallback;
    }
  };
  const store = (key: string, value: string) => {
    try {
      localStorage.setItem(`demo-page:${key}`, value);
    } catch {
      // Not remembered.
    }
  };

  root.lang = stored('language', 'en-US');
  root.dataset['scheme'] = schemes.includes(stored('scheme', scheme) as never) ? stored('scheme', scheme) : scheme;

  return [
    {
      id: 'language',
      label: 'Language',
      icon: svg('<path d="M4 5h7M9 3v2c0 4.4-2.2 8-5 8M5 9c0 2.1 2.9 3.9 6.6 4M12 20l4-9 4 9M19.1 18h-6.2"/>'),
      choices: {
        options: [{ value: 'en-US', label: 'English' }, { value: 'de-DE', label: 'Deutsch' }],
        value: () => root.lang,
        onChange: (value) => {
          root.lang = value;
          store('language', value);
        },
      },
    },
    {
      id: 'scheme',
      label: 'Color scheme',
      icon: svg(
        '<circle cx="12" cy="12" r="9"/><path d="M12 3v18M12 9l4.65-4.65M12 14.3l7.37-7.37M12 19.6l8.85-8.85"/>',
      ),
      choices: {
        options: schemes.map((value) => ({ value, label: value.charAt(0).toUpperCase() + value.slice(1) })),
        value: () => root.dataset['scheme'] ?? scheme,
        onChange: (value) => {
          root.dataset['scheme'] = value;
          store('scheme', value);
        },
      },
    },
  ];
}

// The cockpit's layout (its attribute `layout`: sidebar or topbar), switched live and remembered per browser.
function layoutSetting(selector = 'app-cockpit'): AppCockpit.Action {
  const cockpit = () => document.querySelector<AppCockpit.Element>(selector);
  let layout: AppCockpit.Layout = 'sidebar';

  try {
    layout = localStorage.getItem('demo-page:layout') === 'topbar' ? 'topbar' : 'sidebar';
  } catch {
    // The default.
  }

  cockpit()?.setAttribute('layout', layout);

  return {
    id: 'layout',
    label: 'Layout',
    icon: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>'),
    choices: {
      options: [{ value: 'sidebar', label: 'Sidebar' }, { value: 'topbar', label: 'Topbar' }],
      value: () => cockpit()?.layout ?? layout,
      onChange: (value) => {
        layout = value === 'topbar' ? 'topbar' : 'sidebar';
        cockpit()?.setAttribute('layout', layout);

        try {
          localStorage.setItem('demo-page:layout', layout);
        } catch {
          // Not remembered.
        }
      },
    },
  };
}

// A made-up menu (the kebab menu of the footer): its items only log.
const MENU: AppCockpit.Footer['menu'] = [
  [
    {
      id: 'shortcuts',
      label: 'Keyboard shortcuts',
      shortcut: '?',
      icon: svg(
        '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
      ),
      onSelect: log('Keyboard shortcuts'),
    },
  ],
  [
    {
      id: 'whats-new',
      label: 'What\'s new',
      icon: svg('<path d="M12 3l2.4 5 5.6.8-4 3.9.9 5.5L12 15.6l-4.9 2.6.9-5.5-4-3.9 5.6-.8z"/>'),
      onSelect: log('What\'s new'),
    },
    { id: 'about', label: 'About', onSelect: log('About') },
  ],
];

// The signed-in user of the demo pages (made up), and their menu (its items only log).
const USER: AppCockpit.User = { name: 'Anna Schröder', detail: 'anna.schroeder@acme.example' };

const USER_MENU: AppCockpit.Config['userMenu'] = [
  [{
    id: 'profile',
    label: 'Profile',
    icon: svg('<circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>'),
    onSelect: log('Profile'),
  }, {
    id: 'settings',
    label: 'Settings',
    icon: svg(
      '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    ),
    onSelect: log('Settings'),
  }],
  [{
    id: 'sign-out',
    label: 'Sign out',
    icon: svg(
      '<path d="M14 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2M9 12h12l-3-3M18 15l3-3"/>',
    ),
    onSelect: log('Sign out'),
  }],
];
