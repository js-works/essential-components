import { Button, Group, SimpleGrid, Stack, Tabs, Text } from '@mantine/core';
import { Fragment, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useDialogs, useToast } from '../../../packages/overlays/src/main/bindings/react';
import { countryName } from '../countries';
import { getOrganization } from '../db';
import type { Organization } from '../db';
import { appIcons, PageHeader, useDb } from '../shared';
import { NotFound } from './NotFound';
import { deleteOrganizationsFlow, editOrganization, WebsiteLink } from './OrganizationsPage';
import { PeopleTable } from './PeopleTable';

export { OrganizationPage };

// One organization: its address and website ("Overview"), and its people.
function OrganizationPage(): ReactElement {
  const { organizationId = '' } = useParams();
  const organization = useDb((state) => getOrganization(state, organizationId));
  const [tab, setTab] = useState<string | null>('overview');

  if (organization === undefined) {
    return <NotFound what="organization" />;
  }

  return (
    <Stack gap="md">
      <PageHeader
        title={organization.name}
        subtitle={organization.description === '' ? undefined : organization.description}
      />
      <Tabs value={tab} onChange={setTab} keepMounted={false}>
        <Tabs.List>
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab value="people" leftSection={appIcons.members}>People</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="overview" pt="md">
          <OrganizationOverview organization={organization} />
        </Tabs.Panel>
        <Tabs.Panel value="people" pt="md">
          <PeopleTable
            organizationId={organization.id}
            title="People"
            subtitle={`The people of ${organization.name}. A new one belongs to it.`}
          />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

// The address and the website, as labels and values, with "Edit" (the organization form in a dialog, like "Edit" in
// the list) and "Delete" (then back to the list).
function OrganizationOverview({ organization }: { organization: Organization }): ReactElement {
  const dialogs = useDialogs();
  const toasts = useToast();
  const navigate = useNavigate();
  const people = useDb((state) => state.people.filter((person) => person.organizationId === organization.id).length);
  const place = [organization.zipCode, organization.city].filter((part) => part !== '').join(' ');
  const fields: readonly (readonly [string, ReactNode])[] = [
    ['Name', organization.name],
    ['Street', organization.street],
    ['ZIP code, city', place],
    ['Country', countryName(organization.country)],
    ['Website', organization.website === '' ? '' : <WebsiteLink key="website" url={organization.website} />],
    ['People', String(people)],
  ];

  const remove = async () => {
    if (await deleteOrganizationsFlow(dialogs, toasts, [organization])) {
      navigate('/organizations');
    }
  };

  return (
    // No frame, like the table of the other tab: the title and the buttons in one line, like its toolbar.
    <Stack gap="md" maw={820}>
      <Group justify="space-between" className="board-manager__panel-header">
        <Text fw={700} size="lg">Overview</Text>
        <Group gap="xs">
          <Button
            size="xs"
            variant="default"
            leftSection={appIcons.edit}
            onClick={() => void editOrganization(dialogs, toasts, organization.id)}
          >
            Edit
          </Button>
          <Button
            size="xs"
            variant="default"
            color="danger"
            leftSection={appIcons.remove}
            onClick={() => void remove()}
          >
            Delete
          </Button>
        </Group>
      </Group>
      <SimpleGrid cols={2} spacing="lg" verticalSpacing="xs" style={{ gridTemplateColumns: 'max-content 1fr' }}>
        {fields.map(([label, value]) => (
          <Fragment key={label}>
            <Text size="sm" c="dimmed">{label}</Text>
            {typeof value === 'string' ? <Text size="sm">{value === '' ? '–' : value}</Text> : value}
          </Fragment>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
