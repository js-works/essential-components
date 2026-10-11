import { Menu as BaseMenu } from '@base-ui/react/menu';
import { Fragment, useContext, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent, ReactElement, ReactNode, Ref, RefObject } from 'react';
import type { DataTableComponent as Spec } from '../../react/api';
import { useThemed } from '../config';
import { sameValue, withoutKey } from '../filters';
import { useLocale } from '../texts';
import { flag } from '../utils';
import * as styles from './classes';
import { summaryOf } from './ColumnFilters';
import { icons } from './icons';
import { LayerContext } from './layer';
import { ActionButton, TextButton } from './widgets';

export {
  FILTER_DRAWER_CLOSE_TIME,
  FILTER_VIEW_CLOSE_TIME,
  FILTER_VIEW_OPEN_TIME,
  FilterButton,
  FilterPills,
  FilterSidebar,
  FilterView,
};
export type { FilterColumn };

// A column as the filter view and the pills need it.
type FilterColumn = { key: string; header: ReactNode; filter: Spec.ColumnFilter };

type Filters = Readonly<Record<string, Spec.FilterValue>>;

// What the view may focus in a filter: its first text or number input (not the select in front of a text filter), else
// its first control. A select may have a hidden input of its own for forms.
const TEXT_INPUT = 'input:not([type="hidden"], [type="checkbox"], [tabindex="-1"], [aria-hidden="true"])';
const FOCUSABLE = `${TEXT_INPUT}, button:not([tabindex="-1"]), [role="combobox"]`;

// The least distance (px) of the nose of the filter view from its corners.
const NOSE_MARGIN = 16;

// How long the filter view unrolls on opening and rolls up after closing (ms; the table fades in the same times, see
// `.stack` in the stylesheet).
const FILTER_VIEW_OPEN_TIME = 250;
const FILTER_VIEW_CLOSE_TIME = 250;

