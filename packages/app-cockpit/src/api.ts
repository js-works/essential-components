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

// The navigation, in one value (2026-10-04; `layout`, `nav-lines` and `nav-style` before):
// - `sidebar` (the default): a sidebar on the left;
// - `topbar`: a topbar of two lines (the groups, and below them the apps of the chosen group);
// - `topbar-compact`: a topbar of one line (a select for the group, then its apps);
// - `switcher`: a topbar of one line with one dropdown, the open app: a search panel with all apps.
export type Nav = 'sidebar' | 'topbar' | 'topbar-compact' | 'switcher';

// The navigation's colors: always dark (the default), or like the page (light on a light page, dark on a dark one).
export type NavScheme = 'dark' | 'page';

export type Element = HTMLElement & {
  nav: Nav;
  navScheme: NavScheme;
  readonly activeApp: MiniApp | undefined;
  open(id: string): void;
};

export type ElementClass = new() => Element;
