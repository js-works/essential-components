import type { GeneralAction, RowAction, RowsAction } from '@local/data-table/react';
import { generalAction, multiRowAction, singleRowAction } from '@local/data-table/react';

import type { TableActionOptions } from './api/table.js';
import { ArrowRightIcon, PencilIcon, PlusIcon, TrashIcon } from './icons.js';
import { useTexts } from './use-texts.js';

export { useTableActions };

// A label replaces the standard tip (a tip of its own stays).
const look = (label: string | undefined, tip: string) => (label === undefined ? { tip } : { label });

// The standard actions of a micro-app's tables, built on the data table's builders (`singleRowAction` and the like,
// also for a table's other actions): "New …" (primary, the plus icon), "Open" (the default action, in the action
// column), "Edit" (in the action column and the toolbar) and "Delete" (danger, on the selected rows). Their texts
// follow the language, so the builders come from a hook. An `onClick` may return a promise.
function useTableActions() {
  const { text } = useTexts();

  return {
    newAction: (
      label: string,
      onClick: () => unknown,
      { key = 'new', ...options }: Pick<TableActionOptions, 'key' | 'contextMenu'> = {},
    ): GeneralAction => generalAction(key, onClick, { label, icon: <PlusIcon />, variant: 'primary', ...options }),

    openAction: <Row,>(
      onClick: (row: Row) => unknown,
      { key = 'open', label, ...options }: TableActionOptions<Row> = {},
    ): RowAction<Row> =>
      singleRowAction(key, onClick, {
        icon: <ArrowRightIcon />,
        ...look(label, text('open')),
        show: 'column',
        default: true,
        ...options,
      }),

    editAction: <Row,>(
      onClick: (row: Row) => unknown,
      { key = 'edit', label, ...options }: TableActionOptions<Row> = {},
    ): RowAction<Row> =>
      singleRowAction(key, onClick, { icon: <PencilIcon />, ...look(label, text('edit')), show: 'both', ...options }),

    deleteAction: <Row,>(
      onClick: (rows: readonly Row[]) => unknown,
      { key = 'delete', label, ...options }: Pick<TableActionOptions, 'key' | 'label' | 'contextMenu'> = {},
    ): RowsAction<Row> =>
      multiRowAction(key, onClick, {
        label: label ?? text('delete'),
        icon: <TrashIcon />,
        variant: 'danger',
        ...options,
      }),
  };
}
