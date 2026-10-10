import type { DataTableComponent as Spec } from '../react/api';

export {
  columnItems,
  contextMenuItems,
  defaultActionOf,
  generalToolbarItems,
  groupContextMenuItems,
  groupItems,
  pinnedToolbarItems,
  selectionModeOf,
  selectionToolbarItems,
  variantOf,
};
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

// The general actions: in the toolbar's bar while nothing is selected. Not the pinned ones (below); in a menu, `pinned`
// does nothing.
function generalToolbarItems<Row>(items: readonly ActionInput<Row>[]): readonly ActionItem<Row>[] {
  return filterItems(items.filter((item) => !isPinned(item)), (action) => action.type === 'general');
}

// The pinned general actions (`pinned: true`, 2026-10-10, e.g. "Up" to the parent folder): at the very start of the bar,
// and kept in the selection bar too, in the order of the app.
function pinnedToolbarItems<Row>(items: readonly ActionInput<Row>[]): readonly ActionItem<Row>[] {
  return items.filter(isPinned);
}

function isPinned<Row>(item: ActionInput<Row>): item is Spec.GeneralAction {
  return item.type === 'general' && item.pinned === true;
}

// The actions on the selection: in the selection bar, which replaces the toolbar's bar while rows are selected. Row
// actions (of the toolbar) for exactly one selected row, rows actions for at least one. Hidden, not disabled, otherwise.
function selectionToolbarItems<Row>(
  items: readonly ActionInput<Row>[],
  selectedCount: number,
  // The selected row, when it is exactly one (for `visible`).
  selectedRow?: Row,
): readonly ActionItem<Row>[] {
  return filterItems(items, (action) => {
    switch (action.type) {
      case 'general':
      case 'group':
        return false;
      case 'multiRow':
        return selectedCount >= 1;
      case 'singleRow':
        return (action.show === 'toolbar' || action.show === 'both') && selectedCount === 1
          && (selectedRow === undefined || visibleFor(action, selectedRow));
    }
  });
}

// Actions shown in the action column of a row (without `row`: of any row, e.g. whether there is an action column).
function columnItems<Row>(items: readonly ActionInput<Row>[], row?: Row): readonly ActionItem<Row>[] {
  return filterItems(items, (action) => {
    return action.type === 'singleRow'
      && (action.show === undefined || action.show === 'column' || action.show === 'both')
      && (row === undefined || visibleFor(action, row));
  });
}

// Whether a single-row action is there for a row (`visible`, 2026-10-10: e.g. "Open" only for folders): in the action
// column, the context menu, the selection bar and as the default action. Without `visible`: for every row.
function visibleFor<Row>(action: Spec.RowAction<Row>, row: Row): boolean {
  return action.visible?.(row) ?? true;
}

// Actions shown at the end of every group header (`groupBy`), in the action column.
function groupItems<Row>(items: readonly ActionInput<Row>[]): readonly ActionItem<Row>[] {
  return filterItems(items, (action) => action.type === 'group');
}

// The context menu of a group header: its group actions (menus as submenus), without those with `contextMenu: false`.
function groupContextMenuItems<Row>(items: readonly ActionInput<Row>[]): readonly ContextMenuItem<Row>[] {
  return filterItems(items, (action) => action.type === 'group' && action.contextMenu !== false);
}

// The context menu of a row: first the actions of the clicked row (all single-row actions, wherever else they are
// shown; only while the menu is about one row, like in the toolbar), then those of the selected rows (multi-row, only
// with a selection), then the general ones and last the menus (as submenus, with the entries that apply here). A
// separator between the groups that are present.
function contextMenuItems<Row>(
  items: readonly ActionInput<Row>[],
  selection: Spec.SelectionMode,
  oneRow: boolean,
  // The row it is opened on (for `visible`).
  row?: Row,
): readonly ContextMenuItem<Row>[] {
  // An action with `contextMenu: false` is never there (also not inside a menu), e.g. one that does the same as another.
  const applies = (action: Spec.Action<Row>) =>
    action.contextMenu !== false
    && action.type !== 'group'
    && (action.type === 'general'
      || (action.type === 'singleRow'
        ? oneRow && (row === undefined || visibleFor(action, row))
        : selection === 'multi'));
  const plain = items.filter((item): item is Spec.Action<Row> => item.type !== 'menu' && applies(item));
  const menus = filterItems(items.filter((item) => item.type === 'menu'), applies);
  const groups: readonly (readonly ActionItem<Row>[])[] = [
    plain.filter((action) => action.type === 'singleRow'),
    plain.filter((action) => action.type === 'multiRow'),
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

// The row action a double click on a row runs. The first one marked that is there for the row (`visible`) wins, the
// rest are ignored: e.g. "Open" for a folder, "Details" for a file (2026-10-10; before, only the first one marked
// counted). It counts wherever it lives, also inside a menu, and whatever its `show` says. Without `row`: the first one
// marked (whether there is a default action at all).
function defaultActionOf<Row>(items: readonly ActionInput<Row>[], row?: Row): Spec.RowAction<Row> | undefined {
  const actions = items.flatMap((item) => (item.type === 'menu' ? item.actions : [item]));

  return actions.find((action): action is Spec.RowAction<Row> =>
    action.type === 'singleRow' && action.default === true && (row === undefined || visibleFor(action, row))
  );
}

// The selection mode follows from the action definitions (never from what is visible at the moment):
// a rows action needs several selected rows, a row action in the toolbar needs one, everything else needs none.
function selectionModeOf<Row>(items: readonly ActionInput<Row>[]): Spec.SelectionMode {
  const actions = items.flatMap((item) => (item.type === 'menu' ? item.actions : [item]));

  if (actions.some((action) => action.type === 'multiRow')) {
    return 'multi';
  }

  if (actions.some((action) => action.type === 'singleRow' && (action.show === 'toolbar' || action.show === 'both'))) {
    return 'single';
  }

  return 'none';
}
