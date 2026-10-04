import { useNavigate } from 'react-router';
import { useDialogs, useToast } from '../../../../packages/overlays/src/main/bindings/react';
import type { User } from '../../domain';
import { countText } from '../../shared/lib/format';
import { useChanged, useIamService } from '../iam';
import { UserForm } from './components/UserForm';

export { useUserFlows };

// The changes of users, shared by the users table and a user's page: new, edit, enable or disable, delete.
function useUserFlows() {
  const service = useIamService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();
  const navigate = useNavigate();

  const create = async () => {
    let created: User | undefined;
    const result = await dialogs.form({
      title: 'New user',
      content: <UserForm save={async (values) => void (created = await service.createUser(values))} />,
      buttons: { confirm: 'Create' },
    });

    if (!result.canceled && created !== undefined) {
      await changed();
      toasts.success(`"${created.name}" created`);
      void navigate(`/users/${created.id}`);
    }
  };

  const edit = async (user: User) => {
    const result = await dialogs.form({
      title: 'Edit user',
      content: <UserForm user={user} save={async (values) => void (await service.updateUser(user.id, values))} />,
      buttons: { confirm: 'Save' },
    });

    if (!result.canceled) {
      await changed();
      toasts.success(`"${user.name}" saved`);
    }
  };

  const setActive = async (users: readonly User[], active: boolean) => {
    await Promise.all(users.map((user) => service.updateUser(user.id, { ...user, active })));
    await changed();
    toasts.success(`${countText(users.map((user) => user.name), 'users')} ${active ? 'enabled' : 'disabled'}`);
  };

  const remove = async (users: readonly User[]): Promise<boolean> => {
    const scope = dialogs.open();
    const [first] = users;

    try {
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
    } finally {
      scope.dispose();
    }

    await changed();
    toasts.success(`${countText(users.map((user) => user.name), 'users')} deleted`);

    return true;
  };

  return { create, edit, setActive, remove };
}
