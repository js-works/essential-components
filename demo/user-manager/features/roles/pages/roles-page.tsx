import { Stack } from '@mantine/core';

import { PageHeader } from '../../../shared/ui/parts.js';
import { RoleTable } from '../components/role-table.js';

export { RolesPage };

function RolesPage() {
  return (
    <Stack gap="md">
      <PageHeader
        title="Roles"
        subtitle="Named sets of permissions. Built-in roles cannot be changed; duplicate one to start your own."
      />
      <RoleTable />
    </Stack>
  );
}
