export { localDate, localDateTime };

const pad = (value: number) => String(value).padStart(2, '0');

// A local date without a time zone (`2026-09-15`).
function localDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// A local date and time without a time zone (`2026-09-15T10:00`): ISO dates compare as strings.
function localDateTime(date: Date): string {
  return `${localDate(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
