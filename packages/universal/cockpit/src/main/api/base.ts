import type { I18nAdapter } from './i18n.js';
import type { CockpitFooter, MenuSection, SignedInUser } from './menus.js';
import type { NavGroup, NavItem, NavLayout, NavScheme } from './navigation.js';
import type { CockpitTheme } from './theme.js';

export type { CockpitClass, CockpitClassConfig, CockpitElement, NavDensity };

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
  // The texts (the namespace `'cockpit'`, `CockpitTexts`): the adapter, asked once on the first connect with the element
  // itself. Without one: English and en-US.
  i18n?: { type: 'factory'; getAdapter: (element: HTMLElement) => I18nAdapter };
};

// The density of the sidebar (its rows and the gaps between its sections and groups) and of the popups' rows; the
// same values as the data table's `density`. The topbar's lines and the font sizes stay.
type NavDensity = 'compact' | 'normal' | 'comfortable';

type CockpitElement = HTMLElement & {
  nav: NavLayout;
  navScheme: NavScheme;
  density: NavDensity;
  readonly activeItem: NavItem | undefined;
  open(id: string): void;
  // Closes an open item (removes its element, so its state is lost); the open one: the one used before it is shown.
  // The last open item cannot be closed, except with a start page (then that is shown).
  close(id: string): void;
  // A start page (the attribute `start-page`; see the config's `startPage`).
  startPage: boolean;
  // The look (see `CockpitTheme`); a new object to change it.
  theme: CockpitTheme;
};

type CockpitClass = new() => CockpitElement;
