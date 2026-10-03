import type { AppCockpit } from '../src';

export { accentSetting, MENU, navigationSetting, pageSettings, USER, userMenu };

// The footer of the demo pages: the page's settings (the color scheme; the language in the kebab menu) as actions with choices, and a made-up
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

// The accent colors of the menu: Mantine's (shade 6), violet by default; "design" is the design language's
// (`--ui-color-accent`).
const ACCENTS = [
  ['design', 'Design language', ''],
  ['blue', 'Blue', '#228be6'],
  ['indigo', 'Indigo', '#4c6ef5'],
  ['violet', 'Violet', '#7950f2'],
  ['grape', 'Grape', '#be4bdb'],
  ['pink', 'Pink', '#e64980'],
  ['red', 'Red', '#fa5252'],
  ['orange', 'Orange', '#fd7e14'],
  ['teal', 'Teal', '#12b886'],
  ['green', 'Green', '#40c057'],
  ['cyan', 'Cyan', '#15aabf'],
] as const;

// The page's accent color: only the custom property `--app-accent-color` on `<html>` (none for "Design language"),
// remembered per browser; violet by default. The cockpit follows it; the page maps it to the apps' own tokens (`demo/demo.css` of the root page).
function accentSetting(): AppCockpit.Action {
  const root = document.documentElement;
  let accent = 'violet';

  // An unknown value (e.g. "default", remembered before 2026-10-03): violet.
  const apply = (value: string) => {
    const [id, , color] = ACCENTS.find(([candidate]) => candidate === value)
      ?? ACCENTS.find(([candidate]) => candidate === 'violet')!;

    accent = id;

    if (color === '') {
      root.style.removeProperty('--app-accent-color');
    } else {
      root.style.setProperty('--app-accent-color', color);
    }
  };

  try {
    apply(localStorage.getItem('demo-page:accent') ?? 'violet');
  } catch {
    apply('violet');
  }

  return {
    id: 'accent',
    label: 'Accent color',
    icon: svg(
      '<path d="M12 21a9 9 0 0 1 0 -18c4.97 0 9 3.582 9 8c0 1.06 -.474 2.078 -1.318 2.828c-.844 .75 -1.989 1.172 -3.182 1.172h-2.5a2 2 0 0 0 -1 3.75a1.3 1.3 0 0 1 -1 2.25"/><path d="M8.5 10.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M12.5 7.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M16.5 10.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/>',
    ),
    choices: {
      options: ACCENTS.map(([value, label]) => ({ value, label })),
      value: () => accent,
      onChange: (value) => {
        apply(value);

        try {
          localStorage.setItem('demo-page:accent', accent);
        } catch {
          // Not remembered.
        }
      },
    },
  };
}

// The cockpit's navigation (2026-10-03, one button for two settings): its position (the attribute `layout`: sidebar or
// topbar) and its colors (`nav-scheme`: always dark, or like the page). Switched live, remembered per browser.
function navigationSetting(selector = 'app-cockpit'): AppCockpit.Action {
  const cockpit = () => document.querySelector<AppCockpit.Element>(selector);
  const stored = (key: string) => {
    try {
      return localStorage.getItem(`demo-page:${key}`);
    } catch {
      return null;
    }
  };
  const set = (key: string, attribute: string, value: string) => {
    cockpit()?.setAttribute(attribute, value);

    try {
      localStorage.setItem(`demo-page:${key}`, value);
    } catch {
      // Not remembered.
    }
  };
  const layout: AppCockpit.Layout = stored('layout') === 'topbar' ? 'topbar' : 'sidebar';
  // Like the page by default (2026-10-03).
  const scheme: AppCockpit.NavScheme = stored('nav-scheme') === 'dark' ? 'dark' : 'page';

  cockpit()?.setAttribute('layout', layout);
  cockpit()?.setAttribute('nav-scheme', scheme);

  const item = (key: string, attribute: string, value: string, label: string, current: () => string) => ({
    id: `${key}:${value}`,
    label,
    checked: () => current() === value,
    onSelect: () => set(key, attribute, value),
  });
  const currentLayout = () => cockpit()?.layout ?? layout;
  const currentScheme = () => cockpit()?.navScheme ?? scheme;

  return {
    id: 'navigation',
    label: 'Navigation',
    icon: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>'),
    menu: [
      {
        label: 'Position',
        items: [
          item('layout', 'layout', 'sidebar', 'Sidebar', currentLayout),
          item('layout', 'layout', 'topbar', 'Topbar', currentLayout),
        ],
      },
      {
        label: 'Colors',
        items: [
          item('nav-scheme', 'nav-scheme', 'dark', 'Dark', currentScheme),
          item('nav-scheme', 'nav-scheme', 'page', 'Like the page', currentScheme),
        ],
      },
    ],
  };
}

// A made-up menu (the kebab menu of the footer): its items only log.
// The page's language (`<html lang>`, set by `pageSettings()`), a section of the kebab menu (2026-10-03; an action of
// the footer before): the current one checked.
const LANGUAGES = [{ value: 'en-US', label: 'English' }, { value: 'de-DE', label: 'Deutsch' }];

const languageSection: AppCockpit.MenuSection = {
  label: 'Language',
  items: LANGUAGES.map(({ value, label }) => ({
    id: `language:${value}`,
    label,
    checked: () => document.documentElement.lang === value,
    onSelect: () => {
      document.documentElement.lang = value;

      try {
        localStorage.setItem('demo-page:language', value);
      } catch {
        // Not remembered.
      }
    },
  })),
};

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
  languageSection,
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
const USER: AppCockpit.User = { name: 'Jane Doe', detail: 'jane.doe@acme.example' };

// `signOut`: what "Sign out" does (the root page shows its login screen; else it only logs).
const userMenu = (signOut: () => void = log('Sign out')): AppCockpit.Config['userMenu'] => [
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
    onSelect: signOut,
  }],
];
