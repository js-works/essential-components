import { useNavigate } from 'react-router';

import { useDialogs, useToast } from '@local/overlays/react';

import type { User } from '../../domain/index.js';
import { countText } from '../../shared/lib/format.js';
import { useChanged, useIamService } from '../iam/index.js';
import { UserForm } from './components/user-form.js';

export { useCreateUserFlow, useDeleteUsersFlow, useEditUserFlow, useSetUsersActiveFlow };

// The flows of users, one hook per use case: each gives the function a button or an action calls. A flow
// changes the data and says so; the tables follow the data themselves (the queries).

// "New user", in a form dialog; then a toast, and their page.
function useCreateUserFlow() {
  const service = useIamService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();
  const navigate = useNavigate();

  return async () => {
    let created: User | undefined;
    const result = await dialogs.form({
      title: 'New user',
      content: <UserForm save={async (values) => void (created = await service.createUser(values))} />,
      buttons: { confirm: 'Create' },
    });

    if (result.canceled || created === undefined) {
      return;
    }

    await changed();
    toasts.success(`"${created.name}" created`);
    void navigate(`/users/${created.id}`);
  };
}

// "Edit" of a user, in a form dialog, then a toast.
function useEditUserFlow() {
  const service = useIamService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();

  return async (user: User) => {
    const result = await dialogs.form({
      title: 'Edit user',
      content: <UserForm user={user} save={async (values) => void (await service.updateUser(user.id, values))} />,
      buttons: { confirm: 'Save' },
    });

    if (result.canceled) {
      return;
    }

    await changed();
    toasts.success(`"${user.name}" saved`);
  };
}

// "Enable" or "Disable" of users, then a toast.
function useSetUsersActiveFlow() {
  const service = useIamService();
  const toasts = useToast();
  const changed = useChanged();

  return async (users: readonly User[], active: boolean) => {
    await Promise.all(users.map((user) => service.updateUser(user.id, { ...user, active })));
    await changed();
    toasts.success(`${countText(users.map((user) => user.name), 'users')} ${active ? 'enabled' : 'disabled'}`);
  };
}

// "Delete" of users: a critical confirmation, then a toast.
function useDeleteUsersFlow() {
  const service = useIamService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();

  return async (users: readonly User[]): Promise<boolean> => {
    using scope = dialogs.open();
    const [first] = users;
    const result = await scope.confirmCritical({
      title: users.length === 1 ? 'Delete user' : 'Delete users',
      content: `${
        users.length === 1 && first !== undefined
          ? `Delete "${first.name}"?`
          : `Delete the ${users.length} selected users?`
      }\nTheir memberships and their own grants are deleted too. To keep them, disable the user instead.`,
      buttons: { confirm: 'Delete' },
    });

    if (result.canceled) {
      return false;
    }

    await service.deleteUsers(users.map((user) => user.id));

    await changed();
    toasts.success(`${countText(users.map((user) => user.name), 'users')} deleted`);

    return true;
  };
}
