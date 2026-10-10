export {
  addDays,
  dateOf,
  datesBetween,
  holidaysAround,
  isWeekend,
  minutesOf,
  monthDates,
  publicHolidays,
  timeOf,
  todayDate,
  weekdayOf,
  weekStart,
};
export type { Holiday, HolidayName };

// Dates are local calendar days as `yyyy-mm-dd` strings, times local `HH:mm` strings: no time zones, and they compare
// as strings. Calculations go through UTC dates, so a daylight saving change never shifts a day.

const pad = (value: number) => String(value).padStart(2, '0');

function toUtc(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

function fromUtc(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// A local date (`new Date()` of the browser) as `yyyy-mm-dd`.
function dateOf(value: Date): string {
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

function todayDate(): string {
  return dateOf(new Date());
}

function addDays(date: string, days: number): string {
  const value = toUtc(date);

  value.setUTCDate(value.getUTCDate() + days);

  return fromUtc(value);
}

// Every day from `from` to `to`, both included (none when `to` is before `from`).
function datesBetween(from: string, to: string): string[] {
  const dates: string[] = [];

  for (let date = from; date <= to; date = addDays(date, 1)) {
    dates.push(date);
  }

  return dates;
}

// 0 is Monday, 6 is Sunday.
function weekdayOf(date: string): number {
  return (toUtc(date).getUTCDay() + 6) % 7;
}

function isWeekend(date: string): boolean {
  return weekdayOf(date) >= 5;
}

// The Monday of the week of a date.
function weekStart(date: string): string {
  return addDays(date, -weekdayOf(date));
}

// Every day of a month (`month` 1 to 12).
function monthDates(year: number, month: number): string[] {
  const first = `${year}-${pad(month)}-01`;
  const last = fromUtc(new Date(Date.UTC(year, month, 0)));

  return datesBetween(first, last);
}

function minutesOf(time: string): number {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);

  return hours * 60 + minutes;
}

function timeOf(minutes: number): string {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

type HolidayName =
  | 'newYear'
  | 'goodFriday'
  | 'easterMonday'
  | 'labourDay'
  | 'ascension'
  | 'whitMonday'
  | 'germanUnity'
  | 'christmas'
  | 'boxingDay';

// A public holiday: no work is expected that day. Its name is a key of the app's texts.
type Holiday = { date: string; name: HolidayName };

// Easter Sunday (the Gregorian computus of Meeus, Jones and Butcher).
function easterSunday(year: number): string {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return `${year}-${pad(month)}-${pad(day)}`;
}

// The public holidays of the years around a day (the year before, its own, the next).
function holidaysAround(date: string): Holiday[] {
  const year = Number(date.slice(0, 4));

  return [year - 1, year, year + 1].flatMap(publicHolidays);
}

// The public holidays of Germany that every state has (the regional ones are a later step).
function publicHolidays(year: number): Holiday[] {
  const easter = easterSunday(year);

  return [
    { date: `${year}-01-01`, name: 'newYear' },
    { date: addDays(easter, -2), name: 'goodFriday' },
    { date: addDays(easter, 1), name: 'easterMonday' },
    { date: `${year}-05-01`, name: 'labourDay' },
    { date: addDays(easter, 39), name: 'ascension' },
    { date: addDays(easter, 50), name: 'whitMonday' },
    { date: `${year}-10-03`, name: 'germanUnity' },
    { date: `${year}-12-25`, name: 'christmas' },
    { date: `${year}-12-26`, name: 'boxingDay' },
  ];
}
