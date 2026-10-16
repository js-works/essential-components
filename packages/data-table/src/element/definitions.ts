import type { TableActions, TableColumns, TableFilters } from '../api/index.js';

export { defineActions, defineColumns, defineFilters };

// The columns of a table, typed by its rows (and its content, `Node` by default): `defineColumns<User>([…])`, no type
// annotation needed. Returns them as they are.
function defineColumns<Row, C = Node>(columns: TableColumns<Row, C>): TableColumns<Row, C> {
  return columns;
}

// The actions of a table, typed by its rows (and its content, `Node` by default): `defineActions<User>([…])`. Returns
// them as they are.
function defineActions<Row, C = Node>(actions: TableActions<Row, C>): TableActions<Row, C> {
  return actions;
}

// The filters of a table, by key (and its content, `Node` by default): `defineFilters({ role: selectFilter(…) })`.
// Returns them as they are.
function defineFilters<C = Node>(filters: TableFilters<C>): TableFilters<C> {
  return filters;
}
