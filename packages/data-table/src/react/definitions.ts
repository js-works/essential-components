import type { ActionMenu, ColumnGroup, TableAction, TableColumn, TableFilters } from '../api/react/index.js';

export { defineActions, defineColumns, defineFilters };

// The columns of a table, typed by its rows: `defineColumns<User>([…])`, no type annotation needed. Returns them as
// they are.
function defineColumns<Row>(
  columns: readonly (TableColumn<Row> | ColumnGroup<Row>)[],
): readonly (TableColumn<Row> | ColumnGroup<Row>)[] {
  return columns;
}

// The actions of a table, typed by its rows: `defineActions<User>([…])`. Returns them as they are.
function defineActions<Row>(
  actions: readonly (TableAction<Row> | ActionMenu<Row>)[],
): readonly (TableAction<Row> | ActionMenu<Row>)[] {
  return actions;
}

// The filters of a table, by key (`filters`): `defineFilters({ role: selectFilter(…) })`. Returns them as they are.
function defineFilters(filters: TableFilters): TableFilters {
  return filters;
}
