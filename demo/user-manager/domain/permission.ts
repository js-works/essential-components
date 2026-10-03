export { permissionParts };
export type { CatalogRepository, Permission, Role, RoleRepository, RoleValues };

// One thing that can be done: `<app>.<resource>.<action>` (`media.file.delete`). The apps register theirs; the user
// manager does not know what they mean, it only grants them.
type Permission = {
  id: string;
  app: string;
  description: string;
};

// A named set of permissions. Built-in roles cannot be changed or deleted.
type Role = {
  id: string;
  name: string;
  description: string;
  permissionIds: readonly string[];
  builtIn: boolean;
};

type RoleValues = { name: string; description: string; permissionIds: readonly string[] };

interface RoleRepository {
  all(signal?: AbortSignal): Promise<readonly Role[]>;
  // The name is unique (ignoring the case) and required.
  create(values: RoleValues): Promise<Role>;
  update(id: string, values: RoleValues): Promise<Role>;
  // Refused for a built-in role, and for a role that is still granted somewhere.
  delete(ids: readonly string[]): Promise<void>;
}

// What the apps register (read only here): their permissions, and the resources access is granted on.
interface CatalogRepository {
  permissions(signal?: AbortSignal): Promise<readonly Permission[]>;
}

// `media.file.delete` is app `media`, resource `file`, action `delete`.
function permissionParts(id: string): { app: string; resource: string; action: string } {
  const [app = '', resource = '', ...action] = id.split('.');

  return { app, resource, action: action.join('.') };
}
