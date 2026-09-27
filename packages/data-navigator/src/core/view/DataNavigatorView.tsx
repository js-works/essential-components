import { Tooltip } from '@base-ui/react/tooltip';
import { Fragment, useContext, useState } from 'react';
import type { MouseEvent, ReactElement, ReactNode } from 'react';
import type { DataNavigatorComponent as Spec } from '../../react/api';
import { ConfigContext } from '../config';
import { useDataNavigator } from '../useDataNavigator';
import {
  flag,
  formatValue,
  hasContent,
  startsDoubleClick,
  suppressesTextSelection,
  suppressesWordSelection,
} from '../utils';
import { ActionList } from './Actions';
import * as classes from './DataNavigator.module.css';
import { Footer } from './Footer';
import { LayerContext } from './layer';
import { Toolbar } from './Toolbar';
import { Checkbox, ChevronButton, EmptyIcon, Radio, SortButton, Spinner } from './widgets';

export { DataNavigatorView };

// The whole data navigator: the grid, the header rows, the filter row, the data rows, the detail rows and the empty
// state. The root carries the values of the theme as its custom properties (see config.ts).
function DataNavigatorView<Row>(props: Spec.Props<Row>): ReactElement {
  const { title, subtitle, empty } = props;
  const { themeStyle } = useContext(ConfigContext);
  const nav = useDataNavigator<Row>(props);
  // Where the widgets render their popups (see layer.ts).
  const [layer, setLayer] = useState<HTMLDivElement | null>(null);
  const { texts, selection, rows, layout, sort } = nav;

  // A data row and its detail row are one unit: both select from their free space, and both suppress the text
  // selection that shift + mouse down would otherwise start.
  const rowHandlers = (row: Row, key: string) => ({
    onClick: selection === 'none' ? undefined : (event: MouseEvent<HTMLElement>) => nav.clickRow(event, key),
    onDoubleClick: nav.hasDefaultAction
      ? (event: MouseEvent<HTMLElement>) => nav.doubleClickRow(event, row)
      : undefined,
    // The second mouse down of a double click is where the browser first tells us it is one. The selection the first
    // click made goes back here, before the double click is reported, so the row never stays changed.
    // Shift + mouse down would also select the text between the last click and this one, and that second mouse down
    // would select a word. Neither is wanted where the gesture already means something else.
    onMouseDown: selection === 'multi' || nav.hasDefaultAction
      ? (event: MouseEvent<HTMLElement>) => {
        if (nav.hasDefaultAction && startsDoubleClick(event)) {
          nav.cancelRowClick();
        }

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

  return (
    <div
      className={classes.root}
      style={themeStyle}
      aria-busy={nav.loading}
      data-density={nav.density}
      data-selection={selection}
      data-selection-appearance={nav.selectionAppearance}
      data-striped={flag(nav.striped)}
      data-dimmed={flag(nav.spinnerVisible)}
    >
      <LayerContext value={layer}>
        {/* Tooltips open after a short pause, and at once when moving from one trigger to the next. */}
        <Tooltip.Provider delay={300}>
          <div className={classes.content}>
            <Toolbar
              title={title}
              subtitle={subtitle}
              items={nav.toolbarActions}
              invoke={nav.invokeFromToolbar}
              texts={texts}
              search={nav.searchBox}
              inert={nav.loading}
            />
            <div className={classes.scrollArea}>
              <div className={classes.scroller}>
                <div
                  role="table"
                  className={classes.table}
                  style={{ gridTemplateColumns: nav.gridTemplateColumns }}
                >
                  <div role="row" ref={nav.headerRef} data-filters={flag(nav.hasFilters)} className={classes.headerRow}>
                    {selection !== 'none' && (
                      <div
                        role="columnheader"
                        inert={nav.loading}
                        className={classes.headerTall}
                        style={{ gridColumn: 1, gridRow: nav.headerRowSpan }}
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
                        inert={nav.loading}
                        className={classes.headerTall}
                        style={{ gridColumn: selection !== 'none' ? 2 : 1, gridRow: nav.headerRowSpan }}
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
                        inert={nav.loading}
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
                    {layout.leaves.map(({ column }, index) => (
                      <div
                        key={column.key}
                        role="columnheader"
                        inert={nav.loading}
                        id={nav.headerId(column.key)}
                        aria-sort={column.sortable ? nav.ariaSort(column.key) : undefined}
                        data-align={column.align}
                        data-sortable={flag(column.sortable === true)}
                        onClick={column.sortable ? () => nav.sortBy(column.key) : undefined}
                        className={nav.headerRows === 2 ? classes.headerSub : classes.headerTall}
                        style={{ gridColumn: nav.firstLeafColumn + index }}
                      >
                        {column.sortable
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
                    ))}
                    {nav.hasActionColumn && (
                      <div
                        role="columnheader"
                        inert={nav.loading}
                        className={classes.headerTall}
                        style={{ gridColumn: nav.actionColumn, gridRow: nav.headerRowSpan }}
                      />
                    )}
                    {nav.hasFilters && (
                      <>
                        {selection !== 'none' && (
                          <div
                            role="presentation"
                            className={classes.filterCell}
                            style={{ gridColumn: 1, gridRow: nav.filterRow }}
                          />
                        )}
                        {nav.hasDetails && (
                          <div
                            role="presentation"
                            className={classes.filterCell}
                            style={{ gridColumn: selection !== 'none' ? 2 : 1, gridRow: nav.filterRow }}
                          />
                        )}
                        {layout.leaves.map(({ column }, index) => (
                          <div
                            key={`filter-${column.key}`}
                            role={column.filter ? 'cell' : 'presentation'}
                            className={classes.filterCell}
                            style={{ gridColumn: nav.firstLeafColumn + index, gridRow: nav.filterRow }}
                          >
                            {column.filter?.({
                              value: nav.filters[column.key],
                              onChange: (next) => nav.setFilter(column.key, next),
                              labelledBy: nav.headerId(column.key),
                            })}
                          </div>
                        ))}
                        {nav.hasActionColumn && (
                          <div
                            role="presentation"
                            className={classes.filterCell}
                            style={{ gridColumn: nav.actionColumn, gridRow: nav.filterRow }}
                          />
                        )}
                      </>
                    )}
                  </div>
                  {rows.map((row, index) => {
                    const key = nav.keyOf(row);
                    const selected = nav.isSelected(key);
                    const detail = nav.details[index];
                    const expandable = hasContent(detail);
                    const expanded = expandable && nav.isExpanded(key);

                    return (
                      <Fragment key={key}>
                        <div
                          role="row"
                          className={classes.dataRow}
                          inert={nav.loading}
                          data-stripe={flag(nav.striped && index % 2 === 0)}
                          aria-selected={selection !== 'none' ? selected : undefined}
                          {...rowHandlers(row, key)}
                        >
                          {
                            /* The selection cell and the details toggle cell are not control cells: clicking their free
                          space selects the row, like a data cell. The checkbox and the chevron inside are their own
                          targets, so each still does its own job exactly once. */
                          }
                          {selection !== 'none' && (
                            <div
                              role="cell"
                              className={classes.cell}
                              data-selected={flag(selected)}
                              data-divider={nav.dividerAfter('selection')}
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
                              data-selected={flag(selected)}
                              data-divider={nav.dividerAfter('details')}
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
                          {layout.leaves.map(({ column }) => {
                            const content = column.render ? column.render(row) : formatValue(row[column.key]);

                            return (
                              <div
                                key={column.key}
                                role="cell"
                                className={classes.cell}
                                data-selected={flag(selected)}
                                data-align={column.align}
                                data-wrap={flag(column.wrap === true)}
                              >
                                {cellContent(content)}
                              </div>
                            );
                          })}
                          {nav.hasActionColumn && (
                            <div
                              role="cell"
                              className={classes.cell}
                              data-selected={flag(selected)}
                              data-divider="start"
                              data-control
                            >
                              <div className={classes.rowActions}>
                                <ActionList
                                  items={nav.rowActions}
                                  placement="row"
                                  invoke={(action) => nav.invokeForRow(row, action)}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        {expanded && (
                          <div role="row" className={classes.detailRow} inert={nav.loading} {...rowHandlers(row, key)}>
                            {selection !== 'none' && (
                              <div
                                role="presentation"
                                className={classes.cell}
                                data-selected={flag(selected)}
                                data-divider={nav.dividerAfter('selection')}
                              />
                            )}
                            {nav.hasDetails && (
                              <div
                                role="presentation"
                                className={classes.cell}
                                data-selected={flag(selected)}
                                data-divider={nav.dividerAfter('details')}
                              />
                            )}
                            <div
                              role="cell"
                              className={classes.detailCell}
                              data-selected={flag(selected)}
                              style={{ gridColumn: nav.columnSpan(nav.firstLeafColumn, layout.leaves.length) }}
                            >
                              {cellContent(detail)}
                            </div>
                            {nav.hasActionColumn && (
                              <div
                                role="presentation"
                                className={classes.cell}
                                data-selected={flag(selected)}
                                data-divider="start"
                              />
                            )}
                          </div>
                        )}
                      </Fragment>
                    );
                  })}
                  {nav.isEmpty && (
                    <div role="row" className={classes.row} inert={nav.loading}>
                      <div role="cell" className={classes.emptyCell}>
                        {empty ?? (
                          <>
                            <EmptyIcon />
                            <span className={classes.dimmed}>{nav.emptyText}</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {nav.spinnerVisible && (
                <div className={classes.overlay} style={{ top: nav.headerHeight }}>
                  <Spinner label={texts.loading} />
                </div>
              )}
            </div>
            {rows.length > 0 && (
              <div inert={nav.loading}>
                <Footer
                  texts={texts}
                  selectedCount={nav.selectedRows.length}
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
        </Tooltip.Provider>
      </LayerContext>
      <div ref={setLayer} className={classes.layer} />
    </div>
  );
}
