import { describe, expect, it } from 'vitest';
import { pagerSlots } from './pager';

describe('pagerSlots', () => {
  it('shows every page up to seven', () => {
    expect(pagerSlots(1, 1)).toEqual([1]);
    expect(pagerSlots(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('shows the first five pages, a gap and the last one near the start', () => {
    expect(pagerSlots(1, 27)).toEqual([1, 2, 3, 4, 5, 'gap', 27]);
    expect(pagerSlots(4, 27)).toEqual([1, 2, 3, 4, 5, 'gap', 27]);
  });

  it('shows the first page, a gap and the last five pages near the end', () => {
    expect(pagerSlots(27, 27)).toEqual([1, 'gap', 23, 24, 25, 26, 27]);
    expect(pagerSlots(24, 27)).toEqual([1, 'gap', 23, 24, 25, 26, 27]);
  });

  it('shows the current page with its neighbors between two gaps in the middle', () => {
    expect(pagerSlots(18, 27)).toEqual([1, 'gap', 17, 18, 19, 'gap', 27]);
    expect(pagerSlots(5, 27)).toEqual([1, 'gap', 4, 5, 6, 'gap', 27]);
    expect(pagerSlots(23, 27)).toEqual([1, 'gap', 22, 23, 24, 'gap', 27]);
  });

  it('always has seven slots with more than seven pages', () => {
    for (let page = 1; page <= 9; page++) {
      expect(pagerSlots(page, 9)).toHaveLength(7);
    }
  });
});
