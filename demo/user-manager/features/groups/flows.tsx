import { useNavigate } from 'react-router';
import { useDialogs, useToast } from '../../../../packages/overlays/src/main/bindings/react';
import type { Group } from '../../domain';
import { countText } from '../../shared/lib/format';
import { useChanged, useIamService } from '../iam';
import { GroupForm } from './components/GroupForm';

export { useGroupFlows };

// The changes of groups, shared by the groups table and a group's page: new, edit, delete.
function useGroupFlows() {
  const service = useIamService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();
  const navigate = useNavigate();

  const create = async () => {
    let created: Group | undefined;
    const result = await dialogs.form({
      title: 'New group',
      content: <GroupForm save={async (values) => void (created = await service.createGroup(values))} />,
      buttons: { confirm: 'Create' },
    });

    if (!result.canceled && created !== undefined) {
      await changed();
      toasts.success(`Group "${created.name}" created`);
      void navigate(`/groups/${created.id}`);
    }
  };

  const edit = async (group: Group) => {
    const result = await dialogs.form({
      title: 'Edit group',
      content: <GroupForm group={group} save={async (values) => void (await service.updateGroup(group.id, values))} />,
      buttons: { confirm: 'Save' },
    });

    if (!result.canceled) {
      await changed();
      toasts.success(`Group "${group.name}" saved`);
    }
  };

  const remove = async (groups: readonly Group[]): Promise<boolean> => {
    const scope = dialogs.open();
    const [first] = groups;

    try {
      const result = await scope.confirmCritical({
        title: groups.length === 1 ? 'Delete group' : 'Delete groups',
        content: `${
          groups.length === 1 && first !== undefined
            ? `Delete "${first.name}"?`
            : `Delete the ${groups.length} selected groups?`
        }\nIts members lose the access granted to the group. The users themselves stay.`,
        buttons: { confirm: 'Delete' },
      });

      if (result.canceled) {
        return false;
      }

      await service.deleteGroups(groups.map((group) => group.id));
    } finally {
      scope.dispose();
    }

    await changed();
    toasts.success(`${countText(groups.map((group) => group.name), 'groups')} deleted`);

    return true;
  };

  return { create, edit, remove };
}
