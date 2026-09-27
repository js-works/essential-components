import type { DataNavigatorComponent as Spec } from '../react/api';

export { columnItems, contextMenuItems, defaultActionOf, selectionModeOf, toolbarItems, variantOf };
export type { ActionInput, ActionItem, ContextMenuItem };

// The actions and menus as the app gives them.
type ActionInput<Row> = Spec.Action<Row> | Spec.ActionMenu<Row>;

// A separator as it is rendered: it has a key, made from its position in the list of the app (the app gives none).
type KeyedSeparator = Spec.ActionSeparator & { key: string };

// Omit that keeps the arms of a union (ActionLook has two) apart.
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

type MenuView<Row> =
  & DistributiveOmit<Spec.ActionMenu<Row>, 'actions'>
  & { actions: readonly (Spec.Action<Row> | KeyedSeparator)[] };

// The actions and menus as they are rendered (filtered by what is visible now).
type ActionItem<Row> = Spec.Action<Row> | MenuView<Row>;

// The entries of the context menu of a row: actions, menus (as submenus) and the separators between the groups.
type ContextMenuItem<Row> = ActionItem<Row> | KeyedSeparator;

function filterItems<Row>(
  items: readonly ActionInput<Row>[],
  visible: (action: Spec.Action<Row>) => boolean,
): readonly ActionItem<Row>[] {
  return items.flatMap((item): ActionItem<Row>[] => {
    if (item.type !== 'menu') {
      return visible(item) ? [item] : [];
    }

    const children = item.actions.map((child, index): Spec.Action<Row> | KeyedSeparator =>
      child.type === 'separator' ? { ...child, key: `separator-${index}` } : child
    );
    const actions = withoutUselessSeparators(children.filter((child) => child.type === 'separator' || visible(child)));

    return actions.some((child) => child.type !== 'separator') ? [{ ...item, actions }] : [];
  });
}

// A separator is only shown if there is a visible action before and after it: none at the start or at the end of a
// menu, and only one where several follow each other.
function withoutUselessSeparators<Child extends { type: string }>(children: readonly Child[]): Child[] {
  const result: Child[] = [];

  for (const child of children) {
    if (child.type === 'separator' && (result.length === 0 || result[result.length - 1]?.type === 'separator')) {
      continue;
    }

    result.push(child);
  }

  while (result[result.length - 1]?.type === 'separator') {
    result.pop();
  }

  return result;
}

// Actions shown above the table: general ones always, row actions for exactly one, rows actions for at least one.
function toolbarItems<Row>(items: readonly ActionInput<Row>[], selectedCount: number): readonly ActionItem<Row>[] {
  return filterItems(items, (action) => {
    switch (action.type) {
      case 'general':
        return true;
      case 'rows':
        return selectedCount >= 1;
      case 'row':
        return (action.show === 'toolbar' || action.show === 'both') && selectedCount === 1;
    }
  });
}

// Actions shown in the action column of every row.
function columnItems<Row>(items: readonly ActionInput<Row>[]): readonly ActionItem<Row>[] {
  return filterItems(items, (action) => {
    return action.type === 'row' && (action.show === undefined || action.show === 'column' || action.show === 'both');
  });
}

// The context menu of a row: first the actions of the clicked row (all single-row actions, wherever else they are
// shown; only while the menu is about one row, like in the toolbar), then those of the selected rows (multi-row, only
// with a selection), then the general ones and last the menus (as submenus, with the entries that apply here). A
// separator between the groups that are present.
function contextMenuItems<Row>(
  items: readonly ActionInput<Row>[],
  selection: Spec.SelectionMode,
  oneRow: boolean,
): readonly ContextMenuItem<Row>[] {
  const applies = (action: Spec.Action<Row>) =>
    action.type === 'general' || (action.type === 'row' ? oneRow : selection === 'multi');
  const plain = items.filter((item): item is Spec.Action<Row> => item.type !== 'menu' && applies(item));
  const menus = filterItems(items.filter((item) => item.type === 'menu'), applies);
  const groups: readonly (readonly ActionItem<Row>[])[] = [
    plain.filter((action) => action.type === 'row'),
    plain.filter((action) => action.type === 'rows'),
    [...plain.filter((action) => action.type === 'general'), ...menus],
  ];

  return groups
    .filter((group) => group.length > 0)
    .flatMap((group, index): ContextMenuItem<Row>[] =>
      index === 0 ? [...group] : [{ type: 'separator', key: `group-${index}` }, ...group]
    );
}

// The variant of an action or menu. Secondary is the default.
function variantOf<Row>(item: ActionItem<Row>): Spec.ActionVariant {
  return item.variant ?? 'secondary';
}

// The row action a double click on a row runs. The first one marked wins, the rest are ignored: the type cannot
// check that there is only one. It counts wherever it lives, also inside a menu, and whatever its `show` says.
function defaultActionOf<Row>(items: readonly ActionInput<Row>[]): Spec.RowAction<Row> | undefined {
  const actions = items.flatMap((item) => (item.type === 'menu' ? item.actions : [item]));

  return actions.find((action): action is Spec.RowAction<Row> => action.type === 'row' && action.default === true);
}

// The selection mode follows from the action definitions (never from what is visible at the moment):
// a rows action needs several selected rows, a row action in the toolbar needs one, everything else needs none.
function selectionModeOf<Row>(items: readonly ActionInput<Row>[]): Spec.SelectionMode {
  const actions = items.flatMap((item) => (item.type === 'menu' ? item.actions : [item]));

  if (actions.some((action) => action.type === 'rows')) {
    return 'multi';
  }

  if (actions.some((action) => action.type === 'row' && (action.show === 'toolbar' || action.show === 'both'))) {
    return 'single';
  }

  return 'none';
}
