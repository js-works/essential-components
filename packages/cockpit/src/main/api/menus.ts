export type { ActionChoice, ActionChoices, CockpitFooter, FooterAction, MenuItem, MenuSection, SignedInUser };

type ActionChoice = {
  value: string;
  label: string;
};

type ActionChoices = {
  options: readonly ActionChoice[];
  value: () => string;
  onChange: (value: string) => void;
};

type FooterAction = {
  id: string;
  label: string;
  icon: string;
  badge?: boolean;
  onSelect?: () => void;
  choices?: ActionChoices;
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

type SignedInUser = {
  name: string;
  detail?: string;
  avatar?: string;
};

type CockpitFooter = {
  actions?: readonly FooterAction[];
  menu?: readonly MenuSection[];
};
