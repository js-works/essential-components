import { useDialogs, useToast } from '@local/overlays/react';
import { Badge, Button, Group, Menu, Paper, SimpleGrid, Stack, Tabs, Text, Title } from '@mantine/core';
import { Fragment, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import type { AgendaItem, AgendaSection, Meeting } from '../../../domain/index.js';
import { agendaNumbers, agendaOf } from '../../../domain/index.js';
import { getBoard, getMeeting } from '../../../infra/in-memory/index.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { appIcons, formatDateTime, formatTime, PageHeader, useDb } from '../../../shared/shared.js';
import { NotFound } from '../../../shared/ui/not-found.js';
import { AgendaTable } from '../components/agenda-table.js';
import { membersOf, numbered } from '../components/agenda.js';
import { DocumentTable } from '../components/document-table.js';
import { MinutesBadge, StatusBadge } from '../components/meeting-badges.js';
import { MinutesText } from '../components/minutes.js';
import { useApproveMinutesFlow, useDeleteMeetingsFlow, useEditMeetingFlow, useMarkHeldFlow } from '../meeting-flows.js';
import { downloadMeetingPdf, previewMeetingPdf, printMeetingPdf } from '../pdf/index.js';

export { MeetingPage };

// One meeting: its agenda (with the minutes per item), the minutes as one document, and the documents of the meeting.
// It is below its board (`/boards/:boardId/meetings/:meetingId`) or below "Meetings" (`/meetings/:meetingId`).
function MeetingPage() {
  const t = useTranslate();
  const { meetingId = '' } = useParams();
  const meeting = useDb((state) => getMeeting(state, meetingId));
  const boardName = useDb((state) => getBoard(state, meeting?.boardId)?.name ?? '');
  const agendaItems = useDb((state) => state.agendaItems);
  const agendaSections = useDb((state) => state.agendaSections);
  const approveMinutes = useApproveMinutesFlow();
  const markHeld = useMarkHeldFlow();
  const [tab, setTab] = useState<string | null>('overview');
  const duration = useMemo(
    () => agendaItems.filter((item) => item.meetingId === meetingId).reduce((sum, item) => sum + item.duration, 0),
    [agendaItems, meetingId],
  );

  if (meeting === undefined) {
    return <NotFound what="meeting" />;
  }

  const approveButton = meeting.status === 'Held' && !meeting.minutesApproved && (
    <Button
      size="xs"
      onClick={() => void approveMinutes(meeting)}
    >
      {t('meetings.approveTitle')}
    </Button>
  );

  return (
    <Stack gap="md">
      <PageHeader
        title={meeting.title}
        subtitle={`${boardName} · ${formatDateTime(meeting.start)} · ${meeting.location} · ${
          t('meetings.durationMin', { count: duration })
        }`}
        badges={
          <>
            <StatusBadge status={meeting.status} />
            <MinutesBadge meeting={meeting} />
          </>
        }
        actions={
          <>
            {meeting.status === 'Planned' && (
              <Button size="xs" variant="default" onClick={() => void markHeld(meeting)}>
                {t('meetings.markHeldTitle')}
              </Button>
            )}
            {approveButton}
          </>
        }
      />
      <Tabs value={tab} onChange={setTab} keepMounted={false}>
        <Tabs.List>
          <Tabs.Tab value="overview">{t('common.overview')}</Tabs.Tab>
          <Tabs.Tab value="agenda">{t('meetings.tabs.agenda')}</Tabs.Tab>
          <Tabs.Tab value="minutes" leftSection={appIcons.minutes}>{t('meetings.tabs.minutes')}</Tabs.Tab>
          <Tabs.Tab value="documents">{t('meetings.tabs.documents')}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="overview" pt="md">
          <MeetingOverview meeting={meeting} boardName={boardName} duration={duration} />
        </Tabs.Panel>
        <Tabs.Panel value="agenda" pt="md">
          <AgendaTable meeting={meeting} />
        </Tabs.Panel>
        <Tabs.Panel value="minutes" pt="md">
          <MinutesView
            meeting={meeting}
            agendaItems={agendaItems}
            agendaSections={agendaSections}
            boardName={boardName}
          />
        </Tabs.Panel>
        <Tabs.Panel value="documents" pt="md">
          <DocumentTable meeting={meeting} />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

// The base information of a meeting, as a list of labels and values, with "Edit" (the meeting form in a dialog, like
// "Edit" in the meetings list) and "Delete" (then back to where it was opened: its board, or the meetings list). The
// end is the start plus the duration of the agenda.
function MeetingOverview({ meeting, boardName, duration }: {
  meeting: Meeting;
  boardName: string;
  duration: number;
}) {
  const t = useTranslate();
  const dialogs = useDialogs();
  const toasts = useToast();
  const editMeeting = useEditMeetingFlow();
  const deleteMeetings = useDeleteMeetingsFlow();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const items = useDb((state) => state.agendaItems.filter((item) => item.meetingId === meeting.id).length);
  const sections = useDb((state) => state.agendaSections.filter((section) => section.meetingId === meeting.id).length);
  const documents = useDb((state) => state.documents.filter((document) => document.meetingId === meeting.id).length);
  const end = new Date(new Date(meeting.start).getTime() + duration * 60_000);
  const fields: readonly (readonly [string, ReactNode])[] = [
    [t('meetings.overview.title'), meeting.title],
    [t('meetings.overview.board'), boardName],
    [
      t('meetings.overview.dateTime'),
      `${formatDateTime(meeting.start)} – ${formatTime(end)} (${t('meetings.durationMin', { count: duration })})`,
    ],
    [t('meetings.overview.location'), meeting.location],
    [
      t('meetings.overview.status'),
      <Group key="status" gap="xs">
        <StatusBadge status={meeting.status} />
        <MinutesBadge meeting={meeting} />
      </Group>,
    ],
    [
      t('meetings.overview.agenda'),
      sections === 0
        ? t('meetings.agendaItems', { count: items })
        : `${t('meetings.agendaItems', { count: items })} ${t('meetings.inSections', { count: sections })}`,
    ],
    [t('meetings.overview.documents'), String(documents)],
  ];

  const remove = async () => {
    if (await deleteMeetings([meeting])) {
      navigate(pathname.startsWith('/boards/') ? `/boards/${meeting.boardId}` : '/meetings');
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
            onClick={() => void editMeeting(meeting.id)}
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
          <Menu position="bottom-end" shadow="md" floatingStrategy="fixed">
            <Menu.Target>
              <Button size="xs" variant="default" leftSection={appIcons.pdf} rightSection={appIcons.chevronDown}>
                PDF
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={appIcons.preview}
                onClick={() => void previewMeetingPdf(dialogs, toasts, meeting)}
              >
                {t('meetings.pdf.preview')}
              </Menu.Item>
              <Menu.Item leftSection={appIcons.print} onClick={() => void printMeetingPdf(dialogs, toasts, meeting)}>
                {t('meetings.pdf.print')}
              </Menu.Item>
              <Menu.Item
                leftSection={appIcons.download}
                onClick={() => void downloadMeetingPdf(dialogs, toasts, meeting)}
              >
                {t('meetings.pdf.download')}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
      <SimpleGrid cols={2} spacing="lg" verticalSpacing="xs" style={{ gridTemplateColumns: 'max-content 1fr' }}>
        {fields.map(([label, value]) => (
          <Fragment key={label}>
            <Text size="sm" c="dimmed">{label}</Text>
            {typeof value === 'string' ? <Text size="sm">{value}</Text> : value}
          </Fragment>
        ))}
      </SimpleGrid>
    </Stack>
  );
}

// The minutes as one document: every item with its minutes and decision, in the order of the agenda; the sections as
// headings, their items indented, and "Other" for the items without a section.
function MinutesView({ meeting, agendaItems, agendaSections, boardName }: {
  meeting: Meeting;
  agendaItems: readonly AgendaItem[];
  agendaSections: readonly AgendaSection[];
  boardName: string;
}) {
  const t = useTranslate();
  const agenda = useMemo(
    () => agendaOf({ agendaItems, agendaSections }, meeting.id),
    [agendaItems, agendaSections, meeting.id],
  );
  const numbers = useMemo(() => agendaNumbers(agenda), [agenda]);
  const memberships = useDb((state) => state.memberships);
  const people = useDb((state) => state.people);
  const attendees = useMemo(
    () => membersOf({ memberships, people }, meeting.boardId).map((person) => person.name),
    [memberships, people, meeting.boardId],
  );

  // Without minutes (planned, cancelled), the note is in the same frame as the minutes.
  if (meeting.status !== 'Held') {
    return (
      <Paper withBorder p="lg" radius="sm" maw={820}>
        <Text c="dimmed" size="sm">
          {meeting.status === 'Cancelled' ? t('meetings.minutesView.cancelled') : t('meetings.minutesView.planned')}
        </Text>
      </Paper>
    );
  }

  return (
    <Paper withBorder p="lg" radius="sm" maw={820}>
      <Stack gap="md">
        <Stack gap={2}>
          <Title order={3} size="h4">{t('meetings.minutesView.title', { title: meeting.title })}</Title>
          <Text size="sm" c="dimmed">{boardName} · {formatDateTime(meeting.start)} · {meeting.location}</Text>
          <Text size="sm" c="dimmed">{t('meetings.minutesView.members', { names: attendees.join(', ') })}</Text>
          <Group>
            <Badge size="sm" variant={meeting.minutesApproved ? 'filled' : 'outline'}>
              {meeting.minutesApproved ? t('meetings.minutesView.approved') : t('meetings.minutesView.draft')}
            </Badge>
          </Group>
        </Stack>
        <Stack gap="md">
          {agenda.map((entry, index) => {
            if (entry.type === 'section') {
              return (
                <Title key={entry.section.id} order={4} size="h5" mt="xs">
                  {numbered(numbers.get(entry.section.id) ?? '', entry.section.title)}
                </Title>
              );
            }

            const { item } = entry;
            const previous = agenda[index - 1];
            // The first item of "Other" (with sections only: `numbers` has the key `''`) starts its heading.
            const other = item.sectionId === '' && numbers.has('')
              && !(previous?.type === 'item' && previous.item.sectionId === '');

            return (
              <Fragment key={item.id}>
                {other && (
                  <Title order={4} size="h5" mt="xs">
                    {numbered(numbers.get('') ?? '', t('meetings.agenda.other'))}
                  </Title>
                )}
                <Stack gap={2} pl={numbers.has('') || item.sectionId !== '' ? 'md' : 0}>
                  <Text fw={600} size="sm">{numbered(numbers.get(item.id) ?? '', item.title)}</Text>
                  <MinutesText minutes={item.minutes} empty={t('meetings.minutesView.none')} />
                  {item.decision !== '' && (
                    <Text size="sm" fs="italic">{t('meetings.agenda.decision', { decision: item.decision })}</Text>
                  )}
                </Stack>
              </Fragment>
            );
          })}
        </Stack>
      </Stack>
    </Paper>
  );
}
