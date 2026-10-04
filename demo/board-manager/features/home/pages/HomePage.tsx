import { Anchor, Card, Group, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { useMemo } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { Link } from 'react-router';
import type { Meeting } from '../../../domain';
import { getBoard, localDateTime } from '../../../infra/in-memory';
import { useTranslate } from '../../../shared/lib/i18n';
import { appIcons, formatDateTime, useDb } from '../../../shared/shared';

export { HomePage };

// The start page: the modules (as in the title menu), the next meetings and the minutes that wait for approval. Its
// grids follow the width of the app, not of the window (container queries): the app may be embedded in a narrow place.
function HomePage(): ReactElement {
  const t = useTranslate();
  const boards = useDb((state) => state.boards);
  const meetings = useDb((state) => state.meetings);
  const people = useDb((state) => state.people);
  const organizations = useDb((state) => state.organizations);
  const { upcoming, awaiting } = useMemo(() => {
    const now = localDateTime(new Date());

    return {
      upcoming: meetings
        .filter((meeting) => meeting.status === 'Planned' && meeting.start >= now)
        .sort((a, b) => a.start.localeCompare(b.start)),
      awaiting: meetings
        .filter((meeting) => meeting.status === 'Held' && !meeting.minutesApproved)
        .sort((a, b) => b.start.localeCompare(a.start)),
    };
  }, [meetings]);

  return (
    <Stack gap="lg">
      <Stack gap={2}>
        <Title order={2} size="h3">{t('home.title')}</Title>
        <Text size="sm" c="dimmed">{t('home.intro')}</Text>
      </Stack>
      <SimpleGrid type="container" cols={{ base: 1, '30rem': 2, '56rem': 4 }} spacing="md">
        <ModuleCard
          to="/boards"
          icon={appIcons.boards}
          title={t('modules.boards')}
          text={t('home.boards', { count: boards.length })}
        />
        <ModuleCard
          to="/meetings"
          icon={appIcons.meetings}
          title={t('modules.meetings')}
          text={t('home.meetings', { planned: upcoming.length, total: meetings.length })}
        />
        <ModuleCard
          to="/members"
          icon={appIcons.members}
          title={t('modules.members')}
          text={t('home.people', { count: people.length })}
        />
        <ModuleCard
          to="/organizations"
          icon={appIcons.organizations}
          title={t('modules.organizations')}
          text={t('home.organizations', { count: organizations.length })}
        />
      </SimpleGrid>
      <SimpleGrid type="container" cols={{ base: 1, '48rem': 2 }} spacing="md">
        <MeetingList
          title={t('home.nextMeetings')}
          meetings={upcoming.slice(0, 6)}
          empty={t('home.noPlannedMeetings')}
        />
        <MeetingList
          title={t('home.minutesToApprove')}
          meetings={awaiting.slice(0, 6)}
          empty={t('home.allMinutesApproved')}
        />
      </SimpleGrid>
    </Stack>
  );
}

function ModuleCard(
  { to, icon, title, text }: { to: string; icon: ReactNode; title: string; text: string },
): ReactElement {
  return (
    <Card component={Link} to={to} withBorder padding="md" radius="sm" className="board-manager__card">
      <Group gap="sm" wrap="nowrap">
        <ThemeIcon variant="light" size="lg" radius="sm">{icon}</ThemeIcon>
        <Stack gap={0}>
          <Text fw={600}>{title}</Text>
          <Text size="sm" c="dimmed">{text}</Text>
        </Stack>
      </Group>
    </Card>
  );
}

function MeetingList(
  { title, meetings, empty }: { title: string; meetings: readonly Meeting[]; empty: string },
): ReactElement {
  const boards = useDb((state) => state.boards);

  return (
    <Paper withBorder p="md" radius="sm">
      <Stack gap="sm">
        <Text fw={600}>{title}</Text>
        {meetings.length === 0 && <Text size="sm" c="dimmed">{empty}</Text>}
        {meetings.map((meeting) => (
          <Stack key={meeting.id} gap={0}>
            <Anchor component={Link} to={`/boards/${meeting.boardId}/meetings/${meeting.id}`} size="sm">
              {meeting.title}
            </Anchor>
            <Text size="xs" c="dimmed">
              {getBoard({ boards }, meeting.boardId)?.name} · {formatDateTime(meeting.start)}
            </Text>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}
