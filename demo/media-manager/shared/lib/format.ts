export { countText, formatDateTime, formatSize };

const locale = () => document.documentElement.lang || 'en-US';

// A local date and time without a time zone (`2026-09-15T10:00`).
function formatDateTime(value: string): string {
  return value === ''
    ? ''
    : new Intl.DateTimeFormat(locale(), { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
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

// What a toast or a dialog is about: the name of a single one (`"Logo.svg"`), else the number (`3 items`).
function countText(names: readonly string[], plural: string): string {
  return names.length === 1 ? `"${names[0]}"` : `${names.length} ${plural}`;
}
