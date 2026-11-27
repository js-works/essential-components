import type { NavDensity } from './base.js';
import type { I18nAdapter } from './i18n.js';
import type { NavGroup } from './navigation.js';
import type { CockpitTheme } from './theme.js';

export type {
  NavTreeClass,
  NavTreeClassConfig,
  NavTreeElement,
  NavTreeGroupDisplay,
  NavTreeItem,
  NavTreeNavigateDetail,
};

// An entry of the nav tree: a link.
type NavTreeItem = {
  id: string;
  title: string;
  href: string;
  // SVG markup, drawn in `currentColor` (the theme's `navTreeIconColor`); without one, no icon.
  icon?: string;
  // The tooltip (the link's `title`).
  description?: string;
  // The heading it is under; without one, the items without a group come first.
  group?: string;
  // The folder inside its group (collapsible, with a count); without one, the group's items without a folder come
  // first.
  subgroup?: string;
};

type NavTreeClassConfig = {
  // The first value of the element's `theme`.
  theme?: CockpitTheme;
  // The texts ("Other": the heading of the items without a group; the namespace `'cockpit'`): the adapter, the same for
  // every element of the class. Without one: English and en-US.
  i18n?: I18nAdapter;
  // Where the open and closed groups and folders are remembered per browser (`<storageKey>:groups`); without one, not
  // remembered.
  storageKey?: string;
};

type NavTreeClass = new() => NavTreeElement;

// How the groups are shown: `sections` (each a heading, or a toggle with `collapsible-groups`), or `select` (one group at
// a time, chosen in a dropdown on top; with one group only, as sections).
type NavTreeGroupDisplay = 'sections' | 'select';

// The detail of `navigate`: the item, and its link.
type NavTreeNavigateDetail = { id: string; href: string };

// The navigation tree (a sidebar's middle part): the groups as headings, the folders (collapsible, with an icon and a
// count, their items along a guide line), the items as links (icon, title, the active one marked). Up and Down (Home,
// End) move between them. No landmark of its own: the host wraps it in a `<nav>`.
//
// Slots: `top` and `bottom` (e.g. a title, a filter; links, a user row), fixed above and below the list (the group
// select between `top` and the list). With a height from the host (a flex item, or `height`), only the list scrolls;
// without one, the tree is as tall as its content.
//
// A plain click on an item fires the cancelable `navigate` (`NavTreeNavigateDetail`, bubbling, composed): a router
// cancels it and navigates itself; else the browser follows the link. Middle and modified clicks stay the browser's
// (a new tab).
type NavTreeElement = HTMLElement & {
  items: readonly NavTreeItem[];
  // The icons of the folders: `groups[].subgroups[].icon` (by the items' `group` and `subgroup`).
  groups: readonly NavGroup[];
  // The id of the active item (`aria-current`), `''` for none; the attribute `active`.
  active: string;
  // Items with a dot after their title (e.g. the open apps).
  marked: readonly string[];
  // The attribute `collapsible-groups`: the group headings are toggles with a count. Open by default: the group of the
  // active item, the items without a group, and every group when there are at most 30 items.
  collapsibleGroups: boolean;
  // The attribute `group-display` (`sections` by default). With `select`, the chosen group follows the active item and is
  // remembered per browser (`<storageKey>:group`).
  groupDisplay: NavTreeGroupDisplay;
  // The rows' height and the gaps: `compact`, `normal` (the default), `comfortable`; the attribute `density`.
  density: NavDensity;
  // Its first value the config's; switchable live (a new object).
  theme: CockpitTheme;
};
