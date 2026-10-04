import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import type { DataNavigatorComponent as Spec } from '../../react/api';
import * as classes from './DataNavigator.module.css';
import { PageField, PagerButton, PageSizeField } from './widgets';

export { Footer };

type FooterProps = {
  texts: Spec.Texts;
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
  pageSizeOptions: readonly number[];
  onPage: (page: number) => void;
  onPageSize: (pageSize: number) => void;
};

// The navigation bar below the table: the item range on the left, the page size and the pager
// on the right.
function Footer(props: FooterProps): ReactElement {
  const { texts, total, page, pageCount, pageSize, pageSizeOptions, onPage, onPageSize } = props;
  const { footer, footerSide, footerGroup, pager } = classes;
  // The typed page number is a draft: it is applied on Enter and when the input loses its focus.
  const [draft, setDraft] = useState(String(page));

  useEffect(() => setDraft(String(page)), [page]);

  const commit = () => {
    const value = Math.trunc(Number(draft));

    if (Number.isFinite(value) && value >= 1) {
      onPage(Math.min(value, pageCount));
    } else {
      setDraft(String(page));
    }
  };

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className={footer}>
      <div className={footerSide}>
        {total > 0 && <span>{texts.itemRange({ from, to, total })}</span>}
      </div>
      <div className={footerSide}>
        <div className={footerGroup}>
          <span>{texts.pageSize}</span>
          <PageSizeField
            value={String(pageSize)}
            label={texts.pageSize}
            options={pageSizeOptions.map((option) => ({ value: String(option), label: String(option) }))}
            onChange={(value) => onPageSize(Number(value))}
          />
        </div>
        <div className={pager}>
          <PagerButton
            icon="first"
            label={texts.firstPage}
            disabled={page <= 1}
            onClick={() => onPage(1)}
          />
          <PagerButton
            icon="previous"
            label={texts.previousPage}
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
          />
          <span>{texts.page}</span>
          <PageField
            value={draft}
            label={texts.page}
            onChange={setDraft}
            onBlur={commit}
            onEnter={commit}
          />
          <span>{texts.pageOf({ pages: pageCount })}</span>
          <PagerButton
            icon="next"
            label={texts.nextPage}
            disabled={page >= pageCount}
            onClick={() => onPage(page + 1)}
          />
          <PagerButton
            icon="last"
            label={texts.lastPage}
            disabled={page >= pageCount}
            onClick={() => onPage(pageCount)}
          />
        </div>
      </div>
    </div>
  );
}
