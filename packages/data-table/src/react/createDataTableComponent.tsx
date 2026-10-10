import { useCallback, useMemo, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { checkI18nType, ConfigContext, resolveConfig } from '../core/config';
import type { ResolvedConfig } from '../core/config';
import { DataTableView } from '../core/view/DataTableView';
import type { DataTableComponent as Spec } from './api';

export { createDataTableComponent };

// Creates the data table component with its configuration: the i18n adapter (from a factory or a hook) and the
// theme. Call it once, at module level, and use the result everywhere (a new component per render would remount the
// table).
function createDataTableComponent(config: Spec.Config = {}): Spec.Component {
  const { i18n } = config;

  checkI18nType(i18n, ['factory', 'hook']);

  const resolved = resolveConfig(config.theme);
  // Chosen once, so every render calls the same hooks.
  const useI18n = i18n?.type === 'hook'
    ? hookI18n(i18n.useAdapter)
    : i18n?.type === 'factory'
    ? factoryI18n(i18n.getAdapter)
    : useNoI18n;

  function DataTable<Row>(props: Spec.Props<Row>): ReactElement {
    const { adapter, onRoot } = useI18n();
    const value = useMemo<ResolvedConfig>(() => ({ ...resolved, i18n: adapter, onRoot }), [adapter, onRoot]);

    return (
      <ConfigContext value={value}>
        <DataTableView {...props} />
      </ConfigContext>
    );
  }

  return DataTable;
}

type I18nState = { adapter: Spec.I18nAdapter | undefined; onRoot?: ((root: HTMLElement) => void) | undefined };

function useNoI18n(): I18nState {
  return { adapter: undefined };
}

// The hook runs in the component on every render, so each instance follows the nearest provider of the app.
function hookI18n(useAdapter: () => Spec.I18nAdapter): () => I18nState {
  return function useHookI18n() {
    return { adapter: useAdapter() };
  };
}

// The factory is asked once per instance, with the root element of the table, as soon as that is there: in the commit,
// before the first paint (the texts are rendered once more, in the adapter's language).
function factoryI18n(getAdapter: (element: HTMLElement) => Spec.I18nAdapter): () => I18nState {
  return function useFactoryI18n() {
    const [adapter, setAdapter] = useState<Spec.I18nAdapter>();
    const askedRef = useRef(false);
    const onRoot = useCallback((root: HTMLElement) => {
      if (!askedRef.current) {
        askedRef.current = true;
        const created = getAdapter(root);

        setAdapter(() => created);
      }
    }, []);

    return { adapter, onRoot };
  };
}
