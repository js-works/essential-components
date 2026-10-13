export type {
  ActionSeparator,
  ActionVariant,
  ColumnAlign,
  Density,
  FooterMode,
  Layout,
  RowActionLook,
  SelectionAppearance,
  SelectionMode,
};

type SelectionMode = 'none' | 'single' | 'multi';

type Density = 'compact' | 'normal' | 'comfortable';

type FooterMode = 'always' | 'auto' | 'never';

type Layout = 'auto' | 'table' | 'cards';

type SelectionAppearance = 'neutral' | 'accent';

type RowActionLook = 'icon' | 'label' | 'iconAndLabel';

type ColumnAlign = 'start' | 'center' | 'end';

type ActionVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';

type ActionSeparator = { type: 'separator' };
