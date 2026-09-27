import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { hasContent, isPlainRowClick, isPlainRowDoubleClick } from '../core/utils';
import type { DataNavigatorComponent as Spec } from '../react/api';
import { columnItems, contextMenuItems, defaultActionOf, selectionModeOf, toolbarItems } from './actions';
import { connectController, notifySelection } from './controller';
import type { ControllerTarget } from './controller';
import { sameValue } from './filters';
import { useDelayedFlag, useElementHeight } from './hooks';
import { createLayout } from './layout';
import { useTexts } from './texts';

export { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS, useDataNavigator };
export type { SearchBox };

const DEFAULT_PAGE_SIZE = 25;
const DEFAULT_PAGE_SIZE_OPTIONS: readonly number[] = [10, 25, 50, 100];
const SPINNER_DELAY = 200;

const EMPTY_RESULT: Spec.Result<never> = { rows: [], total: 0 };
const EMPTY_KEYS: ReadonlySet<string> = new Set();
const EMPTY_FILTERS: Readonly<Record<string, Spec.FilterValue>> = {};

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

// The state and behavior of the data navigator, independent of any UI library.
// An implementation renders what this hook returns with the controls of its UI library.
function useDataNavigator<Row>(props: Spec.Props<Row>) {
  const {
    source,
    rowKey,
    columns,
    selectionAppearance = 'neutral',
    density = 'normal',
    striped = false,
    renderDetail,
    actions = [],
  } = props;
  // There is no selection prop: the mode follows from the action definitions.
  const selection = selectionModeOf(actions);
  const texts = useTexts();

  const [sort, setSort] = useState<Spec.Sort | undefined>(props.defaultSort);
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
  const [selectedKeys, setSelectedKeys] = useState(EMPTY_KEYS);
  const [expandedKeys, setExpandedKeys] = useState(EMPTY_KEYS);
  // Counts the reloads of the controller: a new count starts a new load with the same query.
  const [reloads, setReloads] = useState(0);

  const sourceRef = useRef(source);
  const anchorRef = useRef<string | undefined>(undefined);
  // What the selection was before the last row click, so the second mouse down of a double click can put it back.
  const beforeClickRef = useRef<ReadonlySet<string> | undefined>(undefined);
  const spinnerVisible = useDelayedFlag(loading, SPINNER_DELAY);
  const [headerRef, headerHeight] = useElementHeight<HTMLDivElement>();

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

  const layout = useMemo(() => createLayout(columns), [columns]);
  const keyOf = (row: Row): string => String(row[rowKey]);

  const rows = result.rows;
  // The same array until the rows or the selection change: the selection hook of a controller relies on that.
  const selectedRows = useMemo(
    () => rows.filter((row) => selectedKeys.has(String(row[rowKey]))),
    [rows, selectedKeys, rowKey],
  );
  const details = rows.map((row) => renderDetail?.(row) ?? null);
  // Without any data row, there is no details toggle column and no action column (header cells and dividers included).
  const hasDetails = details.some(hasContent);
  const rowsWithDetails = rows.filter((_, index) => hasContent(details[index]));
  const allDetailsExpanded = rowsWithDetails.length > 0 && rowsWithDetails.every((row) => expandedKeys.has(keyOf(row)));
  const rowActions = columnItems(actions);
  const defaultAction = defaultActionOf(actions);
  const hasActionColumn = rowActions.length > 0 && rows.length > 0;

  const resetView = () => {
    anchorRef.current = undefined;
    setSelectedKeys(EMPTY_KEYS);
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
      clearRowSelection: () => {
        anchorRef.current = undefined;
        setSelectedKeys(EMPTY_KEYS);
      },
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

  // A new filter value starts on the first page, like a new sorting. An equal value does nothing. `undefined` removes
  // the filter of the column.
  const setFilter = (key: string, value: Spec.FilterValue | undefined) => {
    if (sameValue(filters[key], value)) {
      return;
    }

    resetView();
    setPage(1);
    setFilters((current) =>
      value === undefined
        ? Object.fromEntries(Object.entries(current).filter(([name]) => name !== key))
        : { ...current, [key]: value }
    );
  };

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

  const sortBy = (key: string) => {
    resetView();
    setPage(1);
    setSort({ key, direction: sort?.key === key && sort.direction === 'asc' ? 'desc' : 'asc' });
  };

  // Multi mode: toggles the row, or with shift changes the range from the anchor row to this row (like Gmail).
  const selectByClick = (key: string, shift: boolean) => {
    const anchor = anchorRef.current;
    const keys = rows.map(keyOf);
    const anchorIndex = anchor === undefined ? -1 : keys.indexOf(anchor);

    anchorRef.current = key;

    if (shift && anchor !== undefined && anchor !== key && anchorIndex !== -1) {
      const included = selectedKeys.has(anchor);
      const clickedIndex = keys.indexOf(key);
      const range = keys.slice(Math.min(anchorIndex, clickedIndex), Math.max(anchorIndex, clickedIndex) + 1);
      const next = new Set(selectedKeys);

      for (const rangeKey of range) {
        if (included) {
          next.add(rangeKey);
        } else {
          next.delete(rangeKey);
        }
      }

      setSelectedKeys(next);
    } else {
      setSelectedKeys(withKey(selectedKeys, key, !selectedKeys.has(key)));
    }
  };

  const selectOnly = (key: string) => setSelectedKeys(new Set([key]));

  const selectAll = (selected: boolean) => setSelectedKeys(selected ? new Set(rows.map(keyOf)) : EMPTY_KEYS);

  const applyRowClick = (key: string, shift: boolean) => {
    if (selection === 'single') {
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

    // The row reacts at once, with no waiting: if a second click follows, the browser marks its mouse down as one of
    // a double click, and `cancelRowClick` puts this back before the double click is even reported.
    beforeClickRef.current = selectedKeys;
    applyRowClick(key, event.shiftKey);
  };

  // The second mouse down of a double click. The browser has already decided that it is one, so the selection the
  // first click made goes back right away, and no threshold has to be guessed anywhere.
  const cancelRowClick = () => {
    const before = beforeClickRef.current;

    beforeClickRef.current = undefined;

    if (before !== undefined) {
      setSelectedKeys(before);
    }
  };

  // A double click on the free space of a row runs the default action. It never changes the selection: the first
  // click's change was already put back by `cancelRowClick` on the mouse down that started this double click.
  const doubleClickRow = (event: MouseEvent<HTMLElement>, row: Row) => {
    if (defaultAction === undefined || !isPlainRowDoubleClick(event)) {
      return;
    }

    defaultAction.onClick(row);
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

    const inSelection = selectedKeys.has(key);

    if (selection !== 'none' && !inSelection) {
      setSelectedKeys(new Set([key]));
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
      case 'row':
        action.onClick(contextRows.row);
        break;
      case 'rows':
        action.onClick(contextRows.rows);
    }
  };

  const invokeFromToolbar = (action: Spec.Action<Row>) => {
    switch (action.type) {
      case 'general':
        action.onClick();
        break;
      case 'rows':
        action.onClick(selectedRows);
        break;
      case 'row': {
        const [only] = selectedRows;

        if (only !== undefined) {
          action.onClick(only);
        }
      }
    }
  };

  const invokeForRow = (row: Row, action: Spec.Action<Row>) => {
    if (action.type === 'row') {
      action.onClick(row);
    }
  };

  // Grid: the meta columns (selection, details toggle) come first, then the columns, then the action column.
  const controlColumns = (selection !== 'none' ? 1 : 0) + (hasDetails ? 1 : 0);
  const firstLeafColumn = controlColumns + 1;
  const lastMetaColumn = hasDetails ? 'details' : selection !== 'none' ? 'selection' : undefined;

  const headerRows = layout.groups.length > 0 ? 2 : 1;

  const gridTemplateColumns = [
    ...(selection !== 'none' ? ['max-content'] : []),
    ...(hasDetails ? ['max-content'] : []),
    ...layout.leaves.map(({ column }) => `minmax(0, ${column.width ?? 1}fr)`),
    ...(hasActionColumn ? ['max-content'] : []),
  ].join(' ');

  return {
    texts,
    emptyText: search === '' && Object.keys(filters).length === 0 ? texts.empty : texts.emptySearch,
    filters,
    setFilter,
    hasFilters: layout.leaves.some(({ column }) => column.filter !== undefined),
    headerId: (key: string) => `${idBase}-header-${key.replace(/\W/g, '_')}`,
    isEmpty: loaded && result.rows.length === 0,
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
    filterRow: headerRows + 1,
    columnSpan: (column: number, span: number) => `${column} / span ${span}`,
    firstLeafColumn,
    actionColumn: firstLeafColumn + layout.leaves.length,
    dividerAfter: (column: 'selection' | 'details') => (lastMetaColumn === column ? 'end' : undefined),

    keyOf,
    selectedRows,
    isSelected: (key: string) => selectedKeys.has(key),
    allSelected: rows.length > 0 && selectedRows.length === rows.length,
    someSelected: selectedRows.length > 0 && selectedRows.length < rows.length,
    selectByClick,
    selectOnly,
    selectAll,
    clickRow,
    cancelRowClick,
    doubleClickRow,
    hasDefaultAction: defaultAction !== undefined,

    details,
    hasDetails,
    allDetailsExpanded,
    isExpanded: (key: string) => expandedKeys.has(key),
    toggleDetails,
    toggleAllDetails,

    toolbarActions: toolbarItems(actions, selectedRows.length),
    rowActions,
    hasActionColumn,
    invokeFromToolbar,
    invokeForRow,
    contextActions,
    prepareContextMenu,
    invokeFromContextMenu,
  };
}
