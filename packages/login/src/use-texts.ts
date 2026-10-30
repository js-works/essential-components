import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import type { loginResources } from './texts.js';

export type { LoginText, LoginTextKey };
export { useTexts };

type LoginTextKey = keyof (typeof loginResources)['en']['login'];

type LoginText = (key: LoginTextKey, params?: Readonly<Record<string, string>>) => string;

// The texts of the namespace `login`, from the app's i18next instance, following its language. Typed by the package's
// own keys, whatever types the app declares for its resources (`CustomTypeOptions`).
function useTexts(): LoginText {
  const { i18n } = useTranslation();
  const t = i18n.getFixedT(null, 'login' as never) as unknown as TFunction;

  return (key, params) => t(key as never, params as never) as unknown as string;
}
