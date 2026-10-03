import { Group, Paper, Text, Tree, UnstyledButton, useTree } from '@mantine/core';
import type { TreeNodeData } from '@mantine/core';
import { useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { TbChevronRight } from 'react-icons/tb';
import { Form } from '../../../../../packages/overlays/src/main/bindings/react';
import { ancestorsOf, isInside, ROOT_ID } from '../../../domain';
import type { Folder } from '../../../domain';
import { appIcons } from '../../../shared/ui/icons';
import { toTreeData } from './FolderTree';

export { MoveForm };

// The target of a move, as the content of a form dialog: the folder tree, opened at the current folder. The folders
// being moved (and everything inside them) cannot be chosen, nor the current folder (nothing would move). "Move" moves
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
  const data = useMemo(
    (): TreeNodeData[] => [{ value: ROOT_ID, label: 'All files', children: toTreeData(folders, ROOT_ID) }],
    [folders],
  );
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
      <Paper withBorder radius="sm" p={4} className="media-manager__move-tree">
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
                  className="media-manager__tree-toggle"
                  tabIndex={-1}
                  aria-hidden
                  data-hidden={!hasChildren || undefined}
                  data-expanded={expanded || undefined}
                  onClick={() => tree.toggleExpanded(node.value)}
                >
                  <TbChevronRight size={14} aria-hidden />
                </UnstyledButton>
                <UnstyledButton
                  className="media-manager__tree-node"
                  disabled={off}
                  aria-pressed={target === node.value}
                  data-chosen={target === node.value || undefined}
                  onClick={() => {
                    setTarget(node.value);
                    setError(undefined);
                  }}
                >
                  <Text component="span" c="dimmed" display="inline-flex">
                    {node.value === ROOT_ID ? appIcons.root : appIcons.folder}
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
