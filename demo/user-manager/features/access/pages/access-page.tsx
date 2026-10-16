import { Stack } from '@mantine/core';
import { PageHeader } from '../../../shared/ui/parts.js';
import { GrantTable } from '../components/grant-table.js';

export { AccessPage };

// Every grant: who has which role where.
function AccessPage() {
  return (
    <Stack gap="md">
      <PageHeader
        title="Access"
        subtitle="Who has which role where. A role on a scope applies to everything below it; a group's access is its members' access."
      />
      <GrantTable name="all" />
    </Stack>
  );
}
