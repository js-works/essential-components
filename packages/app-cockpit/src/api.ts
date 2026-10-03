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
};

export type MenuItem = {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  onSelect?: () => void;
};

export type User = {
  name: string;
  detail?: string;
  avatar?: string;
};

export type Footer = {
  actions?: readonly Action[];
  menu?: readonly (readonly MenuItem[])[];
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
  userMenu?: readonly (readonly MenuItem[])[];
  defaultApp?: string;
  storageKey?: string;
};

// Where the navigation is: a sidebar on the left (the default), or a topbar of two lines.
export type Layout = 'sidebar' | 'topbar';

export type Element = HTMLElement & {
  layout: Layout;
  readonly activeApp: MiniApp | undefined;
  open(id: string): void;
};

export type ElementClass = new() => Element;
