import { useContext, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent, ReactElement, ReactNode, Ref } from 'react';
import type { DataNavigatorComponent as Spec } from '../../react/api';
import { sameValue, withoutKey } from '../filters';
import { useLocale } from '../texts';
import { flag } from '../utils';
import { summaryOf } from './ColumnFilters';
import * as styles from './DataNavigator.module.css';
import { icons } from './icons';
import { LayerContext } from './layer';
import { ActionButton, TextButton } from './widgets';

export { FilterButton, FilterPills, FilterView };
export type { FilterColumn };

// A column as the filter view and the pills need it.
type FilterColumn = { key: string; header: ReactNode; filter: Spec.ColumnFilter };

type Filters = Readonly<Record<string, Spec.FilterValue>>;

// What the view may focus in a filter: its first text or number input (not the select in front of a text filter), else
// its first control. A select may have a hidden input of its own for forms.
const TEXT_INPUT = 'input:not([type="hidden"], [type="checkbox"], [tabindex="-1"], [aria-hidden="true"])';
const FOCUSABLE = `${TEXT_INPUT}, button:not([tabindex="-1"]), [role="combobox"]`;

type FilterButtonProps = {
  count: number;
  open: boolean;
  texts: Spec.Texts;
  buttonRef: Ref<HTMLButtonElement>;
  onToggle: () => void;
  // Removes all filters at once (the × after the button).
  onClear: () => void;
};

// The filter button of the toolbar: a funnel, its label and the number of active filters in a badge. It shows and
// hides the filter view (which takes the place of the rows), and is pressed while the view is shown. While filters are
// active (and the view is not shown), a small × follows it directly (no line between them; each has its own hover): it removes all filters
// at once (like "Clear all" of the pills, on purpose: the × is where the filters are opened).
function FilterButton({ count, open, texts, buttonRef, onToggle, onClear }: FilterButtonProps): ReactElement {
  return (
    <span className={styles.filterButtonGroup}>
      {/* The label names the button (the badge is hidden from assistive technology), so it needs no tooltip. */}
      <button
        ref={buttonRef}
        type="button"
        className={styles.button}
        data-placement="tool"
        data-variant="secondary"
        data-active={flag(count > 0)}
        aria-pressed={open}
        aria-description={count > 0 ? texts.activeFilters({ count }) : undefined}
        onClick={onToggle}
      >
        <span className={styles.buttonIcon}>
          <icons.Filter />
        </span>
        <span className={styles.buttonLabel}>{texts.filters}</span>
        {count > 0 && <span className={styles.filterBadge} aria-hidden>{count}</span>}
      </button>
      {count > 0 && !open && (
        <ActionButton
          look={{ icon: <icons.Close size={14} />, tip: texts.clearFilters }}
          variant="secondary"
          placement="tool"
          onClick={onClear}
        />
      )}
    </span>
  );
}

type FilterViewProps = {
  columns: readonly FilterColumn[];
  filters: Filters;
  texts: Spec.Texts;
  // The filter to focus when the view opens (a pill was clicked), else the first one.
  focusKey: string | undefined;
  onApply: (filters: Filters) => void;
  onCancel: () => void;
};

