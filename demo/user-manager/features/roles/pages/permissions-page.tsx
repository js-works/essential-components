import { Stack } from '@mantine/core';

import { PageHeader } from '../../../shared/ui/parts.js';
import { PermissionTable } from '../components/permission-table.js';

export { PermissionsPage };

function PermissionsPage() {
  return (
    <Stack gap="md">
      <PageHeader
        title="Permissions"
        subtitle="Everything that can be granted: the apps register their permissions, roles bundle them."
      />
      <PermissionTable />
    </Stack>
  );
}
