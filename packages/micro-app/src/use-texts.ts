import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import type { microAppResources } from './texts.js';

export type { MicroAppTextKey };
export { useTexts };

type MicroAppTextKey = keyof (typeof microAppResources)['en']['microApp'];

// The texts of the namespace `microApp`, from the app's i18next instance, following its language. Typed by the
// package's own keys, whatever types the app declares for its resources (`CustomTypeOptions`).
function useTexts(): { text: (key: MicroAppTextKey) => string; t: TFunction } {
  const { i18n } = useTranslation();
  const t = i18n.getFixedT(null, 'microApp' as never) as unknown as TFunction;

  return { text: (key) => t(key as never) as unknown as string, t };
}
