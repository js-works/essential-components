export type { ActionChoice, ActionChoices, CockpitAction, MenuItem, MenuSection, SignedInUser };

type ActionChoice = {
  value: string;
  label: string;
};

type ActionChoices = {
  options: readonly ActionChoice[];
  value: () => string;
  onChange: (value: string) => void;
};

// One of the host's buttons of the cockpit (its icon, its label as the tooltip): in the sidebar's footer, on the right
// of the topbar's line, in the bottom bar's sheet. A click: `onSelect`, a menu of `choices` or one of sections (`menu`).
type CockpitAction = {
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
  // A choice: checked or not, read whenever the menu renders (the host keeps the state); a check before its icon.
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
