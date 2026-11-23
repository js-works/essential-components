export type { I18nAdapter };

type I18nAdapter = {
  currentLocale: () => string;
  resolveText: (
    namespace: string,
    key: string,
    params: Readonly<Record<string, unknown>> | null,
    defaultValue: string,
  ) => string;
  onChange?: (listener: () => void) => () => void;
};
