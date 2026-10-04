import { Stack } from '@mantine/core';
import type { ReactElement } from 'react';
import { PageHeader } from '../../../shared/ui/parts';
import { GrantsTable } from '../components/GrantsTable';

export { AccessPage };

// Every grant: who has which role where.
function AccessPage(): ReactElement {
  return (
    <Stack gap="md">
      <PageHeader
        title="Access"
        subtitle="Who has which role where. A role on a scope applies to everything below it; a group's access is its members' access."
      />
      <GrantsTable name="all" />
    </Stack>
  );
}
