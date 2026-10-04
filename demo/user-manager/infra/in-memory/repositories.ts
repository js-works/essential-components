import type {
  CatalogRepository,
  GrantRepository,
  GroupRepository,
  RoleRepository,
  ScopeRepository,
  UserRepository,
} from '../../domain';
import type { Data } from './seed';
import { seed } from './seed';

export { createInMemoryRepositories };
export type { Repositories };

type Repositories = {
  users: UserRepository;
  groups: GroupRepository;
  roles: RoleRepository;
  grants: GrantRepository;
  scopes: ScopeRepository;
  catalog: CatalogRepository;
};

// The user of the page: what they grant is "granted by" them.
const CURRENT_USER = 'Admin';

// A server takes a while: reading a little, saving (the spinners of the dialogs show) a bit longer.
const LOADING_TIME = 250;
const SAVE_TIME = 600;

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }

    const timer = setTimeout(resolve, ms);

    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    }, { once: true });
  });
}

const now = () => new Date().toISOString().slice(0, 16);

// The in-memory implementation of the user manager's repositories, on one store (seeded) for as long as the page is
// open. A real backend would come as `infra/http/` with the same interfaces.
function createInMemoryRepositories(): Repositories {
  const data: Data = seed();
  let next = 1000;
  const newId = (prefix: string) => `${prefix}${next++}`;

  const required = (value: string, what: string) => {
    const trimmed = value.trim();

    if (trimmed === '') {
      throw new Error(`The ${what} is required.`);
    }

    return trimmed;
  };

  const unique = <T extends { id: string }>(
    items: readonly T[],
    id: string | undefined,
    key: (item: T) => string,
    value: string,
    message: string,
  ) => {
    if (items.some((item) => item.id !== id && key(item).toLowerCase() === value.toLowerCase())) {
      throw new Error(message);
    }
  };

  return {
    users: {
      async all(signal) {
        await wait(LOADING_TIME, signal);
        return [...data.users];
      },
      async create(values) {
        await wait(SAVE_TIME);
        const name = required(values.name, 'name');
        const email = required(values.email, 'email');
        unique(data.users, undefined, (user) => user.email, email, `There is already a user with "${email}".`);
        const user = { ...values, id: newId('u'), name, email, created: now() };
        data.users.push(user);
        return user;
      },
      async update(id, values) {
        await wait(SAVE_TIME);
        const name = required(values.name, 'name');
        const email = required(values.email, 'email');
        unique(data.users, id, (user) => user.email, email, `There is already a user with "${email}".`);
        const user = data.users.find((candidate) => candidate.id === id);
        if (user === undefined) {
          throw new Error('The user does not exist anymore.');
        }
        const updated = { ...user, ...values, name, email };
        data.users = data.users.map((candidate) => (candidate.id === id ? updated : candidate));
        return updated;
      },
      async delete(ids) {
        await wait(SAVE_TIME);
        data.users = data.users.filter((user) => !ids.includes(user.id));
        data.groups = data.groups.map((group) => ({
          ...group,
          memberIds: group.memberIds.filter((id) => !ids.includes(id)),
        }));
        data.grants = data.grants.filter((grant) =>
          !(grant.principal.type === 'user' && ids.includes(grant.principal.id))
        );
      },
    },

    groups: {
      async all(signal) {
        await wait(LOADING_TIME, signal);
        return [...data.groups];
      },
      async create(values) {
        await wait(SAVE_TIME);
        const name = required(values.name, 'name');
        unique(data.groups, undefined, (group) => group.name, name, `There is already a group "${name}".`);
        const group = { id: newId('g'), name, description: values.description.trim(), memberIds: [] };
        data.groups.push(group);
        return group;
      },
      async update(id, values) {
        await wait(SAVE_TIME);
        const name = required(values.name, 'name');
        unique(data.groups, id, (group) => group.name, name, `There is already a group "${name}".`);
        const group = data.groups.find((candidate) => candidate.id === id);
        if (group === undefined) {
          throw new Error('The group does not exist anymore.');
        }
        const updated = { ...group, name, description: values.description.trim() };
        data.groups = data.groups.map((candidate) => (candidate.id === id ? updated : candidate));
        return updated;
      },
      async addMembers(id, userIds) {
        await wait(SAVE_TIME);
        data.groups = data.groups.map((group) =>
          group.id === id ? { ...group, memberIds: [...new Set([...group.memberIds, ...userIds])] } : group
        );
      },
      async removeMembers(id, userIds) {
        await wait(SAVE_TIME);
        data.groups = data.groups.map((group) =>
          group.id === id
            ? { ...group, memberIds: group.memberIds.filter((member) => !userIds.includes(member)) }
            : group
        );
      },
      async delete(ids) {
        await wait(SAVE_TIME);
        data.groups = data.groups.filter((group) => !ids.includes(group.id));
        data.grants = data.grants.filter((grant) =>
          !(grant.principal.type === 'group' && ids.includes(grant.principal.id))
        );
      },
    },

    roles: {
      async all(signal) {
        await wait(LOADING_TIME, signal);
        return [...data.roles];
      },
      async create(values) {
        await wait(SAVE_TIME);
        const name = required(values.name, 'name');
        unique(data.roles, undefined, (role) => role.name, name, `There is already a role "${name}".`);
        const role = {
          id: newId('r'),
          name,
          description: values.description.trim(),
          permissionIds: [...values.permissionIds],
          builtIn: false,
        };
        data.roles.push(role);
        return role;
      },
      async update(id, values) {
        await wait(SAVE_TIME);
        const role = data.roles.find((candidate) => candidate.id === id);
        if (role === undefined) {
          throw new Error('The role does not exist anymore.');
        }
        if (role.builtIn) {
          throw new Error('A built-in role cannot be changed.');
        }
        const name = required(values.name, 'name');
        unique(data.roles, id, (candidate) => candidate.name, name, `There is already a role "${name}".`);
        const updated = {
          ...role,
          name,
          description: values.description.trim(),
          permissionIds: [...values.permissionIds],
        };
        data.roles = data.roles.map((candidate) => (candidate.id === id ? updated : candidate));
        return updated;
      },
      async delete(ids) {
        await wait(SAVE_TIME);
        const roles = data.roles.filter((role) => ids.includes(role.id));
        const builtIn = roles.find((role) => role.builtIn);
        if (builtIn !== undefined) {
          throw new Error(`"${builtIn.name}" is built in and cannot be deleted.`);
        }
        const used = roles.find((role) => data.grants.some((grant) => grant.roleId === role.id));
        if (used !== undefined) {
          throw new Error(`"${used.name}" is still granted. Revoke its grants first.`);
        }
        data.roles = data.roles.filter((role) => !ids.includes(role.id));
      },
    },

    grants: {
      async all(signal) {
        await wait(LOADING_TIME, signal);
        return [...data.grants];
      },
      async create(principal, roleId, scopeId) {
        await wait(SAVE_TIME);
        if (
          data.grants.some((grant) =>
            grant.principal.type === principal.type && grant.principal.id === principal.id
            && grant.roleId === roleId && grant.scopeId === scopeId
          )
        ) {
          throw new Error('This access is granted already.');
        }
        const grant = { id: newId('a'), principal, roleId, scopeId, created: now(), grantedBy: CURRENT_USER };
        data.grants.push(grant);
        return grant;
      },
      async delete(ids) {
        await wait(SAVE_TIME);
        data.grants = data.grants.filter((grant) => !ids.includes(grant.id));
      },
    },

    scopes: {
      async all(signal) {
        await wait(LOADING_TIME, signal);
        return [...data.scopes];
      },
    },

    catalog: {
      async permissions(signal) {
        await wait(LOADING_TIME, signal);
        return [...data.permissions];
      },
    },
  };
}
