import type { AriaAttributes, CSSProperties, Ref } from 'react';

import type { I18nAdapter } from '../../api/i18n.js';

export type { CockpitCommonProps, CockpitComponentI18n };

// The props every component of the package takes, passed on to its element.
type CockpitCommonProps<E extends HTMLElement> = AriaAttributes & {
  [key: `data-${string}`]: string | undefined;
  id?: string;
  className?: string;
  style?: CSSProperties;
  lang?: string;
  ref?: Ref<E>;
};

// The i18n of a component: a hook, called on every render (`i18n.md`); its adapter is set on the element.
type CockpitComponentI18n = {
  useI18n?: () => I18nAdapter;
};
