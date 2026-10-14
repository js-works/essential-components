import type { CockpitFooter, MenuSection, SignedInUser } from './menus.js';
import type { NavGroup, NavItem } from './navigation.js';
import type { CockpitTheme } from './theme.js';

export type { CockpitClassConfig };

type CockpitClassConfig = {
  title?: string;
  subtitle?: string;
  search?: boolean;
  items: readonly NavItem[];
  groups?: readonly NavGroup[];
  groupDisplay?: 'sections' | 'select';
  // `false`: no "Recent" section in the sidebar and the search panel (default: shown with more than a few items).
  recent?: boolean;
  // `false`: the groups are plain headings, not collapsible, also with many items (default: collapsible with many items).
  collapsibleGroups?: boolean;
  footer?: CockpitFooter;
  user?: SignedInUser;
  userMenu?: readonly MenuSection[];
  // The item opened without a hash (without a start page: else the first item; with one: else the start page).
  defaultItem?: string;
  // `true`: a start page, shown while no item is open (without a hash, unless
  // `defaultItem`, and when the last one is closed): a filter, and every item as a card, by folder. The logo opens it.
  // The first value of the element's `startPage` (the attribute `start-page`), which can be switched live.
  startPage?: boolean;
  storageKey?: string;
  // `true`: a taskbar (an internal element) below the open item, with the items opened so far: switch
  // between them, close them. Not with the bottom bar.
  taskbar?: boolean;
  // The first value of the element's `theme`.
  theme?: CockpitTheme;
};
