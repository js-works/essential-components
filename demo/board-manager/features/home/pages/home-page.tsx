import { Badge, Card, Group, Paper, SimpleGrid, Stack, Tabs, Text, ThemeIcon, Title } from '@mantine/core';
import type { LinkProps } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

import { AnchorLink } from '@local/micro-app';

import type { Meeting } from '../../../domain/index.js';
import { localDateTime } from '../../../domain/index.js';
import { useLanguage, useTranslate } from '../../../shared/lib/i18n/index.js';
import { appIcons, formatDateTime } from '../../../shared/shared.js';
import { useBoardList } from '../../boards/reads.js';
import { boardMeetingLink } from '../../meetings/index.js';
import { useMeetingList } from '../../meetings/reads.js';
import { usePersonList } from '../../members/reads.js';
import { useOrganizationList } from '../../organizations/reads.js';
import { HomeAttention } from '../components/home-attention.js';
import { HomeCharts } from '../components/home-charts.js';

export { HomePage };

// The start page: the modules (as in the title menu), the next meetings and the minutes that wait for approval. Its
// grids follow the width of the app, not of the window (container queries): the app may be embedded in a narrow place.
function HomePage() {
  const t = useTranslate();
  const [tab, setTab] = useState<string | null>('overview');
  const boards = useBoardList();
  const meetings = useMeetingList();
  const people = usePersonList();
  const organizations = useOrganizationList();
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
      <Tabs value={tab} onChange={setTab} keepMounted={false}>
        <Tabs.List>
          <Tabs.Tab value="overview">{t('home.tabUpNext')}</Tabs.Tab>
          <Tabs.Tab value="charts">{t('home.tabInsights')}</Tabs.Tab>
          <Tabs.Tab value="attention">{t('home.tabAttention')}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="overview" pt="md">
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
        </Tabs.Panel>
        <Tabs.Panel value="charts" pt="md">
          <HomeCharts />
        </Tabs.Panel>
        <Tabs.Panel value="attention" pt="md">
          <HomeAttention />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

function ModuleCard(
  { to, icon, title, text }: { to: LinkProps['to']; icon: ReactNode; title: string; text: string },
) {
  return (
    <Card
      withBorder
      padding="md"
      radius="sm"
      className="board-manager__card"
      renderRoot={(props) => <Link to={to} {...props} />}
    >
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
) {
  const boards = useBoardList();
  const language = useLanguage();
  const month = new Intl.DateTimeFormat(language, { month: 'short' });
  const relative = new Intl.RelativeTimeFormat(language, { numeric: 'auto' });
  const today = new Date().setHours(0, 0, 0, 0);

  return (
    <Paper withBorder p="md" radius="sm">
      <Stack gap="sm">
        <Group justify="space-between">
          <Text fw={600}>{title}</Text>
          {meetings.length > 0 && <Badge variant="light" color="gray">{meetings.length}</Badge>}
        </Group>
        {meetings.length === 0 && <Text size="sm" c="dimmed">{empty}</Text>}
        {meetings.map((meeting) => {
          const date = new Date(meeting.start);
          const days = Math.round((new Date(date).setHours(0, 0, 0, 0) - today) / 86_400_000);

          return (
            <Group key={meeting.id} gap="sm" wrap="nowrap">
              <div className="board-manager-home-date">
                <span className="board-manager-home-date__month">{month.format(date)}</span>
                <span className="board-manager-home-date__day">{date.getDate()}</span>
              </div>
              <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
                <AnchorLink {...boardMeetingLink(meeting)} size="sm" truncate>
                  {meeting.title}
                </AnchorLink>
                <Text size="xs" c="dimmed" truncate>
                  {boards.find((board) => board.id === meeting.boardId)?.name} · {formatDateTime(meeting.start)}
                </Text>
              </Stack>
              <Badge variant="light" color="gray" radius="sm">{relative.format(days, 'day')}</Badge>
            </Group>
          );
        })}
      </Stack>
    </Paper>
  );
}
