export type {
  ActionSeparator,
  ActionVariant,
  ColumnAlign,
  FooterMode,
  RowActionLook,
  SelectionAppearance,
  SelectionMode,
  TableDensity,
  TableLayout,
};

type SelectionMode = 'none' | 'single' | 'multi';

type TableDensity = 'compact' | 'normal' | 'comfortable';

type FooterMode = 'always' | 'auto' | 'never';

type TableLayout = 'auto' | 'table' | 'cards';

type SelectionAppearance = 'neutral' | 'accent';

type RowActionLook = 'icon' | 'label' | 'iconAndLabel';

type ColumnAlign = 'start' | 'center' | 'end';

type ActionVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';

type ActionSeparator = { type: 'separator' };
