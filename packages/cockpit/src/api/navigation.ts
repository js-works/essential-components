export type { NavGroup, NavItem, NavLayout, NavScheme, NavSubgroup };

type NavItem = {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  group?: string;
  subgroup?: string;
  // Where it is in the navigation: `pinned`: an entry of its own, first (the topbars' top line, the top of
  // the sidebar, the start page), not in its group; `hidden`: nowhere (not in the search, nor on the start page), only
  // opened by its hash, `open()` or a link. Without: in its group.
  placement?: 'pinned' | 'hidden';
  element: string;
  attributes?: Readonly<Record<string, string>>;
  load?: () => Promise<unknown>;
};

type NavGroup = {
  name: string;
  subgroups?: readonly NavSubgroup[];
};

type NavSubgroup = {
  name: string;
  icon?: string;
  // `pinned`: in the topbar and the rail an entry of its own after the pinned items (in the topbar a
  // dropdown of its items, in the rail its flyout button), not in its group. The expanded sidebar, the search and the
  // start page ignore it, like for items.
  placement?: 'pinned';
};

// The navigation, in one value, named by where it is and a variant:
// - `side` (the default): a sidebar on the left;
// - `top`: a topbar of one line, the pinned items as tabs, the groups as entries, each a two-pane menu (its subgroups,
//   the items of the shown one);
// - `top-switcher`: a topbar of one line with one dropdown, the open item: a search panel with all items;
// - `bottom`: a bar at the bottom (phones): "Apps" (a sheet with the whole sidebar), the three items used last, the
//   search;
// - `auto`: by the cockpit's width: the sidebar, below 768px the bottom bar.
type NavLayout = 'auto' | 'side' | 'top' | 'top-switcher' | 'bottom';

// The navigation's colors: always dark (the default), or like the page (light on a light page, dark on a dark one).
type NavScheme = 'dark' | 'page';
