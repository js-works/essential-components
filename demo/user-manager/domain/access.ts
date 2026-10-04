import type { Grant } from './grant';
import type { Permission, Role } from './permission';
import type { Group, User } from './principal';
import { groupsOf } from './principal';
import type { Scope } from './scope';
import { pathOf } from './scope';

export { checkAccess, effectivePermissions, grantsOf };
export type { AccessData, Decision, EffectivePermission, Reason };

// The rules of access, pure: allow only (no deny). A user may do something (a permission) somewhere (a scope) if a
// grant gives a role with that permission to the user or to one of their groups, on that scope or one above it. A
// disabled user may do nothing.

type AccessData = {
  users: readonly User[];
  groups: readonly Group[];
  roles: readonly Role[];
  grants: readonly Grant[];
  scopes: readonly Scope[];
  permissions: readonly Permission[];
};

// Why: the grant, whether it is the user's own or one of a group's, and its role and scope.
type Reason = { grant: Grant; via: { type: 'user' } | { type: 'group'; group: Group }; role: Role; scope: Scope };

type Decision = { allowed: boolean; reasons: readonly Reason[]; disabled: boolean };

// A permission a user has, where (the scopes of the grants that give it), and why.
type EffectivePermission = { permission: Permission; reasons: readonly Reason[] };

// The grants that reach a user: their own and their groups' (with the reason's `via`).
function grantsOf(data: AccessData, userId: string): { grant: Grant; via: Reason['via'] }[] {
  const groups = groupsOf(data.groups, userId);

  return data.grants.flatMap((grant): { grant: Grant; via: Reason['via'] }[] => {
    if (grant.principal.type === 'user') {
      return grant.principal.id === userId ? [{ grant, via: { type: 'user' } }] : [];
    }

    const group = groups.find((candidate) => candidate.id === grant.principal.id);

    return group === undefined ? [] : [{ grant, via: { type: 'group', group } }];
  });
}

function reasonsOf(data: AccessData, userId: string): Reason[] {
  return grantsOf(data, userId).flatMap(({ grant, via }) => {
    const role = data.roles.find((candidate) => candidate.id === grant.roleId);
    const scope = data.scopes.find((candidate) => candidate.id === grant.scopeId);

    return role === undefined || scope === undefined ? [] : [{ grant, via, role, scope }];
  });
}

// May the user do this here? With every reason that allows it (none: denied). Like the effective permissions, only
// grants where the permission means something count.
function checkAccess(data: AccessData, userId: string, permissionId: string, scopeId: string): Decision {
  const user = data.users.find((candidate) => candidate.id === userId);
  const above = new Set(pathOf(data.scopes, scopeId).map((scope) => scope.id));
  const app = data.permissions.find((permission) => permission.id === permissionId)?.app;
  const reasons = reasonsOf(data, userId).filter((reason) =>
    reason.role.permissionIds.includes(permissionId) && above.has(reason.scope.id)
    && (reason.scope.app === undefined || reason.scope.app === app)
  );
  const disabled = user !== undefined && !user.active;

  return { allowed: user !== undefined && !disabled && reasons.length > 0, reasons, disabled };
}

// Everything a user may do anywhere: each permission with the reasons (grants) that give it, by permission id. Only
// grants where the permission means something count: on a scope without an app (the organization) or of its own app
// (a Reader on the Intranet gives no media permission, though the role contains it).
function effectivePermissions(data: AccessData, userId: string): EffectivePermission[] {
  const reasons = reasonsOf(data, userId);

  return data.permissions
    .map((permission) => ({
      permission,
      reasons: reasons.filter((reason) =>
        reason.role.permissionIds.includes(permission.id)
        && (reason.scope.app === undefined || reason.scope.app === permission.app)
      ),
    }))
    .filter((entry) => entry.reasons.length > 0);
}
