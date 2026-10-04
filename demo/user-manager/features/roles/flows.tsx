import { useNavigate } from 'react-router';
import { useDialogs, useToast } from '../../../../packages/overlays/src/main/bindings/react';
import type { Role } from '../../domain';
import { countText } from '../../shared/lib/format';
import { useChanged, useIamService } from '../iam';
import { RoleForm } from './components/RoleForm';

export { useRoleFlows };

// The changes of roles: new (empty, or a copy of a role's permissions), rename, delete (refused for built-in roles and
// roles that are still granted: the dialog shows why).
function useRoleFlows() {
  const service = useIamService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();
  const navigate = useNavigate();

  const create = async (copyOf?: Role) => {
    let created: Role | undefined;
    const result = await dialogs.form({
      title: copyOf === undefined ? 'New role' : `Duplicate "${copyOf.name}"`,
      content: (
        <RoleForm
          {...(copyOf === undefined
            ? {}
            : { initial: { name: `${copyOf.name} (copy)`, description: copyOf.description } })}
          save={async (values) =>
            void (created = await service.createRole({ ...values, permissionIds: copyOf?.permissionIds ?? [] }))}
        />
      ),
      buttons: { confirm: 'Create' },
    });

    if (!result.canceled && created !== undefined) {
      await changed();
      toasts.success(`Role "${created.name}" created`);
      void navigate(`/roles/${created.id}`);
    }
  };

  const rename = async (role: Role) => {
    const result = await dialogs.form({
      title: 'Edit role',
      content: (
        <RoleForm
          initial={{ name: role.name, description: role.description }}
          save={async (values) =>
            void (await service.updateRole(role.id, { ...values, permissionIds: role.permissionIds }))}
        />
      ),
      buttons: { confirm: 'Save' },
    });

    if (!result.canceled) {
      await changed();
      toasts.success(`Role "${role.name}" saved`);
    }
  };

  const remove = async (roles: readonly Role[]): Promise<boolean> => {
    const scope = dialogs.open();
    const [first] = roles;

    try {
      const result = await scope.confirmCritical({
        title: roles.length === 1 ? 'Delete role' : 'Delete roles',
        content: roles.length === 1 && first !== undefined
          ? `Delete "${first.name}"?`
          : `Delete the ${roles.length} selected roles?`,
        buttons: { confirm: 'Delete' },
      });

      if (result.canceled) {
        return false;
      }

      try {
        await service.deleteRoles(roles.map((role) => role.id));
      } catch (cause) {
        scope.dispose();
        await dialogs.warn({ title: 'Not deleted', content: cause instanceof Error ? cause.message : String(cause) });
        return false;
      }
    } finally {
      scope.dispose();
    }

    await changed();
    toasts.success(`${countText(roles.map((role) => role.name), 'roles')} deleted`);

    return true;
  };

  return { create, rename, remove };
}
