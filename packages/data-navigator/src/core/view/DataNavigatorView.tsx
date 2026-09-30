import { Tooltip } from '@base-ui/react/tooltip';
import { Fragment, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { HTMLAttributes, MouseEvent, ReactElement, ReactNode } from 'react';
import type { DataNavigatorComponent as Spec } from '../../react/api';
import { ConfigContext } from '../config';
import { useDataNavigator } from '../useDataNavigator';
import type { RowGroupEntry } from '../useDataNavigator';
import { flag, formatValue, hasContent, suppressesTextSelection, suppressesWordSelection } from '../utils';
import { ActionList } from './Actions';
import * as classes from './DataNavigator.module.css';
import { EditForm } from './EditForm';
import { FilterButton, FilterPills, FilterView } from './FilterPanel';
import { Footer } from './Footer';
import { icons } from './icons';
import { LayerContext } from './layer';
import { RowContextMenu } from './RowContextMenu';
import { useRowDrag } from './rowDrag';
import { Toolbar } from './Toolbar';
import { ActionButton, Checkbox, ChevronButton, LoadingBar, Radio, SortButton, ToggleMenu } from './widgets';

export { DataNavigatorView };

// How long the edit form unfolds and its row folds up (the same as `.editFormCell` in the stylesheet).
const EDIT_FORM_TIME = 180;

// The folding of the edited row, both ways: kept at its end (`fill`) until it is cancelled.
const FOLD_TIMING: KeyframeAnimationOptions = { duration: EDIT_FORM_TIME, easing: 'ease', fill: 'forwards' };

// The whole data navigator: the toolbar (with the filter button and the pills), the grid, the header rows, the data
// rows, the detail rows and the empty state, or the filter view in place of the grid and the footer. The root carries
// the values of the theme as its custom properties (see config.ts).
function DataNavigatorView<Row>(props: Spec.Props<Row>): ReactElement {
  const { title, subtitle, empty } = props;
  const { themeStyle } = useContext(ConfigContext);
  const nav = useDataNavigator<Row>(props);
  // Where the widgets render their popups (see layer.ts).
  const [layer, setLayer] = useState<HTMLDivElement | null>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const { texts, selection, rows, layout, sort } = nav;
  const drag = useRowDrag(nav.lines.length, nav.canReorder, nav.moveLine);
  const rootRef = useRef<HTMLDivElement>(null);
  const editKey = nav.edit?.key;

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
      fold.animation = fold.cell.animate([...fold.keyframes].reverse(), FOLD_TIMING);
    }

    closeTimerRef.current = setTimeout(nav.cancelEdit, EDIT_FORM_TIME);
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
    const timer = setTimeout(() => form?.scrollIntoView({ block: 'nearest' }), EDIT_FORM_TIME);

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

  // Closing the filter view gives the focus back to the filter button (the focused control goes away with the view).
  const closeFilterView = () => {
    filterButtonRef.current?.focus();
    nav.closeFilters();
  };

  // A data row and its detail row are one unit: both select from their free space, and both suppress the text
  // selection that shift + mouse down would otherwise start.
  const rowHandlers = (row: Row, key: string) => ({
    onClick: selection === 'none' ? undefined : (event: MouseEvent<HTMLElement>) => nav.clickRow(event, key),
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

  // Plain text gets an element of its own, so a click on it is not a click on the free space of the cell.
  // Whatever a custom `render` or `renderDetail` returns is already its own target.
  const cellContent = (content: ReactNode): ReactNode =>
    typeof content === 'string' || typeof content === 'number'
      ? <span className={classes.cellText}>{content}</span>
      : content;

  // The header row of a group (the line `line`), over the whole width: a checkbox for its rows (`selectableGroups`,
  // with multi selection; none for an empty group), then a button that collapses and expands the group, with a chevron
  // and the group's content (without the checkbox, it starts in the first column):
  // `renderGroup`, else its key and the number of its rows (of the source's total, when it gives one and the page
  // shows only a part of the group). The group actions at its end, in the action column. During a drag it slides aside like a row.
  const renderGroupRow = (group: RowGroupEntry<Row>, line: number): ReactElement => {
    const collapsed = nav.isGroupCollapsed(group.key);
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
      ref={rootRef}
      className={classes.root}
      style={themeStyle}
      aria-busy={nav.loading}
      data-density={nav.density}
      data-selection={selection}
      data-selection-appearance={nav.selectionAppearance}
      data-striped={flag(nav.striped)}
      data-dimmed={flag(nav.spinnerVisible)}
      data-dragging={flag(drag.drag !== undefined)}
      data-editing={flag(nav.edit !== undefined)}
      data-edit-closing={flag(closing)}
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
                generalActions={nav.generalActions}
                selectionActions={nav.selectionActions}
                invoke={nav.invokeFromToolbar}
                texts={texts}
                search={nav.searchBox}
                // While the filter view is shown, everything of the bar but the filter button is disabled.
                filtering={nav.filterPanel.open}
                reload={nav.reload}
                filterButton={nav.filterColumns.length > 0 && (
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
                )}
                columnMenu={nav.columnToggles.length > 0 && (
                  <ToggleMenu
                    icon={<icons.Columns />}
                    label={texts.columns}
                    entries={nav.columnToggles}
                    onToggle={nav.toggleColumn}
                  />
                )}
                // Not shown while the filter view is shown (the view shows the same filters, as a draft).
                pills={!nav.filterPanel.open && (
                  <FilterPills
                    columns={nav.filterColumns}
                    filters={nav.filters}
                    texts={texts}
                    onOpen={nav.selectionActive ? undefined : nav.openFilters}
                    onRemove={nav.removeFilter}
                    onClearAll={nav.clearFilters}
                  />
                )}
                selectable={selection !== 'none'}
                selectedCount={nav.selectedRows.length}
                onCancelSelection={nav.clearSelection}
                loading={nav.loading}
              />
            </div>
            {
              /* The grid with the footer, and the filter view: stacked in one cell, so the height is the larger of the
              two. While the view is shown, the grid and the footer stay (with their scroll position and state) but are
              hidden (`visibility: hidden`, inert): the table keeps its height, and nothing below it moves. */
            }
            <div className={classes.stack} data-filtering={flag(nav.filterPanel.open)}>
              {nav.filterPanel.open && (
                <FilterView
                  columns={nav.filterColumns}
                  filters={nav.filters}
                  texts={texts}
                  focusKey={nav.filterPanel.focusKey}
                  onApply={(next) => {
                    nav.applyFilters(next);
                    closeFilterView();
                  }}
                  onCancel={closeFilterView}
                />
              )}
              <div className={classes.tableArea} inert={nav.filterPanel.open}>
                <div className={classes.scrollArea}>
                  <div ref={nav.scrollerRef} className={classes.scroller}>
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
                            style={{ gridColumn: nav.handleColumn, gridRow: nav.headerRowSpan }}
                            data-meta={nav.metaEdges('handle')}
                          />
                        )}
                        {selection !== 'none' && (
                          <div
                            role="columnheader"
                            inert={nav.blocked}
                            className={classes.headerTall}
                            style={{ gridColumn: nav.selectionColumn, gridRow: nav.headerRowSpan }}
                            data-meta={nav.metaEdges('selection')}
                            data-select={flag(selection === 'multi' && rows.length > 0)}
                            onClick={(event) => {
                              // The free space of the cell is a click on the select-all checkbox.
                              if (event.target === event.currentTarget && selection === 'multi' && rows.length > 0) {
                                nav.selectAll(!nav.allSelected);
                              }
                            }}
                          >
                            {selection === 'multi' && (
                              <Checkbox
                                label={nav.allSelected ? texts.deselectAll : texts.selectAll}
                                disabled={rows.length === 0}
                                checked={nav.allSelected}
                                indeterminate={nav.someSelected}
                                onChange={(checked) => nav.selectAll(checked)}
                              />
                            )}
                          </div>
                        )}
                        {nav.hasDetails && (
                          <div
                            role="columnheader"
                            inert={nav.blocked}
                            className={classes.headerTall}
                            style={{ gridColumn: nav.detailsColumn, gridRow: nav.headerRowSpan }}
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

                          return (
                            <div
                              key={column.key}
                              role="columnheader"
                              inert={nav.blocked}
                              id={nav.headerId(column.key)}
                              aria-sort={sortable ? nav.ariaSort(column.key) : undefined}
                              data-align={column.align}
                              data-sortable={flag(sortable)}
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
                            </div>
                          );
                        })}
                        {nav.hasActionColumn && (
                          <div
                            role="columnheader"
                            inert={nav.blocked}
                            className={classes.headerTall}
                            style={{ gridColumn: nav.actionColumn, gridRow: nav.headerRowSpan }}
                          />
                        )}
                      </div>
                      {/* A new row (`addRow`) is only its form, at the top of the rows. */}
                      {nav.edit?.isNew === true && <Fragment key={nav.edit.key}>{renderEditForm(nav.edit)}</Fragment>}
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
                        const mark = { 'data-selected': flag(selected), 'data-drag': look.state, style: look.style };
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
                                  data-divider={nav.dividerAfter('handle')}
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
                                /* The free space of the selection cell is a click on its checkbox or radio (a few pixels
                          beside it still hit), with Shift for a range. The details toggle cell is not a control cell:
                          clicking its free space selects the row, like a data cell. The checkbox and the chevron
                          inside are their own targets, so each still does its own job exactly once. */
                              }
                              {selection !== 'none' && (
                                <div
                                  role="cell"
                                  className={classes.cell}
                                  {...mark}
                                  data-divider={nav.dividerAfter('selection')}
                                  data-meta={nav.metaEdges('selection')}
                                  data-select
                                  onClick={(event) => {
                                    if (event.target !== event.currentTarget) {
                                      return;
                                    }

                                    if (selection === 'multi') {
                                      nav.selectByClick(key, event.shiftKey);
                                    } else {
                                      nav.selectOnly(key);
                                    }
                                  }}
                                >
                                  {selection === 'multi'
                                    ? (
                                      <Checkbox
                                        label={selected ? texts.deselectRow : texts.selectRow}
                                        checked={selected}
                                        onChange={(_, shift) => nav.selectByClick(key, shift)}
                                      />
                                    )
                                    : (
                                      <Radio
                                        label={selected ? texts.deselectRow : texts.selectRow}
                                        checked={selected}
                                        onChange={() => nav.selectOnly(key)}
                                      />
                                    )}
                                </div>
                              )}
                              {nav.hasDetails && (
                                <div
                                  role="cell"
                                  className={classes.cell}
                                  {...mark}
                                  data-divider={nav.dividerAfter('details')}
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
                                  data-divider="start"
                                  data-control
                                >
                                  <div className={classes.rowActions} data-row-actions>
                                    <ActionList
                                      items={nav.rowActions}
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
                                    data-divider={nav.dividerAfter('handle')}
                                    data-meta={nav.metaEdges('handle')}
                                  />
                                )}
                                {selection !== 'none' && (
                                  <div
                                    role="presentation"
                                    className={classes.cell}
                                    {...mark}
                                    data-divider={nav.dividerAfter('selection')}
                                    data-meta={nav.metaEdges('selection')}
                                  />
                                )}
                                {nav.hasDetails && (
                                  <div
                                    role="presentation"
                                    className={classes.cell}
                                    {...mark}
                                    data-divider={nav.dividerAfter('details')}
                                    data-meta={nav.metaEdges('details')}
                                  />
                                )}
                                <div
                                  role="cell"
                                  className={classes.detailCell}
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
                          </div>
                        </div>
                      )}
                    </RowContextMenu>
                  </div>
                  {nav.spinnerVisible && (
                    <div className={classes.overlay} style={{ top: nav.headerHeight, right: nav.scrollbarWidth }}>
                      <LoadingBar label={texts.loading} />
                    </div>
                  )}
                </div>
                {nav.footerShown && (
                  <div inert={nav.blocked} data-blocked={flag(nav.edit !== undefined)}>
                    <Footer
                      texts={texts}
                      total={nav.total}
                      page={nav.page}
                      pageCount={nav.pageCount}
                      pageSize={nav.pageSize}
                      pageSizeOptions={nav.pageSizeOptions}
                      onPage={nav.goToPage}
                      onPageSize={nav.changePageSize}
                    />
                  </div>
                )}
              </div>
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
