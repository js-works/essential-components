import type {
  CockpitAction,
  CockpitElement,
  MenuSection,
  NavDensity,
  NavLayout,
  NavScheme,
  SignedInUser,
  ThemeMenuAccent,
  ThemeMenuValue,
} from '../main/index.js';

export {
  accentColor,
  applyAccent,
  MENU,
  navigationSetting,
  restoreLanguage,
  storedTheme,
  storeTheme,
  THEME_ACCENTS,
  USER,
  userMenu,
};

// The footer of the demo pages: the navigation's settings, the accents for the theme menu (`createThemeMenu`, which
// the pages create), the page's language (in the kebab menu), and a made-up menu (its items only log). Icons after
// Tabler icons, MIT.
const svg = (paths: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

const log = (label: string) => () => console.info(`cockpit demo: "${label}" chosen`);

// The accent colors of the theme menu: Mantine's (shade 6), violet by default.
const ACCENTS = [
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

// The color of the remembered accent (`initial` without one, or with one no longer offered): for a part with a theme of
// its own (the root page's login).
function accentColor(initial = 'violet'): string {
  let id = initial;

  try {
    id = localStorage.getItem('demo-page:accent') ?? initial;
  } catch {
    // The initial one.
  }

  return (ACCENTS.find(([candidate]) => candidate === id) ?? ACCENTS.find(([candidate]) => candidate === initial)!)[2];
}

// The page's accent color (an id of `ACCENTS`, else `initial`): `--app-accent-color` on `<html>` and the cockpit's
// `theme.accentColor`, remembered under `demo-page:accent` (read by `accentColor()`, the login's); returns the id
// applied.
function applyAccent(value: string, initial = 'violet', selector = 'app-cockpit'): string {
  const root = document.documentElement;
  const [id, , color] = ACCENTS.find(([candidate]) => candidate === value)
    ?? ACCENTS.find(([candidate]) => candidate === initial)!;

  root.style.setProperty('--app-accent-color', color);

  try {
    localStorage.setItem('demo-page:accent', id);
  } catch {
    // Not remembered.
  }

  // Into the cockpit's theme (its other values kept): once the element is defined, so the first apply (from the config,
  // before) does not replace the config's theme.
  void customElements.whenDefined(selector).then(() => {
    document.querySelectorAll<CockpitElement>(selector).forEach((element) => {
      element.theme = { ...element.theme, accentColor: color };
    });
  });

  return id;
}

// The accents for `createThemeMenu()` (the package's demo): those of the menu above.
const THEME_ACCENTS: readonly ThemeMenuAccent[] = Object.freeze(
  ACCENTS.map(([id, label, color]) => ({ id, label, color })),
);

// The theme menu's choice, kept per browser by the demo pages (the package remembers nothing): read back as the menu's
// `initial` (an accent no longer offered dropped, so the page's own initial one counts), saved in its `onChange`.
function storedTheme(): Partial<ThemeMenuValue> {
  try {
    const value = JSON.parse(localStorage.getItem('demo-page:theme') ?? '{}') as Partial<ThemeMenuValue>;
    const { accent, ...rest } = value;

    return THEME_ACCENTS.some((each) => each.id === accent) ? value : rest;
  } catch {
    return {};
  }
}

function storeTheme(value: ThemeMenuValue): void {
  try {
    localStorage.setItem('demo-page:theme', JSON.stringify(value));
  } catch {
    // Not kept.
  }
}

// The page's language, remembered per browser (the kebab menu's "Language").
function restoreLanguage(): void {
  try {
    document.documentElement.lang = localStorage.getItem('demo-page:language') ?? 'en-US';
  } catch {
    document.documentElement.lang = 'en-US';
  }
}

// The cockpit's navigation (2026-10-03, one button for two settings): which navigation (the attribute `nav`: `side`,
// `top`, `top-switcher`; three attributes before, 2026-10-04; `sidebar`, `topbar`, `topbar-compact`, `switcher` until
// 2026-10-06; `top-compact` until 2026-10-08, when the topbar of two lines went and it became `top`) and its colors (`nav-scheme`: always dark, or like the
// page), and its density (`density`: compact, normal, comfortable; 2026-10-05). Switched live, remembered per browser
// (a value stored under an old name is the default).
const NAVS: { value: NavLayout; label: string }[] = [
  { value: 'auto', label: 'Automatic' },
  { value: 'side', label: 'Sidebar' },
  { value: 'top', label: 'Topbar' },
  { value: 'top-switcher', label: 'App switcher' },
  { value: 'bottom', label: 'Bottom bar' },
];

const DENSITIES: { value: NavDensity; label: string }[] = [
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
  {
    scheme: defaultScheme = 'page',
    nav: defaultNav = 'auto',
    startPage: defaultStartPage,
    density: withDensity = true,
  }: {
    scheme?: NavScheme;
    nav?: NavLayout;
    startPage?: boolean;
    // The section "Density" (the package's demo: in its theme menu instead).
    density?: boolean;
  } = {},
): CockpitAction {
  const cockpitElement = () => document.querySelector<CockpitElement>(selector);
  const stored = (key: string) => {
    try {
      return localStorage.getItem(`demo-page:${key}`);
    } catch {
      return null;
    }
  };
  const set = (key: string, attribute: string, value: string) => {
    cockpitElement()?.setAttribute(attribute, value);

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
  const scheme: NavScheme = storedScheme === 'dark' || storedScheme === 'page'
    ? storedScheme
    : defaultScheme;
  const density = DENSITIES.find(({ value }) => value === stored('density'))?.value ?? 'normal';

  cockpitElement()?.setAttribute('nav', nav);
  cockpitElement()?.setAttribute('nav-scheme', scheme);
  cockpitElement()?.setAttribute('density', density);

  // The stored choice ('on', 'off'), else the default; a boolean attribute: present or not.
  const startPage = stored('start-page') === null ? defaultStartPage : stored('start-page') === 'on';
  const setStartPage = (on: boolean) => {
    cockpitElement()?.toggleAttribute('start-page', on);

    try {
      localStorage.setItem('demo-page:start-page', on ? 'on' : 'off');
    } catch {
      // Not remembered.
    }
  };

  if (startPage !== undefined) {
    cockpitElement()?.toggleAttribute('start-page', startPage);
  }

  const currentNav = () => cockpitElement()?.nav ?? nav;
  const currentScheme = () => cockpitElement()?.navScheme ?? scheme;
  const currentDensity = () => cockpitElement()?.density ?? density;
  const currentStartPage = () => cockpitElement()?.startPage ?? startPage;

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
      ...(withDensity
        ? [{
          label: 'Density',
          items: DENSITIES.map(({ value, label }) => ({
            id: `density:${value}`,
            label,
            checked: () => currentDensity() === value,
            onSelect: () => set('density', 'density', value),
          })),
        }]
        : []),
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
// The page's language (`<html lang>`, restored by `restoreLanguage()`), a section of the kebab menu (2026-10-03; an action of
// the footer before): the current one checked.
const LANGUAGES = [{ value: 'en-US', label: 'English' }, { value: 'de-DE', label: 'Deutsch' }];

const languageSection: MenuSection = {
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

const MENU: readonly MenuSection[] = [
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
const USER: SignedInUser = { name: 'Jane Doe', detail: 'jane.doe@acme.example' };

// `signOut`: what "Sign out" does (the root page shows its login screen; else it only logs).
const userMenu = (signOut: () => void = log('Sign out')): readonly MenuSection[] => [
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
