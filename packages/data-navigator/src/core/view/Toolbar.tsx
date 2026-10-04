import type { ReactElement, ReactNode } from 'react';
import type { DataNavigatorComponent as Spec } from '../../react/api';
import type { ActionItem } from '../actions';
import type { SearchBox } from '../useDataNavigator';
import { flag, hasContent, textFieldKeys } from '../utils';
import { ActionList } from './Actions';
import * as classes from './DataNavigator.module.css';
import { icons } from './icons';
import { ActionButton, Pill, SearchField, WithTip } from './widgets';

export { Toolbar };

type ToolbarProps<Row> = {
  title: ReactNode;
  subtitle: ReactNode;
  generalActions: readonly ActionItem<Row>[];
  selectionActions: readonly ActionItem<Row>[];
  invoke: (action: Spec.Action<Row>) => void;
  texts: Spec.Texts;
  search: SearchBox | undefined;
  reload: (() => void) | undefined;
  // The filter button with its popup, when a column has a filter.
  filterButton: ReactNode;
  // The column toggle menu, when a column is hideable: at the end of the bar, after a divider.
  columnMenu: ReactNode;
  // The pills of the active filters, below the bar.
  pills: ReactNode;
  // Whether the table has a selection mode at all, whether rows are selected now, and how many.
  selectable: boolean;
  selectedCount: number;
  onCancelSelection: () => void;
  loading: boolean;
  // While the filter view is shown, everything of the bar but the filter button is disabled (inert and faded): the
  // filter button is the way back to the rows. The search stays separate from the filters.
  filtering: boolean;
};

// The title and the description, then the bar, then the pills of the active filters.
// The bar: the Reload button and the search box on the left (it grows up to a maximum width), then the free space, the
// filter button, a divider, the general actions, a divider and the column toggle menu. The Reload button stays at the
// start also without a search box.
// While rows are selected, the selection bar takes the bar's place, with the same height (nothing below moves): the
// number of selected rows (a pill with a ×, which clears the selection), the free space, the actions on the
// selection, a divider and an icon-only "deselect" button (which clears it too).
// While loading, everything is blocked (`inert`), except the search box and the filter button: a new search or new
// filters replace the running load, and the search box must not lose its focus while the user types.
function Toolbar<Row>(props: ToolbarProps<Row>): ReactElement | null {
  const { title, subtitle, generalActions, selectionActions, invoke, texts, search, reload, filterButton, pills } =
    props;
  const { columnMenu, filtering, selectable, selectedCount, onCancelSelection, loading } = props;
  const heading = hasContent(title) || hasContent(subtitle);
  const selecting = selectable && selectedCount > 0;
  const tools = hasContent(filterButton) || hasContent(columnMenu) || reload !== undefined;
  const bar = selecting || search !== undefined || tools || generalActions.length > 0;

  if (!heading && !bar && !hasContent(pills)) {
    return null;
  }

  return (
    <div className={classes.toolbar}>
      {heading && (
        <div className={classes.toolbarHeading} inert={loading}>
          {hasContent(title) && <div className={classes.title}>{title}</div>}
          {hasContent(subtitle) && <div className={classes.subtitle}>{subtitle}</div>}
        </div>
      )}
      {bar && (selecting
        ? (
          // A key of its own, so the bar is mounted anew when the mode changes (it fades in).
          <div key="selection" className={classes.toolbarBar} data-mode="selection">
            {
              /* The whole pill is the button that clears the selection: it shows that on hover (a background, the ×
            darker) and in its tooltip. Its name is the action; the count is announced by the status inside. */
            }
            <WithTip tip={texts.clearSelection} describe={false}>
              <button
                type="button"
                className={classes.selectionPill}
                aria-label={texts.clearSelection}
                inert={loading}
                onClick={onCancelSelection}
              >
                <Pill>
                  <span role="status">
                    {/* A key per count, so the text bumps when it changes. */}
                    <span key={selectedCount} className={classes.selectionCount}>
                      {texts.selectedCount({ count: selectedCount })}
                    </span>
                  </span>
                  <span className={classes.pillIcon}>
                    <icons.Close size={14} />
                  </span>
                </Pill>
              </button>
            </WithTip>
            <span className={classes.toolbarSpacer} />
            {selectionActions.length > 0 && (
              <div className={classes.toolbarActions} inert={loading}>
                <ActionList items={selectionActions} placement="toolbar" invoke={invoke} />
              </div>
            )}
            {/* The same as the pill, on purpose: after the actions, the pointer is on the right. */}
            <span className={classes.toolbarDivider} />
            <span className={classes.toolbarActions} inert={loading}>
              <ActionButton
                look={{ icon: <icons.Deselect />, tip: texts.clearSelection }}
                variant="secondary"
                placement="tool"
                onClick={onCancelSelection}
              />
            </span>
          </div>
        )
        : (
          <div
            key="normal"
            className={classes.toolbarBar}
            data-searchable={flag(search !== undefined)}
            data-filtering={flag(filtering)}
          >
            {reload !== undefined && (
              <span className={classes.toolbarReload} inert={loading || filtering}>
                <ActionButton
                  look={{ icon: <icons.Refresh />, tip: texts.reload }}
                  variant="secondary"
                  placement="tool"
                  busy={loading}
                  onClick={reload}
                />
              </span>
            )}
            {search !== undefined && (
              <SearchField
                value={search.text}
                label={texts.searchPlaceholder}
                clearLabel={texts.clearSearch}
                inert={filtering}
                onChange={search.onChange}
                onClear={search.onClear}
                onKeyDown={textFieldKeys(search.onSubmit, search.onClear)}
              />
            )}
            <span className={classes.toolbarSpacer} />
            {filterButton}
            {hasContent(filterButton) && generalActions.length > 0 && <span className={classes.toolbarDivider} />}
            {generalActions.length > 0 && (
              <div className={classes.toolbarActions} inert={loading || filtering}>
                <ActionList items={generalActions} placement="toolbar" invoke={invoke} />
              </div>
            )}
            {hasContent(columnMenu) && (hasContent(filterButton) || generalActions.length > 0) && (
              <span className={classes.toolbarDivider} />
            )}
            {hasContent(columnMenu) && (
              <span className={classes.toolbarActions} inert={filtering}>
                {columnMenu}
              </span>
            )}
          </div>
        ))}
      {pills}
    </div>
  );
}
