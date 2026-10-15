import type { ActionFields, GeneralAction, GroupAction, RowAction, RowGroup, RowsAction } from '../api/index.js';
import { buildAction } from '../core/actionBuilders.js';

export { generalAction, groupAction, multiRowAction, singleRowAction };

// Builders of the element's actions: the key, the click handler and the other fields, the type filled in. A handler
// may return a value (e.g. a promise), which is ignored. The content type `C` comes from where the action is used
// (`Node` by default), not from its fields.

function generalAction<C = Node>(
  key: string,
  onClick: () => unknown,
  fields: NoInfer<ActionFields<GeneralAction<C>>>,
): GeneralAction<C> {
  return buildAction('general', key, onClick, fields);
}

function singleRowAction<Row, C = Node>(
  key: string,
  onClick: (row: Row) => unknown,
  fields: NoInfer<ActionFields<RowAction<Row, C>>>,
): RowAction<Row, C> {
  return buildAction('singleRow', key, onClick, fields);
}

function multiRowAction<Row, C = Node>(
  key: string,
  onClick: (rows: readonly Row[]) => unknown,
  fields: NoInfer<ActionFields<RowsAction<Row, C>>>,
): RowsAction<Row, C> {
  return buildAction('multiRow', key, onClick, fields);
}

function groupAction<Row, C = Node>(
  key: string,
  onClick: (group: RowGroup<Row>) => unknown,
  fields: NoInfer<ActionFields<GroupAction<Row, C>>>,
): GroupAction<Row, C> {
  return buildAction('group', key, onClick, fields);
}
