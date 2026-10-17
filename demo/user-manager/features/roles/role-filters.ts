import type { TableFilter } from '@local/data-table/react';
import { selectFilter } from '@local/data-table/react';

import type { AccessData, Role } from '../../domain/index.js';

export { appFilter, roleFilter };

// The filter of a role (by its name): the given roles.
function roleFilter(roles: readonly Role[]): TableFilter {
  return selectFilter({ options: roles.map((role) => ({ value: role.name, label: role.name })), multiple: true });
}

// The filter of the app of a permission (by its name): the apps that register permissions.
function appFilter(data: AccessData | undefined): TableFilter {
  const apps = [...new Set((data?.permissions ?? []).map((permission) => permission.app))].map((app) =>
    data?.scopes.find((scope) => scope.id === `s-${app}`)?.name ?? app
  );

  return selectFilter({ options: apps.map((app) => ({ value: app, label: app })), multiple: true });
}
