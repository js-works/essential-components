import type { Page, Paging, Range, Sort, TextMatch } from '../../domain/index.js';

export { containsText, inList, inRange, matchesText, pageOf, sorted };

// The domain's criteria (the repositories): one of a list (none or an empty one: any), a text in one of the values
// (ignoring the case), a text match, a range of days (yyyy-mm-dd, both inclusive), sorting and paging.

function inList<T>(value: T, list: readonly T[] | undefined): boolean {
  return list === undefined || list.length === 0 || list.includes(value);
}

function containsText(values: readonly string[], text: string | undefined): boolean {
  const needle = text?.trim().toLowerCase() ?? '';

  return needle === '' || values.some((value) => value.toLowerCase().includes(needle));
}

function matchesText(value: string, match: TextMatch | undefined): boolean {
  if (match === undefined) {
    return true;
  }

  const [haystack, needle] = [value.toLowerCase(), match.text.toLowerCase()];

  return match.match === 'startsWith'
    ? haystack.startsWith(needle)
    : match.match === 'endsWith'
    ? haystack.endsWith(needle)
    : haystack.includes(needle);
}

// `day` may be a date and a time: its date counts.
function inRange(day: string, range: Range<string> | undefined): boolean {
  const date = day.slice(0, 10);

  return range === undefined
    || ((range.from === undefined || date >= range.from) && (range.to === undefined || date <= range.to));
}

// The items sorted by a key (numbers as numbers, texts in a natural order), or as they are without a sort.
function sorted<T, K extends keyof T & string>(items: readonly T[], sort: Sort<K> | undefined): T[] {
  if (sort === undefined) {
    return [...items];
  }

  const factor = sort.direction === 'asc' ? 1 : -1;

  return [...items].sort((a, b) => {
    const [left, right] = [a[sort.key], b[sort.key]];

    return factor * (typeof left === 'number' && typeof right === 'number'
      ? left - right
      : String(left ?? '').localeCompare(String(right ?? ''), 'en', { numeric: true }));
  });
}

function pageOf<T>(items: readonly T[], { offset, limit }: Paging): Page<T> {
  return { items: items.slice(offset, offset + limit), total: items.length };
}
