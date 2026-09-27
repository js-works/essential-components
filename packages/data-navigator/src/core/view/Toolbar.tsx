import type { ReactElement, ReactNode } from 'react';
import type { DataNavigatorComponent as Spec } from '../../react/api';
import type { ActionItem } from '../actions';
import type { SearchBox } from '../useDataNavigator';
import { hasContent, textFieldKeys } from '../utils';
import { ActionList } from './Actions';
import * as classes from './DataNavigator.module.css';
import { SearchField } from './widgets';

export { Toolbar };

type ToolbarProps<Row> = {
  title: ReactNode;
  subtitle: ReactNode;
  items: readonly ActionItem<Row>[];
  invoke: (action: Spec.Action<Row>) => void;
  texts: Spec.Texts;
  search: SearchBox | undefined;
  inert: boolean;
};

// The title and the description above the bar. The bar has the actions on the left and the search box (of a fixed
// width) on the right.
// While loading, everything is blocked (`inert`), except the search box: a new search replaces the running one, and the
// box must not lose its focus while the user types.
function Toolbar<Row>(props: ToolbarProps<Row>): ReactElement | null {
  const { title, subtitle, items, invoke, texts, search, inert } = props;
  const heading = hasContent(title) || hasContent(subtitle);

  if (!heading && items.length === 0 && search === undefined) {
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
      {(items.length > 0 || search !== undefined) && (
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
        </div>
      )}
    </div>
  );
}