// How long a closed filter drawer stays at most (ms): it goes when its transition ends (250ms in the stylesheet,
// `[data-closing]`, which starts only when the closing is rendered); this is the fallback, e.g. without transitions.
const FILTER_DRAWER_CLOSE_TIME = 500;

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
// active, a small × follows it directly (no line between them; each has its own hover): it removes all filters at once
// (like "Clear all" of the pills, on purpose: the × is where the filters are opened), and closes the view if it is shown.
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
        {/* Tabler's `filter-2`, like the title of the filter drawer (2026-10-09, the user's wish; the funnel before). */}
        <span className={styles.buttonIcon}>
          <icons.FilterLines />
        </span>
        <span className={styles.buttonLabel}>{texts.filters}</span>
        {count > 0 && <span className={styles.filterBadge} aria-hidden>{count}</span>}
      </button>
      {count > 0 && (
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
  // Closed, but still rolling up (its animation).
  closing?: boolean;
  // The filter button: the nose of the view points to its middle.
  anchorRef: RefObject<HTMLElement | null>;
  // Saved filters (optional, the app stores them): a row between the filters and the buttons, as in the drawer.
  savedFilters?: Spec.SavedFilters | undefined;
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
  const { columns, filters, texts, focusKey, closing = false, anchorRef, savedFilters, onApply, onCancel } = props;
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
  const themed = useThemed();
  const columnWidth = themed(
    labelWidth === undefined
      ? 'calc(24rem + var(--param-spacing-sm))'
      : `calc(${labelWidth}px + var(--param-spacing-sm) + 20rem)`,
  );
  const single = columns.length <= 2;
  // The width of the filters (one or two columns and the gap), centered in the view. The button row below gets the
  // same width (plus its side padding) and is centered too, so Apply ends where the last column ends.
  const blockWidth = single ? columnWidth : themed(`calc(2 * ${columnWidth} + var(--param-spacing-sm))`);

  // The view is only as wide as its filters, at the end of the table (2026-10-10, the user's wish; it ended where the
  // filter button ends before), and moved towards the start only as far as its nose needs to reach the middle of the
  // button (a button far from the end, in a wide table; never past the table's start). `endOffset` is the distance of
  // the view's end from the end of the table, `noseEnd` where the nose sits: under the middle of the filter button,
  // measured from the end of the view (kept a little away from its corners). Both again whenever the view or the table
  // changes its size. Without the button: no offset and no nose.
  const [noseEnd, setNoseEnd] = useState<number | undefined>(undefined);
  const [endOffset, setEndOffset] = useState(0);
  // How far the view reaches up over the row of the filter pills (while filters are active), so it starts where it does
  // without them, and its nose stays at the button (2026-10-10: with pills it hung a row lower). The pills are faded
  // and disabled meanwhile anyway.
  const [reachUp, setReachUp] = useState(0);

  useLayoutEffect(() => {
    const view = ref.current;

    if (view === null) {
      return;
    }

    const update = () => {
      const anchor = anchorRef.current;

      const area = view.parentElement;

      if (anchor === null || area === null) {
        setNoseEnd(undefined);
        setEndOffset(0);
        setReachUp(0);
        return;
      }

      const box = view.getBoundingClientRect();
      const button = anchor.getBoundingClientRect();
      const areaBox = area.getBoundingClientRect();
      // The pills' row (the last part of the toolbar, which then gives up its bottom padding): reaching up by its top
      // puts the view where it is without pills.
      const pills = anchor.closest(`.${styles.toolbar}`)?.querySelector(`:scope > .${styles.filterPills}`)
        ?.getBoundingClientRect();

      setReachUp(pills === undefined ? 0 : Math.max(0, Math.round(areaBox.top - pills.top)));
      const rtl = getComputedStyle(view).direction === 'rtl';

      // The middle of the button, from the end of the table.
      const middle = (rtl ? button.left - areaBox.left : areaBox.right - button.right) + button.width / 2;
      const offset = Math.min(
        Math.max(0, middle - (box.width - NOSE_MARGIN)),
        Math.max(0, areaBox.width - box.width),
      );

      setEndOffset(Math.round(offset));
      setNoseEnd(Math.round(Math.min(Math.max(middle - offset, NOSE_MARGIN), box.width - NOSE_MARGIN)));
    };
    const observer = new ResizeObserver(update);

    update();
    observer.observe(view);
    if (view.parentElement !== null) observer.observe(view.parentElement);

    return () => observer.disconnect();
  }, []);

  // It unrolls from its top edge down on opening, and rolls up after closing: its height, measured, from 0 and back to
  // 0 (`data-animating` lifts its min height and cuts off what does not fit yet). Closing during the opening starts from
  // the height reached. Not with reduced motion (the view comes and goes at once), nor without `animate` (jsdom).
  const animationRef = useRef<Animation>(undefined);

  useLayoutEffect(() => {
    const view = ref.current;

    if (
      view === null || typeof view.animate !== 'function'
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    // Opening measures the full height, so without a running animation (in development, React runs this effect twice:
    // the second run would measure the first one's height 0); closing measures the height reached, and then cancels.
    const running = animationRef.current;

    if (!closing) {
      running?.cancel();
      view.removeAttribute('data-animating');
    }

    const height = `${view.getBoundingClientRect().height}px`;

    running?.cancel();
    view.setAttribute('data-animating', '');

    const animation = closing
      ? view.animate([{ height }, { height: '0px', opacity: 0 }], {
        duration: FILTER_VIEW_CLOSE_TIME,
        easing: 'ease-in',
        fill: 'forwards',
      })
      : view.animate([{ height: '0px', opacity: 0 }, { height }], {
        duration: FILTER_VIEW_OPEN_TIME,
        easing: 'ease-in-out',
      });

    if (!closing) {
      animation.onfinish = () => view.removeAttribute('data-animating');
    }
    animationRef.current = animation;
  }, [closing]);

  // A click outside closes the view, but only while nothing was changed since it opened (else the draft would be lost
  // by accident). Not outside: the view, its popups (in the layer) and the filter button, which toggles the view. The
  // click that closes it does nothing else: the faded table below acts like a scrim, so a row is not selected by it.
  useEffect(() => {
    if (closing || changed) {
      return;
    }

    const pointerDown = (event: PointerEvent) => {
      const inside = [ref.current, layer, anchorRef?.current].some((part) =>
        part != null && event.composedPath().includes(part)
      );

      if (inside || event.button !== 0) {
        return;
      }

      const swallow = (click: MouseEvent) => {
        click.stopPropagation();
        click.preventDefault();
      };

      // Only the click of this gesture: removed right after its pointer is released (the click comes before that).
      document.addEventListener('click', swallow, { capture: true });
      document.addEventListener(
        'pointerup',
        () => setTimeout(() => document.removeEventListener('click', swallow, { capture: true })),
        { capture: true, once: true },
      );
      onCancel();
    };

    document.addEventListener('pointerdown', pointerDown, { capture: true });

    return () => document.removeEventListener('pointerdown', pointerDown, { capture: true });
  }, [closing, changed, layer, anchorRef, onCancel]);

  // The control of that filter (its first input or button), or of the first one, gets the focus.
  useEffect(() => {
    const rows = [...(ref.current?.querySelectorAll('[data-filter-key]') ?? [])];
    const row = rows.find((candidate) => candidate.getAttribute('data-filter-key') === focusKey) ?? rows[0];

    (row?.querySelector<HTMLElement>(TEXT_INPUT) ?? row?.querySelector<HTMLElement>(FOCUSABLE))?.focus();
  }, []);

  // Enter in a text input applies (not in a select, which opens its list on Enter, nor in an autocomplete with its
  // list open), Escape cancels. The select lists
  // and the date popover are popups of their own (in the layer; their keys bubble up to here through the portal): their
  // keys belong to them.
  const keyDown = (event: KeyboardEvent<HTMLElement>) => {
    const target = event.target;

    if (event.nativeEvent.isComposing || (target instanceof Node && layer?.contains(target) === true)) {
      return;
    }

    // The input of an autocomplete while its list is open: Enter chooses an option, Escape closes the list.
    if (target instanceof HTMLElement && target.getAttribute('aria-expanded') === 'true') {
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
    <section
      ref={ref}
      className={styles.filterView}
      aria-label={texts.filters}
      // Only as wide as its filters (and their side padding and lines), at most the room before the button's end.
      style={{
        width: themed(`calc(${blockWidth} + 2 * var(--param-spacing-md) + 2px)`),
        maxWidth: `calc(100% - ${endOffset}px)`,
        marginInlineEnd: endOffset,
        // Up over the pills (see `reachUp`): the same tiny gap below the bar as without them.
        ...(reachUp > 0 ? { marginTop: themed(`calc(var(--param-spacing-xs) / 2 - ${reachUp}px)`) } : {}),
      }}
      // While it rolls up after closing: gone for the user already.
      data-closing={flag(closing)}
      inert={closing}
      aria-hidden={closing || undefined}
      onKeyDown={keyDown}
    >
      {noseEnd !== undefined && (
        <span className={styles.filterViewNose} aria-hidden="true" style={{ insetInlineEnd: noseEnd }} />
      )}
      <div className={styles.filterViewBody}>
        {/* The columns of filters, at the right edge (one column only for one or two filters). */}
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
                <span id={labelId} className={styles.filterPanelLabel} data-filter-label>
                  {column.header}
                  {/* Set in the draft: a dot after the label. Its room is always kept, so no label moves. */}
                  <span
                    className={styles.filterPanelDot}
                    data-set={flag(draft[column.key] !== undefined)}
                    aria-hidden="true"
                  />
                </span>
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
      {/* The saved filters (2026-10-11, the user's wish, like the drawer's): as wide as the buttons' row below. */}
      {savedFilters !== undefined && (
        <SaveFilterFooter
          place="view"
          savedFilters={savedFilters}
          draft={draft}
          texts={texts}
          width={themed(`min(100%, calc(${blockWidth} + 2 * var(--param-spacing-md)))`)}
          onLoad={setDraft}
        />
      )}
      {
        /* Below the filters, the title (with Clear) on the left, the buttons on the right: Reset | Cancel [Apply] (ghost buttons, a divider between the ones
      that change the draft and the ones that close the view, Apply filled).
      Reset puts the draft back to the applied filters, Clear empties it; neither applies anything. Each is shown only
      when it would change something: Reset while the draft differs from the applied filters, Clear while the draft
      has a filter. The divider goes with them. */
      }
      <div
        className={styles.filterPanelFooter}
        style={{ width: themed(`min(100%, calc(${blockWidth} + 2 * var(--param-spacing-md)))`) }}
      >
        {
          /* On the left the drawer's title (2026-10-10, the user's wish: the left side looked empty): Tabler's `filter-2`
        (in the accent while a filter is set in the draft) and the number of filters set in the draft (the filter
        button's badge; without the word "Filters", 2026-10-10, the user's wish: the section's name stays its label),
        and Clear, the × (only while a filter is set; the same day: an eraser on the right, then the × there). Not a
        button itself. */
        }
        <span className={styles.filterSidebarTitle}>
          <span className={styles.filterSidebarIcon} data-active={flag(filled)} aria-hidden="true">
            <icons.FilterLines />
          </span>
          {filled && <span className={styles.filterBadge} aria-hidden="true">{Object.keys(draft).length}</span>}
          {filled && (
            <ActionButton
              look={{ icon: <icons.Close size={14} />, tip: texts.clear }}
              variant="secondary"
              placement="tool"
              onClick={() => setDraft({})}
            />
          )}
        </span>
        {
          /* Reset: an icon-only ghost button, named and tipped by its text (2026-10-10, the user's wish, like the drawer's:
        Tabler's `rotate`; with its text too for a moment the same day; a text button before; Clear next to it, as text, then icon only, until it went into the title
        the same day). Cancel with a `chevron-up` (2026-10-10, the user's wish: the view rolls up; the drawer's `arrow-left`
        before), Apply with its check (the same day; Cancel as a `chevron-up` in the top corner for a moment: it cost a
        row of room above the filters). */
        }
        {changed && (
          <ActionButton
            look={{ icon: <icons.Rotate size={16} />, tip: texts.resetFilters }}
            variant="secondary"
            placement="tool"
            onClick={() => setDraft(filters)}
          />
        )}
        {changed && <span className={styles.toolbarDivider} />}
        <ActionButton
          look={{ icon: <icons.ChevronUp />, label: texts.cancelFilters }}
          variant="secondary"
          placement="tool"
          onClick={onCancel}
        />
        <button type="button" className={styles.applyButton} data-with-icon="" onClick={apply}>
          <icons.Check />
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
  // The filter view is shown: the pills stay, but are disabled and faint.
  inactive?: boolean;
  // The filter drawer is open (a prototype): the pills are disabled, natively (the row is a `<fieldset>`).
  disabled?: boolean;
};

// One pill per active filter, below the toolbar's bar, and "Clear all" at the end. A click on a pill opens the filter
// view with that filter focused, its × removes the filter at once. Nothing is shown without an active filter.
function FilterPills(props: FilterPillsProps): ReactElement | null {
  const { columns, filters, texts, onOpen, onRemove, onClearAll, inactive = false, disabled = false } = props;
  const locale = useLocale();
  const active = columns.filter((column) => filters[column.key] !== undefined);

  if (active.length === 0) {
    return null;
  }

  return (
    <fieldset className={styles.filterPills} data-inactive={flag(inactive)} inert={inactive} disabled={disabled}>
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
    </fieldset>
  );
}

type FilterDrawerProps = {
  columns: readonly FilterColumn[];
  filters: Filters;
  texts: Spec.Texts;
  // The filter to focus when the drawer opens (a pill was clicked), else the first one.
  focusKey: string | undefined;
  // Closed, but still being covered up (its animation): gone for the user already.
  closing?: boolean;
  // Its closing animation has ended: it can go.
  onClosed?: () => void;
  // The filter button: a click on it is not outside (it toggles the drawer).
  anchorRef: RefObject<HTMLElement | null>;
  // Saved filters (optional, the app stores them): a menu next to the title loads one into the draft, "Save as…" at
  // the bottom saves the draft.
  savedFilters?: Spec.SavedFilters | undefined;
  onApply: (filters: Filters) => void;
  onCancel: () => void;
};

// A prototype (2026-10-09, the user's idea): the filter button opens the filters in a drawer over the rows, at the right
// edge of the table, sliding in from the right. Mounted on every opening, so the draft starts with the applied filters
// each time. Like the filter view: Apply (or Enter in a text input) applies, Cancel (or Escape) throws the draft away.
// The buttons at the top (the filter view's order: Reset | Cancel [Apply]; Clear is the × of the title), the filters below (label on the left,
// right aligned).
function FilterSidebar(props: FilterDrawerProps): ReactElement {
  const { columns, filters, texts, focusKey, closing = false, onClosed, anchorRef, savedFilters, onApply, onCancel } =
    props;
  const id = useId();
  const layer = useContext(LayerContext);
  const ref = useRef<HTMLElement>(null);
  const [draft, setDraft] = useState(filters);
  const changed = !sameValue(draft, filters);
  const filled = Object.keys(draft).length > 0;
  const apply = () => onApply(draft);
  // Two columns of filters when one column would scroll (2026-10-11, the user's wish; from 7 filters on for a few
  // minutes the same day): decided once, when the drawer opens (see below), so it never switches while it is open. The
  // first column as long as the second or one longer. One column anyway in a narrow drawer (see the stylesheet).
  const [twoColumns, setTwoColumns] = useState(false);
  const firstColumnSize = Math.ceil(columns.length / 2);
  const bodyRef = useRef<HTMLDivElement>(null);

  // It covers the toolbar's bar (the search, the filter button, the actions) and the row of the filter pills too
  // (2026-10-09, the user's wishes; first only the pills): it reaches up by the distance from the top of the bar (or of
  // the pills, without a bar; both part of the toolbar, above the table area) to its own cell, measured, and again
  // when the table changes its size (the pills may wrap differently).
  const [reachUp, setReachUp] = useState(0);
  const themed = useThemed();

  useLayoutEffect(() => {
    const cell = ref.current?.parentElement;
    const content = cell?.parentElement;
    const top = content?.querySelector(`.${styles.toolbarBar}`) ?? content?.querySelector(`.${styles.filterPills}`);
    const reachOf = () =>
      cell == null || top == null
        ? 0
        : Math.max(0, cell.getBoundingClientRect().top - top.getBoundingClientRect().top);
    const body = bodyRef.current;

    // One column would scroll: before the first paint, in one column, before it reaches up (it grows by that, so the
    // filters may scroll by that much less; 1px for rounding).
    if (body != null) {
      setTwoColumns(body.scrollHeight - body.clientHeight > reachOf() + 1);
    }

    if (cell == null || top == null) {
      return;
    }

    const update = () => setReachUp(reachOf());
    const observer = new ResizeObserver(update);

    update();
    observer.observe(cell);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const rows = [...(ref.current?.querySelectorAll('[data-filter-key]') ?? [])];
    const row = rows.find((candidate) => candidate.getAttribute('data-filter-key') === focusKey) ?? rows[0];

    (row?.querySelector<HTMLElement>(TEXT_INPUT) ?? row?.querySelector<HTMLElement>(FOCUSABLE))?.focus();
  }, []);

  // Escape closes it also while the focus is elsewhere (e.g. on the page after a click on a disabled part): on the
  // document. Not the Escape of a popup (in the layer: it closes the popup), nor one handled already (the drawer's own,
  // below, stops it).
  useEffect(() => {
    if (closing) {
      return;
    }

    const keyDown = (event: globalThis.KeyboardEvent) => {
      const inLayer = event.target instanceof Node && layer?.contains(event.target) === true;
      // An input with its list open (an autocomplete): its Escape closes the list.
      const expanded = event.target instanceof HTMLElement && event.target.getAttribute('aria-expanded') === 'true';

      if (event.key === 'Escape' && !event.defaultPrevented && !event.isComposing && !inLayer && !expanded) {
        onCancel();
      }
    };

    document.addEventListener('keydown', keyDown);

    return () => document.removeEventListener('keydown', keyDown);
  }, [closing, layer, onCancel]);

  // A click outside closes it, but only while nothing was changed since it opened (else the draft would be lost by
  // accident; like the filter view). Not outside: the drawer, its popups (in the layer) and the filter button (it
  // toggles). The click that closes it does nothing else (it is swallowed: a row is not selected by it).
  useEffect(() => {
    if (closing || changed) {
      return;
    }

    const pointerDown = (event: PointerEvent) => {
      const inside = [ref.current, layer, anchorRef.current].some((part) =>
        part != null && event.composedPath().includes(part)
      );

      if (inside || event.button !== 0) {
        return;
      }

      const swallow = (click: MouseEvent) => {
        click.stopPropagation();
        click.preventDefault();
      };

      document.addEventListener('click', swallow, { capture: true });
      document.addEventListener(
        'pointerup',
        () => setTimeout(() => document.removeEventListener('click', swallow, { capture: true })),
        { capture: true, once: true },
      );
      onCancel();
    };

    document.addEventListener('pointerdown', pointerDown, { capture: true });

    return () => document.removeEventListener('pointerdown', pointerDown, { capture: true });
  }, [closing, changed, layer, anchorRef, onCancel]);

  // The keys of the filter view: Enter in a text input applies, Escape cancels (not in the popups of the layer, nor in
  // an autocomplete with its list open).
  const keyDown = (event: KeyboardEvent<HTMLElement>) => {
    const target = event.target;

    if (event.nativeEvent.isComposing || (target instanceof Node && layer?.contains(target) === true)) {
      return;
    }

    if (target instanceof HTMLElement && target.getAttribute('aria-expanded') === 'true') {
      return;
    }

    if (event.key === 'Enter' && target instanceof HTMLInputElement) {
      event.preventDefault();
      apply();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onCancel();
    }
  };

  return (
    <section
      ref={ref}
      className={styles.filterSidebar}
      aria-label={texts.filters}
      data-two-columns={flag(twoColumns)}
      data-closing={flag(closing)}
      inert={closing}
      aria-hidden={closing || undefined}
      // Covered up completely (the clip's transition, not the popups' or the buttons' inside it): it can go.
      onTransitionEnd={(event) => {
        if (closing && event.target === event.currentTarget && event.propertyName === 'clip-path') onClosed?.();
      }}
      // Up to the top of the toolbar's bar (or of the pills), and a bit higher still: as much as its header's extra room
      // on top (2026-10-09, the user's wish), so its buttons stay on the line of the toolbar's (see the stylesheet).
      style={{ marginTop: themed(`calc(${-reachUp}px - var(--param-spacing-xs) / 2)`) }}
      onKeyDown={keyDown}
    >
      <div className={styles.filterSidebarHeader}>
        {
          /* The title (2026-10-09, the user's wishes): Tabler's `filter-2` (in the accent while a filter is set in the
        draft, like the filter button's), "Filters" (the filter button's size and weight), the number of filters set in
        the draft (the filter button's badge), and Clear, the × (only while a filter is set, like the × after the
        filter button). Not a button itself (it was the real filter button for a while, the same day: closing it with
        a click). */
        }
        <span className={styles.filterSidebarTitle}>
          <span className={styles.filterSidebarIcon} data-active={flag(filled)} aria-hidden="true">
            <icons.FilterLines />
          </span>
          {texts.filters}
          {filled && <span className={styles.filterBadge} aria-hidden="true">{Object.keys(draft).length}</span>}
          {filled && (
            <ActionButton
              // Tabler's `eraser` (2026-10-11, the user's wish: the × is Cancel now, at the end; the × before).
              look={{ icon: <icons.Eraser size={16} />, tip: texts.clear }}
              variant="secondary"
              placement="tool"
              onClick={() => setDraft({})}
            />
          )}
        </span>
        {
          /* Reset, with the divider after it, only while it would change something: while the draft differs from the
        applied filters (2026-10-09, the user's wish, like the ×; always there, disabled while not, for a while the
        same day). Icon only: Tabler's `rotate` (the common Reset icon; `arrow-back-up`, read as Undo, before), named
        and tipped "Reset". */
        }
        {changed && (
          <>
            <ActionButton
              look={{ icon: <icons.Rotate size={16} />, tip: texts.resetFilters }}
              variant="secondary"
              placement="tool"
              onClick={() => setDraft(filters)}
            />
            <span className={styles.toolbarDivider} />
          </>
        )}
        {
          /* A check and the text (2026-10-09, the user's wish; the funnel only, the funnel and the text, and the text
        only were tried the same day). */
        }
        <button type="button" className={styles.applyButton} data-with-icon="" onClick={apply}>
          <icons.Check />
          {texts.applyFilters}
        </button>
        {
          /* Cancel: an icon-only ×, named and tipped "Cancel", at the very end, where a drawer's close button is
        (2026-10-11, the user's wish). Before: "Cancel" before Apply, a ghost button with its text (with Tabler's thin
        `arrow-left` from 2026-10-09 to 2026-10-11); tried 2026-10-09: `circle-arrow-left`, `arrow-right`, outlined,
        and an icon-only button after Apply (`arrow-right`, `layout-sidebar-right-collapse`, `arrow-bar-to-right`,
        `arrow-big-right`, the ×). */
        }
        <ActionButton
          look={{ icon: <icons.Close size={16} />, tip: texts.cancelFilters }}
          variant="secondary"
          placement="tool"
          onClick={onCancel}
        />
      </div>
      <div ref={bodyRef} className={styles.filterSidebarBody}>
        {columns.map((column, index) => {
          const labelId = `${id}-label-${index}`;

          return (
            <div
              key={column.key}
              className={styles.filterSidebarRow}
              data-filter-key={column.key}
              data-column={twoColumns ? (index < firstColumnSize ? '1' : '2') : undefined}
            >
              <span id={labelId} className={styles.filterPanelLabel}>
                {column.header}
                <span
                  className={styles.filterPanelDot}
                  data-set={flag(draft[column.key] !== undefined)}
                  aria-hidden="true"
                />
              </span>
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
      {savedFilters !== undefined && (
        <SaveFilterFooter place="drawer" savedFilters={savedFilters} draft={draft} texts={texts} onLoad={setDraft} />
      )}
    </section>
  );
}

type SavedFilterMenuProps = {
  savedFilters: Spec.SavedFilters;
  draft: Filters;
  texts: Spec.Texts;
  onLoad: (filters: Filters) => void;
};

// The saved filters, at the start of the drawer's bottom row (2026-10-11, the user's wish; after the title for a few
// hours the same day: too little room there, its text went when the count came; only while there are some): a ghost
// button
// with the name of the saved filter the draft equals (else "Saved filters") and a chevron, and its menu: a click on a
// name loads it into the draft (Apply applies it, as always), the × after it deletes it (the menu stays open). The
// check marks the one the draft equals.
function SavedFilterMenu({ savedFilters, draft, texts, onLoad }: SavedFilterMenuProps): ReactElement {
  const layer = useContext(LayerContext);
  const filled = Object.keys(draft).length > 0;
  const current = filled ? savedFilters.items.find((item) => sameValue(item.filters, draft)) : undefined;

  // The app's answers: a rejection is only logged (the list stays as the app has it).
  const run = (action: () => void | Promise<void>) => {
    void Promise.resolve()
      .then(action)
      .catch((error: unknown) => console.error(error));
  };
  // Own filters can be shared and unshared in the menu (2026-10-11, the user's wish): with `sharing` and `setShared`,
  // on the removable ones (not another user's).
  const toggles = (item: Spec.SavedFilter) =>
    savedFilters.sharing === true && savedFilters.setShared !== undefined && item.removable !== false;

  return (
    <BaseMenu.Root modal={false}>
      <BaseMenu.Trigger
        className={`${styles.button} ${styles.savedFilterButton}`}
        data-placement="tool"
        // With a name shown, what the button is for.
        aria-description={current === undefined ? undefined : texts.savedFilters}
      >
        <span className={styles.buttonLabel}>{current?.name ?? texts.savedFilters}</span>
        <icons.ChevronDown size={14} />
      </BaseMenu.Trigger>
      <BaseMenu.Portal container={layer}>
        <BaseMenu.Positioner
          className={styles.popupPositioner}
          side="top"
          align="start"
          sideOffset={4}
          positionMethod="fixed"
        >
          <BaseMenu.Popup className={`${styles.popup} ${styles.savedFilterMenu}`}>
            {savedFilters.items.map((item) => (
              <Fragment key={item.id}>
                <BaseMenu.Item className={styles.menuItem} data-load="" onClick={() => onLoad(item.filters)}>
                  <span className={styles.menuIcon}>
                    <span className={styles.selectCheck}>{item === current && <icons.Check size={14} />}</span>
                  </span>
                  <span className={styles.menuText}>
                    <span>
                      <span className={styles.buttonLabel}>{item.name}</span>
                      {
                        /* Shared (2026-10-11): Tabler's `users`, named for screen readers; the toggle's instead,
                      where it has one. */
                      }
                      {item.shared === true && !toggles(item) && (
                        <span className={styles.savedFilterShared} role="img" aria-label={texts.sharedFilter}>
                          <icons.Users size={14} />
                        </span>
                      )}
                    </span>
                    {/* Someone else's: their name below, dimmed. */}
                    {item.owner !== undefined && (
                      <span className={styles.savedFilterOwner}>{texts.filterOwner({ name: item.owner })}</span>
                    )}
                  </span>
                </BaseMenu.Item>
                {
                  /* Share or unshare (a checkable item; the menu stays open): a chip with the state, "🔒 Private" or
                  "👥 Shared" (in the accent), 2026-10-11, the user's wish: the icon alone, dimmed or in the accent,
                  did not say which state was which. */
                }
                {toggles(item) && (
                  <BaseMenu.CheckboxItem
                    className={styles.menuItem}
                    data-share=""
                    aria-label={texts.shareSavedFilter({ name: item.name })}
                    checked={item.shared === true}
                    closeOnClick={false}
                    onCheckedChange={(checked) => run(() => savedFilters.setShared?.(item.id, checked))}
                  >
                    <span className={styles.savedFilterChip}>
                      {item.shared === true ? <icons.Users size={14} /> : <icons.Lock size={14} />}
                      {item.shared === true ? texts.sharedFilter : texts.privateFilter}
                    </span>
                  </BaseMenu.CheckboxItem>
                )}
                {/* Not removable (e.g. another user's): no ×. */}
                {item.removable !== false && (
                  <BaseMenu.Item
                    className={styles.menuItem}
                    data-delete=""
                    aria-label={texts.deleteSavedFilter({ name: item.name })}
                    closeOnClick={false}
                    onClick={() => run(() => savedFilters.remove(item.id))}
                  >
                    <icons.Close size={14} />
                  </BaseMenu.Item>
                )}
              </Fragment>
            ))}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}

type SaveFilterFooterProps = {
  // The drawer's bottom row, or a row of the filter view (above its buttons), as wide as `width`.
  place: 'drawer' | 'view';
  width?: string;
  savedFilters: Spec.SavedFilters;
  draft: Filters;
  texts: Spec.Texts;
  onLoad: (filters: Filters) => void;
};

// The bottom row of the drawer with saved filters (2026-10-11, the user's wish): the saved filters' menu on the left
// (see `SavedFilterMenu`), "Save as…" on the right (a ghost button with Tabler's
// `device-floppy`; only while there is something to save: not while the draft is empty or equals a saved filter, the
// user's wish the same day; disabled while empty before), which becomes a name field with Cancel and Save. Save (or Enter)
// saves the draft, not the applied filters, by the app's `save`: the app decides what a name that exists already
// means. While it saves, Save turns its icon; a rejection keeps the field and shows the message (the `Error`'s, else
// `saveFilterFailed`); the next change removes it. Escape in the field closes it (not the drawer).
function SaveFilterFooter(props: SaveFilterFooterProps): ReactElement | null {
  const { place, width, savedFilters, draft, texts, onLoad } = props;
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  // "Share" (2026-10-11, the user's wish; only with `sharing`): off for every new name.
  const [shared, setShared] = useState(false);
  const filled = Object.keys(draft).length > 0;
  const trimmed = name.trim();
  const known = savedFilters.items.some((item) => sameValue(item.filters, draft));

  const close = () => {
    setNaming(false);
    setName('');
    setShared(false);
    setError(undefined);
  };

  const save = async () => {
    if (trimmed === '' || !filled || saving) {
      return;
    }

    setSaving(true);
    setError(undefined);

    try {
      await savedFilters.save(trimmed, draft, { shared: savedFilters.sharing === true && shared });
      close();
    } catch (caught) {
      setError(caught instanceof Error && caught.message !== '' ? caught.message : texts.saveFilterFailed);
    } finally {
      setSaving(false);
    }
  };

  // Enter and Escape belong to the field: they neither apply nor cancel the drawer.
  const keyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) {
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      void save();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close();
    }
  };

  const saveable = filled && !known;
  const loadable = savedFilters.items.length > 0;

  if (!naming && !saveable && !loadable) {
    return null;
  }

  return (
    <div className={styles.filterSidebarFooter} data-place={place} style={width === undefined ? undefined : { width }}>
      {naming
        ? (
          <div className={styles.savedFilterForm}>
            <div className={styles.field}>
              <input
                type="text"
                className={styles.input}
                aria-label={texts.filterName}
                placeholder={texts.filterName}
                value={name}
                readOnly={saving}
                autoFocus
                onChange={(event) => {
                  setName(event.currentTarget.value);
                  setError(undefined);
                }}
                onKeyDown={keyDown}
              />
            </div>
            {savedFilters.sharing === true && (
              <label className={styles.savedFilterShare}>
                <input
                  type="checkbox"
                  className={styles.check}
                  checked={shared}
                  disabled={saving}
                  onChange={(event) => setShared(event.currentTarget.checked)}
                />
                {texts.shareFilter}
              </label>
            )}
            {
              /* Cancel and Save as icons, outlined and square, their texts as the tooltips and names (2026-10-11, the
              user's wish: the words were too long in some languages). */
            }
            <ActionButton
              look={{ icon: <icons.Close size={14} />, tip: texts.cancelSaveFilter }}
              variant="secondary"
              placement="toolbar"
              onClick={close}
            />
            <ActionButton
              // While it saves, a turning icon in place of the check (like OK of the edit form).
              look={{
                icon: saving ? <icons.Refresh size={14} /> : <icons.Check size={14} />,
                tip: texts.confirmSaveFilter,
              }}
              variant="secondary"
              placement="toolbar"
              busy={saving}
              disabled={trimmed === '' || !filled}
              onClick={() =>
                void save()}
            />
            {error !== undefined && <span role="alert" className={styles.savedFilterError}>{error}</span>}
          </div>
        )
        : (
          <>
            {loadable && <SavedFilterMenu savedFilters={savedFilters} draft={draft} texts={texts} onLoad={onLoad} />}
            {saveable && (
              <ActionButton
                look={{ icon: <icons.Save size={16} />, label: texts.saveFilter }}
                variant="secondary"
                placement="tool"
                onClick={() => setNaming(true)}
              />
            )}
          </>
        )}
    </div>
  );
}
