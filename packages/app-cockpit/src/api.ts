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

// Where the navigation is: a sidebar on the left (the default), or a topbar of two lines.
export type Layout = 'sidebar' | 'topbar';

// The navigation's colors: always dark (the default), or like the page (light on a light page, dark on a dark one).
export type NavScheme = 'dark' | 'page';

export type Element = HTMLElement & {
  layout: Layout;
  navScheme: NavScheme;
  readonly activeApp: MiniApp | undefined;
  open(id: string): void;
};

export type ElementClass = new() => Element;
