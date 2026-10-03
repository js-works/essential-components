import { Group, Stack, Text, Title } from '@mantine/core';
import { useSyncExternalStore } from 'react';
import type { ReactElement, ReactNode } from 'react';
import {
  TbArrowLeft,
  TbArrowRight,
  TbBuilding,
  TbCalendar,
  TbChevronDown,
  TbDownload,
  TbExternalLink,
  TbEye,
  TbFileExport,
  TbHome,
  TbInfoCircle,
  TbLayoutBoard,
  TbNotes,
  TbPencil,
  TbPlus,
  TbPresentation,
  TbPrinter,
  TbSection,
  TbTrash,
  TbUpload,
  TbUsers,
} from 'react-icons/tb';
import { useStore } from 'zustand';
import { i18n as navigatorI18n } from '../../../packages/data-navigator/demo/i18n';
import { autocompleteColumnFilter, createDataNavigatorComponent } from '../../../packages/data-navigator/src/react';
import { mantineTheme } from '../../../packages/data-navigator/src/themes';
import { db, suggestOrganizations, suggestPeople } from '../infra/in-memory';
import type { Db } from '../infra/in-memory';

export {
  appIcons,
  countText,
  formatDate,
  formatDateTime,
  formatSize,
  formatTime,
  Navigator,
  organizationFilter,
  PageHeader,
  personFilter,
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

// The filters of every column of an organization or a person (by name, the value is the name): autocompletes, all
// options when the list opens (`minQueryLength: 0`), each with a second line (dimmed): the city of an organization,
// the organization of a person.
const suggestion = (label: string, second: string) => () => (
  <span>
    {label}
    {second !== '' && <Text size="xs" c="dimmed">{second}</Text>}
  </span>
);

const organizationFilter = autocompleteColumnFilter({
  multiple: true,
  minQueryLength: 0,
  load: async (query, signal) =>
    (await suggestOrganizations(query, signal)).map(({ city, ...option }) => ({
      ...option,
      content: suggestion(option.label, city),
    })),
});

const personFilter = autocompleteColumnFilter({
  multiple: true,
  minQueryLength: 0,
  load: async (query, signal) =>
    (await suggestPeople(query, signal)).map(({ description, ...option }) => ({
      ...option,
      value: option.label,
      content: suggestion(option.label, description),
    })),
});

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

function formatTime(value: Date): string {
  return new Intl.DateTimeFormat(locale(), { timeStyle: 'short' }).format(value);
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

// The `<board-manager>` element: its color scheme is the one of its CSS (`color-scheme`, set on it or inherited).
let schemeHost: HTMLElement | null = null;

function setSchemeHost(element: HTMLElement | null): void {
  schemeHost = element;
}

// The color scheme: the computed CSS `color-scheme` of the element (else of `<html>`, in the demo tab). Only `dark` is
// dark, only `light` is light; `normal`, `light dark` and anything else follow the system. The demo page's switch
// sets it through `ui.css` (`<html data-scheme>`).
function currentScheme(): 'light' | 'dark' {
  const words = getComputedStyle(schemeHost ?? document.documentElement).colorScheme.split(/\s+/);
  const light = words.includes('light');
  const dark = words.includes('dark');

  if (light !== dark) {
    return dark ? 'dark' : 'light';
  }

  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// There is no event for a changed computed style: any attribute change of `<html>`, `<body>` or the element (a class,
// `style`, `data-scheme`, ...) reads it again (React renders only if the scheme differs). Not seen: a swapped
// stylesheet, a media query of the host page, a change on another ancestor (then a reload is needed).
function subscribeScheme(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  const media = matchMedia('(prefers-color-scheme: dark)');

  for (const element of [document.documentElement, document.body, schemeHost]) {
    if (element !== null) {
      observer.observe(element, { attributes: true });
    }
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
  organizations: <TbBuilding size={18} aria-hidden />,
  open: <TbArrowRight size={16} aria-hidden />,
  back: <TbArrowLeft size={18} aria-hidden />,
  forward: <TbArrowRight size={18} aria-hidden />,
  minutes: <TbNotes size={16} aria-hidden />,
  add: <TbPlus size={16} aria-hidden />,
  section: <TbSection size={16} aria-hidden />,
  edit: <TbPencil size={16} aria-hidden />,
  remove: <TbTrash size={16} aria-hidden />,
  info: <TbInfoCircle size={16} aria-hidden />,
  upload: <TbUpload size={16} aria-hidden />,
  external: <TbExternalLink size={14} aria-hidden />,
  pdf: <TbFileExport size={16} aria-hidden />,
  preview: <TbEye size={16} aria-hidden />,
  download: <TbDownload size={16} aria-hidden />,
  print: <TbPrinter size={16} aria-hidden />,
};
