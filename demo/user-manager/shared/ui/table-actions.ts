import type { GeneralAction, RowAction, RowsAction } from '@local/data-table/react';
import { generalAction, multiRowAction, singleRowAction } from '@local/data-table/react';

import { appIcons } from './icons.js';

export { deleteAction, editAction, newAction, openAction };

// What a table may change of a standard action: its key, its label (in place of the standard tip), its tip, where it is
// shown, whether it is the default action, for which rows it is there.
type ActionOptions<Row = never> = {
  key?: string;
  label?: string;
  tip?: string;
  show?: 'column' | 'toolbar' | 'both';
  default?: boolean;
  contextMenu?: boolean;
  visible?: (row: Row) => boolean;
};

// The standard actions of the app's tables, in its look: "New …" (primary, the plus icon), "Open" (the default action,
// in the action column), "Edit" (in the action column and the toolbar) and "Delete" (danger, on the selected rows).
// Plain functions, built on the data table's builders (`singleRowAction` and the like, also for the other actions of a
// table). An `onClick` may return a promise. The same file in each of the five apps (the texts and the look may
// differ).

// A label replaces the standard tip (a tip of its own stays).
const look = (label: string | undefined, tip: string) => (label === undefined ? { tip } : { label });

function newAction(
  label: string,
  onClick: () => unknown,
  { key = 'new', ...options }: Pick<ActionOptions, 'key' | 'contextMenu'> = {},
): GeneralAction {
  return generalAction(key, onClick, { label, icon: appIcons.add, variant: 'primary', ...options });
}

function openAction<Row>(
  onClick: (row: Row) => unknown,
  { key = 'open', label, ...options }: ActionOptions<Row> = {},
): RowAction<Row> {
  return singleRowAction(key, onClick, {
    icon: appIcons.open,
    ...look(label, 'Open'),
    show: 'column',
    default: true,
    ...options,
  });
}

function editAction<Row>(
  onClick: (row: Row) => unknown,
  { key = 'edit', label, ...options }: ActionOptions<Row> = {},
): RowAction<Row> {
  return singleRowAction(key, onClick, {
    icon: appIcons.edit,
    ...look(label, 'Edit'),
    show: 'both',
    ...options,
  });
}

function deleteAction<Row>(
  onClick: (rows: readonly Row[]) => unknown,
  { key = 'delete', label, ...options }: Pick<ActionOptions, 'key' | 'label' | 'contextMenu'> = {},
): RowsAction<Row> {
  return multiRowAction(key, onClick, {
    label: label ?? 'Delete',
    icon: appIcons.remove,
    variant: 'danger',
    ...options,
  });
}
