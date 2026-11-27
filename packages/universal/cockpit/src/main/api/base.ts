import type { I18nAdapter } from './i18n.js';
import type { CockpitAction, MenuSection, SignedInUser } from './menus.js';
import type { NavGroup, NavItem, NavLayout, NavScheme } from './navigation.js';
import type { CockpitTheme } from './theme.js';

export type { CockpitClass, CockpitClassConfig, CockpitElement, CockpitNavigateDetail, NavDensity };

// Only what is per class; the data and the parts are the element's properties (see `CockpitElement`).
type CockpitClassConfig = {
  // The first value of the element's `theme`.
  theme?: CockpitTheme;
  // The texts (the namespace `'cockpit'`, `CockpitTextKey`): the adapter, the same for every element of the class.
  // Without one: English and en-US.
  i18n?: I18nAdapter;
};

// The density of the sidebar (its rows and the gaps between its sections and groups) and of the popups' rows; the
// same values as the data table's `density`. The topbar's lines and the font sizes stay.
type NavDensity = 'compact' | 'normal' | 'comfortable';

// The cockpit: every property switchable live (a new array or object to change one). It never touches the URL: the
// open item is `active`, and the user's choice of one is the cancelable event `navigate` (`CockpitNavigateDetail`,
// bubbling): not canceled, the cockpit sets `active` itself; a router cancels it and sets `active` once it has
// navigated (or `routeByHash()` does it with the URL's hash). Nothing is shown before the first `items`; an open item
// that is no longer in them is closed (`navigate` to the one used before it).
type CockpitElement = HTMLElement & {
  // The attributes `headline` and `subheadline`: the product's name and a line below it (the sidebar's brand, the
  // topbar's, the start page's title). Not `title`: the browser would show it as a tooltip.
  headline: string;
  subheadline: string;
  items: readonly NavItem[];
  // The extra data of the groups and their subgroups (by the items' `group` and `subgroup`): the subgroups' icons and
  // placement.
  groups: readonly NavGroup[];
  // The attribute `group-display`: `sections` (the default) or `select` (one group at a time, a select on top).
  groupDisplay: 'sections' | 'select';
  // The host's buttons, and the sections of the kebab menu after them.
  actions: readonly CockpitAction[];
  menu: readonly MenuSection[];
  // The signed-in user (a row above the footer; `null`: none) and their menu.
  user: SignedInUser | null;
  userMenu: readonly MenuSection[];
  // The attribute `default-item`: the item opened without a hash (`''`: the first item, or the start page).
  defaultItem: string;
  // The attribute `search`: the search panel (Ctrl K) `always`, `never`, or `auto` (the default: with more than a few
  // items).
  search: 'auto' | 'always' | 'never';
  // The attribute `collapsible-groups`: `auto` (the default: collapsible with many items) or `never` (plain headings).
  collapsibleGroups: 'auto' | 'never';
  // The attribute `recent-count`: the items of "Recent" (default 5; `0`: no "Recent").
  recentCount: number;
  // The attribute `taskbar`: the opened items below the open one, to switch and close (not with the bottom bar).
  taskbar: boolean;
  // The attribute `active`: the open item's id. Empty or unknown: at the start the default item (`defaultItem`, else
  // the first; or the start page), which `active` then becomes; later the start page (with `startPage`), else the
  // default item.
  active: string;
  nav: NavLayout;
  navScheme: NavScheme;
  density: NavDensity;
  // The attribute `start-page`: a start page while no item is open (a filter, every item as a card, by folder; the logo
  // opens it).
  startPage: boolean;
  // The look (see `CockpitTheme`; its first value the config's); a new object to change it.
  theme: CockpitTheme;
  readonly activeItem: NavItem | undefined;
  // Opens an item by code, like the user: `navigate`, then (not canceled) `active`.
  open(id: string): void;
  // Closes an open item (removes its element, so its state is lost); the open one: the one used before it is shown.
  // The last open item cannot be closed, except with a start page (then that is shown).
  close(id: string): void;
};

type CockpitClass = new() => CockpitElement;

// The item the user asks for (`''`: the start page).
type CockpitNavigateDetail = {
  id: string;
};
