import { Stack } from '@mantine/core';

import { PageHeader } from '../../../shared/ui/parts.js';
import { GroupTable } from '../components/group-table.js';

export { GroupsPage };

function GroupsPage() {
  return (
    <Stack gap="md">
      <PageHeader title="Groups" subtitle="Sets of users. Access granted to a group is its members' access." />
      <GroupTable />
    </Stack>
  );
}
