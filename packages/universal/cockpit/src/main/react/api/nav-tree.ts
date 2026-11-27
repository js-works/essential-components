import type { ReactNode } from 'react';

import type { NavDensity } from '../../api/base.js';
import type {
  NavTreeClassConfig,
  NavTreeElement,
  NavTreeGroupDisplay,
  NavTreeItem,
  NavTreeNavigateDetail,
} from '../../api/nav-tree.js';
import type { NavGroup } from '../../api/navigation.js';
import type { CockpitTheme } from '../../api/theme.js';
import type { CockpitCommonProps, CockpitComponentI18n } from './base.js';

export type { NavTreeComponentConfig, NavTreeProps };

type NavTreeComponentConfig = Omit<NavTreeClassConfig, 'i18n'> & CockpitComponentI18n;

// The element's properties (see `NavTreeElement`; a missing prop is the element's default, `theme` the config's), its
// slots as nodes, its event as a callback (the DOM event: `preventDefault()` cancels it).
type NavTreeProps = CockpitCommonProps<NavTreeElement> & {
  items?: readonly NavTreeItem[];
  groups?: readonly NavGroup[];
  active?: string;
  marked?: readonly string[];
  collapsibleGroups?: boolean;
  groupDisplay?: NavTreeGroupDisplay;
  density?: NavDensity;
  theme?: CockpitTheme;
  top?: ReactNode;
  bottom?: ReactNode;
  onNavigate?: (event: CustomEvent<NavTreeNavigateDetail>) => void;
};
