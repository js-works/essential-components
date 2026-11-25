import { useMemo } from 'react';

import type * as Spec from '../api/react/index.js';
import type { ResolvedConfig } from '../core/config.js';
import { ConfigContext, resolveConfig } from '../core/config.js';
import { DataTableView } from '../core/view/data-table-view.js';

export { createDataTableComponent };

// Creates the data table component with its configuration: the i18n adapter (from its hook), the theme
// and the defaults of its tables. Call it once, at module level, and use the result everywhere (a new component per render would remount the
// table).
function createDataTableComponent(config: Spec.DataTableComponentConfig = {}): Spec.DataTableComponent {
  const resolved = resolveConfig(config.theme);
  const defaults = config.defaults ?? {};
  // Chosen once, so every render calls the same hooks. It runs in the component on every render, so each instance
  // can follow the nearest provider of the app.
  const useI18n = config.useI18n ?? useNoI18n;

  function DataTable<Row>(props: Spec.DataTableProps<Row>) {
    const adapter = useI18n();
    const value = useMemo<ResolvedConfig>(() => ({ ...resolved, i18n: adapter }), [adapter]);

    return (
      <ConfigContext value={value}>
        <DataTableView {...props} {...defaultsOf(props, defaults)} />
      </ConfigContext>
    );
  }

  return DataTable;
}

// The props a table leaves out, from the defaults (a prop given as `undefined` counts as left out).
function defaultsOf<Row>(
  props: Spec.DataTableProps<Row>,
  defaults: Spec.DataTableDefaults,
): Partial<Spec.DataTableProps<Row>> {
  return {
    density: props.density ?? defaults.density,
    layout: props.layout ?? defaults.layout,
    footer: props.footer ?? defaults.footer,
    rowActionLook: props.rowActionLook ?? defaults.rowActionLook,
    selectionAppearance: props.selectionAppearance ?? defaults.selectionAppearance,
    defaultPageSize: props.defaultPageSize ?? defaults.pageSize,
    pageSizeOptions: props.pageSizeOptions ?? defaults.pageSizeOptions,
  };
}

function useNoI18n(): Spec.I18nAdapter | undefined {
  return undefined;
}
