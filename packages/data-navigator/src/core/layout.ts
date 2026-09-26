import type { ReactNode } from 'react';
import type { DataNavigator as Spec } from '../api';

export { createLayout };
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
