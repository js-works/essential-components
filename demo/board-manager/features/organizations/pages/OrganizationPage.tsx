import { Button, Group, SimpleGrid, Stack, Tabs, Text } from '@mantine/core';
import { Fragment, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useDialogs, useToast } from '../../../../../packages/overlays/src/main/bindings/react';
import type { Organization } from '../../../domain';
import { getOrganization } from '../../../infra/in-memory';
import { countryName } from '../../../shared/lib/countries';
import { useTranslate } from '../../../shared/lib/i18n';
import { appIcons, PageHeader, useDb } from '../../../shared/shared';
import { NotFound } from '../../../shared/ui/NotFound';
import { PeopleTable } from '../../members/components/PeopleTable';
import { deleteOrganizationsFlow, editOrganization, WebsiteLink } from './OrganizationsPage';

export { OrganizationPage };

// One organization: its address and website ("Overview"), and its people.
function OrganizationPage(): ReactElement {
  const t = useTranslate();
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
          <Tabs.Tab value="overview">{t('common.overview')}</Tabs.Tab>
          <Tabs.Tab value="people" leftSection={appIcons.members}>{t('organizations.people')}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="overview" pt="md">
          <OrganizationOverview organization={organization} />
        </Tabs.Panel>
        <Tabs.Panel value="people" pt="md">
          <PeopleTable
            organizationId={organization.id}
            title={t('organizations.people')}
            subtitle={t('organizations.peopleSubtitle', { name: organization.name })}
          />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

// The address and the website, as labels and values, with "Edit" (the organization form in a dialog, like "Edit" in
// the list) and "Delete" (then back to the list).
function OrganizationOverview({ organization }: { organization: Organization }): ReactElement {
  const t = useTranslate();
  const dialogs = useDialogs();
  const toasts = useToast();
  const navigate = useNavigate();
  const people = useDb((state) => state.people.filter((person) => person.organizationId === organization.id).length);
  const place = [organization.zipCode, organization.city].filter((part) => part !== '').join(' ');
  const fields: readonly (readonly [string, ReactNode])[] = [
    [t('organizations.overview.name'), organization.name],
    [t('organization.street'), organization.street],
    [t('organizations.overview.zipCity'), place],
    [t('organization.country'), countryName(organization.country)],
    [
      t('organization.website'),
      organization.website === '' ? '' : <WebsiteLink key="website" url={organization.website} />,
    ],
    [t('organizations.overview.people'), String(people)],
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
        <Text fw={700} size="lg">{t('common.overview')}</Text>
        <Group gap="xs">
          <Button
            size="xs"
            variant="default"
            leftSection={appIcons.edit}
            onClick={() => void editOrganization(dialogs, toasts, organization.id)}
          >
            {t('common.edit')}
          </Button>
          <Button
            size="xs"
            variant="default"
            color="danger"
            leftSection={appIcons.remove}
            onClick={() => void remove()}
          >
            {t('common.delete')}
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
