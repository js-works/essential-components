import { useDialogs, useToast } from '@local/overlays/react';
import { useNavigate } from 'react-router';
import type { Role } from '../../domain/index.js';
import { countText } from '../../shared/lib/format.js';
import { useChanged, useIamService } from '../iam/index.js';
import { RoleForm } from './components/role-form.js';

export { useCreateRoleFlow, useDeleteRolesFlow, useRenameRoleFlow };

// The flows of roles, one hook per use case: each gives the function a button or an action calls. A flow
// changes the data and says so; the tables follow the data themselves (the queries).

// "New role": empty, or a copy of a role's permissions, in a form dialog; then a toast, and its page.
function useCreateRoleFlow() {
  const service = useIamService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();
  const navigate = useNavigate();

  return async (copyOf?: Role) => {
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

    if (result.canceled || created === undefined) {
      return;
    }

    await changed();
    toasts.success(`Role "${created.name}" created`);
    void navigate(`/roles/${created.id}`);
  };
}

// "Rename" of a role, in a form dialog, then a toast.
function useRenameRoleFlow() {
  const service = useIamService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();

  return async (role: Role) => {
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

    if (result.canceled) {
      return;
    }

    await changed();
    toasts.success(`Role "${role.name}" saved`);
  };
}

// "Delete" of roles: refused for built-in roles and roles that are still granted (the dialog says why); else a
// critical confirmation, then a toast.
function useDeleteRolesFlow() {
  const service = useIamService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();

  return async (roles: readonly Role[]): Promise<boolean> => {
    using scope = dialogs.open();
    const [first] = roles;
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
      await scope.warn({ title: 'Not deleted', content: cause instanceof Error ? cause.message : String(cause) });
      return false;
    }

    await changed();
    toasts.success(`${countText(roles.map((role) => role.name), 'roles')} deleted`);

    return true;
  };
}
