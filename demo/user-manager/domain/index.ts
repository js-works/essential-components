// The user manager's domain (the shared kernel): users and groups, permissions and roles, the scope tree, grants, and
// the rules of access. Pure TypeScript; imports nothing from outside.

export { checkAccess, effectivePermissions, grantsOf } from './access';
export type { AccessData, Decision, EffectivePermission, Reason } from './access';
export type { Grant, GrantRepository } from './grant';
export { permissionParts } from './permission';
export type { CatalogRepository, Permission, Role, RoleRepository, RoleValues } from './permission';
export { groupsOf, membersOf } from './principal';
export type { Group, GroupRepository, PrincipalRef, User, UserRepository, UserValues } from './principal';
export type { Page, Paging, Range, Sort } from './query';
export { pathOf, scopeChildren, scopeLabel } from './scope';
export type { Scope, ScopeRepository } from './scope';
