import type { ReactNode } from 'react';
import type { DataNavigator } from '../src';
import type { DemoActions } from './controls';
import type { User } from './data';

export { createActions, fullName };
export type { DemoIcons };

function fullName(user: User): string {
  return `${user.firstName} ${user.lastName}`;
}

type Item = DataNavigator.Action<User> | DataNavigator.ActionMenu<User>;

// The icons of the actions.
type DemoIcons = { add: ReactNode; edit: ReactNode; remove: ReactNode };

// The selection mode of the table follows from these actions: general and column-only row actions need no selection,
// a row action in the toolbar needs single selection, and a rows action needs multi selection.
// With `variants`, "Add user" is the primary action and the deletes are danger actions. Without, all are secondary.
function createActions(
  report: (message: string) => void,
  mode: DemoActions,
  icons: DemoIcons,
  variants: boolean,
): readonly Item[] {
  const primary = variants ? 'primary' : 'secondary';
  const danger = variants ? 'danger' : 'secondary';

  const add: Item = {
    type: 'general',
    key: 'add',
    label: 'Add user',
    icon: icons.add,
    variant: primary,
    onClick: () => report('Add user'),
  };

  // The default action: a double click on the free space of a row runs it, as well as its button.
  const edit: Item = {
    type: 'row',
    key: 'edit',
    icon: icons.edit,
    tip: 'Edit user',
    default: true,
    onClick: (user) => report(`Edit ${fullName(user)}`),
  };

  // An icon-only danger action for a single row. In the action column of every row, and in single-row mode also in the
  // toolbar (for the selected row): that toolbar action is what needs the single selection.
  const removeRow = (show: 'column' | 'both'): Item => ({
    type: 'row',
    key: 'delete-user',
    icon: icons.remove,
    tip: 'Delete user',
    variant: danger,
    show,
    onClick: (user) => report(`Delete ${fullName(user)}`),
  });

  const remove: Item = {
    type: 'rows',
    key: 'delete',
    label: 'Delete',
    icon: icons.remove,
    variant: danger,
    onClick: (users) => report(`Delete ${users.map(fullName).join(', ')}`),
  };

  // "Export all" needs no selection (general actions). "Export selection" needs selected rows (rows actions): it only
  // exists in the multi-row set, and it is only visible while at least one row is selected.
  const exportMenu = (withSelection: boolean): Item => {
    const actions: (DataNavigator.Action<User> | DataNavigator.ActionSeparator)[] = [
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
          type: 'rows',
          key: 'export-selection-csv',
          label: 'Export selection to CSV',
          onClick: (users) => report(`Export ${users.length} selected user(s) to CSV`),
        },
        {
          type: 'rows',
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
