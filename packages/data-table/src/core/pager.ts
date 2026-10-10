export { PAGER_SLOTS, pagerSlots };
export type { PagerSlot };

// A slot of the numbered pager: a page number, or a gap (`…`) for the pages left out.
type PagerSlot = number | 'gap';

// The pager always shows this many slots once there are more pages, so its width stays the same while paging.
const PAGER_SLOTS = 7;

// The slots of the pager: all pages up to seven; else the first and the last page, the current one with its neighbors,
// and gaps between them: `1 … 17 [18] 19 … 27`, at the start `[1] 2 3 4 5 … 27`, at the end `1 … 23 24 25 26 [27]`.
function pagerSlots(page: number, pageCount: number): readonly PagerSlot[] {
  const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, index) => from + index);

  if (pageCount <= PAGER_SLOTS) {
    return range(1, pageCount);
  }

  if (page <= 4) {
    return [...range(1, 5), 'gap', pageCount];
  }

  if (page >= pageCount - 3) {
    return [1, 'gap', ...range(pageCount - 4, pageCount)];
  }

  return [1, 'gap', page - 1, page, page + 1, 'gap', pageCount];
}
