import type {
  AccessData,
  CatalogRepository,
  GrantRepository,
  GroupRepository,
  RoleRepository,
  ScopeRepository,
  UserRepository,
} from '../../domain';

export { createIamService };
export type { IamService };

// The app's service: what the UI calls. The repositories' own methods, and `data()`: everything access depends on, in
// one read (the lists are small; every page needs several of them, and the rules of access need all).
function createIamService(repositories: {
  users: UserRepository;
  groups: GroupRepository;
  roles: RoleRepository;
  grants: GrantRepository;
  scopes: ScopeRepository;
  catalog: CatalogRepository;
}) {
  const { users, groups, roles, grants, scopes, catalog } = repositories;

  return {
    async data(signal?: AbortSignal): Promise<AccessData> {
      const [userList, groupList, roleList, grantList, scopeList, permissions] = await Promise.all([
        users.all(signal),
        groups.all(signal),
        roles.all(signal),
        grants.all(signal),
        scopes.all(signal),
        catalog.permissions(signal),
      ]);

      return {
        users: userList,
        groups: groupList,
        roles: roleList,
        grants: grantList,
        scopes: scopeList,
        permissions,
      };
    },
    createUser: users.create,
    updateUser: users.update,
    deleteUsers: users.delete,
    createGroup: groups.create,
    updateGroup: groups.update,
    addMembers: groups.addMembers,
    removeMembers: groups.removeMembers,
    deleteGroups: groups.delete,
    createRole: roles.create,
    updateRole: roles.update,
    deleteRoles: roles.delete,
    grant: grants.create,
    revoke: grants.delete,
  };
}

type IamService = ReturnType<typeof createIamService>;
