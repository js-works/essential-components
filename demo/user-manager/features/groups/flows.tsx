import { useDialogs, useToast } from '@local/overlays/react';
import { useNavigate } from 'react-router';
import type { Group, User } from '../../domain/index.js';
import { countText } from '../../shared/lib/format.js';
import { useAccessData, useChanged, useIamService } from '../iam/index.js';
import { AddMembersForm } from './components/AddMembersForm.js';
import { GroupForm } from './components/GroupForm.js';

export { useGroupFlows };
export type { GroupFlows };

// What `useGroupFlows()` gives: the flows, for the functions that build a table's actions.
type GroupFlows = ReturnType<typeof useGroupFlows>;

// The changes of groups, shared by the groups table and a group's page: new, edit, delete; and of a group's members:
// add, remove.
function useGroupFlows() {
  const service = useIamService();
  const data = useAccessData();
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

  // "Add members": a checklist of the users who are not members yet, in a form dialog; then a toast.
  const addMembers = async (group: Group) => {
    if (data === undefined) {
      return;
    }

    let added: readonly string[] = [];
    const current = data.groups.find((candidate) => candidate.id === group.id) ?? group;
    const result = await dialogs.form({
      title: `Add members to "${group.name}"`,
      content: (
        <AddMembersForm
          candidates={data.users.filter((user) => !current.memberIds.includes(user.id))}
          save={async (userIds) => {
            await service.addMembers(group.id, userIds);
            added = userIds;
          }}
        />
      ),
      buttons: { confirm: 'Add' },
    });

    if (!result.canceled) {
      await changed();
      toasts.success(`${added.length === 1 ? '1 member' : `${added.length} members`} added`);
    }
  };

  // "Remove" of members from a group (no confirmation: they can be added again), then a toast.
  const removeMembers = async (group: Group, users: readonly User[]) => {
    await service.removeMembers(group.id, users.map((user) => user.id));
    await changed();
    toasts.success(`${countText(users.map((user) => user.name), 'members')} removed from "${group.name}"`);
  };

  return { create, edit, remove, addMembers, removeMembers };
}
