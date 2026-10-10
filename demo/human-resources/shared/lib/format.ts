export { formatDate, formatDayMonth, formatMoney, formatNumber, formatRelativeDays, formatSize, formatStamp, locale };

// Dates, amounts and sizes in the language of the page (`<html lang>`), with `Intl`.

const locale = () => document.documentElement.lang || 'en-US';

const utc = (date: string) => new Date(`${date}T00:00:00Z`);

// `Oct 6, 2026`
function formatDate(date: string | null): string {
  return date === null || date === ''
    ? ''
    : new Intl.DateTimeFormat(locale(), { dateStyle: 'medium', timeZone: 'UTC' }).format(utc(date));
}

// `Oct 6` (a birthday, an anniversary)
function formatDayMonth(date: string): string {
  return new Intl.DateTimeFormat(locale(), { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(utc(date));
}

// A local date and time (`2026-10-06T09:05`): `Oct 6, 2026, 9:05 AM`.
function formatStamp(value: string): string {
  return value === ''
    ? ''
    : new Intl.DateTimeFormat(locale(), { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

// `today`, `tomorrow`, `in 5 days`, `3 days ago`
function formatRelativeDays(days: number): string {
  return new Intl.RelativeTimeFormat(locale(), { numeric: 'auto' }).format(days, 'day');
}

// A yearly salary: `€72,500` (`72.500 €`), without cents.
function formatMoney(amount: number): string {
  return new Intl.NumberFormat(locale(), { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
    .format(amount);
}

function formatNumber(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat(locale(), { maximumFractionDigits: fractionDigits }).format(value);
}

// `240 KB`, `1.2 MB`
function formatSize(bytes: number): string {
  const [value, unit] = bytes >= 1024 * 1024 ? [bytes / 1024 / 1024, 'megabyte'] : [bytes / 1024, 'kilobyte'];

  return new Intl.NumberFormat(locale(), {
    style: 'unit',
    unit,
    unitDisplay: 'short',
    maximumFractionDigits: value < 10 ? 1 : 0,
  }).format(value);
}
