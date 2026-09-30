import { describe, expect, it } from 'vitest';
import { flatRows, groupKeyOf, linesOf, moveInSegments, segmentsOf } from './grouping';
import type { Segment } from './grouping';

// Rows are their names; the group is the part before the dot (`.1` is in the blank group `''`).
const keyOf = (row: string) => row.split('.')[0] ?? '';
const rows = ['a.1', 'a.2', 'b.1', '.1'];
const expanded = () => false;

// The runs as text: `a[a.1 a.2]`.
const show = (segments: readonly Segment<string>[]) =>
  segments.map((segment) => `${segment.key ?? '-'}[${segment.rows.join(' ')}]`).join(' ');

function move(
  segments: readonly Segment<string>[],
  row: string,
  slot: number,
  isCollapsed: (key: string) => boolean = expanded,
) {
  return moveInSegments(segments, flatRows(segments).indexOf(row), slot, isCollapsed);
}

describe('grouping', () => {
  it('takes an empty value as the blank group', () => {
    type Item = { group: string | null | undefined };

    expect(groupKeyOf<Item>({ group: null }, 'group')).toBe('');
    expect(groupKeyOf<Item>({ group: undefined }, 'group')).toBe('');
    expect(groupKeyOf<Item>({ group: 'x' }, 'group')).toBe('x');
  });

  it('makes runs of the rows: consecutive rows of a group', () => {
    const segments = segmentsOf(rows, keyOf);

    expect(show(segments)).toBe('a[a.1 a.2] b[b.1] [.1]');
    expect(linesOf(segments, expanded).map((line) => line.type)).toEqual([
      'group',
      'row',
      'row',
      'group',
      'row',
      'group',
      'row',
    ]);
    expect(show(segmentsOf(['a.1', 'b.1', 'a.2'], keyOf))).toBe('a[a.1] b[b.1] a[a.2]');
    expect(show(segmentsOf(rows, undefined))).toBe('-[a.1 a.2 b.1 .1]');
  });

  // The lines without a.1: a | a.2 | b | b.1 | (blank) | .1
  it('moves a row into the group of the line above: after a row, or at the start of an expanded group', () => {
    const segments = segmentsOf(rows, keyOf);

    expect(move(segments, 'a.1', 1)).toBeUndefined();
    // Below the last row of a: still in a.
    expect(move(segments, 'a.1', 2)).toMatchObject({ group: 'a', index: 1 });
    // Right below the header of b: its start.
    expect(show(move(segments, 'a.1', 3)!.segments)).toBe('a[a.2] b[a.1 b.1] [.1]');
    expect(move(segments, 'a.1', 5)).toMatchObject({ group: '', index: 2 });
    // At the very top: the start of the first group.
    expect(move(segments, 'b.1', 0)).toMatchObject({ group: 'a', index: 0 });
  });

  it('keeps a group that has no rows left', () => {
    const segments = segmentsOf(rows, keyOf);
    // The lines without b.1: a | a.1 | a.2 | b | (blank) | .1; slot 5 is below the header of the blank group.
    const moved = move(segments, 'b.1', 5);

    expect(show(moved!.segments)).toBe('a[a.1 a.2] b[] [b.1 .1]');
    expect(moved?.group).toBe('');
  });

  it('puts a row below a collapsed group at its end', () => {
    const segments = segmentsOf(rows, keyOf);
    // a is collapsed: the lines without b.1 are a | b | (blank) | .1.
    const moved = move(segments, 'b.1', 1, (key) => key === 'a');

    expect(show(moved!.segments)).toBe('a[a.1 a.2 b.1] b[] [.1]');
  });
});
