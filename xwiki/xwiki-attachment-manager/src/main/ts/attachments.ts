import type { DataNavigator } from '../../../../../packages/data-navigator/src';
import type { Attachment } from './xwiki/rest';

export { authorOf, formatDate, formatSize, queryAttachments, rowsOf, SIZES, typeOf };
export type { AttachmentRow };

// An attachment as a row of the table: with its type (the extension in capitals) and its size class.
type AttachmentRow = Attachment & { type: string };

// The size classes of the Size filter.
const SIZES = [
  { value: 'small', label: 'Small (< 100 kB)', min: 0, max: 100 * 1024 },
  { value: 'medium', label: 'Medium (100 kB – 1 MB)', min: 100 * 1024, max: 1024 * 1024 },
  { value: 'large', label: 'Large (≥ 1 MB)', min: 1024 * 1024, max: Number.POSITIVE_INFINITY },
] as const;

// "report.PDF" → "PDF"; no extension → "–".
function typeOf(name: string): string {
  const dot = name.lastIndexOf('.');

  return dot > 0 ? name.slice(dot + 1).toUpperCase() : '–';
}

// "XWiki.Admin" → "Admin" (the name of the user's page).
function authorOf(author: string): string {
  return author.slice(author.lastIndexOf('.') + 1);
}

function rowsOf(attachments: readonly Attachment[]): readonly AttachmentRow[] {
  return attachments.map((attachment) => ({ ...attachment, type: typeOf(attachment.name) }));
}

const sizeClassOf = (bytes: number) => SIZES.find((entry) => bytes >= entry.min && bytes < entry.max)?.value ?? '';

// yyyy-mm-dd of a time, in the local time zone (as the date range filter gives its dates).
function isoDay(time: number): string {
  const date = new Date(time);
  const pad = (value: number) => String(value).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// A text filter: the value contains the text, without regard to case.
const contains = (value: string, filter: DataNavigator.FilterValue | undefined) =>
  typeof filter !== 'string' || value.toLowerCase().includes(filter.toLowerCase());

// One of the chosen values (a multiple select), or no filter.
const oneOf = (value: string, filter: DataNavigator.FilterValue | undefined) =>
  !Array.isArray(filter) || filter.length === 0 || filter.includes(value);

const within = (day: string, filter: DataNavigator.FilterValue | undefined) => {
  if (filter === null || typeof filter !== 'object' || Array.isArray(filter)) {
    return true;
  }

  const { from, to } = filter as { readonly [key: string]: DataNavigator.FilterValue };

  return typeof from !== 'string' || typeof to !== 'string' || (day >= from && day <= to);
};

// The search, the column filters, the sort and the page, applied to all attachments of the page (the REST API returns
// them at once).
function queryAttachments(
  rows: readonly AttachmentRow[],
  query: DataNavigator.Query,
): DataNavigator.Result<AttachmentRow> {
  const text = query.search.toLowerCase();
  const { name, author, size, date } = query.filters;
  const found = rows
    .filter((row) =>
      contains(row.name, name)
      && contains(authorOf(row.author), author)
      && oneOf(sizeClassOf(row.size), size)
      && within(isoDay(row.date), date)
    )
    .filter((row) =>
      text === '' || [row.name, authorOf(row.author), row.type].some((value) => value.toLowerCase().includes(text))
    );

  if (query.sort) {
    const key = query.sort.key as keyof AttachmentRow;
    const factor = query.sort.direction === 'asc' ? 1 : -1;
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

    found.sort((a, b) => {
      const [x, y] = [a[key], b[key]];

      return factor * (typeof x === 'number' && typeof y === 'number' ? x - y : collator.compare(String(x), String(y)));
    });
  }

  const { page, pageSize } = query;

  return { rows: found.slice((page - 1) * pageSize, page * pageSize), total: found.length };
}

const UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte'] as const;

function formatSize(bytes: number): string {
  let value = bytes;
  let unit = 0;

  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit++;
  }

  return new Intl.NumberFormat(undefined, { style: 'unit', unit: UNITS[unit], maximumFractionDigits: 1 }).format(value);
}

function formatDate(time: number): string {
  // Short ("10.07.26, 10:20"). In the table it wraps after the comma when the column is narrow.
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' }).format(time);
}
