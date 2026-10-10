import type { ReactElement } from 'react';
import type { DataTableComponent as Spec } from '../../react/api';
import { useThemed } from '../config';
import { pagerSlots } from '../pager';
import * as classes from './classes';
import { PageButton, PagerButton, PageSizeField } from './widgets';

export { Footer };

type FooterProps = {
  texts: Spec.Texts;
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
  // What is being loaded: a page clicked, a page size chosen (each with a small indicator); the rest of the footer shows
  // the rows shown until they are there.
  pendingPage?: number | undefined;
  pendingPageSize?: number | undefined;
  pageSizeOptions: readonly number[];
  onPage: (page: number) => void;
  onPageSize: (pageSize: number) => void;
};

// The navigation bar below the table: the item range on the left, the pager and the page size ("10 per page") on the
// right. The pager: previous, the page numbers (seven slots, with gaps), next; in a narrow footer "18 of 27" in place of
// the numbers (a container query). The page size at the very end (2026-10-05; before the pager until then): it does not
// move while paging, and the pager keeps its width then (its gaps are as wide as its numbers).
function Footer(props: FooterProps): ReactElement {
  const { texts, total, page, pageCount, pageSize, pendingPage, pendingPageSize, pageSizeOptions, onPage, onPageSize } =
    props;
  const { footer, footerSide, pager, pagerNumbers, pagerGap, pagerCompact } = classes;
  const themed = useThemed();

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  // Every slot as wide as the largest page number needs (its digits, `ch` of the tabular figures, and the button's side
  // padding), at least a round button: so the pager keeps its width while paging, also with three digits and more.
  const slotWidth = themed(
    `max(calc(0.65 * var(--param-control-height)), calc(${String(pageCount).length}ch + var(--param-spacing-xs) / 2))`,
  );

  return (
    <div className={footer}>
      <div className={footerSide}>
        {/* A range of one item without the dash: "1 / 1", not "1-1 / 1". */}
        {total > 0 && (
          <span>{from === to ? texts.itemSingle({ item: from, total }) : texts.itemRange({ from, to, total })}</span>
        )}
      </div>
      <div className={footerSide}>
        <div className={pager}>
          <PagerButton
            icon="previous"
            label={texts.previousPage}
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
          />
          <span className={pagerNumbers}>
            {pagerSlots(page, pageCount).map((slot, index) =>
              slot === 'gap'
                ? (
                  <span key={`gap-${index}`} className={pagerGap} style={{ width: slotWidth }} aria-hidden="true">
                    …
                  </span>
                )
                : (
                  <PageButton
                    key={slot}
                    page={slot}
                    width={slotWidth}
                    label={texts.goToPage({ page: slot })}
                    current={slot === page}
                    pending={slot === pendingPage}
                    onClick={() => onPage(slot)}
                  />
                )
            )}
          </span>
          <span className={pagerCompact}>{texts.pageOf({ page, pages: pageCount })}</span>
          <PagerButton
            icon="next"
            label={texts.nextPage}
            disabled={page >= pageCount}
            onClick={() => onPage(page + 1)}
          />
        </div>
        {/* The toolbar's divider (2026-10-05): the pager, then the page size. */}
        <span className={classes.toolbarDivider} />
        <PageSizeField
          value={String(pageSize)}
          label={texts.pageSize}
          text={texts.perPage({ count: pageSize })}
          pending={pendingPageSize !== undefined}
          options={pageSizeOptions.map((option) => ({ value: String(option), label: String(option) }))}
          onChange={(value) => onPageSize(Number(value))}
        />
      </div>
    </div>
  );
}
