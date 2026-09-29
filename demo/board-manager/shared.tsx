import { Group, Stack, Text, Title } from '@mantine/core';
import { useSyncExternalStore } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { useStore } from 'zustand';
import { i18n as navigatorI18n } from '../../packages/data-navigator/demo/i18n';
import { createDataNavigatorComponent } from '../../packages/data-navigator/src/react';
import { mantineTheme } from '../../packages/data-navigator/src/themes';
import { db } from './db';
import type { Db } from './db';

export {
  appIcons,
  countText,
  formatDate,
  formatDateTime,
  formatSize,
  Navigator,
  PageHeader,
  Scope,
  SCOPE_CLASS,
  useDb,
  useScheme,
};

// What the pages share: the table (a data navigator with the Mantine theme), formatting, icons, the page header, and
// the scope of Mantine (its variables and its color scheme, which follows the page's switch).

// One data navigator component for every table. It follows `<html lang>` through the i18n adapter of its demo.
const Navigator = createDataNavigatorComponent({ i18n: navigatorI18n, theme: mantineTheme });

// The fake server's state, for a page that shows it (the breadcrumb, the home page, the headers).
function useDb<T>(selector: (state: Db) => T): T {
  return useStore(db, selector);
}

const locale = () => document.documentElement.lang || 'en-US';

// A local date and time without a time zone (`2026-09-15T10:00`), or a date (`2026-09-15`).
function formatDateTime(value: string): string {
  return value === ''
    ? ''
    : new Intl.DateTimeFormat(locale(), { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function formatDate(value: string): string {
  return value === '' ? '' : new Intl.DateTimeFormat(locale(), { dateStyle: 'medium' }).format(new Date(value));
}

const SIZE_UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte'] as const;

// A size with the unit that fits (1 kB = 1024 bytes), like the file upload shows it.
function formatSize(bytes: number): string {
  let value = bytes;
  let unit = 0;

  while (value >= 1024 && unit < SIZE_UNITS.length - 1) {
    value /= 1024;
    unit++;
  }

  return new Intl.NumberFormat(locale(), {
    style: 'unit',
    unit: SIZE_UNITS[unit] ?? 'byte',
    unitDisplay: 'short',
    maximumFractionDigits: unit === 0 ? 0 : 1,
  }).format(value);
}

// What a toast or a dialog is about: the name of a single one (`"Minutes.pdf"`), else the number (`3 documents`).
function countText(names: readonly string[], plural: string): string {
  return names.length === 1 ? `"${names[0]}"` : `${names.length} ${plural}`;
}

// The color scheme of the page's switch (`<html data-scheme>`: light, dark or system).
function currentScheme(): 'light' | 'dark' {
  const scheme = document.documentElement.dataset['scheme'];

  if (scheme === 'light' || scheme === 'dark') {
    return scheme;
  }

  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function subscribeScheme(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  const media = matchMedia('(prefers-color-scheme: dark)');

  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-scheme'] });
  media.addEventListener('change', onChange);

  return () => {
    observer.disconnect();
    media.removeEventListener('change', onChange);
  };
}

function useScheme(): 'light' | 'dark' {
  return useSyncExternalStore(subscribeScheme, currentScheme);
}

// Mantine's variables and color scheme are set on this class, not on `:root`: the app shares its page with other demos
// (and later with the host, e.g. XWiki). The app is one scope, and the content of each dialog another (the dialogs are
// not inside the app's element).
const SCOPE_CLASS = 'board-manager';

function Scope({ children }: { children: ReactNode }): ReactElement {
  return (
    <div className={SCOPE_CLASS} data-mantine-color-scheme={useScheme()}>
      {children}
    </div>
  );
}

// The title of a page, with a line below it and its actions on the right.
function PageHeader(
  { title, subtitle, badges, actions }: { title: ReactNode; subtitle?: ReactNode; badges?: ReactNode; actions?: ReactNode },
): ReactElement {
  return (
    <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
      <Stack gap={4}>
        <Group gap="xs">
          <Title order={2} size="h3">{title}</Title>
          {badges}
        </Group>
        {subtitle !== undefined && <Text size="sm" c="dimmed">{subtitle}</Text>}
      </Stack>
      {actions !== undefined && <Group gap="xs">{actions}</Group>}
    </Group>
  );
}

// The icons of the app (the paths of the Tabler icons, MIT), in the current text color.
function icon(paths: readonly string[], size = 18) {
  return function Icon(): ReactElement {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        focusable="false"
      >
        {paths.map((path) => <path key={path} d={path} />)}
      </svg>
    );
  };
}

const App = icon([
  'M3 4l18 0',
  'M4 4v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-10',
  'M12 16l0 4',
  'M9 20l6 0',
  'M8 12l3 -3l2 2l3 -3',
], 22);

const Home = icon(['M5 12l-2 0l9 -9l9 9l-2 0', 'M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7', 'M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6']);

const ChevronDown = icon(['M6 9l6 6l6 -6'], 16);

const Boards = icon([
  'M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z',
  'M4 9h8',
  'M12 15h8',
  'M12 4v16',
]);

const Calendar = icon([
  'M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z',
  'M16 3v4',
  'M8 3v4',
  'M4 11h16',
]);

const Users = icon([
  'M5 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0',
  'M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2',
  'M16 3.13a4 4 0 0 1 0 7.75',
  'M21 21v-2a4 4 0 0 0 -3 -3.85',
]);

const Open = icon(['M5 12l14 0', 'M13 18l6 -6', 'M13 6l6 6'], 16);

const Notes = icon([
  'M5 5a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z',
  'M9 7l6 0',
  'M9 11l6 0',
  'M9 15l4 0',
], 16);

const appIcons = {
  app: <App />,
  home: <Home />,
  chevronDown: <ChevronDown />,
  boards: <Boards />,
  meetings: <Calendar />,
  members: <Users />,
  open: <Open />,
  minutes: <Notes />,
};
