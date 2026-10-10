export type NavItem = {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  group?: string;
  subgroup?: string;
  // Where it is in the navigation (2026-10-08): `pinned`: an entry of its own, first (the topbars' top line, the top of
  // the sidebar, the start page), not in its group; `hidden`: nowhere (not in the search, nor on the start page), only
  // opened by its hash, `open()` or a link. Without: in its group.
  placement?: 'pinned' | 'hidden';
  element: string;
  attributes?: Readonly<Record<string, string>>;
  load?: () => Promise<unknown>;
};

export type Group = {
  name: string;
  subgroups?: readonly Subgroup[];
};

export type Subgroup = {
  name: string;
  icon?: string;
  // `pinned` (2026-10-08): in the topbar and the rail an entry of its own after the pinned items (in the topbar a
  // dropdown of its items, in the rail its flyout button), not in its group. The expanded sidebar, the search and the
  // start page ignore it, like for items.
  placement?: 'pinned';
};

export type Choice = {
  value: string;
  label: string;
};

export type Choices = {
  options: readonly Choice[];
  value: () => string;
  onChange: (value: string) => void;
};

export type Action = {
  id: string;
  label: string;
  icon: string;
  badge?: boolean;
  onSelect?: () => void;
  choices?: Choices;
  // A menu of sections (with labels and checked items), e.g. several settings behind one button.
  menu?: readonly MenuSection[];
};

export type MenuItem = {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  // A choice: checked or not, read whenever the menu renders (the host keeps the state); a check in place of the icon.
  checked?: () => boolean;
  onSelect?: () => void;
};

// A section of a menu (separated by lines): its items, or with a label on top.
export type MenuSection = readonly MenuItem[] | { label?: string; items: readonly MenuItem[] };

export type User = {
  name: string;
  detail?: string;
  avatar?: string;
};

export type Footer = {
  actions?: readonly Action[];
  menu?: readonly MenuSection[];
};

// The cockpit's look (2026-10-10), a few values (the user's choice: what a host could override before, and the
// accent; the colors are the design language's). Without a key, its default. The element's `theme` can be switched
// live (a new object).
export type Theme = {
  // One color, lighter in the dark navigation by a mix with white (default: the design language's).
  accent?: string;
  // The base size of the cockpit's text and icons (default `14px`, the apps' normal text).
  fontSize?: string;
  // Default `system-ui, sans-serif`: the cockpit's own, so a mini-app's global CSS does not change it.
  fontFamily?: string;
  // The sidebar's default width (`256px`; the user can resize it), the rail's (`68px`).
  sidebarWidth?: string;
  railWidth?: string;
  // Around the open app beside the expanded sidebar and with the bottom bar (default `16px 20px`).
  contentPadding?: string;
};

export type Config = {
  title?: string;
  subtitle?: string;
  search?: boolean;
  items: readonly NavItem[];
  groups?: readonly Group[];
  groupDisplay?: 'sections' | 'select';
  // `false`: no "Recent" section in the sidebar and the search panel (default: shown with more than a few items).
  recent?: boolean;
  // `false`: the groups are plain headings, not collapsible, also with many items (default: collapsible with many items).
  collapsibleGroups?: boolean;
  footer?: Footer;
  user?: User;
  userMenu?: readonly MenuSection[];
  // The item opened without a hash (without a start page: else the first item; with one: else the start page).
  defaultItem?: string;
  // `true` (2026-10-08; `home` for a few hours): a start page, shown while no item is open (without a hash, unless
  // `defaultItem`, and when the last one is closed): a filter, and every item as a card, by folder. The logo opens it.
  // The first value of the element's `startPage` (the attribute `start-page`), which can be switched live.
  startPage?: boolean;
  storageKey?: string;
  // `true` (2026-10-07): a taskbar (`<app-taskbar>`) below the open item, with the items opened so far: switch between
  // them, close them. Not with the bottom bar.
  taskbar?: boolean;
  // The first value of the element's `theme`.
  theme?: Theme;
};

// The navigation, in one value (2026-10-04; `layout`, `nav-lines` and `nav-style` before), named by where it is and a
// variant (2026-10-06; `sidebar`, `topbar`, `topbar-compact`, `switcher` before):
// - `side` (the default): a sidebar on the left;
// - `top`: a topbar of one line, the pinned items as tabs, the groups as entries, each a two-pane menu (its subgroups,
//   the items of the shown one). `top-compact` until 2026-10-08, when the topbar of two lines (`top` then: the groups,
//   below them the chosen group's items) was removed;
// - `top-switcher`: a topbar of one line with one dropdown, the open item: a search panel with all items;
// - `bottom` (2026-10-06): a bar at the bottom (phones): "Apps" (a sheet with the whole sidebar), the three items used
//   last, the search;
// - `auto` (2026-10-06): by the cockpit's width: the sidebar, below 768px the bottom bar.
export type Nav = 'auto' | 'side' | 'top' | 'top-switcher' | 'bottom';

// The navigation's colors: always dark (the default), or like the page (light on a light page, dark on a dark one).
export type NavScheme = 'dark' | 'page';

// The density of the sidebar (its rows and the gaps between its sections and groups) and of the popups' rows; the
// same values as the data table's `density`. The topbar's lines and the font sizes stay.
export type Density = 'compact' | 'normal' | 'comfortable';

export type Element = HTMLElement & {
  nav: Nav;
  navScheme: NavScheme;
  density: Density;
  readonly activeItem: NavItem | undefined;
  open(id: string): void;
  // Closes an open item (removes its element, so its state is lost); the open one: the one used before it is shown.
  // The last open item cannot be closed, except with a start page (then that is shown).
  close(id: string): void;
  // A start page (the attribute `start-page`; see the config's `startPage`).
  startPage: boolean;
  // The look (see `Theme`); a new object to change it.
  theme: Theme;
};

export type ElementClass = new() => Element;

// --- The taskbar (`<app-taskbar>`, 2026-10-07) ----------------------------------------------------------------------

// An entry of the taskbar: an open app. `icon`: SVG markup, drawn in `currentColor`. `closable: false`: no close button.
export type Task = {
  id: string;
  title: string;
  icon?: string;
  closable?: boolean;
};

// The taskbar keeps no state: the host sets `tasks` and `active`, and gets `task-select` and `task-close` (a
// `CustomEvent<TaskEventDetail>`, bubbling, not composed), and `task-move` (`CustomEvent<TaskMoveEventDetail>`, a task
// dragged or moved by the keys to another place: the host reorders its `tasks`).
export type TaskbarElement = HTMLElement & {
  tasks: readonly Task[];
  active: string | undefined;
  // The look (2026-10-10; see `Theme`): the cockpit passes its own.
  theme: Theme;
};

export type TaskEventDetail = { id: string };

// `index`: the task's new place in `tasks` (counted after taking it out).
export type TaskMoveEventDetail = { id: string; index: number };

export type TaskbarElementClass = new() => TaskbarElement;
