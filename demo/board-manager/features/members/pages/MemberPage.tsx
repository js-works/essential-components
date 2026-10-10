import { Anchor, Button, Group, SimpleGrid, Stack, Tabs, Text } from '@mantine/core';
import { Fragment, useMemo, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useDataTableController } from '../../../../../packages/data-table/src/react';
import type { DataTableComponent } from '../../../../../packages/data-table/src/react';
import { useDialogs, useToast } from '../../../../../packages/overlays/src/main/bindings/react';
import type { Person } from '../../../domain';
import { boardIdsOf, fetchMemberships, getOrganization, getPerson } from '../../../infra/in-memory';
import type { MembershipRow } from '../../../infra/in-memory';
import { useTranslate } from '../../../shared/lib/i18n';
import type { Translate } from '../../../shared/lib/i18n';
import { appIcons, DataTable, formatDate, PAGE_SIZE_OPTIONS, PageHeader, useDb } from '../../../shared/shared';
import { NotFound } from '../../../shared/ui/NotFound';
import { MeetingsTable } from '../../meetings/components/MeetingsTable';
import { deletePeopleFlow, editPerson } from '../components/PeopleTable';

export { MemberPage };

// A meeting of the member's boards opens below its board (the breadcrumb: Boards › board › meeting).
const meetingPath = (meeting: { id: string; boardId: string }) => `/boards/${meeting.boardId}/meetings/${meeting.id}`;

// One member: their contact and organization ("Overview"), their boards, and the meetings of their boards.
function MemberPage(): ReactElement {
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
          <MembershipsTable personId={person.id} />
        </Tabs.Panel>
        <Tabs.Panel value="meetings" pt="md">
          <MeetingsTable
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
function MemberOverview({ person }: { person: Person }): ReactElement {
  const t = useTranslate();
  const dialogs = useDialogs();
  const toasts = useToast();
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
    if (await deletePeopleFlow(dialogs, toasts, [person])) {
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
            onClick={() => void editPerson(dialogs, toasts, person.id)}
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

const membershipColumnsOf = (t: Translate): readonly DataTableComponent.Column<MembershipRow>[] => [
  {
    key: 'board',
    header: t('members.columns.board'),
    width: 3,
    sortable: true,
    render: (row) => <Anchor component={Link} to={`/boards/${row.boardId}`} size="sm">{row.board}</Anchor>,
  },
  {
    key: 'role',
    header: t('members.columns.role'),
    width: 2,
    sortable: true,
    render: (row) => t(`roles.${row.role}`),
  },
  {
    key: 'since',
    header: t('members.columns.since'),
    width: 2,
    sortable: true,
    render: (row) => formatDate(row.since),
  },
];

// The member's boards and roles, read-only: memberships are changed on the page of a board ("Open", also a double
// click, or the name).
function MembershipsTable({ personId }: { personId: string }): ReactElement {
  const t = useTranslate();
  const columns = useMemo(() => membershipColumnsOf(t), [t]);
  const nav = useDataTableController<MembershipRow>();
  const navigate = useNavigate();
  const source = useMemo(() => fetchMemberships(personId), [personId]);
  const actions = useMemo<readonly DataTableComponent.Action<MembershipRow>[]>(() => [
    {
      type: 'singleRow',
      key: 'open',
      icon: appIcons.open,
      tip: t('members.openBoard'),
      show: 'column',
      default: true,
      onClick: (row) => navigate(`/boards/${row.boardId}`),
    },
  ], [t, navigate]);

  return (
    <DataTable
      controller={nav}
      title={t('modules.boards')}
      subtitle={t('members.boardsSubtitle')}
      density="compact"
      reloadable
      source={source}
      rowKey="id"
      columns={columns}
      actions={actions}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      footer="auto"
    />
  );
}
