import { Tooltip } from '@base-ui/react/tooltip';
import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import type {
  CSSProperties,
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  ReactElement,
  ReactNode,
} from 'react';
import type { DataTableComponent as Spec } from '../../react/api';
import { ConfigContext } from '../config';
import { useNarrowerThan, useScrollEdges, useStickyOffsets } from '../hooks';
import { provideStylesheet } from '../stylesheet';
import { useDataTable } from '../useDataTable';
import type { RowGroupEntry } from '../useDataTable';
import { flag, formatValue, hasContent, suppressesTextSelection, suppressesWordSelection } from '../utils';
import { ActionList } from './Actions';
import * as classes from './classes';
import { ColumnResizer } from './ColumnResizer';
import { EditForm } from './EditForm';
import {
  FILTER_DRAWER_CLOSE_TIME,
  FILTER_VIEW_CLOSE_TIME,
  FILTER_VIEW_OPEN_TIME,
  FilterButton,
  FilterPills,
  FilterSidebar,
  FilterView,
} from './FilterPanel';
import { Footer } from './Footer';
import { icons } from './icons';
import { LayerContext } from './layer';
import { RowContextMenu } from './RowContextMenu';
import { useRowDrag } from './rowDrag';
import { Toolbar } from './Toolbar';
import { ActionButton, Checkbox, ChevronButton, LoadingBar, SortButton, ToggleMenu } from './widgets';

// A prototype (2026-10-09): the filters in a sidebar at the right edge (like AG Grid's), instead of the filter view.
// Which one stays is open (see the todo in `CLAUDE.md`). Until then a page flag, not an API (2026-10-09, the user's
// wish: a check item in the root page's kebab menu): the attribute `data-data-table-filter-drawer` on `<html>`; every
// table follows it live.
const FILTER_DRAWER_FLAG = 'data-data-table-filter-drawer';

function subscribeFilterDrawerFlag(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: [FILTER_DRAWER_FLAG] });
  return () => observer.disconnect();
}

function useFilterDrawerFlag(): boolean {
  return useSyncExternalStore(
    subscribeFilterDrawerFlag,
    () => document.documentElement.hasAttribute(FILTER_DRAWER_FLAG),
    () => false,
  );
}

// Whether the filter drawer is animated (opens and closes with a transition, see the stylesheet). Off for now
// (2026-10-09, the user's wish): the closed drawer goes at once.
const DRAWER_ANIMATION = false;

// How long the toolbar's actions are marked as coming back after the filter drawer closed (ms): a little more than
// their animation (`data-table-bar-in`, 150ms, see the stylesheet).
const ACTIONS_BACK_TIME = 200;

export { DataTableView };

// How long the edit form unfolds and its row folds up, and how long they play back: the times and the easings of the
// filter view (2026-10-04, the user's wish), the same as `.editFormCell` in the stylesheet.
const EDIT_FORM_OPEN_TIME = FILTER_VIEW_OPEN_TIME;
const EDIT_FORM_CLOSE_TIME = FILTER_VIEW_CLOSE_TIME;

// The folding of the edited row: kept at its end (`fill`) until it is cancelled; and played back.
const FOLD_TIMING: KeyframeAnimationOptions = {
  duration: EDIT_FORM_OPEN_TIME,
  easing: 'cubic-bezier(0.2, 0, 0, 1)',
  fill: 'forwards',
};
const UNFOLD_TIMING: KeyframeAnimationOptions = { duration: EDIT_FORM_CLOSE_TIME, easing: 'ease-in', fill: 'forwards' };

// Below this width of the data table (in pixels, 36rem at a 16px root; 2026-10-05, fixed for now) its rows are cards
// instead of a table (see `renderCard`).
const CARDS_BELOW = 576;

type LayoutMode = 'auto' | 'table' | 'cards';

const LAYOUT_MODES: readonly LayoutMode[] = ['auto', 'table', 'cards'];

