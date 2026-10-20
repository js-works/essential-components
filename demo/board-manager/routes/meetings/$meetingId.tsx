import { Badge, Button, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Fragment, useMemo } from 'react';

import { AnchorLink } from '@local/micro-app';

import type { MeetingSummary } from '../../domain/index.js';
import { agendaNumbers } from '../../domain/index.js';
import { numbered } from '../../features/meetings/agenda.js';
import { AgendaTable } from '../../features/meetings/agenda-table.js';
import { DocumentTable } from '../../features/meetings/document-table.js';
import { MinutesBadge, StatusBadge } from '../../features/meetings/meeting-components.js';
import { useAgenda, useBoardMembers, useMeeting } from '../../features/meetings/meeting-data.js';
import { useApproveMinutesFlow, useMarkHeldFlow, useMeetingFlows } from '../../features/meetings/meeting-flows.js';
import { MinutesText } from '../../features/meetings/minutes.js';
import { useTranslate } from '../../shared/lib/i18n/index.js';
import { appIcons, formatDateTime, formatTime } from '../../shared/shared.js';
import { NotFound } from '../../shared/ui/not-found.js';
import { RecordPage } from '../../shared/ui/record-page.js';

export const Route = createFileRoute('/meetings/$meetingId')({
  staticData: { crumb: (params) => <MeetingCrumb id={params['meetingId'] ?? ''} /> },
  component: MeetingPage,
});

function MeetingCrumb({ id }: { id: string }) {
  const t = useTranslate();

  return useMeeting(id).meeting?.title ?? t('entities.meeting');
}

// One meeting: its base information ("Overview"; the end is the start plus the duration of the agenda), its agenda
// (with the minutes per item), the minutes as one document, and its documents. The subtitle links to its board.
function MeetingPage() {
  const t = useTranslate();
  const navigate = useNavigate();
  const { meetingId } = Route.useParams();
  const { meeting, isPending } = useMeeting(meetingId);
  const { entries, sections } = useAgenda(meetingId);
  const flows = useMeetingFlows();
  const approveMinutes = useApproveMinutesFlow();
  const markHeld = useMarkHeldFlow();
  const duration = entries.reduce((sum, entry) => sum + (entry.type === 'item' ? entry.item.duration : 0), 0);
  const items = (record: MeetingSummary) =>
    sections.length === 0
      ? t('meetings.agendaItems', { count: record.items })
      : `${t('meetings.agendaItems', { count: record.items })} ${t('meetings.inSections', { count: sections.length })}`;
  const end = (record: MeetingSummary) => new Date(new Date(record.start).getTime() + duration * 60_000);

  return (
    <RecordPage
      record={meeting}
      isPending={isPending}
      notFound={<NotFound what="meeting" />}
      title={(record) => record.title}
      subtitle={(record) => (
        <>
          <AnchorLink to="/boards/$boardId" params={{ boardId: record.boardId }} size="sm">{record.board}</AnchorLink>
          {` · ${formatDateTime(record.start)} · ${record.location} · ${
            t('meetings.durationMin', { count: duration })
          }`}
        </>
      )}
      badges={(record) => (
        <>
          <StatusBadge status={record.status} />
          <MinutesBadge meeting={record} />
        </>
      )}
      actions={(record) => (
        <>
          {record.status === 'Planned' && (
            <Button size="xs" variant="default" onClick={() => void markHeld(record)}>
              {t('meetings.markHeldTitle')}
            </Button>
          )}
          {record.status === 'Held' && !record.minutesApproved && (
            <Button
              size="xs"
              onClick={() => void approveMinutes(record)}
            >
              {t('meetings.approveTitle')}
            </Button>
          )}
        </>
      )}
      fields={(record) => [
        [t('meetings.overview.title'), record.title],
        [t('meetings.overview.board'), record.board],
        [
          t('meetings.overview.dateTime'),
          `${formatDateTime(record.start)} – ${formatTime(end(record))} (${
            t('meetings.durationMin', { count: duration })
          })`,
        ],
        [t('meetings.overview.location'), record.location],
        [
          t('meetings.overview.status'),
          <Group gap="xs">
            <StatusBadge status={record.status} />
            <MinutesBadge meeting={record} />
          </Group>,
        ],
        [t('meetings.overview.agenda'), items(record)],
        [t('meetings.overview.documents'), String(record.documents)],
      ]}
      onEdit={flows.edit}
      onDelete={async (record) => {
        if (await flows.remove([record])) {
          void navigate({ to: '/meetings' });
        }
      }}
      tabs={[
        { key: 'agenda', label: t('meetings.tabs.agenda'), render: (record) => <AgendaTable meeting={record} /> },
        {
          key: 'minutes',
          label: t('meetings.tabs.minutes'),
          icon: appIcons.minutes,
          render: (record) => <MinutesView meeting={record} />,
        },
        {
          key: 'documents',
          label: t('meetings.tabs.documents'),
          render: (record) => <DocumentTable meeting={record} />,
        },
      ]}
    />
  );
}

// The minutes as one document: every item with its minutes and decision, in the order of the agenda; the sections as
// headings, their items indented, and "Other" for the items without a section.
function MinutesView({ meeting }: { meeting: MeetingSummary }) {
  const t = useTranslate();
  const { entries: agenda } = useAgenda(meeting.id);
  const numbers = useMemo(() => agendaNumbers(agenda), [agenda]);
  const attendees = useBoardMembers(meeting.boardId).map((person) => person.name);

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
          <Text size="sm" c="dimmed">{meeting.board} · {formatDateTime(meeting.start)} · {meeting.location}</Text>
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
