export { CURRENT_USER, localDate, localDateTime, typeOf };

// The user of the page: new documents are theirs.
const CURRENT_USER = 'Admin';

const pad = (value: number) => String(value).padStart(2, '0');

function localDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function localDateTime(date: Date): string {
  return `${localDate(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// The extension in capitals, or `FILE` for a name without one.
function typeOf(name: string): string {
  const dot = name.lastIndexOf('.');

  return dot > 0 && dot < name.length - 1 ? name.slice(dot + 1).toUpperCase() : 'FILE';
}
