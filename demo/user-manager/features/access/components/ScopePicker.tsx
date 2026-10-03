import { Paper, Text, Tree, UnstyledButton, useTree } from '@mantine/core';
import type { TreeNodeData } from '@mantine/core';
import { useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { TbChevronRight } from 'react-icons/tb';
import { pathOf, scopeChildren } from '../../../domain';
import type { Scope } from '../../../domain';

export { ScopePicker };

function toTreeData(scopes: readonly Scope[], id: string): TreeNodeData[] {
  return scopeChildren(scopes, id).map((scope) => ({
    value: scope.id,
    label: scope.name,
    nodeProps: { kind: scope.kind },
    children: toTreeData(scopes, scope.id),
  }));
}

// The scope tree to choose a scope from (the organization on top, its apps, their resources). The chosen scope is
// marked, its kind is shown next to it; the path to it is always expanded.
function ScopePicker({ scopes, value, onChange, height = 260 }: {
  scopes: readonly Scope[];
  value: string | undefined;
  onChange: (id: string) => void;
  height?: number;
}): ReactElement {
  const root = scopes.find((scope) => scope.parentId === null);
  const data = useMemo(
    (): TreeNodeData[] =>
      root === undefined
        ? []
        : [{ value: root.id, label: root.name, nodeProps: { kind: root.kind }, children: toTreeData(scopes, root.id) }],
    [scopes, root],
  );
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(scopes.filter((scope) => scope.parentId === null).map((scope) => [scope.id, true]))
  );
  const path = value === undefined ? [] : pathOf(scopes, value).slice(0, -1).map((scope) => scope.id);
  const tree = useTree({
    expandedState: { ...expanded, ...Object.fromEntries(path.map((id) => [id, true])) },
    onExpandedStateChange: setExpanded,
  });

  return (
    <Paper withBorder radius="sm" p={4} mah={height} style={{ overflow: 'auto' }}>
      <Tree
        data={data}
        tree={tree}
        levelOffset={14}
        expandOnClick={false}
        selectOnClick={false}
        renderNode={({ node, expanded: open, hasChildren, elementProps }) => (
          <div {...elementProps}>
            <UnstyledButton
              className="user-manager__tree-toggle"
              tabIndex={-1}
              aria-hidden
              data-hidden={!hasChildren || undefined}
              data-expanded={open || undefined}
              onClick={() => tree.toggleExpanded(node.value)}
            >
              <TbChevronRight size={14} aria-hidden />
            </UnstyledButton>
            <UnstyledButton
              className="user-manager__tree-node"
              aria-pressed={value === node.value}
              data-chosen={value === node.value || undefined}
              onClick={() => onChange(node.value)}
            >
              <Text component="span" size="sm" truncate>{node.label}</Text>
              <Text component="span" size="xs" c="dimmed">{String(node.nodeProps?.['kind'] ?? '')}</Text>
            </UnstyledButton>
          </div>
        )}
      />
    </Paper>
  );
}
