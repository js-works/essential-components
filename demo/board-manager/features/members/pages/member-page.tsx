import { Anchor, Button, Group, SimpleGrid, Stack, Tabs, Text } from '@mantine/core';
import { Fragment, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import type { Person } from '../../../domain/index.js';
import { boardIdsOf, getOrganization, getPerson } from '../../../infra/in-memory/index.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { appIcons, PageHeader, useDb } from '../../../shared/shared.js';
import { NotFound } from '../../../shared/ui/not-found.js';
import { MeetingTable } from '../../meetings/components/meeting-table.js';
import { MembershipTable } from '../components/membership-table.js';
import { useDeletePeopleFlow, useEditPersonFlow } from '../member-flows.js';

export { MemberPage };

// A meeting of the member's boards opens below its board (the breadcrumb: Boards › board › meeting).
const meetingPath = (meeting: { id: string; boardId: string }) => `/boards/${meeting.boardId}/meetings/${meeting.id}`;

// One member: their contact and organization ("Overview"), their boards, and the meetings of their boards.
function MemberPage() {
  const t = useTranslate();
  const { personId = '' } = useParams();
  const person = useDb((state) => getPerson(state, personId));
  const organization = useDb((state) => getOrganization(state, person?.organizationId));
  const [tab, setTab] = useState<string | null>('overview');

  if (person === undefined) {
    return <NotFound what="member" />;
  }

  return (
    <Stack gap="md">
      <PageHeader title={person.name} subtitle={organization?.name} />
      <Tabs value={tab} onChange={setTab} keepMounted={false}>
        <Tabs.List>
          <Tabs.Tab value="overview">{t('common.overview')}</Tabs.Tab>
          <Tabs.Tab value="boards" leftSection={appIcons.boards}>{t('modules.boards')}</Tabs.Tab>
          <Tabs.Tab value="meetings" leftSection={appIcons.meetings}>{t('modules.meetings')}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="overview" pt="md">
          <MemberOverview person={person} />
        </Tabs.Panel>
        <Tabs.Panel value="boards" pt="md">
          <MembershipTable personId={person.id} />
        </Tabs.Panel>
        <Tabs.Panel value="meetings" pt="md">
          <MeetingTable
            personId={person.id}
            pathOf={meetingPath}
            title={t('modules.meetings')}
            subtitle={t('members.meetingsSubtitle', { name: person.name })}
          />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

// The contact and the organization, as labels and values, with "Edit" (the person form in a dialog, like "Edit" in the
// list) and "Delete" (then back to the list).
function MemberOverview({ person }: { person: Person }) {
  const t = useTranslate();
  const editPerson = useEditPersonFlow();
  const deletePeople = useDeletePeopleFlow();
  const navigate = useNavigate();
  const organization = useDb((state) => getOrganization(state, person.organizationId));
  const boards = useDb((state) => boardIdsOf(state, person.id).length);
  const fields: readonly (readonly [string, ReactNode])[] = [
    [t('members.columns.name'), person.name],
    [t('members.columns.email'), <Anchor key="email" href={`mailto:${person.email}`} size="sm">{person.email}</Anchor>],
    [
      t('members.columns.organization'),
      organization === undefined
        ? ''
        : (
          <Anchor key="organization" component={Link} to={`/organizations/${organization.id}`} size="sm">
            {organization.name}
          </Anchor>
        ),
    ],
    [t('members.columns.boards'), String(boards)],
  ];

  const remove = async () => {
    if (await deletePeople([person])) {
      navigate('/members');
    }
  };

  return (
    // No frame, like the tables of the other tabs: the title and the buttons in one line, like their toolbars.
    <Stack gap="md" maw={820}>
      <Group justify="space-between" className="board-manager__panel-header">
        <Text fw={700} size="lg">{t('common.overview')}</Text>
        <Group gap="xs">
          <Button
            size="xs"
            variant="default"
            leftSection={appIcons.edit}
            onClick={() => void editPerson(person.id)}
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
