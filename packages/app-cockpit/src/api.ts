export type MiniApp = {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  group?: string;
  subgroup?: string;
  element: string;
  attributes?: Readonly<Record<string, string>>;
  load?: () => Promise<unknown>;
};

export type Group = {
  name: string;
  icon?: string;
  subgroups?: readonly Subgroup[];
};

export type Subgroup = {
  name: string;
  icon?: string;
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

export type Config = {
  title?: string;
  subtitle?: string;
  search?: boolean;
  apps: readonly MiniApp[];
  groups?: readonly Group[];
  groupDisplay?: 'sections' | 'select';
  footer?: Footer;
  user?: User;
  userMenu?: readonly MenuSection[];
  defaultApp?: string;
  storageKey?: string;
};

// The navigation, in one value (2026-10-04; `layout`, `nav-lines` and `nav-style` before), named by where it is and a
// variant (2026-10-06; `sidebar`, `topbar`, `topbar-compact`, `switcher` before):
// - `side` (the default): a sidebar on the left;
// - `top`: a topbar of two lines (the groups, and below them the apps of the chosen group);
// - `top-compact`: a topbar of one line (a select for the group, then its apps);
// - `top-switcher`: a topbar of one line with one dropdown, the open app: a search panel with all apps;
// - `bottom` (2026-10-06): a bar at the bottom (phones): "Apps" (a sheet with the whole sidebar), the three apps used
//   last, the search;
// - `auto` (2026-10-06): by the cockpit's width: the sidebar, below 768px the bottom bar.
export type Nav = 'auto' | 'side' | 'top' | 'top-compact' | 'top-switcher' | 'bottom';

// The navigation's colors: always dark (the default), or like the page (light on a light page, dark on a dark one).
export type NavScheme = 'dark' | 'page';

// The density of the sidebar (its rows and the gaps between its sections and groups) and of the popups' rows; the
// same values as the data navigator's `density`. The topbar's lines and the font sizes stay.
export type Density = 'compact' | 'normal' | 'comfortable';

export type Element = HTMLElement & {
  nav: Nav;
  navScheme: NavScheme;
  density: Density;
  readonly activeApp: MiniApp | undefined;
  open(id: string): void;
};

export type ElementClass = new() => Element;
