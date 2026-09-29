import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { hasContent, isPlainRowClick, isPlainRowDoubleClick, isTextEditingTarget } from '../core/utils';
import type { DataNavigatorComponent as Spec } from '../react/api';
import {
  columnItems,
  contextMenuItems,
  defaultActionOf,
  generalToolbarItems,
  selectionModeOf,
  selectionToolbarItems,
} from './actions';
import { connectController, notifySelection } from './controller';
import type { ControllerTarget } from './controller';
import { sameValue, withoutKey } from './filters';
import { useDelayedFlag, useElementHeight, useScrollbarWidth } from './hooks';
import { createLayout, withoutHidden } from './layout';
import { useTexts } from './texts';

export { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS, useDataNavigator };
export type { RowGroupEntry, SearchBox };

const DEFAULT_PAGE_SIZE = 25;
const DEFAULT_PAGE_SIZE_OPTIONS: readonly number[] = [10, 25, 50, 100];
const SPINNER_DELAY = 200;

const EMPTY_RESULT: Spec.Result<never> = { rows: [], total: 0 };
const EMPTY_KEYS: ReadonlySet<string> = new Set();
const EMPTY_FILTERS: Readonly<Record<string, Spec.FilterValue>> = {};

// The selected rows by their key, with their row objects.
type Selection<Row> = ReadonlyMap<string, Row>;

// A group of rows of the page (`groupBy`): what `renderGroup` gets, and the indexes of its rows on the page.
type RowGroupEntry<Row> = Spec.RowGroup<Row> & { indexes: readonly number[] };

// What the filter popup needs: whether it is open, and the filter to focus when it opens (from a pill).
type FilterPanelState = { open: boolean; focusKey: string | undefined };

// What a search box needs: its text and what to do on typing, Enter and Escape.
type SearchBox = {
  text: string;
  onChange: (text: string) => void;
  onSubmit: () => void;
  onClear: () => void;
};

function withKey(keys: ReadonlySet<string>, key: string, included: boolean): ReadonlySet<string> {
  const next = new Set(keys);

  if (included) {
    next.add(key);
  } else {
    next.delete(key);
  }

  return next;
}

// The selection with these rows added (a row) or removed (undefined).
function withRows<Row>(selection: Selection<Row>, entries: readonly (readonly [string, Row | undefined])[]) {
  const next = new Map(selection);

  for (const [key, row] of entries) {
    if (row === undefined) {
      next.delete(key);
    } else {
      next.set(key, row);
    }
  }

  return next;
}

