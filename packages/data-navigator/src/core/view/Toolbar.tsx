import type { ReactElement, ReactNode } from 'react';
import type { DataNavigatorComponent as Spec } from '../../react/api';
import type { ActionItem } from '../actions';
import type { SearchBox } from '../useDataNavigator';
import { hasContent, textFieldKeys } from '../utils';
import { ActionList } from './Actions';
import * as classes from './DataNavigator.module.css';
import { icons } from './icons';
import { ActionButton, SearchField } from './widgets';

export { Toolbar };

type ToolbarProps<Row> = {
  title: ReactNode;
  subtitle: ReactNode;
  items: readonly ActionItem<Row>[];
  invoke: (action: Spec.Action<Row>) => void;
  texts: Spec.Texts;
  search: SearchBox | undefined;
  reload: (() => void) | undefined;
  inert: boolean;
};

// The title and the description above the bar. The bar has the actions on the left and the search box (of a fixed
// width) and the Reload button on the right.
// While loading, everything is blocked (`inert`), except the search box: a new search replaces the running one, and the
// box must not lose its focus while the user types.
function Toolbar<Row>(props: ToolbarProps<Row>): ReactElement | null {
  const { title, subtitle, items, invoke, texts, search, reload, inert } = props;
  const end = search !== undefined || reload !== undefined;
  const heading = hasContent(title) || hasContent(subtitle);

  if (!heading && items.length === 0 && !end) {
    return null;
  }

  return (
    <div className={classes.toolbar}>
      {heading && (
        <div className={classes.toolbarHeading} inert={inert}>
          {hasContent(title) && <div className={classes.title}>{title}</div>}
          {hasContent(subtitle) && <div className={classes.subtitle}>{subtitle}</div>}
        </div>
      )}
      {(items.length > 0 || end) && (
        <div className={classes.toolbarBar}>
          {items.length > 0 && (
            <div className={classes.toolbarActions} inert={inert}>
              <ActionList items={items} placement="toolbar" invoke={invoke} />
            </div>
          )}
          <span className={classes.toolbarSpacer} />
          {search !== undefined && (
            <SearchField
              value={search.text}
              label={texts.searchPlaceholder}
              clearLabel={texts.clearSearch}
              onChange={search.onChange}
              onClear={search.onClear}
              onKeyDown={textFieldKeys(search.onSubmit, search.onClear)}
            />
          )}
          {reload !== undefined && (
            <div className={classes.toolbarReload} inert={inert}>
              <ActionButton
                look={{ icon: <icons.Refresh />, tip: texts.reload }}
                variant="secondary"
                placement="toolbar"
                onClick={reload}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
