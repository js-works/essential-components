export {
  formatDate,
  formatDateRange,
  formatDays,
  formatDayShort,
  formatDuration,
  formatMonth,
  formatStamp,
  formatTime,
  formatWeekday,
  locale,
};

// Dates, times, durations and numbers in the language of the page (`<html lang>`), with `Intl`.

const locale = () => document.documentElement.lang || 'en-US';

const utc = (date: string) => new Date(`${date}T00:00:00Z`);

// `Oct 6, 2026`
function formatDate(date: string): string {
  return date === ''
    ? ''
    : new Intl.DateTimeFormat(locale(), { dateStyle: 'medium', timeZone: 'UTC' }).format(utc(date));
}

// `Mon, Oct 6`
function formatDayShort(date: string): string {
  return new Intl.DateTimeFormat(locale(), { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })
    .format(utc(date));
}

// `Mo`, `Mon`: the short name of the day of the week.
function formatWeekday(date: string, width: 'short' | 'narrow' = 'short'): string {
  return new Intl.DateTimeFormat(locale(), { weekday: width, timeZone: 'UTC' }).format(utc(date));
}

// `Oct 6 – 10, 2026`, or one date when both are the same.
function formatDateRange(from: string, to: string): string {
  const format = new Intl.DateTimeFormat(locale(), { dateStyle: 'medium', timeZone: 'UTC' });

  return from === to ? format.format(utc(from)) : format.formatRange(utc(from), utc(to));
}

// `October 2026`
function formatMonth(year: number, month: number): string {
  return new Intl.DateTimeFormat(locale(), { month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(year, month - 1, 1)));
}

// A time of day (`HH:mm`) the local way: `9:05 AM`, `09:05`.
function formatTime(time: string): string {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);

  return new Intl.DateTimeFormat(locale(), { hour: 'numeric', minute: '2-digit' })
    .format(new Date(2000, 0, 1, hours, minutes));
}

// A local date and time (`2026-10-06T09:05`): `Oct 6, 2026, 9:05 AM`.
function formatStamp(value: string): string {
  return value === ''
    ? ''
    : new Intl.DateTimeFormat(locale(), { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

// Minutes as hours and minutes: `7:45`, `-0:30`; with `sign`, a plus for a positive balance (`+1:15`).
function formatDuration(minutes: number, { sign = false } = {}): string {
  const absolute = Math.abs(Math.round(minutes));
  const text = `${Math.floor(absolute / 60)}:${String(absolute % 60).padStart(2, '0')}`;

  return minutes < 0 ? `−${text}` : sign && minutes > 0 ? `+${text}` : text;
}

// Days, with a half: `12`, `2.5` (`2,5`).
function formatDays(days: number): string {
  return new Intl.NumberFormat(locale(), { maximumFractionDigits: 1 }).format(days);
}
