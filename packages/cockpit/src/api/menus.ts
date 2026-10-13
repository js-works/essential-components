export type { Action, Choice, Choices, Footer, MenuItem, MenuSection, User };

type Choice = {
  value: string;
  label: string;
};

type Choices = {
  options: readonly Choice[];
  value: () => string;
  onChange: (value: string) => void;
};

type Action = {
  id: string;
  label: string;
  icon: string;
  badge?: boolean;
  onSelect?: () => void;
  choices?: Choices;
  // A menu of sections (with labels and checked items), e.g. several settings behind one button.
  menu?: readonly MenuSection[];
};

type MenuItem = {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  // A choice: checked or not, read whenever the menu renders (the host keeps the state); a check in place of the icon.
  checked?: () => boolean;
  onSelect?: () => void;
};

// A section of a menu (separated by lines): its items, or with a label on top.
type MenuSection = readonly MenuItem[] | { label?: string; items: readonly MenuItem[] };

type User = {
  name: string;
  detail?: string;
  avatar?: string;
};

type Footer = {
  actions?: readonly Action[];
  menu?: readonly MenuSection[];
};
