import type { ReactElement } from 'react';
import { ConfigContext, resolveConfig } from '../core/config';
import { DataNavigatorView } from '../core/view/DataNavigatorView';
import type { DataNavigatorComponent as Spec } from './api';

export { createDataNavigatorComponent };

// Creates the data navigator component with its configuration: the i18n adapter and the theme. Call it once, at module
// level, and use the result everywhere (a new component per render would remount the table).
function createDataNavigatorComponent(config: Spec.Config = {}): Spec.Component {
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
