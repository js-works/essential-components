import type { ReactNode } from 'react';
import type { DataTableComponent as Spec } from '../react/api';

export { createLayout, withoutHidden };
export type { Layout };

type Leaf<Row> = {
  column: Spec.Column<Row>;
  grouped: boolean;
};

type Group = {
  header: ReactNode;
  start: number;
  span: number;
};

type Layout<Row> = {
  leaves: readonly Leaf<Row>[];
  groups: readonly Group[];
};

function createLayout<Row>(columns: readonly (Spec.Column<Row> | Spec.ColumnGroup<Row>)[]): Layout<Row> {
  const leaves: Leaf<Row>[] = [];
  const groups: Group[] = [];

  for (const column of columns) {
    if (!('columns' in column)) {
      leaves.push({ column, grouped: false });
      continue;
    }

    if (column.columns.length === 0) {
      continue;
    }

    groups.push({ header: column.header, start: leaves.length, span: column.columns.length });

    for (const leaf of column.columns) {
      leaves.push({ column: leaf, grouped: true });
    }
  }

  return { leaves, groups };
}

// The columns without the hidden ones (the column toggle menu). A group without a visible column is left out too.
function withoutHidden<Row>(
  columns: readonly (Spec.Column<Row> | Spec.ColumnGroup<Row>)[],
  hidden: ReadonlySet<string>,
): readonly (Spec.Column<Row> | Spec.ColumnGroup<Row>)[] {
  if (hidden.size === 0) {
    return columns;
  }

  return columns.flatMap((column): (Spec.Column<Row> | Spec.ColumnGroup<Row>)[] => {
    if (!('columns' in column)) {
      return hidden.has(column.key) ? [] : [column];
    }

    const children = column.columns.filter((leaf) => !hidden.has(leaf.key));

    return children.length === 0 ? [] : [{ ...column, columns: children }];
  });
}
