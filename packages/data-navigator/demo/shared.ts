import type { ReactNode } from 'react';
import type { DataNavigatorComponent } from '../src/react';
import type { DemoActions } from './controls';
import type { User } from './data';

export { createActions, fullName };
export type { DemoIcons };

function fullName(user: User): string {
  return `${user.firstName} ${user.lastName}`;
}

type Item = DataNavigatorComponent.Action<User> | DataNavigatorComponent.ActionMenu<User>;

// The icons of the actions.
type DemoIcons = { add: ReactNode; edit: ReactNode; remove: ReactNode };

// The selection mode of the table follows from these actions: general and column-only row actions need no selection,
// a row action in the toolbar needs single selection, and a rows action needs multi selection.
// With `variants`, "Add user" is the primary action and the deletes are danger actions. Without, all are secondary.
// "Edit" opens the edit form of the row (`editRow` of the controller), "Add user" a new row (`addRow`).
function createActions(
  report: (message: string) => void,
  mode: DemoActions,
  icons: DemoIcons,
  variants: boolean,
  rows: { editRow: (user: User) => void; addRow: () => void },
): readonly Item[] {
  const primary = variants ? 'primary' : 'secondary';
  const danger = variants ? 'danger' : 'secondary';

  const add: Item = {
    type: 'general',
    key: 'add',
    label: 'Add user',
    icon: icons.add,
    variant: primary,
    onClick: rows.addRow,
  };

  // The default action: a double click on the free space of a row runs it, as well as its button. It opens the edit
  // form below the row (see `saveRow` of the table).
  const edit: Item = {
    type: 'singleRow',
    key: 'edit',
    label: 'Edit',
    icon: icons.edit,
    tip: 'Edit user',
    default: true,
    onClick: rows.editRow,
  };

  // A danger action for a single row (how the action column shows it: the "Row actions" selector, `rowActionLook`; the
  // tip is its name there when only the icon is shown). In the action column of every row, and in single-row mode also in the
  // toolbar (for the selected row): that toolbar action is what needs the single selection.
  const removeRow = (show: 'column' | 'both'): Item => ({
    type: 'singleRow',
    key: 'delete-user',
    label: 'Delete',
    icon: icons.remove,
    tip: 'Delete user',
    variant: danger,
    show,
    onClick: (user) => report(`Delete ${fullName(user)}`),
  });

  const remove: Item = {
    type: 'multiRow',
    key: 'delete',
    label: 'Delete',
    icon: icons.remove,
    variant: danger,
    onClick: (users) => report(`Delete ${users.map(fullName).join(', ')}`),
  };

  // "Export all" needs no selection (general actions). "Export selection" needs selected rows (rows actions): it only
  // exists in the multi-row set, and it is only visible while at least one row is selected.
  const exportMenu = (withSelection: boolean): Item => {
    const actions: (DataNavigatorComponent.Action<User> | DataNavigatorComponent.ActionSeparator)[] = [
      {
        type: 'general',
        key: 'export-all-csv',
        label: 'Export all to CSV',
        onClick: () => report('Export all to CSV'),
      },
      {
        type: 'general',
        key: 'export-all-excel',
        label: 'Export all to Excel',
        onClick: () => report('Export all to Excel'),
      },
    ];

    if (withSelection) {
      actions.push(
        { type: 'separator' },
        {
          type: 'multiRow',
          key: 'export-selection-csv',
          label: 'Export selection to CSV',
          onClick: (users) => report(`Export ${users.length} selected user(s) to CSV`),
        },
        {
          type: 'multiRow',
          key: 'export-selection-excel',
          label: 'Export selection to Excel',
          onClick: (users) => report(`Export ${users.length} selected user(s) to Excel`),
        },
      );
    }

    return { type: 'menu', key: 'export', label: 'Export', actions };
  };

  switch (mode) {
    case 'general':
      return [add, edit, removeRow('column'), exportMenu(false)];
    case 'single-row':
      return [add, edit, removeRow('both'), exportMenu(false)];
    case 'multi-row':
      return [add, edit, removeRow('column'), remove, exportMenu(true)];
  }
}
