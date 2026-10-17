import { Stack } from '@mantine/core';

import { PageHeader } from '../../../shared/ui/parts.js';
import { UserTable } from '../components/user-table.js';

export { UsersPage };

function UsersPage() {
  return (
    <Stack gap="md">
      <PageHeader
        title="Users"
        subtitle="Everyone who signs in. A disabled user keeps their data and grants, but has no access."
      />
      <UserTable />
    </Stack>
  );
}
