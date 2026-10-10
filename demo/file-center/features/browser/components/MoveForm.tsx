import { Group, Paper, Text, Tree, UnstyledButton, useTree } from '@mantine/core';
import type { TreeNodeData } from '@mantine/core';
import { useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { TbChevronRight } from 'react-icons/tb';
import { Form } from '../../../../../packages/overlays/src/main/bindings/react';
import { ancestorsOf, isInside, ROOT_ID } from '../../../domain';
import type { Folder } from '../../../domain';
import { folderIcon, toTreeData } from './FolderTree';

export { MoveForm };

// The target of a move, as the content of a form dialog: the folder tree, opened at the current folder. The folders
// being moved (and everything inside them) cannot be chosen, nor the current folder (nothing would move); the root
// ("Files", which holds only the storages) is not in it. "Move" moves
// (`save`); a refusal shows below the tree.
function MoveForm({ folders, current, moving, save }: {
  folders: readonly Folder[];
  current: string;
  // The ids of the folders being moved.
  moving: readonly string[];
  save: (targetId: string) => Promise<void>;
}): ReactElement {
  const [target, setTarget] = useState<string>();
  const [error, setError] = useState<string>();
  // The storages on top, without the root (2026-10-07: nothing can be moved into it).
  const data = useMemo((): TreeNodeData[] => toTreeData(folders, ROOT_ID), [folders]);
  const tree = useTree({
    initialExpandedState: Object.fromEntries(ancestorsOf(folders, current).map((folder) => [folder.id, true])),
  });
  const disabled = (id: string) => id === current || moving.some((folderId) => isInside(folders, id, folderId));

  return (
    <Form
      confirm={async () => {
        if (target === undefined) {
          setError('Please choose a folder.');
          return { ok: false };
        }

        try {
          await save(target);
          return { ok: true };
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : String(cause));
          return { ok: false };
        }
      }}
    >
      <Paper withBorder radius="sm" p={4} className="file-center__move-tree">
        <Tree
          data={data}
          tree={tree}
          levelOffset={14}
          expandOnClick={false}
          selectOnClick={false}
          renderNode={({ node, expanded, hasChildren, elementProps }) => {
            const off = disabled(node.value);

            return (
              <div {...elementProps}>
                <UnstyledButton
                  className="file-center__tree-toggle"
                  tabIndex={-1}
                  aria-hidden
                  data-hidden={!hasChildren || undefined}
                  data-expanded={expanded || undefined}
                  onClick={() => tree.toggleExpanded(node.value)}
                >
                  <TbChevronRight size={14} aria-hidden />
                </UnstyledButton>
                <UnstyledButton
                  className="file-center__tree-node"
                  disabled={off}
                  aria-pressed={target === node.value}
                  data-chosen={target === node.value || undefined}
                  onClick={() => {
                    setTarget(node.value);
                    setError(undefined);
                  }}
                >
                  <Text component="span" c="dimmed" display="inline-flex">
                    {folderIcon(folders, node.value)}
                  </Text>
                  <Text component="span" size="sm" truncate c={off ? 'dimmed' : undefined}>{node.label}</Text>
                </UnstyledButton>
              </div>
            );
          }}
        />
      </Paper>
      <Group mt="xs" gap={4} mih={20}>
        {error !== undefined
          ? <Text size="sm" c="red">{error}</Text>
          : target !== undefined && (
            <Text size="sm" c="dimmed">
              Into: {ancestorsOf(folders, target).map((folder) => folder.name).join(' › ')}
            </Text>
          )}
      </Group>
    </Form>
  );
}
