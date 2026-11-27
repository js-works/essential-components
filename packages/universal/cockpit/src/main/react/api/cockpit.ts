import type { ReactNode } from 'react';

import type { CockpitClassConfig, CockpitElement, NavDensity } from '../../api/base.js';
import type { NavLayout, NavScheme } from '../../api/navigation.js';
import type { CockpitTheme } from '../../api/theme.js';
import type { CockpitCommonProps, CockpitComponentI18n } from './base.js';

export type { CockpitComponentConfig, CockpitProps };

// The cockpit's config (its items, groups, footer, …), fixed per component like the class's.
type CockpitComponentConfig = Omit<CockpitClassConfig, 'i18n'> & CockpitComponentI18n;

// The element's properties (see `CockpitElement`; a missing prop is the element's default, `startPage` and `theme` the
// config's), its slots as nodes. The open app's element is the cockpit's own child, not React's.
type CockpitProps = CockpitCommonProps<CockpitElement> & {
  nav?: NavLayout;
  navScheme?: NavScheme;
  density?: NavDensity;
  startPage?: boolean;
  theme?: CockpitTheme;
  logo?: ReactNode;
  sidebarEnd?: ReactNode;
};
