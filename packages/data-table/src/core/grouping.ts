import type { DataTableComponent as Spec } from '../react/api';

export { flatRows, groupKeyOf, linesOf, moveInSegments, segmentsOf };
export type { Line, Segment, SegmentMove };

// The rows of the page as runs: with `groupBy`, the rows of a group (`key`; `''` is the group of the empty value);
// without it, one run of all rows (`key` undefined). A group whose rows were all moved away keeps its run, empty, until
// the next load.
type Segment<Row> = { key: string | undefined; rows: readonly Row[] };

// A line of the rows area, in the order shown: the header of a group, or a data row (with its detail row). `index` is
// the index of the row on the page, `local` its index in its segment.
type Line =
  | { type: 'group'; segment: number; collapsed: boolean }
  | { type: 'row'; segment: number; index: number; local: number };

// The result of a move: the new runs, the group the row landed in, and its new index on the page.
type SegmentMove<Row> = { segments: readonly Segment<Row>[]; row: Row; group: string | undefined; index: number };

// The group of a row: the value of the column as a string, or what the function returns. An empty value (`''`, `null`,
// `undefined`) is the group `''` (like "(Blanks)" in other grids).
function groupKeyOf<Row>(row: Row, groupBy: Spec.GroupBy<Row>): string {
  const value: unknown = typeof groupBy === 'function' ? groupBy(row) : row[groupBy];

  return value === undefined || value === null ? '' : String(value);
}

// The runs of the page: consecutive rows with the same group are one run (the source sorts by group; unsorted rows
// give a group more than once). An empty group of the source (`Result.groups` with `total: 0`) gets a run without
// rows, at its place in the order of `groups`: right before the next group of that order that is on the page, else
// right after the one before it; none when no group of that order is on the page, or the page has no rows.
function segmentsOf<Row>(
  rows: readonly Row[],
  keyOf: ((row: Row) => string) | undefined,
  groups?: readonly Spec.ResultGroup[],
): Segment<Row>[] {
  if (keyOf === undefined) {
    return [{ key: undefined, rows }];
  }

  const segments: { key: string; rows: Row[] }[] = [];

  for (const row of rows) {
    const key = keyOf(row);
    const last = segments[segments.length - 1];

    if (last?.key === key) {
      last.rows.push(row);
    } else {
      segments.push({ key, rows: [row] });
    }
  }

  if (groups === undefined || segments.length === 0) {
    return segments;
  }

  const order = groups.map((group) => group.key);
  const onPage = (key: string) => segments.some((segment) => segment.key === key);

  groups.forEach((group, index) => {
    if (group.total !== 0 || onPage(group.key)) {
      return;
    }

    const next = order.slice(index + 1).find(onPage);
    const previous = order.slice(0, index).reverse().find(onPage);
    const at = next !== undefined
      ? segments.findIndex((segment) => segment.key === next)
      : previous !== undefined
      ? segments.length - [...segments].reverse().findIndex((segment) => segment.key === previous)
      : -1;

    if (at >= 0) {
      segments.splice(at, 0, { key: group.key, rows: [] });
    }
  });

  return segments;
}

function flatRows<Row>(segments: readonly Segment<Row>[]): Row[] {
  return segments.flatMap((segment) => segment.rows);
}

// The lines shown: a header per group, then its rows (none while it is collapsed). Without groups, only the rows.
function linesOf<Row>(segments: readonly Segment<Row>[], isCollapsed: (key: string) => boolean): Line[] {
  const lines: Line[] = [];
  let index = 0;

  segments.forEach((segment, number) => {
    const collapsed = segment.key !== undefined && isCollapsed(segment.key);

    if (segment.key !== undefined) {
      lines.push({ type: 'group', segment: number, collapsed });
    }

    segment.rows.forEach((_, local) => {
      if (!collapsed) {
        lines.push({ type: 'row', segment: number, index, local });
      }

      index += 1;
    });
  });

  return lines;
}

// Moves the row at `index` (of the page) into the slot `slot` of the other lines (the number of other lines above it):
// right below the header of an expanded group with rows, the start of that group; below the header of a collapsed or
// an empty group, its end; below a row, right after it, in its group. At the very top, the start of the first run.
// Undefined when nothing changes.
function moveInSegments<Row>(
  segments: readonly Segment<Row>[],
  index: number,
  slot: number,
  isCollapsed: (key: string) => boolean,
): SegmentMove<Row> | undefined {
  const row = flatRows(segments)[index];

  if (row === undefined) {
    return undefined;
  }

  const origin = segments.find((segment) => segment.rows.includes(row));
  const next = segments.map((segment) => ({ key: segment.key, rows: segment.rows.filter((other) => other !== row) }));
  const above = linesOf(next, isCollapsed)[slot - 1];
  const target = above === undefined
    ? { segment: 0, local: 0 }
    : above.type === 'row'
    ? { segment: above.segment, local: above.local + 1 }
    : above.collapsed
    ? { segment: above.segment, local: next[above.segment]?.rows.length ?? 0 }
    : { segment: above.segment, local: 0 };
  const segment = next[target.segment];

  if (segment === undefined) {
    return undefined;
  }

  segment.rows.splice(target.local, 0, row);

  const newIndex = flatRows(next).indexOf(row);

  if (newIndex === index && segment.key === origin?.key) {
    return undefined;
  }

  return { segments: next, row, group: segment.key, index: newIndex };
}
