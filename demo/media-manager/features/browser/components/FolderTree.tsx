import { Group, Loader, Text, Tree, UnstyledButton, useTree } from '@mantine/core';
import type { TreeNodeData } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { TbChevronRight } from 'react-icons/tb';
import { ancestorsOf, childrenOf, ROOT_ID } from '../../../domain';
import type { Folder } from '../../../domain';
import { appIcons } from '../../../shared/ui/icons';
import { useBrowserService } from '../context';
import { browserKeys } from '../keys';

export { FolderTree, toTreeData };

// The folders as Mantine's tree data, from a folder down (by name).
function toTreeData(folders: readonly Folder[], id: string): TreeNodeData[] {
  return childrenOf(folders, id)
    .sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }))
    .map((folder) => ({ value: folder.id, label: folder.name, children: toTreeData(folders, folder.id) }));
}

// The tree of all folders (the left column): the root ("All files") on top, its folders below it. The open folder is
// selected, and the path to it is expanded (also when it is opened from the table or the breadcrumb).
// A click opens a folder; its chevron (or a click on the open folder) expands or collapses it.
function FolderTree({ current, onOpen }: { current: string; onOpen: (id: string) => void }): ReactElement {
  const service = useBrowserService();
  const { data: folders } = useQuery({
    queryKey: browserKeys.folders(),
    queryFn: ({ signal }) => service.folders(signal),
  });
  const data = useMemo(
    (): TreeNodeData[] =>
      folders === undefined
        ? []
        : [{ value: ROOT_ID, label: 'All files', children: toTreeData(folders, ROOT_ID) }],
    [folders],
  );
  // Controlled: the app owns which folders are expanded, and the selection is the open folder. The path to the open
  // folder is always expanded (derived, so the tree's own initialization cannot collapse it); the user expands and
  // collapses the rest.
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ [ROOT_ID]: true });
  const path = useMemo(
    () => (folders === undefined ? [] : ancestorsOf(folders, current).slice(0, -1).map((folder) => folder.id)),
    [folders, current],
  );
  const tree = useTree({
    expandedState: { ...expanded, ...Object.fromEntries(path.map((id) => [id, true])) },
    onExpandedStateChange: setExpanded,
    selectedState: [current],
  });

  if (folders === undefined) {
    return (
      <Group justify="center" p="md">
        <Loader size="sm" />
      </Group>
    );
  }

  return (
    <Tree
      className="media-manager__tree"
      data={data}
      tree={tree}
      levelOffset={14}
      expandOnClick={false}
      selectOnClick={false}
      renderNode={({ node, expanded, hasChildren, elementProps, selected }) => (
        <div {...elementProps} data-selected={selected || undefined}>
          <UnstyledButton
            className="media-manager__tree-toggle"
            aria-label={expanded ? `Collapse ${String(node.label)}` : `Expand ${String(node.label)}`}
            tabIndex={-1}
            data-hidden={!hasChildren || undefined}
            data-expanded={expanded || undefined}
            onClick={(event) => {
              event.stopPropagation();
              tree.toggleExpanded(node.value);
            }}
          >
            <TbChevronRight size={14} aria-hidden />
          </UnstyledButton>
          <UnstyledButton
            className="media-manager__tree-node"
            onClick={() => (node.value === current ? tree.toggleExpanded(node.value) : onOpen(node.value))}
            aria-current={selected ? 'page' : undefined}
          >
            <Text component="span" c={selected ? undefined : 'dimmed'} display="inline-flex">
              {node.value === ROOT_ID ? appIcons.root : appIcons.folder}
            </Text>
            <Text component="span" size="sm" truncate fw={selected ? 600 : undefined}>{node.label}</Text>
          </UnstyledButton>
        </div>
      )}
    />
  );
}
