import type { ReactNode } from 'react';

import type { ActionMenu, ActionSeparator, TableAction } from '../src/react/index.js';
import { generalAction, multiRowAction, singleRowAction } from '../src/react/index.js';
import type { DemoActions } from './controls.js';
import type { User } from './data.js';

export type { DemoIcons };
export { createActions, fullName };

function fullName(user: User): string {
  return `${user.firstName} ${user.lastName}`;
}

type Item = TableAction<User> | ActionMenu<User>;

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
  // The rarer actions as ghost buttons (2026-10-11, `tertiary`).
  const tertiary = variants ? 'tertiary' : 'secondary';

  // The actions are made by the builders (`generalAction`, `singleRowAction`, `multiRowAction`): the key, the handler,
  // the other fields.
  const add = generalAction('add', rows.addRow, { label: 'Add user', icon: icons.add, variant: primary });

  // The default action: a double click on the free space of a row runs it, as well as its button. It opens the edit
  // form below the row (see `saveRow` of the table).
  const edit = singleRowAction('edit', rows.editRow, {
    label: 'Edit',
    icon: icons.edit,
    tip: 'Edit user',
    default: true,
  });

  // A danger action for a single row (how the action column shows it: the "Row actions" selector, `rowActionLook`; the
  // tip is its name there when only the icon is shown). In the action column of every row, and in single-row mode also in the
  // toolbar (for the selected row): that toolbar action is what needs the single selection.
  const removeRow = (show: 'column' | 'both') =>
    singleRowAction('delete-user', (user: User) => report(`Delete ${fullName(user)}`), {
      label: 'Delete',
      icon: icons.remove,
      tip: 'Delete user',
      variant: danger,
      show,
    });

  const remove = multiRowAction(
    'delete',
    (users: readonly User[]) => report(`Delete ${users.map(fullName).join(', ')}`),
    {
      label: 'Delete',
      icon: icons.remove,
      variant: danger,
    },
  );

  // "Export all" needs no selection (general actions). "Export selection" needs selected rows (rows actions): it only
  // exists in the multi-row set, and it is only visible while at least one row is selected.
  const exportMenu = (withSelection: boolean): Item => {
    const actions: (TableAction<User> | ActionSeparator)[] = [
      generalAction('export-all-csv', () => report('Export all to CSV'), { label: 'Export all to CSV' }),
      generalAction('export-all-excel', () => report('Export all to Excel'), { label: 'Export all to Excel' }),
    ];

    if (withSelection) {
      actions.push(
        { type: 'separator' },
        multiRowAction(
          'export-selection-csv',
          (users: readonly User[]) => report(`Export ${users.length} selected user(s) to CSV`),
          {
            label: 'Export selection to CSV',
          },
        ),
        multiRowAction(
          'export-selection-excel',
          (users: readonly User[]) => report(`Export ${users.length} selected user(s) to Excel`),
          {
            label: 'Export selection to Excel',
          },
        ),
      );
    }

    return { type: 'menu', key: 'export', label: 'Export', variant: tertiary, actions };
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
