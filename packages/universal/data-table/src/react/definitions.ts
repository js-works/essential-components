import type { TableActions, TableColumns, TableFilters } from '../api/react/index.js';

export { defineActions, defineColumns, defineFilters };

// The columns of a table, typed by its rows: `defineColumns<User>([…])`, no type annotation needed. Returns them as
// they are.
function defineColumns<Row>(columns: TableColumns<Row>): TableColumns<Row> {
  return columns;
}

// The actions of a table, typed by its rows: `defineActions<User>([…])`. Returns them as they are.
function defineActions<Row>(actions: TableActions<Row>): TableActions<Row> {
  return actions;
}

// The filters of a table, by key (`filters`): `defineFilters({ role: selectFilter(…) })`. Returns them as they are.
function defineFilters(filters: TableFilters): TableFilters {
  return filters;
}
