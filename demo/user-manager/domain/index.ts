// The user manager's domain (the shared kernel): users and groups, permissions and roles, the scope tree, grants, and
// the rules of access. Pure TypeScript; imports nothing from outside.

export { checkAccess, effectivePermissions, grantsOf } from './access.js';
export type { AccessData, Decision, EffectivePermission, Reason } from './access.js';
export type { Grant, GrantRepository } from './grant.js';
export { permissionParts } from './permission.js';
export type { CatalogRepository, Permission, Role, RoleRepository, RoleValues } from './permission.js';
export { groupsOf, membersOf } from './principal.js';
export type { Group, GroupRepository, PrincipalRef, User, UserRepository, UserValues } from './principal.js';
export type { Page, Paging, Range, Sort } from './query.js';
export { pathOf, scopeChildren, scopeLabel } from './scope.js';
export type { Scope, ScopeRepository } from './scope.js';
