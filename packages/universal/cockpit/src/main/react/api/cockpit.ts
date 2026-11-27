import type { ReactNode } from 'react';

import type { CockpitClassConfig, CockpitElement, CockpitNavigateDetail, NavDensity } from '../../api/base.js';
import type { CockpitAction, MenuSection, SignedInUser } from '../../api/menus.js';
import type { NavGroup, NavItem, NavLayout, NavScheme } from '../../api/navigation.js';
import type { CockpitTheme } from '../../api/theme.js';
import type { CockpitCommonProps, CockpitComponentI18n } from './base.js';

export type { CockpitComponentConfig, CockpitProps };

type CockpitComponentConfig = Omit<CockpitClassConfig, 'i18n'> & CockpitComponentI18n;

// The element's properties (see `CockpitElement`; a missing prop is the element's default, `theme` the config's), its
// slots as nodes, its event as a callback. The open app's element is the cockpit's own child, not React's.
type CockpitProps = CockpitCommonProps<CockpitElement> & {
  headline?: string;
  subheadline?: string;
  items?: readonly NavItem[];
  groups?: readonly NavGroup[];
  groupDisplay?: 'sections' | 'select';
  actions?: readonly CockpitAction[];
  menu?: readonly MenuSection[];
  user?: SignedInUser | null;
  userMenu?: readonly MenuSection[];
  defaultItem?: string;
  search?: 'auto' | 'always' | 'never';
  collapsibleGroups?: 'auto' | 'never';
  recentCount?: number;
  taskbar?: boolean;
  active?: string;
  nav?: NavLayout;
  navScheme?: NavScheme;
  density?: NavDensity;
  startPage?: boolean;
  theme?: CockpitTheme;
  logo?: ReactNode;
  sidebarEnd?: ReactNode;
  // The user asks for an item (the DOM event: `preventDefault()` cancels it, then the host sets `active`).
  onNavigate?: (event: CustomEvent<CockpitNavigateDetail>) => void;
};
