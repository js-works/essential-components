import type { ReactElement } from 'react';
import type { DataNavigator as Spec } from './api';
import { ConfigContext, resolveConfig } from './core/config';
import { DataNavigatorView } from './core/view/DataNavigatorView';

export { createDataNavigator };

// Creates the data navigator component with its configuration: the i18n adapter and the theme. Call it once, at module
// level, and use the result everywhere (a new component per render would remount the table).
function createDataNavigator(config: Spec.Config = {}): Spec.Component {
  const resolved = resolveConfig(config);

  function DataNavigator<Row>(props: Spec.Props<Row>): ReactElement {
    return (
      <ConfigContext value={resolved}>
        <DataNavigatorView {...props} />
      </ConfigContext>
    );
  }

  return DataNavigator;
}
