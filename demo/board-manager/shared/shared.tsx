import { Group, Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';
import { useSyncExternalStore } from 'react';
import {
  TbBuilding,
  TbCalendar,
  TbExternalLink,
  TbInfoCircle,
  TbLayoutBoard,
  TbNotes,
  TbPencil,
  TbPresentation,
  TbSection,
  TbTrash,
  TbUpload,
  TbUsers,
} from 'react-icons/tb';

import { MantineScope } from '@local/micro-app';

export {
  appIcons,
  formatDate,
  formatDateTime,
  formatSize,
  formatTime,
  PAGE_SIZE_OPTIONS,
  PageHeader,
  SCOPE_CLASS,
  Scope,
  setSchemeHost,
  useScheme,
};

// What the pages share: formatting, icons, the page header, and the scope of Mantine (its variables and its color
// scheme, the element's or the page's).

// The page sizes of the paged tables (not the agenda and the sections, which show one page).
const PAGE_SIZE_OPTIONS: readonly number[] = [10, 25, 50];

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

function Scope({ children }: { children: ReactNode }) {
  return (
    <MantineScope className={SCOPE_CLASS} scheme={useScheme()}>
      {children}
    </MantineScope>
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
) {
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
  boards: <TbLayoutBoard size={18} aria-hidden />,
  meetings: <TbCalendar size={18} aria-hidden />,
  members: <TbUsers size={18} aria-hidden />,
  organizations: <TbBuilding size={18} aria-hidden />,
  minutes: <TbNotes size={16} aria-hidden />,
  section: <TbSection size={16} aria-hidden />,
  edit: <TbPencil size={16} aria-hidden />,
  remove: <TbTrash size={16} aria-hidden />,
  info: <TbInfoCircle size={16} aria-hidden />,
  upload: <TbUpload size={16} aria-hidden />,
  external: <TbExternalLink size={14} aria-hidden />,
};
