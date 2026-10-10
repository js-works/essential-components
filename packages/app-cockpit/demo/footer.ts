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

// The page's accent color (none for "Design language"), remembered per browser; `initial` (violet) by default, the root
// page uses indigo (2026-10-07). The cockpit's `theme` (2026-10-10; it reads no custom property of the page), and for
// the page the custom property `--app-accent-color` on `<html>`, which the root page maps to the apps' own tokens
// (its `demo/demo.css`).
function accentSetting(initial = 'violet', selector = 'app-cockpit'): AppCockpit.Action {
  const root = document.documentElement;
  let accent = initial;

  // An unknown value (e.g. "default", remembered before 2026-10-03): the initial one.
  const apply = (value: string) => {
    const [id, , color] = ACCENTS.find(([candidate]) => candidate === value)
      ?? ACCENTS.find(([candidate]) => candidate === initial)!;

    accent = id;

    if (color === '') {
      root.style.removeProperty('--app-accent-color');
    } else {
      root.style.setProperty('--app-accent-color', color);
    }

    // Into the cockpit's theme (its other values kept): once the element is defined, so the first apply (from the config,
    // before) does not replace the config's theme.
    void customElements.whenDefined(selector).then(() => {
      document.querySelectorAll<AppCockpit.Element>(selector).forEach((cockpit) => {
        const { accent: _, ...rest } = cockpit.theme;
        cockpit.theme = color === '' ? rest : { ...rest, accent: color };
      });
    });
  };

  try {
    apply(localStorage.getItem('demo-page:accent') ?? initial);
  } catch {
    apply(initial);
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

// The cockpit's navigation (2026-10-03, one button for two settings): which navigation (the attribute `nav`: `side`,
// `top`, `top-switcher`; three attributes before, 2026-10-04; `sidebar`, `topbar`, `topbar-compact`, `switcher` until
// 2026-10-06; `top-compact` until 2026-10-08, when the topbar of two lines went and it became `top`) and its colors (`nav-scheme`: always dark, or like the
// page), and its density (`density`: compact, normal, comfortable; 2026-10-05). Switched live, remembered per browser
// (a value stored under an old name is the default).
const NAVS: { value: AppCockpit.Nav; label: string }[] = [
  { value: 'auto', label: 'Automatic' },
  { value: 'side', label: 'Sidebar' },
  { value: 'top', label: 'Topbar' },
  { value: 'top-switcher', label: 'App switcher' },
  { value: 'bottom', label: 'Bottom bar' },
];

const DENSITIES: { value: AppCockpit.Density; label: string }[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'normal', label: 'Normal' },
  { value: 'comfortable', label: 'Comfortable' },
];

// `scheme`: the colors until the user chooses (the root's page: dark, 2026-10-08; this demo: like the page). `nav`: the
// navigation until the user chooses (the root's page: the topbar of two lines, 2026-10-08; this demo: automatic).
// `startPage`: the start page (the attribute `start-page`) until the user chooses, and a section "Start page" (On,
// Off) in the menu (2026-10-08, the root page: on); without it, no section, and the attribute is left alone.
function navigationSetting(
  selector = 'app-cockpit',
  { scheme: defaultScheme = 'page', nav: defaultNav = 'auto', startPage: defaultStartPage }: {
    scheme?: AppCockpit.NavScheme;
    nav?: AppCockpit.Nav;
    startPage?: boolean;
  } = {},
): AppCockpit.Action {
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
  // The stored choice, else the default (`nav`; automatic, 2026-10-06: the sidebar, the bottom bar in a narrow window).
  const nav = NAVS.find(({ value }) => value === stored('nav'))?.value ?? defaultNav;
  // The stored choice, else the default (`scheme`; like the page before 2026-10-08, everywhere).
  const storedScheme = stored('nav-scheme');
  const scheme: AppCockpit.NavScheme = storedScheme === 'dark' || storedScheme === 'page'
    ? storedScheme
    : defaultScheme;
  const density = DENSITIES.find(({ value }) => value === stored('density'))?.value ?? 'normal';

  cockpit()?.setAttribute('nav', nav);
  cockpit()?.setAttribute('nav-scheme', scheme);
  cockpit()?.setAttribute('density', density);

  // The stored choice ('on', 'off'), else the default; a boolean attribute: present or not.
  const startPage = stored('start-page') === null ? defaultStartPage : stored('start-page') === 'on';
  const setStartPage = (on: boolean) => {
    cockpit()?.toggleAttribute('start-page', on);

    try {
      localStorage.setItem('demo-page:start-page', on ? 'on' : 'off');
    } catch {
      // Not remembered.
    }
  };

  if (startPage !== undefined) {
    cockpit()?.toggleAttribute('start-page', startPage);
  }

  const currentNav = () => cockpit()?.nav ?? nav;
  const currentScheme = () => cockpit()?.navScheme ?? scheme;
  const currentDensity = () => cockpit()?.density ?? density;
  const currentStartPage = () => cockpit()?.startPage ?? startPage;

  return {
    id: 'navigation',
    label: 'Navigation',
    icon: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>'),
    menu: [
      {
        label: 'Navigation',
        items: NAVS.map(({ value, label }) => ({
          id: `nav:${value}`,
          label,
          checked: () => currentNav() === value,
          onSelect: () => set('nav', 'nav', value),
        })),
      },
      {
        label: 'Colors',
        items: [{ value: 'dark', label: 'Dark' }, { value: 'page', label: 'Match page' }].map(
          ({ value, label }) => ({
            id: `nav-scheme:${value}`,
            label,
            checked: () => currentScheme() === value,
            onSelect: () => set('nav-scheme', 'nav-scheme', value),
          }),
        ),
      },
      {
        label: 'Density',
        items: DENSITIES.map(({ value, label }) => ({
          id: `density:${value}`,
          label,
          checked: () => currentDensity() === value,
          onSelect: () => set('density', 'density', value),
        })),
      },
      ...(defaultStartPage === undefined ? [] : [{
        label: 'Start page',
        items: [{ value: true, label: 'On' }, { value: false, label: 'Off' }].map(({ value, label }) => ({
          id: `start-page:${value ? 'on' : 'off'}`,
          label,
          checked: () => currentStartPage() === value,
          onSelect: () => setStartPage(value),
        })),
      }]),
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

// "Reset demo" (2026-10-07): the demo as if it were opened for the very first time. Everything the page may have saved
// is forgotten (`localStorage`, `sessionStorage`, IndexedDB, cookies, the cache storage: all of the origin, so this is
// meant for a demo's own origin), then the page reloads at its start (no hash, no query).
async function resetDemo(): Promise<void> {
  const forget = async (task: () => unknown) => {
    try {
      await task();
    } catch {
      // Not available (e.g. blocked storage): nothing to forget there.
    }
  };

  await forget(() => localStorage.clear());
  await forget(() => sessionStorage.clear());
  await forget(async () => {
    for (const { name } of await indexedDB.databases()) {
      if (name !== undefined) {
        indexedDB.deleteDatabase(name);
      }
    }
  });
  await forget(async () => {
    for (const name of await caches.keys()) {
      await caches.delete(name);
    }
  });
  await forget(() => {
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0]?.trim();

      if (name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      }
    }
  });
  history.replaceState(null, '', location.pathname);
  location.reload();
}

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
      id: 'reset-demo',
      label: 'Reset demo',
      icon: svg(
        '<path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"/><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"/>',
      ),
      onSelect: () => void resetDemo(),
    },
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
