export { groupsOf, membersOf };
export type { Group, GroupRepository, PrincipalRef, User, UserRepository, UserValues };

// A person who signs in. Disabled users keep their data and their grants, but get no access.
type User = {
  id: string;
  name: string;
  email: string;
  title: string;
  department: string;
  active: boolean;
  // An ISO date and time.
  created: string;
};

type UserValues = Omit<User, 'id' | 'created'>;

// A set of users: what a group is granted, its members get.
type Group = {
  id: string;
  name: string;
  description: string;
  memberIds: readonly string[];
};

// Who a grant is for: a user or a group.
type PrincipalRef = { type: 'user' | 'group'; id: string };

interface UserRepository {
  all(signal?: AbortSignal): Promise<readonly User[]>;
  // The email is unique (ignoring the case); name and email are required.
  create(values: UserValues): Promise<User>;
  update(id: string, values: UserValues): Promise<User>;
  // With their memberships and their own grants.
  delete(ids: readonly string[]): Promise<void>;
}

interface GroupRepository {
  all(signal?: AbortSignal): Promise<readonly Group[]>;
  // The name is unique (ignoring the case) and required.
  create(values: { name: string; description: string }): Promise<Group>;
  update(id: string, values: { name: string; description: string }): Promise<Group>;
  addMembers(id: string, userIds: readonly string[]): Promise<void>;
  removeMembers(id: string, userIds: readonly string[]): Promise<void>;
  // With their grants.
  delete(ids: readonly string[]): Promise<void>;
}

// The groups a user is a member of.
function groupsOf(groups: readonly Group[], userId: string): Group[] {
  return groups.filter((group) => group.memberIds.includes(userId));
}

function membersOf(users: readonly User[], group: Group): User[] {
  return users.filter((user) => group.memberIds.includes(user.id));
}
