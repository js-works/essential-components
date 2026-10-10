import { ActionIcon, Group, Loader, Text, Tooltip, Tree, UnstyledButton, useTree } from '@mantine/core';
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

export { folderIcon, FolderTree, toTreeData };

// The icon of a folder in a tree (the side tree, the Move dialog): a storage (2026-10-07) or an ordinary folder, both
// outline icons (the table's folders are filled).
function folderIcon(folders: readonly Folder[], id: string): ReactElement {
  return folders.find((folder) => folder.id === id)?.storage === true ? appIcons.storage : appIcons.treeFolder;
}

// The folders as Mantine's tree data, from a folder down (by name).
function toTreeData(folders: readonly Folder[], id: string): TreeNodeData[] {
  return childrenOf(folders, id)
    .sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }))
    .map((folder) => ({ value: folder.id, label: folder.name, children: toTreeData(folders, folder.id) }));
}

// The tree of all folders (the left column): the storages on top (2026-10-07: without the root, "Files", which the
// breadcrumb's "Files" opens), their folders below them. The open folder is selected, and the path to it is expanded
// (also when it is opened from the table or the breadcrumb).
// A click opens a folder; its chevron (or a click on the open folder) expands or collapses it.
function FolderTree({ current, onOpen }: { current: string; onOpen: (id: string) => void }): ReactElement {
  const service = useBrowserService();
  const { data: folders } = useQuery({
    queryKey: browserKeys.folders(),
    queryFn: ({ signal }) => service.folders(signal),
  });
  const data = useMemo((): TreeNodeData[] => (folders === undefined ? [] : toTreeData(folders, ROOT_ID)), [folders]);
  // Controlled: the app owns which folders are expanded, and the selection is the open folder. The path to the open
  // folder is always expanded (derived, so the tree's own initialization cannot collapse it); the user expands and
  // collapses the rest.
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const path = useMemo(
    () => (folders === undefined ? [] : ancestorsOf(folders, current).slice(0, -1).map((folder) => folder.id)),
    [folders, current],
  );
  const tree = useTree({
    expandedState: { ...expanded, ...Object.fromEntries(path.map((id) => [id, true])) },
    onExpandedStateChange: setExpanded,
    selectedState: [current],
  });
  // "Collapse all" (2026-10-07, the user's wish) collapses everything but the path to the open folder (which stays
  // expanded, see above): there is something to collapse while another folder is expanded. Otherwise the button is
  // invisible, but keeps its place (the header's height stays, the tree does not jump).
  const collapsible = Object.entries(expanded).some(([id, open]) => open && !path.includes(id));

  return (
    <>
      <Group justify="space-between" wrap="nowrap" className="file-center__tree-header">
        <Text size="xs" fw={600} c="dimmed" tt="uppercase">Folders</Text>
        <Tooltip label="Collapse all" openDelay={400} fz="xs">
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            disabled={!collapsible}
            data-hidden={!collapsible || undefined}
            onClick={() => setExpanded({})}
            aria-label="Collapse all"
          >
            {appIcons.collapseAll}
          </ActionIcon>
        </Tooltip>
      </Group>
      {folders === undefined
        ? (
          <Group justify="center" p="md">
            <Loader size="sm" />
          </Group>
        )
        : <FolderNodes data={data} tree={tree} current={current} folders={folders} onOpen={onOpen} />}
    </>
  );
}

// The nodes of the side tree.
function FolderNodes({ data, tree, current, folders, onOpen }: {
  data: TreeNodeData[];
  tree: ReturnType<typeof useTree>;
  current: string;
  folders: readonly Folder[];
  onOpen: (id: string) => void;
}): ReactElement {
  return (
    <Tree
      className="file-center__tree"
      data={data}
      tree={tree}
      levelOffset={14}
      expandOnClick={false}
      selectOnClick={false}
      renderNode={({ node, expanded, hasChildren, elementProps, selected }) => (
        <div {...elementProps} data-selected={selected || undefined}>
          <UnstyledButton
            className="file-center__tree-toggle"
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
            className="file-center__tree-node"
            onClick={() => (node.value === current ? tree.toggleExpanded(node.value) : onOpen(node.value))}
            aria-current={selected ? 'page' : undefined}
          >
            <Text component="span" c={selected ? undefined : 'dimmed'} display="inline-flex">
              {folderIcon(folders, node.value)}
            </Text>
            <Text component="span" size="sm" truncate fw={selected ? 600 : undefined}>{node.label}</Text>
          </UnstyledButton>
        </div>
      )}
    />
  );
}
