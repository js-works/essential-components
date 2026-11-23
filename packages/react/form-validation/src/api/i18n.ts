export type { I18nAdapter, I18nConfig };

/**
 * The app's i18n system, the same shape as the adapters of the other components (data table, file upload), so one
 * adapter object fits all of them.
 */
interface I18nAdapter {
  currentLocale: () => string;
  /**
   * The namespace is `'formValidation'` for the messages of the library, and the app namespace (see
   * `FormConfig.appNamespace`) for the app's keys (labels, messages of the schema or the server). `defaultValue` is the
   * text the library would show (from `messages` or its catalog, already filled in): return it if there is no
   * translation.
   */
  resolveText: (
    namespace: string,
    key: string,
    params: Readonly<Record<string, unknown>> | null,
    defaultValue: string,
  ) => string;
  /** Reports a change of the language: the form renders again. */
  onChange?: (listener: () => void) => () => void;
}

/**
 * Where the adapter comes from: a factory, asked once per form with its `<form>` element (rendered with `form()`), or a
 * React hook, called on every render (e.g. for a React context). A shared adapter: `getAdapter: () => adapter`.
 */
type I18nConfig =
  | { type: 'factory'; getAdapter: (element: HTMLElement) => I18nAdapter }
  | { type: 'hook'; useAdapter: () => I18nAdapter };
