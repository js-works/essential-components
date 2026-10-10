export { addDays, dateOf, daysBetween, nextYearly, todayDate, yearsBetween };

// Dates are local `yyyy-mm-dd` strings (no time zones; they compare as strings).

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function dateOf(value: Date): string {
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

function todayDate(): string {
  return dateOf(new Date());
}

function utc(date: string): number {
  const [year = 1970, month = 1, day = 1] = date.split('-').map(Number);

  return Date.UTC(year, month - 1, day);
}

function addDays(date: string, days: number): string {
  const value = new Date(utc(date) + days * 86_400_000);

  return `${value.getUTCFullYear()}-${pad(value.getUTCMonth() + 1)}-${pad(value.getUTCDate())}`;
}

// The days from one date to another (negative when `to` is before `from`).
function daysBetween(from: string, to: string): number {
  return Math.round((utc(to) - utc(from)) / 86_400_000);
}

// The full years from one date to another (an age, the years of service).
function yearsBetween(from: string, to: string): number {
  const years = Number(to.slice(0, 4)) - Number(from.slice(0, 4));

  return to.slice(5) >= from.slice(5) ? years : years - 1;
}

// The next day of the year of a date (a birthday, an anniversary) on or after `today`; February 29 is March 1 in a
// year without it.
function nextYearly(date: string, today: string): string {
  const year = Number(today.slice(0, 4));
  // `addDays` by 0 normalizes the date (`2027-02-29` is `2027-03-01`).
  const inYear = (y: number) => addDays(`${y}-${date.slice(5)}`, 0);
  const thisYear = inYear(year);

  return thisYear >= today ? thisYear : inYear(year + 1);
}
