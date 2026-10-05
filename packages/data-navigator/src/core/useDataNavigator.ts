import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import {
  hasContent,
  isPlainRowClick,
  isPlainRowDoubleClick,
  isTextEditingTarget,
  MAX_OPTIMAL_COLUMN_WIDTH,
  MIN_COLUMN_WIDTH,
} from '../core/utils';
import type { DataNavigatorComponent as Spec } from '../react/api';
import {
  columnItems,
  contextMenuItems,
  defaultActionOf,
  generalToolbarItems,
  groupContextMenuItems,
  groupItems,
  selectionModeOf,
  selectionToolbarItems,
} from './actions';
import { connectController, notifySelection } from './controller';
import type { ControllerTarget } from './controller';
import { sameValue, withoutKey } from './filters';
import { flatRows, groupKeyOf, linesOf, moveInSegments, segmentsOf } from './grouping';
import type { Line, Segment } from './grouping';
import { useDelayedFlag, useElementHeight, useScrollbarWidth } from './hooks';
import { createLayout, withoutHidden } from './layout';
import { useTexts } from './texts';

export { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS, useDataNavigator };
export type { ContextTarget, RowGroupEntry, SearchBox };

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

// What a context menu is opened on: a data row (or its detail row), or a group header, by its key.
type ContextTarget = { type: 'row' | 'group'; key: string };

