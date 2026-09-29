import { Group, Stack, Text, Title } from '@mantine/core';
import { useSyncExternalStore } from 'react';
import type { ReactElement, ReactNode } from 'react';
import {
  TbArrowRight,
  TbCalendar,
  TbChevronDown,
  TbHome,
  TbInfoCircle,
  TbLayoutBoard,
  TbNotes,
  TbPencil,
  TbPlus,
  TbPresentation,
  TbTrash,
  TbUpload,
  TbUsers,
} from 'react-icons/tb';
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
  setSchemeHost,
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

// The `<board-manager>` element, whose `scheme` attribute (light or dark) wins over the page's switch.
let schemeHost: HTMLElement | null = null;

function setSchemeHost(element: HTMLElement | null): void {
  schemeHost = element;
}

// The color scheme: the element's `scheme`, else the page's switch (`<html data-scheme>`: light, dark or system).
function currentScheme(): 'light' | 'dark' {
  const scheme = schemeHost?.getAttribute('scheme') ?? document.documentElement.dataset['scheme'];

  if (scheme === 'light' || scheme === 'dark') {
    return scheme;
  }

  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function subscribeScheme(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  const media = matchMedia('(prefers-color-scheme: dark)');

  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-scheme'] });

  if (schemeHost !== null) {
    observer.observe(schemeHost, { attributes: true, attributeFilter: ['scheme'] });
  }
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
  { title, subtitle, badges, actions }: {
    title: ReactNode;
    subtitle?: ReactNode;
    badges?: ReactNode;
    actions?: ReactNode;
  },
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

// The icons of the app: the Tabler icons of react-icons, in the current text color.
const appIcons = {
  app: <TbPresentation size={22} aria-hidden />,
  home: <TbHome size={18} aria-hidden />,
  chevronDown: <TbChevronDown size={16} aria-hidden />,
  boards: <TbLayoutBoard size={18} aria-hidden />,
  meetings: <TbCalendar size={18} aria-hidden />,
  members: <TbUsers size={18} aria-hidden />,
  open: <TbArrowRight size={16} aria-hidden />,
  minutes: <TbNotes size={16} aria-hidden />,
  add: <TbPlus size={16} aria-hidden />,
  edit: <TbPencil size={16} aria-hidden />,
  remove: <TbTrash size={16} aria-hidden />,
  info: <TbInfoCircle size={16} aria-hidden />,
  upload: <TbUpload size={16} aria-hidden />,
};
