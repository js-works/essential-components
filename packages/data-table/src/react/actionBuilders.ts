import type { RowGroup } from '../api/query.js';
import type { ActionFields, GeneralAction, GroupAction, RowAction, RowsAction } from '../api/react/index.js';
import { buildAction } from '../core/actionBuilders.js';

export { generalAction, groupAction, multiRowAction, singleRowAction };

// Builders of the actions: the key, the click handler and the other fields, the type filled in. A handler may return a
// value (e.g. a promise), which is ignored.

function generalAction(key: string, onClick: () => unknown, fields: ActionFields<GeneralAction>): GeneralAction {
  return buildAction('general', key, onClick, fields);
}

function singleRowAction<Row>(
  key: string,
  onClick: (row: Row) => unknown,
  fields: ActionFields<RowAction<Row>>,
): RowAction<Row> {
  return buildAction('singleRow', key, onClick, fields);
}

function multiRowAction<Row>(
  key: string,
  onClick: (rows: readonly Row[]) => unknown,
  fields: ActionFields<RowsAction<Row>>,
): RowsAction<Row> {
  return buildAction('multiRow', key, onClick, fields);
}

function groupAction<Row>(
  key: string,
  onClick: (group: RowGroup<Row>) => unknown,
  fields: ActionFields<GroupAction<Row>>,
): GroupAction<Row> {
  return buildAction('group', key, onClick, fields);
}