// The row in edit mode (the controller's `editRow`, saved with `saveRow`), or a new row (`addRow`, saved with
// `createRow`, `isNew`): its row object (the template of a new one) and its draft, whether the draft is being saved,
// and the message of a failed save. `id` tells one edit from the next. A new row has a key of its own until it is
// saved.
type RowEdit<Row> = {
  id: number;
  key: string;
  isNew: boolean;
  row: Row;
  draft: Row;
  saving: boolean;
  error: string | undefined;
};

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

  // A table whose rows can be moved (`reorder`) has no column sorting: the moved order is the order. With `groupBy`,
  // a row may be moved into another group (or out of every group).
  const reorderable = props.reorder !== undefined;
  const [sort, setSort] = useState<Spec.Sort | undefined>(reorderable ? undefined : props.defaultSort);
  const searchable = props.searchable === true;
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const idBase = useId();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(props.pageSize ?? DEFAULT_PAGE_SIZE);
  const [result, setResult] = useState<Spec.Result<Row>>(EMPTY_RESULT);
  // The page and the page size of the rows shown (of the last finished load): the footer shows them, not the requested
  // ones, so it changes together with the rows (2026-10-05).
  const [shown, setShown] = useState(() => ({ page: 1, pageSize: props.pageSize ?? DEFAULT_PAGE_SIZE }));
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
  const [headerRef, headerHeight, headerElement] = useElementHeight<HTMLDivElement>();
  // The loading overlay ends where the scrollbar of the rows area begins.
  const [scrollerRef, scrollbarWidth, scroller] = useScrollbarWidth<HTMLDivElement>();

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
          setShown({ page, pageSize });
          // A new load brings the order of the source (moved rows included, once saved).
          setMoved(undefined);
          // And other rows: a row in edit mode leaves it, its draft is dropped.
          setEdit(undefined);
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
  const shownPageCount = Math.max(1, Math.ceil(result.total / shown.pageSize));

  useEffect(() => {
    if (loaded && page > pageCount) {
      setPage(pageCount);
    }
  }, [loaded, page, pageCount]);

  const footerMode = props.footer ?? 'always';
  const pageSizeOptions = useMemo(() => {
    const options = props.pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS;

    return [...new Set([...options, pageSize])].sort((a, b) => a - b);
  }, [props.pageSizeOptions, pageSize]);

  // All columns (for the filters and the column toggle menu), and the ones shown. `hidden` counts only on a
  // `hideable` column (it could not be shown again otherwise). The hidden columns are not kept: a remount starts again
  // from `hidden`.
  const allLayout = useMemo(() => createLayout(columns), [columns]);
  // The widths set by the user (by column key), not kept after a remount, like the hidden columns. A dragged column is
  // fixed; an optimized one (`grow`) is at least as wide as its content and shares the free width with the other
  // optimized ones, in proportion to its width, so the table keeps filling its view.
  const [columnWidths, setColumnWidths] = useState<Readonly<Record<string, { px: number; grow: boolean }>>>({});
  const resizeColumn = (key: string, width: number | undefined) =>
    setColumnWidths(({ [key]: _old, ...rest }) =>
      width === undefined ? rest : { ...rest, [key]: { px: width, grow: false } }
    );
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

  // The fields of the edit form: the columns with an editor (also the hidden ones, in their order), then the extra
  // fields (`editFields`, values that are no column).
  const { editFields } = props;
  const formFields = useMemo(
    (): readonly Spec.EditField<Row>[] => [
      ...allLayout.leaves.flatMap(({ column: { key, header, edit } }) =>
        edit === undefined ? [] : [{ key, label: header, edit }]
      ),
      ...(editFields ?? []),
    ],
    [allLayout, editFields],
  );
  // Editing a row needs `saveRow`, a new row `createRow`, and both at least one field. One row at a time; meanwhile
  // the rest of the table is blocked.
  const editable = props.saveRow !== undefined && formFields.length > 0;
  const creatable = props.createRow !== undefined && formFields.length > 0;
  const [edit, setEdit] = useState<RowEdit<Row> | undefined>(undefined);
  const editIdRef = useRef(0);
  // The id of the edit that is shown (a save that ends after its edit was dropped changes nothing).
  const shownEditRef = useRef<number | undefined>(undefined);
  const saveRowRef = useRef(props.saveRow);
  const createRowRef = useRef(props.createRow);

  useEffect(() => {
    shownEditRef.current = edit?.id;
    saveRowRef.current = props.saveRow;
    createRowRef.current = props.createRow;
  });

  // The runs of the page (see grouping.ts) as the user moved its rows, with the changes of the groups' totals, until the
  // next load (then the source's order counts again), or undefined.
  const [moved, setMoved] = useState<
    { segments: readonly Segment<Row>[]; deltas: ReadonlyMap<string, number> } | undefined
  >(undefined);
  // What a screen reader hears after a move ("Moved to position 3").
  const [announcement, setAnnouncement] = useState('');
  // The saves of the moves, one after the other (a move never overtakes the one before it).
  const savingRef = useRef<Promise<void>>(Promise.resolve());
  const reorderRef = useRef(props.reorder);

  useEffect(() => {
    reorderRef.current = props.reorder;
  });

  // The runs of the page: without `groupBy` one run of all rows, with it the groups (also the empty ones of the source).
  const { groupBy } = props;
  const loadedSegments = useMemo(
    () =>
      segmentsOf(
        result.rows,
        groupBy === undefined ? undefined : (row: Row) => groupKeyOf(row, groupBy),
        result.groups,
      ),
    [result, groupBy],
  );
  const segments = moved?.segments ?? loadedSegments;
  const rows = useMemo(() => flatRows(segments), [segments]);

  // Column sorting is off in a reorderable table: `sortable` is ignored, and said so while developing.
  useEffect(() => {
    if (reorderable && import.meta.env.DEV && createLayout(columns).leaves.some(({ column }) => column.sortable)) {
      console.warn('DataNavigator: `sortable` columns are ignored in a table with `reorder` (its rows are moved).');
    }
  }, [reorderable, columns]);

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
  // The actions at the end of every group header (only with `groupBy`), in the action column too.
  const groupActions = groupBy === undefined ? [] : groupItems(actions);
  const hasActionColumn = (rowActions.length > 0 && rows.length > 0)
    || (groupActions.length > 0 && segments.some((segment) => segment.key !== undefined));

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
    editRow: () => {},
    addRow: () => {},
  });

  // A layout effect: a call right after a render (e.g. `editRow` from a click on a row that just came) already gets the
  // state of that render, not the one before.
  useLayoutEffect(() => {
    latestRef.current = {
      // The row is found on the page by its key (a row that is not shown cannot be edited).
      editRow: (row) => editRow(row as Row),
      // The template of a new row is a row of the app's row type.
      addRow: (template) => addRow(template as Row),
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
      editRow: (row) => latestRef.current.editRow(row),
      addRow: (template) => latestRef.current.addRow(template),
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

  // The same size changes nothing (it would clear the selection and go back to page 1).
  const changePageSize = (next: number) => {
    if (next === pageSize) {
      return;
    }

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

  // Row groups (`groupBy`): the runs of the page with a group, each with the indexes of its rows on the page. The total
  // of a group comes from the source (`Result.groups`), if it gives one, changed by the moves since the load.
  const rowGroups = useMemo((): readonly RowGroupEntry<Row>[] | undefined => {
    if (groupBy === undefined) {
      return undefined;
    }

    const totals = new Map((result.groups ?? []).map(({ key, total }) => [key, total]));
    const groups: RowGroupEntry<Row>[] = [];
    let index = 0;

    for (const segment of segments) {
      const indexes = segment.rows.map(() => index++);
      const total = segment.key === undefined ? undefined : totals.get(segment.key);

      if (segment.key !== undefined) {
        groups.push({
          key: segment.key,
          rows: segment.rows,
          indexes,
          total: total === undefined ? undefined : total + (moved?.deltas.get(segment.key) ?? 0),
        });
      }
    }

    return groups;
  }, [groupBy, segments, result.groups, moved]);

  // Collapsed groups, by key: a matter of the view (no new load), kept across loads (a group stays collapsed on the
  // next page).
  const [collapsedGroups, setCollapsedGroups] = useState(EMPTY_KEYS);
  const toggleGroup = (key: string) => setCollapsedGroups(withKey(collapsedGroups, key, !collapsedGroups.has(key)));
  const isGroupCollapsed = (key: string) => collapsedGroups.has(key);

  // The lines of the rows area, in the order shown: group headers and data rows (see grouping.ts), each with its group
  // (the entry of `rowGroups`, undefined for a row without a group).
  const lines = useMemo((): readonly (Line & { group: RowGroupEntry<Row> | undefined })[] => {
    const groupOfSegment = new Map<Segment<Row>, RowGroupEntry<Row>>();
    let group = 0;

    for (const segment of segments) {
      const entry = segment.key === undefined ? undefined : rowGroups?.[group++];

      if (entry !== undefined) {
        groupOfSegment.set(segment, entry);
      }
    }

    return linesOf(segments, (key) => collapsedGroups.has(key)).map((line) => {
      const segment = segments[line.segment];

      return { ...line, group: segment === undefined ? undefined : groupOfSegment.get(segment) };
    });
  }, [segments, rowGroups, collapsedGroups]);

  // Rows can be moved only without search and filters (within a filtered subset, where a row lands among the hidden
  // ones is unclear), within the page.
  // A single row can still move into another group (e.g. an empty one).
  const canReorder = reorderable && search === '' && Object.keys(filters).length === 0 && edit === undefined
    && (rows.length > 1 || (rows.length === 1 && segments.length > 1));

  // The move of the row of the line `from` into the slot `slot` of the other lines (see `moveInSegments`), or
  // undefined when nothing would change.
  const planMove = (from: number, slot: number) => {
    const line = lines[from];

    return line?.type === 'row' ? moveInSegments(segments, line.index, slot, isGroupCollapsed) : undefined;
  };

  // Moves a row (the line `from`) into the slot `slot` of the other lines (with groups, also into another group): at
  // once on the screen, then `reorder` saves it. If a save fails, the error is logged and the page is loaded again (the
  // source's order is the truth).
  const moveLine = (from: number, slot: number) => {
    const plan = canReorder && !loading ? planMove(from, slot) : undefined;

    if (plan === undefined) {
      return;
    }

    const next = flatRows(plan.segments);
    const origin = groupBy === undefined ? undefined : segments.find((segment) => segment.rows.includes(plan.row))?.key;
    const deltas = new Map(moved?.deltas);

    if (origin !== plan.group) {
      if (origin !== undefined) {
        deltas.set(origin, (deltas.get(origin) ?? 0) - 1);
      }

      if (plan.group !== undefined) {
        deltas.set(plan.group, (deltas.get(plan.group) ?? 0) + 1);
      }
    }

    setMoved({ segments: plan.segments, deltas });

    // The group a row leaves empty collapses (nothing left to show), and a collapsed empty group the row lands in
    // expands (the row is its only content). A group that has rows keeps its state, also a collapsed one the row lands
    // in: opening a long list would push everything down; its count changes.
    const rowsIn = (key: string) =>
      segments.filter((segment) => segment.key === key).reduce((sum, segment) => sum + segment.rows.length, 0);

    if (origin !== plan.group) {
      const collapse = origin !== undefined && rowsIn(origin) === 1 ? origin : undefined;
      const expand = plan.group !== undefined && rowsIn(plan.group) === 0 ? plan.group : undefined;

      if (collapse !== undefined || expand !== undefined) {
        setCollapsedGroups((current) => {
          const collapsed = collapse === undefined ? current : withKey(current, collapse, true);

          return expand === undefined ? collapsed : withKey(collapsed, expand, false);
        });
      }
    }
    setAnnouncement(texts.movedTo({ position: plan.index + 1 }));

    // The neighbors on the page (in the order of the source, rows of collapsed groups included).
    const move = { row: plan.row, group: plan.group, after: next[plan.index - 1], before: next[plan.index + 1] };

    savingRef.current = savingRef.current
      .then(() => reorderRef.current?.(move))
      .catch((error: unknown) => {
        console.error(error);
        setReloads((count) => count + 1);
      });
  };

  // The checkbox of a group (multi selection): all its rows of the page, or none.
  const selectGroup = (group: RowGroupEntry<Row>, included: boolean) =>
    setSelected(withRows(selected, group.rows.map((row) => [keyOf(row), included ? row : undefined] as const)));
  const groupSelection = (group: RowGroupEntry<Row>): 'all' | 'some' | 'none' => {
    const count = group.rows.filter((row) => selected.has(keyOf(row))).length;

    return count === 0 ? 'none' : count === group.rows.length ? 'all' : 'some';
  };

  const toggleDetails = (key: string) => setExpandedKeys(withKey(expandedKeys, key, !expandedKeys.has(key)));

  const toggleAllDetails = () => setExpandedKeys(allDetailsExpanded ? EMPTY_KEYS : new Set(rowsWithDetails.map(keyOf)));

  // The context menu of a row: the row it was opened on, and the rows its multi-row actions get. Of a group header: its
  // group (then no row).
  const [contextRows, setContextRows] = useState<{ row: Row; rows: readonly Row[] }>();
  const [contextGroup, setContextGroup] = useState<RowGroupEntry<Row>>();
  const groupOf = (key: string) => rowGroups?.find((group) => group.key === key);
  // With several selected rows (a right-click on one of them), the menu is about all of them: no single-row actions.
  const contextActions = contextGroup !== undefined
    ? groupContextMenuItems(actions)
    : contextMenuItems(actions, selection, contextRows === undefined || contextRows.rows.length <= 1);

  // Whether a context menu can open on this target (else the browser's own menu opens).
  const hasContextMenu = (target: ContextTarget): boolean =>
    target.type === 'group'
      ? groupOf(target.key) !== undefined && groupContextMenuItems(actions).length > 0
      : target.key !== edit?.key && contextMenuItems(actions, selection, true).length > 0;

  // Called when the context menu is about to open on a row or a group header. On a row, like a file manager: a row that
  // is not selected becomes the only selected one; on a selected row the selection stays. False when there is nothing
  // to show.
  const prepareContextMenu = (target: ContextTarget): boolean => {
    if (target.type === 'group') {
      const group = groupOf(target.key);

      setContextRows(undefined);
      setContextGroup(group);

      return group !== undefined;
    }

    const { key } = target;
    const row = rows.find((candidate) => keyOf(candidate) === key);

    setContextGroup(undefined);

    if (row === undefined || !hasContextMenu(target)) {
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
    if (action.type === 'group') {
      if (contextGroup !== undefined) {
        action.onClick(contextGroup);
      }

      return;
    }

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

  const invokeForGroup = (group: RowGroupEntry<Row>, action: Spec.Action<Row>) => {
    if (action.type === 'group') {
      action.onClick(group);
    }
  };

  // Opens the edit form. Not while loading, while the filter view is shown, or while another row is edited.
  const canStartEdit = !loading && !filterPanel.open && edit === undefined;

  // Puts a row of the page into edit mode: its draft starts as the row.
  const editRow = (row: Row) => {
    const key = keyOf(row);
    const shown = rows.find((candidate) => keyOf(candidate) === key);

    if (!editable || !canStartEdit || shown === undefined) {
      return;
    }

    editIdRef.current += 1;
    setEdit({ id: editIdRef.current, key, isNew: false, row: shown, draft: shown, saving: false, error: undefined });
  };

  // A new row at the top of the page, with its form open: its draft starts as the template.
  const addRow = (template: Row) => {
    if (!creatable || !canStartEdit) {
      return;
    }

    editIdRef.current += 1;

    const id = editIdRef.current;

    setEdit({ id, key: `new-row-${id}`, isNew: true, row: template, draft: template, saving: false, error: undefined });
  };

  // An editor changes the draft (not while it is saved). A change takes the message of a failed save away.
  const changeDraft = (patch: Partial<Row>) =>
    setEdit((current) =>
      current === undefined || current.saving
        ? current
        : { ...current, draft: { ...current.draft, ...patch }, error: undefined }
    );

  const cancelEdit = () => setEdit((current) => (current?.saving === true ? current : undefined));

  // The saved row (what `saveRow` returns, else the draft) takes the place of the row on the page, without a new load.
  const replaceRow = (key: string, next: Row) => {
    const swap = (list: readonly Row[]) => list.map((candidate) => (keyOf(candidate) === key ? next : candidate));

    setResult((current) => ({ ...current, rows: swap(current.rows) }));
    setMoved((current) =>
      current === undefined
        ? current
        : { ...current, segments: current.segments.map((segment) => ({ ...segment, rows: swap(segment.rows) })) }
    );
  };

  // A created row comes first on the page (and counts), until the next load puts it where the source has it.
  const insertRow = (created: Row) => {
    setResult((current) => ({ ...current, rows: [created, ...current.rows], total: current.total + 1 }));
    setMoved((current) => {
      const [first, ...others] = current?.segments ?? [];

      return current === undefined || first === undefined
        ? current
        : { ...current, segments: [{ ...first, rows: [created, ...first.rows] }, ...others] };
    });
  };

  // Saves the draft ("Save", Enter): `saveRow` gets the row and the draft; for a new row, `createRow` the draft. Without
  // a change, an edited row just leaves edit mode (a new one is always created). A rejection keeps the form open, with
  // the message of the error (an `Error`'s message, else `Texts.saveFailed`).
  const saveEdit = () => {
    const current = edit;

    if (current === undefined || current.saving) {
      return;
    }

    const save = saveRowRef.current;
    const create = createRowRef.current;
    const draftKeys = Object.keys(current.draft as object) as (keyof Row)[];
    const unchanged = draftKeys.every((key) => Object.is(current.draft[key], current.row[key]));

    if (current.isNew ? create === undefined : save === undefined || unchanged) {
      setEdit(undefined);

      return;
    }

    const { id } = current;

    setEdit({ ...current, saving: true, error: undefined });

    Promise.resolve()
      .then(() => (current.isNew ? create?.(current.draft) : save?.(current.row, current.draft)))
      .then(
        (saved) => {
          if (shownEditRef.current !== id) {
            return;
          }

          if (current.isNew) {
            insertRow(saved ?? current.draft);
          } else {
            replaceRow(current.key, saved ?? current.draft);
          }

          setEdit(undefined);
        },
        (error: unknown) => {
          const message = error instanceof Error && error.message !== '' ? error.message : texts.saveFailed;

          setEdit((shown) => (shown?.id === id ? { ...shown, saving: false, error: message } : shown));
        },
      );
  };

  // The keys of the edit form: Enter in a text input saves, Escape cancels. Not in a popup of an editor (a select's
  // list is in the layer, and its keys bubble up to here through the portal: they belong to it).
  // `cancel`: what Escape does (the view folds the form up first, then cancels).
  // A native event (see EditForm.tsx: a native listener on the form, so a dialog around the table sees it handled).
  const keyDownEdit = (event: globalThis.KeyboardEvent, layer: HTMLElement | null, cancel = cancelEdit) => {
    const target = event.target;

    if (
      edit === undefined || event.isComposing
      || (target instanceof Node && layer?.contains(target) === true)
    ) {
      return;
    }

    if (event.key === 'Escape') {
      // It belongs to the form: the selection stays (the root would clear it), and a dialog around the table (e.g. a
      // drawer) stays open.
      event.preventDefault();
      event.stopPropagation();
      cancel();
    } else if (
      event.key === 'Enter' && target instanceof HTMLInputElement
      && !['checkbox', 'radio', 'button', 'submit', 'reset'].includes(target.type)
    ) {
      event.preventDefault();
      saveEdit();
    }
  };

  // Grid: the meta columns (the drag handle, selection, details toggle) come first, then the columns, then the action
  // column. The handle column is there whenever the table is reorderable (also while its handles are hidden), so the
  // columns do not jump.
  const hasHandleColumn = reorderable;
  const handleColumn = 1;
  const selectionColumn = hasHandleColumn ? 2 : 1;
  const detailsColumn = selectionColumn + (selection !== 'none' ? 1 : 0);
  const controlColumns = (hasHandleColumn ? 1 : 0) + (selection !== 'none' ? 1 : 0) + (hasDetails ? 1 : 0);
  const firstLeafColumn = controlColumns + 1;
  const firstMetaColumn = hasHandleColumn
    ? 'handle'
    : selection !== 'none'
    ? 'selection'
    : hasDetails
    ? 'details'
    : undefined;
  const lastMetaColumn = hasDetails
    ? 'details'
    : selection !== 'none'
    ? 'selection'
    : hasHandleColumn
    ? 'handle'
    : undefined;

  const headerRows = layout.groups.length > 0 ? 2 : 1;

  // The tracks: the control columns, the data columns, the action column.
  const leafTrackStart = (hasHandleColumn ? 1 : 0) + (selection !== 'none' ? 1 : 0) + (hasDetails ? 1 : 0);
  const gridTracks = [
    ...(hasHandleColumn ? ['max-content'] : []),
    ...(selection !== 'none' ? ['max-content'] : []),
    ...(hasDetails ? ['max-content'] : []),
    // A number is a share of the free width (`fr`), a string a CSS length of its own (a fixed track, e.g. `3rem`); a
    // column the user resized has its width in pixels (see `columnWidths`).
    ...layout.leaves.map(({ column }) => {
      const set = columnWidths[column.key];

      return set !== undefined
        ? set.grow ? `minmax(${set.px}px, ${set.px}fr)` : `${set.px}px`
        : typeof column.width === 'string'
        ? column.width
        : `minmax(0, ${column.width ?? 1}fr)`;
    }),
    ...(hasActionColumn ? ['max-content'] : []),
  ];
  const gridTemplateColumns = gridTracks.join(' ');
  const headerId = (key: string) => `${idBase}-header-${key.replace(/\W/g, '_')}`;

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
    headerId,
    // Empty groups of the source are shown too: only a page without any line is empty.
    isEmpty: loaded && lines.length === 0 && edit?.isNew !== true,
    // The footer (`footer`): always with rows; `auto` only when there is something to page or to choose (more than one
    // page, or more rows than the smallest page size); `never` not. From the last load, so a new load does not flicker.
    footerShown: rows.length > 0 && (footerMode === 'always'
      || (footerMode === 'auto' && (shownPageCount > 1 || result.total > Math.min(...pageSizeOptions)))),
    // What the footer shows: the page, the page size and the number of pages of the rows shown (the last finished
    // load); and what is being loaded instead (a page clicked, a page size chosen), for its indicators.
    shownPage: shown.page,
    shownPageSize: shown.pageSize,
    shownPageCount,
    pendingPage: loading && page !== shown.page && pageSize === shown.pageSize ? page : undefined,
    pendingPageSize: loading && pageSize !== shown.pageSize ? pageSize : undefined,
    // The Reload button of the toolbar: the same as the controller's reload().
    reload: props.reloadable === true ? () => latestRef.current.reload() : undefined,
    // A checkbox in every group header that selects the group's rows (opt-in, like in other grids): only with multi
    // selection.
    selectableGroups: props.selectableGroups === true && selection === 'multi',
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
    headerElement,
    headerHeight,
    scrollerRef,
    scroller,
    scrollbarWidth,

    sort,
    sortBy,
    resizeColumn,
    // Fixes the columns that have no width of their own yet at what they are now (pixels), when a drag starts: the
    // others are `fr` tracks, which would share out the free width again with every step and change with the dragged
    // column. So only the dragged column changes (the table may become wider than its view).
    freezeColumns: () => {
      const table = scroller?.querySelector<HTMLElement>('[role="table"]');

      if (table === null || table === undefined) {
        return;
      }

      const widths: Record<string, { px: number; grow: boolean }> = {};

      for (const { column } of layout.leaves) {
        const header = table.querySelector<HTMLElement>(`[id="${headerId(column.key)}"]`);

        if (header !== null && columnWidths[column.key] === undefined) {
          widths[column.key] = { px: Math.round(header.getBoundingClientRect().width), grow: false };
        }
      }

      setColumnWidths((current) => ({ ...widths, ...current }));
    },
    resetColumnWidths: () => setColumnWidths({}),
    hasResizedColumns: Object.keys(columnWidths).length > 0,
    // Sets every resizable column to the width its content needs now: the table is laid out once with `max-content`
    // tracks (the rows of the page, the headers), the header cells' widths are read, and the table goes back before
    // anything is painted. Capped (a column with long texts would take the whole table), and not narrower than a
    // column can be made by hand. The columns then grow to fill the view (see `columnWidths`).
    optimizeColumnWidths: () => {
      const table = scroller?.querySelector<HTMLElement>('[role="table"]');

      if (table === null || table === undefined) {
        return;
      }

      const saved = table.style.gridTemplateColumns;

      table.style.gridTemplateColumns = gridTracks.map((track, index) =>
        index >= leafTrackStart && index < leafTrackStart + layout.leaves.length ? 'max-content' : track
      ).join(' ');

      const widths: Record<string, { px: number; grow: boolean }> = {};

      for (const { column } of layout.leaves) {
        const header = table.querySelector<HTMLElement>(`[id="${headerId(column.key)}"]`);

        if (header !== null && column.resizable !== false) {
          widths[column.key] = {
            px: Math.round(
              Math.min(MAX_OPTIMAL_COLUMN_WIDTH, Math.max(MIN_COLUMN_WIDTH, header.getBoundingClientRect().width)),
            ),
            grow: true,
          };
        }
      }

      table.style.gridTemplateColumns = saved;
      setColumnWidths((current) => ({ ...current, ...widths }));
    },
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
    hasHandleColumn,
    moveLine,
    announcement,
    actionColumn: firstLeafColumn + layout.leaves.length,
    // The `data-meta` of a meta cell: which outer edges of the meta columns it has (`first`, `last`, both, or none).
    metaEdges: (column: 'handle' | 'selection' | 'details') =>
      [column === firstMetaColumn ? 'first' : '', column === lastMetaColumn ? 'last' : ''].filter(Boolean).join(' '),

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

    // Row groups: undefined without `groupBy`. The lines: the group headers and the rows, in the order shown.
    rowGroups,
    lines,
    isGroupCollapsed,
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
    groupActions,
    invokeForGroup,
    hasContextMenu,
    contextActions,
    prepareContextMenu,
    invokeFromContextMenu,

    // Row editing: the edited row (undefined while none is), its draft and state, and what the editors and the buttons
    // do. While a row is edited, the rest of the table is blocked, like while loading.
    edit,
    formFields,
    fieldId: (key: string) => `${idBase}-field-${key.replace(/\W/g, '_')}`,
    blocked: loading || edit !== undefined,
    changeDraft,
    saveEdit,
    cancelEdit,
    keyDownEdit,
  };
}