// The filter view: it takes the place of the column headers, the rows and the footer while it is shown (the toolbar
// stays). One row per filterable column, its header as the label and its filter as the control, in as many columns as
// fit. Everything changed here is a draft: "Apply" (or Enter in a text input) applies it, all filters at once; "Cancel"
// and Escape throw it away; "Reset" puts it back to the applied filters, "Clear" empties it (neither applies anything:
// Apply does). It is mounted on every opening, so the draft
// starts with the applied filters each time.
function FilterView(props: FilterViewProps): ReactElement {
  const { columns, filters, texts, focusKey, onApply, onCancel } = props;
  const id = useId();
  const layer = useContext(LayerContext);
  const [draft, setDraft] = useState(filters);
  // Whether Reset and Clear would change something (else they are not shown).
  const changed = !sameValue(draft, filters);
  const filled = Object.keys(draft).length > 0;
  const apply = () => onApply(draft);
  const ref = useRef<HTMLElement>(null);
  // The width of the widest label, measured: every label gets it, so every control gets its full width (at most
  // 20rem) and the controls line up. Before it is measured, the stylesheet sizes each label to its own text.
  const [labelWidth, setLabelWidth] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const labels = [...(ref.current?.querySelectorAll<HTMLElement>('[data-filter-label]') ?? [])];

    setLabelWidth(labels.length === 0 ? undefined : Math.ceil(Math.max(...labels.map((label) => label.scrollWidth))));
  }, [columns, texts]);

  // A column: the label, the gap and the control.
  // (Before the labels are measured: room for a label of about 4rem.)
  const columnWidth = labelWidth === undefined
    ? 'calc(24rem + var(--datnav-spacing-sm))'
    : `calc(${labelWidth}px + var(--datnav-spacing-sm) + 20rem)`;
  const single = columns.length === 1;
  // The width of the filters (one or two columns and the gap), centered in the view. The button row below gets the
  // same width (plus its side padding) and is centered too, so Apply ends where the last column ends.
  const blockWidth = single ? columnWidth : `calc(2 * ${columnWidth} + var(--datnav-spacing-sm))`;

  // The control of that filter (its first input or button), or of the first one, gets the focus.
  useEffect(() => {
    const rows = [...(ref.current?.querySelectorAll('[data-filter-key]') ?? [])];
    const row = rows.find((candidate) => candidate.getAttribute('data-filter-key') === focusKey) ?? rows[0];

    (row?.querySelector<HTMLElement>(TEXT_INPUT) ?? row?.querySelector<HTMLElement>(FOCUSABLE))?.focus();
  }, []);

  // Enter in a text input applies (not in a select, which opens its list on Enter), Escape cancels. The select lists
  // and the date popover are popups of their own (in the layer; their keys bubble up to here through the portal): their
  // keys belong to them.
  const keyDown = (event: KeyboardEvent<HTMLElement>) => {
    const target = event.target;

    if (event.nativeEvent.isComposing || (target instanceof Node && layer?.contains(target) === true)) {
      return;
    }

    if (event.key === 'Enter' && target instanceof HTMLInputElement) {
      event.preventDefault();
      apply();
    } else if (event.key === 'Escape') {
      event.stopPropagation();
      onCancel();
    }
  };

  return (
    <section ref={ref} className={styles.filterView} aria-label={texts.filters} onKeyDown={keyDown}>
      <div className={styles.filterViewBody}>
        {/* The columns of filters, at the right edge (one column only for a single filter). */}
        <div
          className={styles.filterViewColumns}
          data-single={flag(single)}
          style={{ columns: single ? 1 : `2 ${columnWidth}`, width: `min(100%, ${blockWidth})` }}
        >
          {columns.map((column, index) => {
            const labelId = `${id}-label-${index}`;

            return (
              <div
                key={column.key}
                className={styles.filterPanelRow}
                data-filter-key={column.key}
                style={labelWidth === undefined
                  ? undefined
                  : { gridTemplateColumns: `${labelWidth}px minmax(0, 20rem)` }}
              >
                <span id={labelId} className={styles.filterPanelLabel} data-filter-label>{column.header}</span>
                <div className={styles.filterPanelControl}>
                  {column.filter({
                    value: draft[column.key],
                    onChange: (value) =>
                      setDraft((current) =>
                        value === undefined ? withoutKey(current, column.key) : { ...current, [column.key]: value }
                      ),
                    labelledBy: labelId,
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {
        /* Below the filters, all on the right: Reset Clear | Cancel [Apply] (ghost buttons, a divider between the ones
      that change the draft and the ones that close the view, Apply outlined).
      Reset puts the draft back to the applied filters, Clear empties it; neither applies anything. Each is shown only
      when it would change something: Reset while the draft differs from the applied filters, Clear while the draft
      has a filter. The divider goes with them. */
      }
      <div
        className={styles.filterPanelFooter}
        style={{ width: `min(100%, calc(${blockWidth} + 2 * var(--datnav-spacing-sm)))` }}
      >
        {changed && (
          <ActionButton
            look={{ label: texts.resetFilters }}
            variant="secondary"
            placement="tool"
            onClick={() => setDraft(filters)}
          />
        )}
        {filled && (
          <ActionButton
            look={{ label: texts.clear }}
            variant="secondary"
            placement="tool"
            onClick={() => setDraft({})}
          />
        )}
        {(changed || filled) && <span className={styles.toolbarDivider} />}
        <ActionButton look={{ label: texts.cancelFilters }} variant="secondary" placement="tool" onClick={onCancel} />
        <button type="button" className={styles.applyButton} onClick={apply}>
          {texts.applyFilters}
        </button>
      </div>
    </section>
  );
}

type FilterPillsProps = {
  columns: readonly FilterColumn[];
  filters: Filters;
  texts: Spec.Texts;
  // Undefined while the selection bar is shown: the filter button is not there then.
  onOpen: ((key: string) => void) | undefined;
  onRemove: (key: string) => void;
  onClearAll: () => void;
};

// One pill per active filter, below the toolbar's bar, and "Clear all" at the end. A click on a pill opens the filter
// view with that filter focused, its × removes the filter at once. Nothing is shown without an active filter.
function FilterPills(props: FilterPillsProps): ReactElement | null {
  const { columns, filters, texts, onOpen, onRemove, onClearAll } = props;
  const locale = useLocale();
  const active = columns.filter((column) => filters[column.key] !== undefined);

  if (active.length === 0) {
    return null;
  }

  return (
    <div className={styles.filterPills}>
      {active.map((column) => {
        const summary = summaryOf(column.filter, filters[column.key] ?? null, { locale, texts });
        const dots = <span className={styles.filterPillDots} aria-hidden>⋯</span>;

        const content = (
          <>
            <span className={styles.filterPillLabel}>
              {column.header}
              {summary.relation === ':' ? ':' : summary.relation === '' ? '' : ` ${summary.relation}`}
            </span>
            <span className={styles.filterPillValue}>
              {summary.before === true && dots}
              <span className={styles.filterPillText} data-boxed={flag(summary.boxed === true)}>{summary.value}</span>
              {summary.after === true && dots}
            </span>
            {summary.more !== undefined && <span className={styles.filterPillMore}>+{summary.more}</span>}
          </>
        );

        return (
          <span key={column.key} className={styles.filterPill}>
            {onOpen === undefined
              ? <span className={styles.filterPillMain}>{content}</span>
              : (
                <button type="button" className={styles.filterPillMain} onClick={() => onOpen(column.key)}>
                  {content}
                </button>
              )}
            <button
              type="button"
              className={styles.filterPillRemove}
              aria-label={texts.removeFilter}
              onClick={() => onRemove(column.key)}
            >
              <icons.Close size={12} />
            </button>
          </span>
        );
      })}
      <TextButton muted onClick={onClearAll}>{texts.clearAllFilters}</TextButton>
    </div>
  );
}