// The state and behavior of the data navigator, independent of any UI library.
// An implementation renders what this hook returns with the controls of its UI library.
function useDataNavigator<Row>(props: Spec.Props<Row>) {
  const {
    source,
    rowKey,
    columns,
    selectionAppearance = 'accent',
    density = 'normal',
    striped = false,
    renderDetail,
    actions = [],
  } = props;
  // There is no selection prop: the mode follows from the action definitions.
  const selection = selectionModeOf(actions);
  const texts = useTexts();

  // A table whose rows can be moved (`reorder`) has no column sorting: the moved order is the order. Grouped rows
  // (`groupBy`) cannot be moved (a move out of a group would change the row).
  const reorderable = props.reorder !== undefined && props.groupBy === undefined;
  const [sort, setSort] = useState<Spec.Sort | undefined>(reorderable ? undefined : props.defaultSort);
  const searchable = props.searchable === true;
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const idBase = useId();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(props.pageSize ?? DEFAULT_PAGE_SIZE);
  const [result, setResult] = useState<Spec.Result<Row>>(EMPTY_RESULT);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState<Selection<Row>>(() => new Map());
  const [expandedKeys, setExpandedKeys] = useState(EMPTY_KEYS);
  const [filterPanel, setFilterPanel] = useState<FilterPanelState>({ open: false, focusKey: undefined });
  // Counts the reloads of the controller: a new count starts a new load with the same query.
  const [reloads, setReloads] = useState(0);

  const sourceRef = useRef(source);
  const anchorRef = useRef<string | undefined>(undefined);
  const spinnerVisible = useDelayedFlag(loading, SPINNER_DELAY);
  const [headerRef, headerHeight] = useElementHeight<HTMLDivElement>();
  // The loading overlay ends where the scrollbar of the rows area begins.
  const [scrollerRef, scrollbarWidth] = useScrollbarWidth<HTMLDivElement>();

  useEffect(() => {
    sourceRef.current = source;
  });

  useEffect(() => {
    let current = true;
    const controller = new AbortController();

    setLoading(true);

    sourceRef.current({ page, pageSize, sort, search, filters }, controller.signal).then(
      (next) => {
        if (current) {
          setResult(next);
          // A new load brings the order of the source (moved rows included, once saved).
          setMovedRows(undefined);
          setLoaded(true);
          setLoading(false);
        }
      },
      (error: unknown) => {
        if (current) {
          setLoading(false);
          console.error(error);
        }
      },
    );

    // A newer load (or the unmount) aborts this one. Its response, or its rejection, is ignored and not logged.
    return () => {
      current = false;
      controller.abort();
    };
  }, [page, pageSize, sort, search, filters, reloads]);

  const pageCount = Math.max(1, Math.ceil(result.total / pageSize));

  useEffect(() => {
    if (loaded && page > pageCount) {
      setPage(pageCount);
    }
  }, [loaded, page, pageCount]);

  const pageSizeOptions = useMemo(() => {
    const options = props.pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS;

    return [...new Set([...options, pageSize])].sort((a, b) => a - b);
  }, [props.pageSizeOptions, pageSize]);

  // All columns (for the filters and the column toggle menu), and the ones shown. `hidden` counts only on a
  // `hideable` column (it could not be shown again otherwise). The hidden columns are not kept: a remount starts again
  // from `hidden`.
  const allLayout = useMemo(() => createLayout(columns), [columns]);
  const [hiddenKeys, setHiddenKeys] = useState<ReadonlySet<string>>(
    () =>
      new Set(
        allLayout.leaves
          .filter(({ column }) => column.hideable === true && column.hidden === true)
          .map(({ column }) => column.key),
      ),
  );
  const layout = useMemo(() => createLayout(withoutHidden(columns, hiddenKeys)), [columns, hiddenKeys]);
  // The entries of the column toggle menu: the hideable columns. The last shown column cannot be hidden.
  const columnToggles = allLayout.leaves
    .filter(({ column }) => column.hideable === true)
    .map(({ column }) => {
      const shown = !hiddenKeys.has(column.key);

      return { key: column.key, label: column.header, checked: shown, disabled: shown && layout.leaves.length <= 1 };
    });
  const toggleColumn = (key: string, shown: boolean) => setHiddenKeys(withKey(hiddenKeys, key, !shown));
  const keyOf = (row: Row): string => String(row[rowKey]);

  // The rows of the page in the order the user moved them to, until the next load (then the source's order counts
  // again), or undefined.
  const [movedRows, setMovedRows] = useState<readonly Row[] | undefined>(undefined);
  // What a screen reader hears after a move ("Moved to position 3").
  const [announcement, setAnnouncement] = useState('');
  // The saves of the moves, one after the other (a move never overtakes the one before it).
  const savingRef = useRef<Promise<void>>(Promise.resolve());
  const reorderRef = useRef(props.reorder);

  useEffect(() => {
    reorderRef.current = props.reorder;
  });

  const rows = movedRows ?? result.rows;
  // Rows can be moved only without search and filters (within a filtered subset, where a row lands among the hidden
  // ones is unclear), within the page.
  const canReorder = reorderable && search === '' && Object.keys(filters).length === 0 && rows.length > 1;

  // Moves the row at `from` to `to` (indexes of the page): at once on the screen, then `reorder` saves it. If a save
  // fails, the error is logged and the page is loaded again (the source's order is the truth).
  const moveRow = (from: number, to: number) => {
    if (!canReorder || loading || from === to || to < 0 || to >= rows.length) {
      return;
    }

    const next = [...rows];
    const [row] = next.splice(from, 1);

    if (row === undefined) {
      return;
    }

    next.splice(to, 0, row);
    setMovedRows(next);
    setAnnouncement(texts.movedTo({ position: to + 1 }));

    const move = { row, after: next[to - 1], before: next[to + 1] };

    savingRef.current = savingRef.current
      .then(() => reorderRef.current?.(move))
      .catch((error: unknown) => {
        console.error(error);
        setReloads((count) => count + 1);
      });
  };

  // Column sorting is off in a reorderable table: `sortable` is ignored, and said so while developing.
  useEffect(() => {
    if (reorderable && import.meta.env.DEV && createLayout(columns).leaves.some(({ column }) => column.sortable)) {
      console.warn('DataNavigator: `sortable` columns are ignored in a table with `reorder` (its rows are moved).');
    }
  }, [reorderable, columns]);

  useEffect(() => {
    if (props.reorder !== undefined && props.groupBy !== undefined && import.meta.env.DEV) {
      console.warn('DataNavigator: `reorder` is ignored in a table with `groupBy` (grouped rows cannot be moved).');
    }
  }, [props.reorder, props.groupBy]);

  // The selected rows (all of the current page), in the order they were selected. The same array until the selection
  // changes:
  // the selection hook of a controller relies on that.
  const selectedRows = useMemo(() => [...selected.values()], [selected]);
  const pageKeys = rows.map(keyOf);

  // A new load may bring newer objects of selected rows: the selection takes them over.
  useEffect(() => {
    setSelected((current) => {
      const updates = result.rows
        .map((row) => [String(row[rowKey]), row] as const)
        .filter(([key, row]) => current.has(key) && current.get(key) !== row);

      return updates.length === 0 ? current : withRows(current, updates);
    });
  }, [result, rowKey]);
  const details = rows.map((row) => renderDetail?.(row) ?? null);
  // Without any data row, there is no details toggle column and no action column (header cells and dividers included).
  const hasDetails = details.some(hasContent);
  const rowsWithDetails = rows.filter((_, index) => hasContent(details[index]));
  const allDetailsExpanded = rowsWithDetails.length > 0 && rowsWithDetails.every((row) => expandedKeys.has(keyOf(row)));
  const rowActions = columnItems(actions);
  const defaultAction = defaultActionOf(actions);
  const hasActionColumn = rowActions.length > 0 && rows.length > 0;

  const clearSelection = () => {
    anchorRef.current = undefined;
    setSelected(new Map());
  };

  // Other rows (a new page, page size, sorting, search, new filters, a reload): the selection and the details are
  // cleared. So the selection never spans pages.
  const resetView = () => {
    clearSelection();
    setExpandedKeys(EMPTY_KEYS);
  };

  // The controller of the app (optional) reaches the table through a target that always uses the latest state.
  const controller = props.controller;
  const latestRef = useRef<ControllerTarget>({
    reload: () => {},
    clearRowSelection: () => {},
    getSelectedRows: () => selectedRows,
  });

  useEffect(() => {
    latestRef.current = {
      // The current page again, with page size, sort, search and filters kept. Selection and details are cleared,
      // like on every new load. A page that no longer exists goes to the last one (see the page count above).
      reload: () => {
        resetView();
        setReloads((current) => current + 1);
      },
      clearRowSelection: clearSelection,
      getSelectedRows: () => selectedRows,
    };
  });

  useEffect(() => {
    if (controller !== undefined) {
      notifySelection(controller);
    }
  }, [controller, selectedRows]);

  // One controller serves one table: connecting a second mounted table throws (see controller.ts).
  useEffect(() => {
    if (controller === undefined) {
      return;
    }

    return connectController(controller, {
      reload: () => latestRef.current.reload(),
      clearRowSelection: () => latestRef.current.clearRowSelection(),
      getSelectedRows: () => latestRef.current.getSelectedRows(),
    });
  }, [controller]);

  // New filters (all of them at once: "Apply" of the filter popup, a pill's ×, "Clear all") start on the first page and
  // clear the selection. Equal filters do nothing.
  const applyFilters = (next: Readonly<Record<string, Spec.FilterValue>>) => {
    if (sameValue(filters, next)) {
      return;
    }

    resetView();
    setPage(1);
    setFilters(next);
  };

  const removeFilter = (key: string) => applyFilters(withoutKey(filters, key));

  const openFilters = (focusKey?: string) => setFilterPanel({ open: true, focusKey });

  const closeFilters = () => setFilterPanel({ open: false, focusKey: undefined });

  // A new search starts on the first page, like a new sorting.
  const applySearch = (text: string) => {
    const next = text.trim();

    if (next !== search) {
      resetView();
      setPage(1);
      setSearch(next);
    }
  };

  // What is typed is only a draft: it is searched for on Enter (like a text filter). Emptying the box removes the
  // search at once.
  const changeSearchText = (text: string) => {
    setSearchText(text);

    if (text.trim() === '') {
      applySearch('');
    }
  };

  const clearSearch = () => {
    setSearchText('');
    applySearch('');
  };

  const goToPage = (next: number) => {
    if (next !== page) {
      resetView();
      setPage(Math.min(Math.max(next, 1), pageCount));
    }
  };

  const changePageSize = (next: number) => {
    resetView();
    setPageSize(next);
    setPage(1);
  };

  // A new sorting clears the selection (like a new search), and starts on the first page.
  const sortBy = (key: string) => {
    if (reorderable) {
      return;
    }

    resetView();
    setPage(1);
    setSort({ key, direction: sort?.key === key && sort.direction === 'asc' ? 'desc' : 'asc' });
  };

  // Multi mode: toggles the row, or with shift changes the range from the anchor row to this row (like Gmail).
  const selectByClick = (key: string, shift: boolean) => {
    const anchor = anchorRef.current;
    const anchorIndex = anchor === undefined ? -1 : pageKeys.indexOf(anchor);
    const rowOf = (candidate: string) => rows[pageKeys.indexOf(candidate)];

    anchorRef.current = key;

    if (shift && anchor !== undefined && anchor !== key && anchorIndex !== -1) {
      const included = selected.has(anchor);
      const clickedIndex = pageKeys.indexOf(key);
      const range = pageKeys.slice(Math.min(anchorIndex, clickedIndex), Math.max(anchorIndex, clickedIndex) + 1);

      setSelected(
        withRows(selected, range.map((rangeKey) => [rangeKey, included ? rowOf(rangeKey) : undefined] as const)),
      );
    } else {
      setSelected(withRows(selected, [[key, selected.has(key) ? undefined : rowOf(key)]]));
    }
  };

  const selectOnly = (key: string) => {
    const row = rows[pageKeys.indexOf(key)];

    setSelected(row === undefined ? new Map() : new Map([[key, row]]));
  };

  // The select-all checkbox: selects all rows of the page, or none.
  const selectAll = (included: boolean) =>
    setSelected(withRows(selected, rows.map((row) => [keyOf(row), included ? row : undefined] as const)));

  const pageSelectedCount = pageKeys.filter((key) => selected.has(key)).length;

  // Escape clears the selection, but only when nothing else took it: an open menu or select (their popups are in the
  // layer, and their Escape bubbles up to here through the portal) and a text input keep theirs.
  const keyDownRoot = (event: KeyboardEvent<HTMLElement>, layer: HTMLElement | null) => {
    const target = event.target;

    if (
      event.key !== 'Escape' || selected.size === 0 || event.nativeEvent.isComposing || isTextEditingTarget(target)
      || (target instanceof Node && layer?.contains(target) === true)
    ) {
      return;
    }

    clearSelection();
  };

  // A row click works like in a file manager: a plain click selects only this row (the anchor for Shift + click),
  // Ctrl/Cmd + click toggles it. So the first click of a double click already leaves the selection the double click
  // ends with, and nothing has to be put back. The checkbox toggles either way.
  const applyRowClick = (key: string, shift: boolean, toggle: boolean) => {
    if (selection === 'single' || (!shift && !toggle)) {
      anchorRef.current = key;
      selectOnly(key);
    } else {
      selectByClick(key, shift);
    }
  };

  // For the onClick of a data row. Does nothing without a selection mode.
  const clickRow = (event: MouseEvent<HTMLElement>, key: string) => {
    if (selection === 'none' || !isPlainRowClick(event)) {
      return;
    }

    // The second click of a double click changes nothing on its own.
    if (event.detail >= 2) {
      return;
    }

    // The row reacts at once, with no waiting.
    applyRowClick(key, event.shiftKey, event.ctrlKey || event.metaKey);
  };

  // A double click on the free space of a row runs the default action. It changes the selection no further: its first
  // click has already selected only this row (see `applyRowClick`).
  const doubleClickRow = (event: MouseEvent<HTMLElement>, row: Row) => {
    if (defaultAction === undefined || !isPlainRowDoubleClick(event)) {
      return;
    }

    defaultAction.onClick(row);
  };

  // Row groups (`groupBy`): the rows of the page, in their order, in groups of consecutive rows with the same group key
  // (the source sorts by group; unsorted rows give a group more than once). The total of a group comes from the source
  // (`Result.groups`), if it gives one.
  const { groupBy } = props;
  const rowGroups = useMemo((): readonly RowGroupEntry<Row>[] | undefined => {
    if (groupBy === undefined) {
      return undefined;
    }

    const totals = new Map((result.groups ?? []).map(({ key, total }) => [key, total]));
    const groups: { key: string; rows: Row[]; indexes: number[]; total: number | undefined }[] = [];

    rows.forEach((row, index) => {
      const key = typeof groupBy === 'function' ? groupBy(row) : String(row[groupBy]);
      const last = groups[groups.length - 1];

      if (last?.key === key) {
        last.rows.push(row);
        last.indexes.push(index);
      } else {
        groups.push({ key, rows: [row], indexes: [index], total: totals.get(key) });
      }
    });

    return groups;
  }, [groupBy, rows, result.groups]);

  // Collapsed groups, by key: a matter of the view (no new load), kept across loads (a group stays collapsed on the
  // next page).
  const [collapsedGroups, setCollapsedGroups] = useState(EMPTY_KEYS);
  const toggleGroup = (key: string) => setCollapsedGroups(withKey(collapsedGroups, key, !collapsedGroups.has(key)));

  // The checkbox of a group (multi selection): all its rows of the page, or none.
  const selectGroup = (group: RowGroupEntry<Row>, included: boolean) =>
    setSelected(withRows(selected, group.rows.map((row) => [keyOf(row), included ? row : undefined] as const)));
  const groupSelection = (group: RowGroupEntry<Row>): 'all' | 'some' | 'none' => {
    const count = group.rows.filter((row) => selected.has(keyOf(row))).length;

    return count === 0 ? 'none' : count === group.rows.length ? 'all' : 'some';
  };

  const toggleDetails = (key: string) => setExpandedKeys(withKey(expandedKeys, key, !expandedKeys.has(key)));

  const toggleAllDetails = () => setExpandedKeys(allDetailsExpanded ? EMPTY_KEYS : new Set(rowsWithDetails.map(keyOf)));

  // The context menu of a row: the row it was opened on, and the rows its multi-row actions get.
  const [contextRows, setContextRows] = useState<{ row: Row; rows: readonly Row[] }>();
  // With several selected rows (a right-click on one of them), the menu is about all of them: no single-row actions.
  const contextActions = contextMenuItems(
    actions,
    selection,
    contextRows === undefined || contextRows.rows.length <= 1,
  );

  // Called when the context menu is about to open on the row with this key. Like a file manager: a row that is not
  // selected becomes the only selected one; on a selected row the selection stays. False when there is nothing to
  // show (then the browser's own menu opens).
  const prepareContextMenu = (key: string): boolean => {
    const row = rows.find((candidate) => keyOf(candidate) === key);

    if (row === undefined || contextActions.length === 0) {
      return false;
    }

    const inSelection = selected.has(key);

    if (selection !== 'none' && !inSelection) {
      setSelected(new Map([[key, row]]));
    }

    setContextRows({ row, rows: selection !== 'multi' ? [] : inSelection ? selectedRows : [row] });

    return true;
  };

  const invokeFromContextMenu = (action: Spec.Action<Row>) => {
    if (contextRows === undefined) {
      return;
    }

    switch (action.type) {
      case 'general':
        action.onClick();
        break;
      case 'singleRow':
        action.onClick(contextRows.row);
        break;
      case 'multiRow':
        action.onClick(contextRows.rows);
    }
  };

  const invokeFromToolbar = (action: Spec.Action<Row>) => {
    switch (action.type) {
      case 'general':
        action.onClick();
        break;
      case 'multiRow':
        action.onClick(selectedRows);
        break;
      case 'singleRow': {
        const [only] = selectedRows;

        if (only !== undefined) {
          action.onClick(only);
        }
      }
    }
  };

  const invokeForRow = (row: Row, action: Spec.Action<Row>) => {
    if (action.type === 'singleRow') {
      action.onClick(row);
    }
  };

  // Grid: the meta columns (the drag handle, selection, details toggle) come first, then the columns, then the action
  // column. The handle column is there whenever the table is reorderable (also while its handles are hidden), so the
  // columns do not jump.
  const handleColumn = 1;
  const selectionColumn = reorderable ? 2 : 1;
  const detailsColumn = selectionColumn + (selection !== 'none' ? 1 : 0);
  const controlColumns = (reorderable ? 1 : 0) + (selection !== 'none' ? 1 : 0) + (hasDetails ? 1 : 0);
  const firstLeafColumn = controlColumns + 1;
  const lastMetaColumn = hasDetails
    ? 'details'
    : selection !== 'none'
    ? 'selection'
    : reorderable
    ? 'handle'
    : undefined;

  const headerRows = layout.groups.length > 0 ? 2 : 1;

  const gridTemplateColumns = [
    ...(reorderable ? ['max-content'] : []),
    ...(selection !== 'none' ? ['max-content'] : []),
    ...(hasDetails ? ['max-content'] : []),
    ...layout.leaves.map(({ column }) => `minmax(0, ${column.width ?? 1}fr)`),
    ...(hasActionColumn ? ['max-content'] : []),
  ].join(' ');

  return {
    texts,
    emptyText: Object.keys(filters).length > 0 ? texts.emptyFilters : search === '' ? texts.empty : texts.emptySearch,
    filters,
    applyFilters,
    removeFilter,
    clearFilters: () => applyFilters(EMPTY_FILTERS),
    // The columns with a filter, in their order. Only they are in the filter popup.
    filterColumns: useMemo(
      () =>
        // Hidden columns keep their filters (and their pills).
        allLayout.leaves.flatMap(({ column: { key, header, filter } }) =>
          filter === undefined ? [] : [{ key, header, filter }]
        ),
      [allLayout],
    ),
    columnToggles,
    toggleColumn,
    filterPanel,
    openFilters,
    closeFilters,
    headerId: (key: string) => `${idBase}-header-${key.replace(/\W/g, '_')}`,
    isEmpty: loaded && result.rows.length === 0,
    // The Reload button of the toolbar: the same as the controller's reload().
    reload: props.reloadable === true ? () => latestRef.current.reload() : undefined,
    // What the action column shows of an action: its icon (with the label as tooltip), its label, or both.
    rowActionLook: props.rowActionLook ?? 'icon',
    searchBox: searchable
      ? { text: searchText, onChange: changeSearchText, onSubmit: () => applySearch(searchText), onClear: clearSearch }
      : undefined,
    selection,
    selectionAppearance,
    density,
    striped,

    rows,
    total: result.total,
    loading,
    loaded,
    spinnerVisible,
    headerRef,
    headerHeight,
    scrollerRef,
    scrollbarWidth,

    sort,
    sortBy,
    ariaSort: (key: string): 'ascending' | 'descending' | 'none' => {
      if (sort?.key !== key) {
        return 'none';
      }

      return sort.direction === 'asc' ? 'ascending' : 'descending';
    },

    page,
    pageCount,
    pageSize,
    pageSizeOptions,
    goToPage,
    changePageSize,

    layout,
    gridTemplateColumns,
    headerRows,
    // Grid placement for the cells. The values go straight onto `grid-column` and `grid-row`, so the stylesheet needs
    // nothing of them.
    headerRowSpan: `1 / span ${headerRows}`,
    columnSpan: (column: number, span: number) => `${column} / span ${span}`,
    firstLeafColumn,
    handleColumn,
    selectionColumn,
    detailsColumn,
    // Moving rows (`reorder`): whether the table can, whether it can now (no search, no filters), and the move.
    reorderable,
    canReorder,
    moveRow,
    announcement,
    actionColumn: firstLeafColumn + layout.leaves.length,
    dividerAfter: (column: 'handle' | 'selection' | 'details') => (lastMetaColumn === column ? 'end' : undefined),

    keyOf,
    selectedRows,
    isSelected: (key: string) => selected.has(key),
    allSelected: rows.length > 0 && pageSelectedCount === rows.length,
    someSelected: pageSelectedCount > 0 && pageSelectedCount < rows.length,
    clearSelection,
    keyDownRoot,
    selectByClick,
    selectOnly,
    selectAll,
    clickRow,
    doubleClickRow,
    hasDefaultAction: defaultAction !== undefined,

    // Row groups: undefined without `groupBy`.
    rowGroups,
    isGroupCollapsed: (key: string) => collapsedGroups.has(key),
    toggleGroup,
    selectGroup,
    groupSelection,

    details,
    hasDetails,
    allDetailsExpanded,
    isExpanded: (key: string) => expandedKeys.has(key),
    toggleDetails,
    toggleAllDetails,

    generalActions: generalToolbarItems(actions),
    selectionActions: selectionToolbarItems(actions, selectedRows.length),
    // While rows are selected, the selection bar takes the place of the toolbar's bar.
    selectionActive: selection !== 'none' && selectedRows.length > 0,
    rowActions,
    hasActionColumn,
    invokeFromToolbar,
    invokeForRow,
    contextActions,
    prepareContextMenu,
    invokeFromContextMenu,
  };
}