// The whole data table: the toolbar (with the filter button and the pills), the grid, the header rows, the data
// rows, the detail rows and the empty state, or the filter view in place of the grid and the footer. The root carries
// the id of its theme (`data-data-table-theme`), which its stylesheet is scoped to (see stylesheet.ts).
function DataTableView<Row>(props: Spec.Props<Row>): ReactElement {
  const { title, subtitle, empty } = props;
  const { stylesheet, onRoot } = useContext(ConfigContext);
  const nav = useDataTable<Row>(props);
  // Where the widgets render their popups (see layer.ts).
  const [layer, setLayer] = useState<HTMLDivElement | null>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const { texts, selection, rows, layout, sort } = nav;
  const drag = useRowDrag(nav.lines.length, nav.canReorder, nav.moveLine);
  const rootRef = useRef<HTMLDivElement>(null);
  const [rootElement, setRootElement] = useState<HTMLDivElement | null>(null);
  // The root element, also for an i18n factory of the created component (see createDataTableComponent.tsx).
  const setRoot = useCallback((root: HTMLDivElement | null) => {
    rootRef.current = root;
    setRootElement(root);

    if (root !== null) {
      // Before the first paint (a ref is set in the commit).
      provideStylesheet(root, stylesheet);
      onRoot?.(root);
    }
  }, [onRoot, stylesheet]);
  // The layout (the "Layout" choice of the column menu, 2026-10-05): automatic (cards in a narrow table, see
  // `renderCard`), always the table, or always cards. A matter of the view: not kept after a remount.
  // Set by the app (`layout`): fixed, and no choice in the menu (2026-10-06, the user's wish).
  const [chosenLayout, setLayoutMode] = useState<LayoutMode>('auto');
  const layoutMode = props.layout ?? chosenLayout;
  const narrow = useNarrowerThan(rootElement, CARDS_BELOW);
  const cards = layoutMode === 'cards' || (layoutMode === 'auto' && narrow);
  const editKey = nav.edit?.key;

  // The fixed columns: the control columns (handle, selection, details) stay at the start while the table is
  // scrolled sideways, the action column at the end. A start column's offset is the width of those before it.
  const startColumns = (['handle', 'selection', 'details'] as const).filter((column) =>
    column === 'handle' ? nav.hasHandleColumn : column === 'selection' ? nav.hasSelectionColumn : nav.hasDetails
  );
  const startOffsets = useStickyOffsets(nav.headerElement, startColumns.length);
  const scrollEdges = useScrollEdges(nav.scroller);
  const stickyAttributes = (column: 'handle' | 'selection' | 'details' | 'action') =>
    column === 'action'
      ? { 'data-sticky': 'end' }
      : {
        'data-sticky': 'start',
        'data-sticky-edge': flag(column === startColumns[startColumns.length - 1]),
      };
  const stickyStyle = (column: 'handle' | 'selection' | 'details' | 'action', style?: CSSProperties) =>
    column === 'action' ? style : { ...style, insetInlineStart: startOffsets[startColumns.indexOf(column)] ?? 0 };

  // The rows of the edited row (its data row, and its detail row), not its form.
  const editedRows = (root: HTMLElement, key: string) =>
    [...root.querySelectorAll<HTMLElement>('[role="row"][data-row-key]:not([data-edit-form])')].filter((row) =>
      row.getAttribute('data-row-key') === key
    );

  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // The folding of the edited row, per cell (see below): the cell, its keyframes and its animation. And the form being
  // folded up by "Cancel", before it closes.
  const foldRef = useRef<{ cell: HTMLElement; keyframes: readonly Keyframe[]; animation: Animation }[]>([]);
  // By the id of the edit, not the key of its row: the same row may be opened again right after.
  const [closingId, setClosingId] = useState<number | undefined>(undefined);
  const closing = nav.edit !== undefined && closingId === nav.edit.id;
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(closeTimerRef.current), []);

  // "Cancel" (and Escape) the other way round: the form folds up while its row unfolds again, in the same time, and the
  // rest of the table fades back; then the form closes. Meanwhile nothing in the form reacts. Not while the draft is
  // saved. With reduced motion at once.
  const cancelEdit = () => {
    const edit = nav.edit;

    if (edit === undefined || edit.saving || closing) {
      return;
    }

    if (reducedMotion()) {
      nav.cancelEdit();

      return;
    }

    setClosingId(edit.id);
    // Its keyframes backwards, as a new animation: `reverse()` would also turn the easing around, and the row would lag
    // behind the form.
    for (const fold of foldRef.current) {
      fold.animation.cancel();
      fold.animation = fold.cell.animate([...fold.keyframes].reverse(), UNFOLD_TIMING);
    }

    closeTimerRef.current = setTimeout(nav.cancelEdit, EDIT_FORM_CLOSE_TIME);
  };

  // The form takes the place of its row: while it unfolds (CSS, `@starting-style`), the row folds up in the same time,
  // from its measured height to none (a Web Animation: CSS cannot animate from `auto`). It stays folded while the form
  // is open (`fill`); "Cancel" plays it back (see above). Before the first paint, so nothing flashes. With reduced
  // motion at once.
  useLayoutEffect(() => {
    const root = rootRef.current;

    if (editKey === undefined || root === null) {
      return;
    }

    const timing = reducedMotion() ? { ...FOLD_TIMING, duration: 0 } : FOLD_TIMING;
    const folds = editedRows(root, editKey).flatMap((row) =>
      [...row.children].flatMap((cell) => {
        if (!(cell instanceof HTMLElement) || typeof cell.animate !== 'function') {
          return [];
        }

        const { paddingTop, paddingBottom, borderBottomWidth } = getComputedStyle(cell);
        const keyframes: readonly Keyframe[] = [
          {
            boxSizing: 'border-box',
            overflow: 'hidden',
            maxHeight: `${cell.getBoundingClientRect().height}px`,
            paddingTop,
            paddingBottom,
            borderBottomWidth,
            opacity: 1,
          },
          {
            boxSizing: 'border-box',
            overflow: 'hidden',
            maxHeight: '0px',
            paddingTop: '0px',
            paddingBottom: '0px',
            borderBottomWidth: '0px',
            opacity: 0,
          },
        ];

        return [{ cell, keyframes, animation: cell.animate([...keyframes], timing) }];
      })
    );

    foldRef.current = folds;

    return () => {
      // Closed another way meanwhile (e.g. by a new load): a pending close of "Cancel" is not for the next form.
      clearTimeout(closeTimerRef.current);
      foldRef.current = [];
      folds.forEach((fold) => fold.animation.cancel());
    };
  }, [editKey]);

  // The edit form gets the focus in its first editor (a text is selected), and comes into view (its buttons too), as
  // far as it fits, once it has unfolded. When it closes, the focus goes back to where it was (e.g. the row's "Edit" or
  // a button of the toolbar), else to the first button of the row's actions.
  useEffect(() => {
    const root = rootRef.current;

    if (editKey === undefined || root === null) {
      return;
    }

    const before = document.activeElement;
    const form = root.querySelector<HTMLElement>('[data-edit-form] [role="cell"]');
    const first = form?.querySelector<HTMLElement>(':is(input, textarea, select, button)');
    const timer = setTimeout(() => form?.scrollIntoView({ block: 'nearest' }), EDIT_FORM_OPEN_TIME);

    first?.focus({ preventScroll: true });

    if (first instanceof HTMLInputElement) {
      first.select();
    }

    return () => {
      clearTimeout(timer);

      if (before instanceof HTMLElement && before.isConnected && root.contains(before) && !before.closest('[inert]')) {
        before.focus();
      } else if (document.activeElement === null || document.activeElement === document.body) {
        editedRows(root, editKey)[0]?.querySelector<HTMLElement>('[data-row-actions] button')?.focus();
      }
    };
  }, [editKey]);

  // The filter view by a key per opening: after closing, the closed one stays a moment (by its key) and rolls up, while
  // everything else is back at once; one opened meanwhile is a new one (a new key). With reduced motion it goes at once.
  const [filterViewKey, setFilterViewKey] = useState(0);
  const [closingFilterViewKey, setClosingFilterViewKey] = useState<number | undefined>(undefined);
  const filterViewTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(filterViewTimerRef.current), []);

  // The filter sidebar (a prototype, see `FilterSidebar`): shown instead of the filter button and the filter view.
  const drawerFlag = useFilterDrawerFlag();
  const [sidebar, setSidebar] = useState<{ open: boolean; focusKey?: string | undefined }>({ open: false });
  // A switch of the flag closes what is open (the drawer, or the filter view), its draft dropped.
  const drawerFlagRef = useRef(drawerFlag);
  const { closeFilters } = nav;
  useEffect(() => {
    if (drawerFlagRef.current === drawerFlag) return;
    drawerFlagRef.current = drawerFlag;
    setSidebar({ open: false });
    closeFilters();
  }, [drawerFlag, closeFilters]);
  // The filter view or the drawer is open: everything else of the table but the filter button is disabled and faded.
  const filtersOpen = nav.filterPanel.open || sidebar.open;
  // The drawer by a key per opening, like the filter view: after closing, the closed one stays a moment (by its key)
  // and is covered up from the left (its animation; it goes when the animation ends, at the latest after
  // `FILTER_DRAWER_CLOSE_TIME`); one opened meanwhile is a new one. With
  // reduced motion it goes at once.
  const [actionsBack, setActionsBack] = useState(false);
  const actionsBackTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(actionsBackTimerRef.current), []);

  const [sidebarKey, setSidebarKey] = useState(0);
  const [closingSidebarKey, setClosingSidebarKey] = useState<number | undefined>(undefined);
  const sidebarTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(sidebarTimerRef.current), []);

  // Closing the drawer gives the focus back to the filter button (like the filter view): once it is shown again (it is
  // hidden while the drawer is open, see the stylesheet), so after the render.
  const closeSidebar = () => {
    setTimeout(() => filterButtonRef.current?.focus());
    setSidebar({ open: false });
    // The toolbar's actions come back like a new bar (`data-actions-back`, for the time of their animation).
    setActionsBack(true);
    clearTimeout(actionsBackTimerRef.current);
    actionsBackTimerRef.current = setTimeout(() => setActionsBack(false), ACTIONS_BACK_TIME);
    setSidebarKey((key) => key + 1);

    if (DRAWER_ANIMATION && !reducedMotion()) {
      clearTimeout(sidebarTimerRef.current);
      setClosingSidebarKey(sidebarKey);
      sidebarTimerRef.current = setTimeout(() => setClosingSidebarKey(undefined), FILTER_DRAWER_CLOSE_TIME);
    }
  };

  const filterDrawer = (key: number, closing: boolean) => (
    <FilterSidebar
      key={key}
      columns={nav.filterColumns}
      filters={nav.filters}
      texts={texts}
      focusKey={sidebar.focusKey}
      closing={closing}
      onClosed={() => {
        clearTimeout(sidebarTimerRef.current);
        setClosingSidebarKey(undefined);
      }}
      anchorRef={filterButtonRef}
      onApply={(next) => {
        nav.applyFilters(next);
        closeSidebar();
      }}
      onCancel={closeSidebar}
    />
  );

  // Closing the filter view gives the focus back to the filter button (the focused control goes away with the view).
  const closeFilterView = () => {
    filterButtonRef.current?.focus();
    nav.closeFilters();
    setFilterViewKey((key) => key + 1);

    if (!reducedMotion()) {
      clearTimeout(filterViewTimerRef.current);
      setClosingFilterViewKey(filterViewKey);
      filterViewTimerRef.current = setTimeout(() => setClosingFilterViewKey(undefined), FILTER_VIEW_CLOSE_TIME);
    }
  };

  const filterView = (key: number, closing: boolean) => (
    <FilterView
      key={key}
      columns={nav.filterColumns}
      filters={nav.filters}
      texts={texts}
      focusKey={nav.filterPanel.focusKey}
      closing={closing}
      anchorRef={filterButtonRef}
      onApply={(next) => {
        nav.applyFilters(next);
        closeFilterView();
      }}
      onCancel={closeFilterView}
    />
  );

  // Text is selectable in one cell at a time: the cell where the mouse went down is marked, and only a marked cell
  // has `user-select: text` (see `.table`), so a drag never reaches the next cell. The cells of a group header are
  // never marked: their text is not for selecting (the header bands have `user-select: none`).
  const selectingRef = useRef<HTMLElement | null>(null);
  const markSelectableCell = (event: PointerEvent<HTMLElement>) => {
    const found = event.target instanceof Element ? event.target.closest<HTMLElement>('[role="cell"]') : null;
    const cell = found?.parentElement?.hasAttribute('data-group-key') === true ? null : found;

    if (cell !== selectingRef.current) {
      selectingRef.current?.removeAttribute('data-selecting');
      cell?.setAttribute('data-selecting', '');
      selectingRef.current = cell;
    }
  };

  // A data row and its detail row are one unit: both select from their free space, and both suppress the text
  // selection that shift + mouse down would otherwise start.
  const rowHandlers = (row: Row, key: string) => ({
    onClick: selection === 'none' ? undefined : (event: MouseEvent<HTMLElement>) => nav.clickRow(event, key),
    // Single selection has no control: the row itself is focusable. Space selects it, the arrows move to the previous
    // or next row and select it. Keys inside a cell (an input, a button, a menu) are theirs.
    tabIndex: selection === 'single' ? 0 : undefined,
    onKeyDown: selection === 'single'
      ? (event: KeyboardEvent<HTMLElement>) => {
        if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) {
          return;
        }

        const step = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;

        if (event.key === ' ') {
          event.preventDefault();
          nav.selectOnly(key);
        } else if (step !== 0) {
          const rows = [
            ...event.currentTarget.parentElement?.querySelectorAll<HTMLElement>('[role="row"][data-row-key]') ?? [],
          ];
          const next = rows[rows.indexOf(event.currentTarget) + step];

          if (next !== undefined) {
            event.preventDefault();
            next.focus();
            nav.selectOnly(next.dataset.rowKey ?? '');
          }
        }
      }
      : undefined,
    onDoubleClick: nav.hasDefaultAction
      ? (event: MouseEvent<HTMLElement>) => nav.doubleClickRow(event, row)
      : undefined,
    // Shift + mouse down would select the text between the last click and this one, and the second mouse down of a
    // double click would select a word. Neither is wanted where the gesture already means something else.
    onMouseDown: selection === 'multi' || nav.hasDefaultAction
      ? (event: MouseEvent<HTMLElement>) => {
        const range = selection === 'multi' && suppressesTextSelection(event);
        const word = nav.hasDefaultAction && suppressesWordSelection(event);

        if (range || word) {
          event.preventDefault();
        }
      }
      : undefined,
  });

  // Plain text gets an element of its own (`data-cell-text`): a click on it counts like one on the free space of the
  // cell (see `isRowTarget`), and its cursor follows the cell's. Whatever a custom `render` or `renderDetail` returns
  // is its own target.
  const cellContent = (content: ReactNode): ReactNode =>
    typeof content === 'string' || typeof content === 'number'
      ? <span className={classes.cellText} data-cell-text>{content}</span>
      : content;

  // The button of a group header that collapses and expands it: a caret and the group's content (`renderGroup`, else its
  // key and the number of its rows). In the grid and in the cards alike.
  const groupToggle = (group: RowGroupEntry<Row>): ReactElement => {
    const collapsed = nav.isGroupCollapsed(group.key);
    const shown = group.rows.length;

    return (
      <button
        type="button"
        className={classes.groupToggle}
        aria-expanded={!collapsed}
        onClick={() => nav.toggleGroup(group.key)}
      >
        {/* A filled caret, not the chevron of the row details: a group hides or shows rows, not a row's content. */}
        <span className={classes.chevron} data-expanded={flag(!collapsed)}>
          <icons.CaretRight />
        </span>
        {props.renderGroup !== undefined ? props.renderGroup(group) : (
          <>
            <span className={classes.groupLabel}>{group.key === '' ? texts.emptyGroup : group.key}</span>
            <span className={classes.groupCount}>
              {group.total === undefined || group.total === shown
                ? texts.groupCount({ count: group.total ?? shown })
                : texts.groupPartial({ shown, total: group.total })}
            </span>
          </>
        )}
      </button>
    );
  };

  // The header row of a group (the line `line`), over the whole width: a checkbox for its rows (`selectableGroups`,
  // with multi selection; none for an empty group), then a button that collapses and expands the group, with a chevron
  // and the group's content (without the checkbox, it starts in the first column):
  // `renderGroup`, else its key and the number of its rows (of the source's total, when it gives one and the page
  // shows only a part of the group). The group actions at its end, in the action column. During a drag it slides aside like a row.
  const renderGroupRow = (group: RowGroupEntry<Row>, line: number): ReactElement => {
    const selectedState = nav.groupSelection(group);
    const shown = group.rows.length;
    // With the checkbox (`selectableGroups`, only with multi selection), the toggle starts after the selection column;
    // without it, in the first column, so the caret and the name are not pushed to the right by an empty cell.
    const withCheckbox = nav.selectableGroups;
    const look = drag.lookOf(line);
    const withActions = nav.groupActions.length > 0;

    return (
      <div
        role="row"
        className={classes.groupRow}
        data-line={line}
        data-group-key={group.key}
        inert={nav.blocked}
        data-blocked={flag(nav.edit !== undefined)}
      >
        {
          /* With a checkbox, the band starts in the selection column: an empty band cell in the handle column before
        it, so the band runs through from the left edge. */
        }
        {withCheckbox && nav.hasHandleColumn && (
          <div
            role="presentation"
            className={classes.groupCell}
            data-drag={look.state}
            style={{ ...look.style, gridColumn: nav.handleColumn }}
            data-meta={nav.metaEdges('handle')}
          />
        )}
        {withCheckbox && (
          <div
            role="cell"
            className={classes.groupCell}
            data-drag={look.state}
            style={{ ...look.style, gridColumn: nav.selectionColumn }}
            data-meta={nav.metaEdges('selection')}
          >
            {shown > 0 && (
              <Checkbox
                label={selectedState === 'all' ? texts.deselectGroup : texts.selectGroup}
                checked={selectedState === 'all'}
                indeterminate={selectedState === 'some'}
                onChange={(checked) => nav.selectGroup(group, checked)}
              />
            )}
          </div>
        )}
        <div
          role="cell"
          className={classes.groupCell}
          data-drag={look.state}
          style={{
            ...look.style,
            gridColumn: `${withCheckbox ? nav.selectionColumn + 1 : 1} / ${withActions ? nav.actionColumn : -1}`,
          }}
        >
          {groupToggle(group)}
        </div>
        {withActions && (
          <div
            role="cell"
            className={classes.groupCell}
            data-drag={look.state}
            style={{ ...look.style, gridColumn: nav.actionColumn }}
          >
            <div className={classes.rowActions}>
              <ActionList
                items={nav.groupActions}
                placement="row"
                rowActionLook={nav.rowActionLook}
                invoke={(action) => nav.invokeForGroup(group, action)}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  // The cells of the data columns of a row: its `render`, else its value as text.
  const renderDataCells = (shown: Row, mark: HTMLAttributes<HTMLDivElement>): ReactNode =>
    layout.leaves.map(({ column }) => (
      <div
        key={column.key}
        role="cell"
        className={classes.cell}
        {...mark}
        data-align={column.align}
        data-wrap={flag(column.wrap === true)}
      >
        {cellContent(column.render ? column.render(shown) : formatValue(shown[column.key]))}
      </div>
    ));

  // A narrow table (2026-10-05, see `CARDS_BELOW`): each row is a card instead of a grid row. On top a bar with the
  // selection (its free space is a click on the checkbox, like the selection cell), the details toggle and the
  // row actions; then one line per shown column, its header as the label and its content as in a cell; the row details
  // at the end. The same row click, double click, context menu and selection as a grid row (the card is the row: the
  // label, the value and the bar are its direct children, so their free space selects). The edited row is its form.
  const renderCard = (row: Row, index: number): ReactElement => {
    const key = nav.keyOf(row);
    const edit = nav.edit?.key === key ? nav.edit : undefined;

    if (edit !== undefined) {
      return renderEditForm(edit);
    }

    const selected = nav.isSelected(key);
    const detail = nav.details[index];
    const expandable = hasContent(detail);
    const expanded = expandable && nav.isExpanded(key);

    return (
      <div
        role="listitem"
        className={classes.card}
        data-row-key={key}
        data-selected={flag(selected)}
        inert={nav.blocked}
        data-blocked={flag(nav.edit !== undefined)}
        {...rowHandlers(row, key)}
      >
        {(nav.hasSelectionColumn || nav.hasDetails || nav.hasActionColumn) && (
          <div className={classes.cardBar}>
            {nav.hasSelectionColumn && (
              <span
                className={classes.cardSelect}
                data-select
                onClick={(event) => {
                  if (event.target !== event.currentTarget) {
                    return;
                  }

                  nav.selectByClick(key, event.shiftKey);
                }}
              >
                <Checkbox
                  label={selected ? texts.deselectRow : texts.selectRow}
                  checked={selected}
                  onChange={(_, shift) => nav.selectByClick(key, shift)}
                />
              </span>
            )}
            {expandable && (
              <ChevronButton
                label={expanded ? texts.collapseDetails : texts.expandDetails}
                expanded={expanded}
                onClick={() => nav.toggleDetails(key)}
              />
            )}
            {nav.hasActionColumn && (
              <div className={classes.cardActions} data-row-actions>
                <ActionList
                  items={nav.rowActionsFor(row)}
                  placement="row"
                  rowActionLook={nav.rowActionLook}
                  invoke={(action) => nav.invokeForRow(row, action)}
                />
              </div>
            )}
          </div>
        )}
        {layout.leaves.map(({ column }) => (
          <Fragment key={column.key}>
            <span className={classes.cardLabel}>{column.header}</span>
            <div className={classes.cardValue} data-wrap={flag(column.wrap === true)}>
              {cellContent(column.render ? column.render(row) : formatValue(row[column.key]))}
            </div>
          </Fragment>
        ))}
        {expanded && <div className={classes.cardDetail} data-detail>{cellContent(detail)}</div>}
      </div>
    );
  };

  // A group header between the cards: its checkbox (`selectableGroups`), the toggle, its group actions.
  const renderCardGroup = (group: RowGroupEntry<Row>): ReactElement => {
    const selectedState = nav.groupSelection(group);

    return (
      <div role="listitem" className={classes.cardGroup} data-group-key={group.key} inert={nav.blocked}>
        {nav.selectableGroups && group.rows.length > 0 && (
          <Checkbox
            label={selectedState === 'all' ? texts.deselectGroup : texts.selectGroup}
            checked={selectedState === 'all'}
            indeterminate={selectedState === 'some'}
            onChange={(checked) => nav.selectGroup(group, checked)}
          />
        )}
        {groupToggle(group)}
        {nav.groupActions.length > 0 && (
          <div className={classes.cardActions}>
            <ActionList
              items={nav.groupActions}
              placement="row"
              rowActionLook={nav.rowActionLook}
              invoke={(action) => nav.invokeForGroup(group, action)}
            />
          </div>
        )}
      </div>
    );
  };

  // The empty state: in the grid's empty row, or in the list of cards.
  const emptyContent = (
    <>
      {empty ?? <span className={classes.dimmed}>{nav.emptyText}</span>}
      {empty === undefined && Object.keys(nav.filters).length > 0 && (
        // A ghost button in the text color (neutral, like the other view controls).
        <ActionButton
          look={{ label: texts.clearFilters }}
          variant="secondary"
          placement="tool"
          onClick={nav.clearFilters}
        />
      )}
    </>
  );

  // The edit form of the edited row (or of the new one), below it.
  const renderEditForm = (edit: NonNullable<typeof nav.edit>): ReactElement => (
    <EditForm
      rowKey={edit.key}
      isNew={edit.isNew}
      row={edit.row}
      draft={edit.draft}
      saving={edit.saving}
      error={edit.error}
      fields={nav.formFields}
      texts={texts}
      fieldId={nav.fieldId}
      onChange={nav.changeDraft}
      onSave={nav.saveEdit}
      closing={closing}
      onCancel={cancelEdit}
      onKeyDown={(event) => nav.keyDownEdit(event, layer, cancelEdit)}
    />
  );

  return (
    <div
      ref={setRoot}
      className={classes.root}
      data-data-table-theme={stylesheet.id}
      aria-busy={nav.loading}
      data-density={nav.density}
      data-selection={selection}
      data-selection-appearance={nav.selectionAppearance}
      data-striped={flag(nav.striped)}
      data-dimmed={flag(nav.spinnerVisible)}
      data-dragging={flag(drag.drag !== undefined)}
      data-editing={flag(nav.edit !== undefined)}
      data-edit-closing={flag(closing)}
      data-cards={flag(cards)}
      data-filter-drawer={flag(sidebar.open)}
      data-actions-back={flag(actionsBack)}
      onKeyDown={(event) => nav.keyDownRoot(event, layer)}
    >
      <LayerContext value={layer}>
        {/* Tooltips open after a short pause, and at once when moving from one trigger to the next. */}
        <Tooltip.Provider delay={300}>
          <div className={classes.content}>
            {/* While a row is edited, the toolbar is blocked too (also the search box and the filter button). */}
            <div className={classes.blocker} inert={nav.edit !== undefined} data-blocked={flag(nav.edit !== undefined)}>
              <Toolbar
                title={title}
                subtitle={subtitle}
                // The total of the last finished load (`showTotal`): not before the first one.
                total={props.showTotal === true && nav.loaded ? texts.totalCount({ count: nav.total }) : undefined}
                generalActions={nav.generalActions}
                pinnedActions={nav.pinnedActions}
                selectionActions={nav.selectionActions}
                invoke={nav.invokeFromToolbar}
                texts={texts}
                search={nav.searchBox}
                // While the filter view is shown, everything of the bar but the filter button is disabled.
                filtering={nav.filterPanel.open}
                disabled={sidebar.open}
                reload={nav.reload}
                filterButton={nav.filterColumns.length > 0 && (
                  drawerFlag
                    ? (
                      <FilterButton
                        count={Object.keys(nav.filters).length}
                        open={sidebar.open}
                        texts={texts}
                        buttonRef={filterButtonRef}
                        onToggle={() => (sidebar.open ? closeSidebar() : setSidebar({ open: true }))}
                        onClear={() => {
                          nav.clearFilters();
                          if (sidebar.open) closeSidebar();
                        }}
                      />
                    )
                    : (
                      <FilterButton
                        count={Object.keys(nav.filters).length}
                        open={nav.filterPanel.open}
                        texts={texts}
                        buttonRef={filterButtonRef}
                        onToggle={() => (nav.filterPanel.open ? closeFilterView() : nav.openFilters())}
                        onClear={() => {
                          nav.clearFilters();
                          if (nav.filterPanel.open) closeFilterView();
                        }}
                      />
                    )
                )}
                columnMenu={
                  <ToggleMenu
                    icon={<icons.Columns />}
                    label={texts.columns}
                    choice={props.layout === undefined
                      ? {
                        label: texts.layout,
                        value: layoutMode,
                        options: [
                          { value: 'auto', label: texts.layoutAuto },
                          { value: 'table', label: texts.layoutTable },
                          { value: 'cards', label: texts.layoutCards },
                        ],
                        onChange: (value) => setLayoutMode(LAYOUT_MODES.find((mode) => mode === value) ?? 'auto'),
                      }
                      : undefined}
                    // The column widths are the table's: disabled while the rows are cards.
                    actions={[{
                      key: 'optimize-widths',
                      label: texts.optimizeColumnWidths,
                      icon: <icons.FitWidth size={16} />,
                      disabled: cards,
                      onSelect: nav.optimizeColumnWidths,
                    }, {
                      key: 'reset-widths',
                      label: texts.resetColumnWidths,
                      icon: <icons.ArrowBackUp size={16} />,
                      disabled: cards || !nav.hasResizedColumns,
                      onSelect: nav.resetColumnWidths,
                    }]}
                    entries={nav.columnToggles}
                    onToggle={nav.toggleColumn}
                  />
                }
                // Shown while the filter view is shown too, but disabled and a bit faded like the bar's other parts.
                pills={
                  <FilterPills
                    columns={nav.filterColumns}
                    filters={nav.filters}
                    texts={texts}
                    onOpen={nav.selectionActive
                      ? undefined
                      : drawerFlag
                      ? (key) => setSidebar({ open: true, focusKey: key })
                      : nav.openFilters}
                    onRemove={nav.removeFilter}
                    onClearAll={nav.clearFilters}
                    inactive={nav.filterPanel.open}
                    disabled={sidebar.open}
                  />
                }
                selectable={selection !== 'none'}
                selectedCount={nav.selectedRows.length}
                onCancelSelection={nav.clearSelection}
                loading={nav.loading}
              />
            </div>
            {
              /* The grid with the footer, and the filter view: stacked in one cell, so the height is the larger of the
              two. While the view is shown, the grid and the footer stay (with their scroll position and state), faded
              and inert below it: the table keeps its height, and nothing below it moves. */
            }
            <div className={classes.stack} data-filtering={flag(filtersOpen)}>
              {/* One list, so the closed view keeps its instance (its key) while it rolls up. */}
              {[
                closingFilterViewKey !== undefined && filterView(closingFilterViewKey, true),
                nav.filterPanel.open && filterView(filterViewKey, false),
              ]}
              <div className={classes.tableArea} inert={filtersOpen}>
                <div className={classes.scrollArea}>
                  <div
                    ref={nav.scrollerRef}
                    className={classes.scroller}
                    data-overflow-start={flag(scrollEdges.start)}
                    data-overflow-end={flag(scrollEdges.end)}
                    onPointerDown={markSelectableCell}
                  >
                    {cards
                      ? (
                        <RowContextMenu
                          role="list"
                          items={nav.contextActions}
                          available={nav.hasContextMenu}
                          prepare={nav.prepareContextMenu}
                          invoke={nav.invokeFromContextMenu}
                          className={classes.cards}
                        >
                          {nav.edit?.isNew === true && (
                            <Fragment key={nav.edit.key}>{renderEditForm(nav.edit)}</Fragment>
                          )}
                          {nav.lines.map((line) => {
                            if (line.type === 'group') {
                              return line.group === undefined
                                ? null
                                : (
                                  <Fragment key={`group:${line.group.key}:${line.segment}`}>
                                    {renderCardGroup(line.group)}
                                  </Fragment>
                                );
                            }

                            const row = rows[line.index];

                            return row === undefined
                              ? null
                              : <Fragment key={nav.keyOf(row)}>{renderCard(row, line.index)}</Fragment>;
                          })}
                          {nav.isEmpty && (
                            <div role="listitem" className={classes.cardsEmpty} inert={nav.blocked}>
                              {emptyContent}
                            </div>
                          )}
                        </RowContextMenu>
                      )
                      : (
                        <RowContextMenu
                          items={nav.contextActions}
                          available={nav.hasContextMenu}
                          prepare={nav.prepareContextMenu}
                          invoke={nav.invokeFromContextMenu}
                          className={classes.table}
                          style={{ gridTemplateColumns: nav.gridTemplateColumns }}
                        >
                          <div
                            role="row"
                            ref={nav.headerRef}
                            data-groups={flag(nav.headerRows === 2)}
                            className={classes.headerRow}
                          >
                            {nav.hasHandleColumn && (
                              <div
                                role="columnheader"
                                className={classes.headerTall}
                                style={stickyStyle('handle', {
                                  gridColumn: nav.handleColumn,
                                  gridRow: nav.headerRowSpan,
                                })}
                                {...stickyAttributes('handle')}
                                data-meta={nav.metaEdges('handle')}
                              />
                            )}
                            {nav.hasSelectionColumn && (
                              <div
                                role="columnheader"
                                inert={nav.blocked}
                                className={classes.headerTall}
                                style={stickyStyle('selection', {
                                  gridColumn: nav.selectionColumn,
                                  gridRow: nav.headerRowSpan,
                                })}
                                {...stickyAttributes('selection')}
                                data-meta={nav.metaEdges('selection')}
                                data-select={flag(rows.length > 0)}
                                onClick={(event) => {
                                  // The free space of the cell is a click on the select-all checkbox.
                                  if (event.target === event.currentTarget && rows.length > 0) {
                                    nav.selectAll(!nav.allSelected);
                                  }
                                }}
                              >
                                <Checkbox
                                  label={nav.allSelected ? texts.deselectAll : texts.selectAll}
                                  disabled={rows.length === 0}
                                  checked={nav.allSelected}
                                  indeterminate={nav.someSelected}
                                  onChange={(checked) => nav.selectAll(checked)}
                                />
                              </div>
                            )}
                            {nav.hasDetails && (
                              <div
                                role="columnheader"
                                inert={nav.blocked}
                                className={classes.headerTall}
                                style={stickyStyle('details', {
                                  gridColumn: nav.detailsColumn,
                                  gridRow: nav.headerRowSpan,
                                })}
                                {...stickyAttributes('details')}
                                data-meta={nav.metaEdges('details')}
                              >
                                <ChevronButton
                                  label={nav.allDetailsExpanded ? texts.collapseAllDetails : texts.expandAllDetails}
                                  expanded={nav.allDetailsExpanded}
                                  onClick={nav.toggleAllDetails}
                                />
                              </div>
                            )}
                            {layout.groups.map((group) => (
                              <div
                                key={group.start}
                                role="columnheader"
                                inert={nav.blocked}
                                className={classes.groupHeader}
                                style={{ gridColumn: nav.columnSpan(nav.firstLeafColumn + group.start, group.span) }}
                              >
                                <div className={classes.groupTitle}>{group.header}</div>
                              </div>
                            ))}
                            {nav.headerRows === 2
                              && layout.leaves.map(({ column, grouped }, index) =>
                                grouped
                                  ? null
                                  : (
                                    <div
                                      key={`filler-${column.key}`}
                                      role="presentation"
                                      className={classes.headerFiller}
                                      style={{ gridColumn: nav.firstLeafColumn + index }}
                                    />
                                  )
                              )}
                            {layout.leaves.map(({ column }, index) => {
                              // A table whose rows are moved has no column sorting.
                              const sortable = column.sortable === true && !nav.reorderable;
                              const resizable = column.resizable !== false;

                              return (
                                <div
                                  key={column.key}
                                  role="columnheader"
                                  inert={nav.blocked}
                                  id={nav.headerId(column.key)}
                                  aria-sort={sortable ? nav.ariaSort(column.key) : undefined}
                                  data-align={column.align}
                                  data-sortable={flag(sortable)}
                                  data-resizable={flag(resizable)}
                                  data-sorted={flag(sort?.key === column.key)}
                                  onClick={sortable ? () => nav.sortBy(column.key) : undefined}
                                  className={nav.headerRows === 2 ? classes.headerSub : classes.headerTall}
                                  style={{ gridColumn: nav.firstLeafColumn + index }}
                                >
                                  {sortable
                                    ? (
                                      <SortButton
                                        tip={sort?.key === column.key && sort.direction === 'asc'
                                          ? texts.sortDesc
                                          : texts.sortAsc}
                                        header={column.header}
                                        direction={sort?.key === column.key ? sort.direction : undefined}
                                      />
                                    )
                                    : <span className={classes.headerText}>{column.header}</span>}
                                  {resizable && (
                                    <ColumnResizer
                                      onStart={nav.freezeColumns}
                                      onResize={(width) => nav.resizeColumn(column.key, width)}
                                    />
                                  )}
                                </div>
                              );
                            })}
                            {nav.hasActionColumn && (
                              <div
                                role="columnheader"
                                inert={nav.blocked}
                                className={classes.headerTall}
                                style={stickyStyle('action', {
                                  gridColumn: nav.actionColumn,
                                  gridRow: nav.headerRowSpan,
                                })}
                                {...stickyAttributes('action')}
                              />
                            )}
                          </div>
                          {/* A new row (`addRow`) is only its form, at the top of the rows. */}
                          {nav.edit?.isNew === true && (
                            <Fragment key={nav.edit.key}>{renderEditForm(nav.edit)}</Fragment>
                          )}
                          {nav.lines.map((line, lineIndex) => {
                            // The lines: group headers and rows (the rows of a collapsed group are left out). The stripes
                            // start again in every group, and in every run of rows without a group.
                            if (line.type === 'group') {
                              return line.group === undefined
                                ? null
                                : (
                                  <Fragment key={`group:${line.group.key}:${line.segment}`}>
                                    {renderGroupRow(line.group, lineIndex)}
                                  </Fragment>
                                );
                            }

                            const { index } = line;

                            if (index >= rows.length) {
                              return null;
                            }

                            const row = rows[index] as Row;

                            const key = nav.keyOf(row);
                            const stripeIndex = line.local;
                            const selected = nav.isSelected(key);
                            const detail = nav.details[index];
                            const expandable = hasContent(detail);
                            const expanded = expandable && nav.isExpanded(key);
                            // Every cell of the row and of its detail row: selected, and during a drag lifted and moved
                            // with the pointer, or moved aside to make room (the transform).
                            const look = drag.lookOf(lineIndex);
                            const mark = {
                              'data-selected': flag(selected),
                              'data-drag': look.state,
                              style: look.style,
                            };
                            // In edit mode, the edit form follows the row (after its detail row) and takes its place: the
                            // row folds up (see above). While a row is edited, every row is blocked (the form is not); the
                            // others are faded.
                            const edit = nav.edit?.key === key ? nav.edit : undefined;
                            const otherEdited = nav.edit !== undefined && edit === undefined;
                            const rowInert = nav.blocked;

                            return (
                              <Fragment key={key}>
                                <div
                                  role="row"
                                  className={classes.dataRow}
                                  data-row-key={key}
                                  data-line={lineIndex}
                                  inert={rowInert}
                                  data-blocked={flag(otherEdited)}
                                  data-editing={flag(edit !== undefined)}
                                  data-stripe={flag(nav.striped && stripeIndex % 2 === 0)}
                                  aria-selected={selection !== 'none' ? selected : undefined}
                                  {...rowHandlers(row, key)}
                                >
                                  {
                                    /* The drag handle cell is a control cell (clicking it never selects). Its handle is only
                          there while rows can be moved (no search, no filters); the cell stays, so nothing shifts. */
                                  }
                                  {nav.hasHandleColumn && (
                                    <div
                                      role="cell"
                                      className={classes.cell}
                                      {...mark}
                                      style={stickyStyle('handle', mark.style)}
                                      {...stickyAttributes('handle')}
                                      data-meta={nav.metaEdges('handle')}
                                      data-control
                                    >
                                      {nav.reorderable && (
                                        <button
                                          type="button"
                                          className={classes.dragHandle}
                                          aria-label={texts.moveRow}
                                          aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown"
                                          inert={!nav.canReorder}
                                          data-inactive={flag(!nav.canReorder)}
                                          {...drag.handleProps(lineIndex)}
                                        >
                                          <icons.Grip />
                                        </button>
                                      )}
                                    </div>
                                  )}
                                  {
                                    /* The free space of the selection cell is a click on its checkbox (a few pixels
                          beside it still hit), with Shift for a range. The details toggle cell is not a control cell:
                          clicking its free space selects the row, like a data cell. The checkbox and the chevron
                          inside are their own targets, so each still does its own job exactly once. */
                                  }
                                  {nav.hasSelectionColumn && (
                                    <div
                                      role="cell"
                                      className={classes.cell}
                                      {...mark}
                                      style={stickyStyle('selection', mark.style)}
                                      {...stickyAttributes('selection')}
                                      data-meta={nav.metaEdges('selection')}
                                      data-select
                                      onClick={(event) => {
                                        if (event.target !== event.currentTarget) {
                                          return;
                                        }

                                        nav.selectByClick(key, event.shiftKey);
                                      }}
                                    >
                                      <Checkbox
                                        label={selected ? texts.deselectRow : texts.selectRow}
                                        checked={selected}
                                        onChange={(_, shift) => nav.selectByClick(key, shift)}
                                      />
                                    </div>
                                  )}
                                  {nav.hasDetails && (
                                    <div
                                      role="cell"
                                      className={classes.cell}
                                      {...mark}
                                      style={stickyStyle('details', mark.style)}
                                      {...stickyAttributes('details')}
                                      data-meta={nav.metaEdges('details')}
                                    >
                                      {expandable && (
                                        <ChevronButton
                                          label={expanded ? texts.collapseDetails : texts.expandDetails}
                                          expanded={expanded}
                                          onClick={() => nav.toggleDetails(key)}
                                        />
                                      )}
                                    </div>
                                  )}
                                  {renderDataCells(row, mark)}
                                  {nav.hasActionColumn && (
                                    <div
                                      role="cell"
                                      className={classes.cell}
                                      {...mark}
                                      style={stickyStyle('action', mark.style)}
                                      {...stickyAttributes('action')}
                                      data-divider="start"
                                      data-control
                                    >
                                      <div className={classes.rowActions} data-row-actions>
                                        <ActionList
                                          items={nav.rowActionsFor(row)}
                                          placement="row"
                                          rowActionLook={nav.rowActionLook}
                                          invoke={(action) => nav.invokeForRow(row, action)}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {expanded && (
                                  <div
                                    role="row"
                                    className={classes.detailRow}
                                    data-row-key={key}
                                    data-line={lineIndex}
                                    inert={rowInert}
                                    data-blocked={flag(otherEdited)}
                                    {...rowHandlers(row, key)}
                                  >
                                    {nav.hasHandleColumn && (
                                      <div
                                        role="presentation"
                                        className={classes.cell}
                                        {...mark}
                                        data-meta={nav.metaEdges('handle')}
                                      />
                                    )}
                                    {nav.hasSelectionColumn && (
                                      <div
                                        role="presentation"
                                        className={classes.cell}
                                        {...mark}
                                        data-meta={nav.metaEdges('selection')}
                                      />
                                    )}
                                    {nav.hasDetails && (
                                      <div
                                        role="presentation"
                                        className={classes.cell}
                                        {...mark}
                                        data-meta={nav.metaEdges('details')}
                                      />
                                    )}
                                    <div
                                      role="cell"
                                      className={classes.detailCell}
                                      data-detail
                                      {...mark}
                                      style={{
                                        ...look.style,
                                        gridColumn: nav.columnSpan(nav.firstLeafColumn, layout.leaves.length),
                                      }}
                                    >
                                      {cellContent(detail)}
                                    </div>
                                    {nav.hasActionColumn && (
                                      <div
                                        role="presentation"
                                        className={classes.cell}
                                        {...mark}
                                        data-divider="start"
                                      />
                                    )}
                                  </div>
                                )}
                                {edit !== undefined && renderEditForm(edit)}
                              </Fragment>
                            );
                          })}
                          {nav.isEmpty && (
                            <div role="row" className={classes.row} inert={nav.blocked}>
                              <div role="cell" className={classes.emptyCell}>
                                {emptyContent}
                              </div>
                            </div>
                          )}
                        </RowContextMenu>
                      )}
                  </div>
                  {nav.spinnerVisible && (
                    <div
                      className={classes.overlay}
                      style={{ top: cards ? 0 : nav.headerHeight, right: nav.scrollbarWidth }}
                    >
                      <LoadingBar label={texts.loading} />
                    </div>
                  )}
                </div>
                {nav.footerShown && (
                  <div inert={nav.blocked} data-blocked={flag(nav.edit !== undefined)}>
                    <Footer
                      texts={texts}
                      total={nav.total}
                      page={nav.shownPage}
                      pageCount={nav.shownPageCount}
                      pageSize={nav.shownPageSize}
                      // The indicators of what is loading: the page's ring after the delay of the loading bar, like it;
                      // the page size's spinner at once (it replaces the chevron as the menu closes, which would else
                      // turn back first).
                      pendingPage={nav.spinnerVisible ? nav.pendingPage : undefined}
                      pendingPageSize={nav.pendingPageSize}
                      pageSizeOptions={nav.pageSizeOptions}
                      onPage={nav.goToPage}
                      onPageSize={nav.changePageSize}
                    />
                  </div>
                )}
              </div>
              {/* The filter drawer (a prototype): in the same cell, over the table area, at its end. */}
              {/* One list, so the closed drawer keeps its instance (its key) while it is covered up. */}
              {drawerFlag && [
                closingSidebarKey !== undefined && filterDrawer(closingSidebarKey, true),
                sidebar.open && filterDrawer(sidebarKey, false),
              ]}
            </div>
          </div>
        </Tooltip.Provider>
      </LayerContext>
      {nav.hasHandleColumn && (
        <div role="status" className={classes.liveRegion}>
          {nav.announcement}
        </div>
      )}
      <div ref={setLayer} className={classes.layer} />
    </div>
  );
}
