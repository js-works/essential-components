import { useNavigate } from '@tanstack/react-router';

import { useDialogs, useToast } from '@local/overlays/react';

import type { Group, User } from '../../domain/index.js';
import { countText } from '../../shared/lib/format.js';
import { useAccessData, useChanged, useIamService } from '../iam/index.js';
import { AddMembersForm } from './components/add-members-form.js';
import { GroupForm } from './components/group-form.js';

export { useAddMembersFlow, useCreateGroupFlow, useDeleteGroupsFlow, useEditGroupFlow, useRemoveMembersFlow };

// The flows of groups and their members, one hook per use case: each gives the function a button or an action calls. A flow
// changes the data and says so; the tables follow the data themselves (the queries).

// "New group", in a form dialog; then a toast, and its page.
function useCreateGroupFlow() {
  const service = useIamService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();
  const navigate = useNavigate();

  return async () => {
    let created: Group | undefined;
    const result = await dialogs.form({
      title: 'New group',
      content: <GroupForm save={async (values) => void (created = await service.createGroup(values))} />,
      buttons: { confirm: 'Create' },
    });

    if (result.canceled || created === undefined) {
      return;
    }

    await changed();
    toasts.success(`Group "${created.name}" created`);
    void navigate({ to: '/groups/$groupId', params: { groupId: created.id } });
  };
}

// "Edit" of a group, in a form dialog, then a toast.
function useEditGroupFlow() {
  const service = useIamService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();

  return async (group: Group) => {
    const result = await dialogs.form({
      title: 'Edit group',
      content: <GroupForm group={group} save={async (values) => void (await service.updateGroup(group.id, values))} />,
      buttons: { confirm: 'Save' },
    });

    if (result.canceled) {
      return;
    }

    await changed();
    toasts.success(`Group "${group.name}" saved`);
  };
}

// "Delete" of groups: a critical confirmation (their members lose what the groups were granted), then a toast.
function useDeleteGroupsFlow() {
  const service = useIamService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();

  return async (groups: readonly Group[]): Promise<boolean> => {
    using scope = dialogs.open();
    const [first] = groups;
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

    await changed();
    toasts.success(`${countText(groups.map((group) => group.name), 'groups')} deleted`);

    return true;
  };
}

// "Add members": a checklist of the users who are not members yet, in a form dialog; then a toast.
function useAddMembersFlow() {
  const service = useIamService();
  const data = useAccessData();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();

  return async (group: Group) => {
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

    if (result.canceled) {
      return;
    }

    await changed();
    toasts.success(`${added.length === 1 ? '1 member' : `${added.length} members`} added`);
  };
}

// "Remove" of members from a group (no confirmation: they can be added again), then a toast.
function useRemoveMembersFlow() {
  const service = useIamService();
  const toasts = useToast();
  const changed = useChanged();

  return async (group: Group, users: readonly User[]) => {
    await service.removeMembers(group.id, users.map((user) => user.id));
    await changed();
    toasts.success(`${countText(users.map((user) => user.name), 'members')} removed from "${group.name}"`);
  };
}
