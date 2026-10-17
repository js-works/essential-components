import { Avatar, Badge, Group, Paper, SimpleGrid, Stack, Text, useMantineTheme } from '@mantine/core';
import { useMemo } from 'react';

import { AnchorLink } from '@local/micro-app';

import { localDateTime } from '../../../domain/index.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { useBoardList } from '../../boards/reads.js';
import type { MeetingLink } from '../../meetings/index.js';
import { boardMeetingLink } from '../../meetings/index.js';
import { useMeetingList } from '../../meetings/reads.js';
import { useMembershipList, usePersonList } from '../../members/reads.js';

export { HomeAttention };

const LIMIT = 5;

// `person`: the name for an avatar with initials.
type Entry = { id: string; label: string; link: EntryLink; person?: string };
type EntryLink =
  | { to: '/boards/$boardId'; params: { boardId: string } }
  | MeetingLink
  | { to: '/members/$personId'; params: { personId: string } };
type Check = { key: 'overdue' | 'noUpcoming' | 'noChair' | 'noOrganization'; entries: Entry[] };

// What needs a look: data that is probably incomplete or overdue, each check with its count and the first entries as
// links.
function HomeAttention() {
  const t = useTranslate();
  const { primaryColor } = useMantineTheme();
  const boards = useBoardList();
  const meetings = useMeetingList();
  const people = usePersonList();
  const memberships = useMembershipList();

  const checks = useMemo(() => {
    const now = localDateTime(new Date());
    const hasPlanned = new Set(
      meetings.filter((meeting) => meeting.status === 'Planned' && meeting.start >= now).map((meeting) =>
        meeting.boardId
      ),
    );
    const hasChair = new Set(
      memberships.filter((membership) => membership.role === 'Chair').map((membership) => membership.boardId),
    );
    const boardName = (id: string) => boards.find((board) => board.id === id)?.name ?? '';
    const board = (item: { id: string; name: string }): Entry => ({
      id: item.id,
      label: item.name,
      link: { to: '/boards/$boardId', params: { boardId: item.id } },
    });

    const result: Check[] = [
      {
        key: 'overdue',
        entries: meetings
          .filter((meeting) => meeting.status === 'Planned' && meeting.start < now)
          .sort((a, b) => a.start.localeCompare(b.start))
          .map((meeting): Entry => ({
            id: meeting.id,
            label: `${meeting.title} · ${boardName(meeting.boardId)}`,
            link: boardMeetingLink(meeting),
          })),
      },
      { key: 'noUpcoming', entries: boards.filter((item) => !hasPlanned.has(item.id)).map(board) },
      { key: 'noChair', entries: boards.filter((item) => !hasChair.has(item.id)).map(board) },
      {
        key: 'noOrganization',
        entries: people.filter((person) => person.organizationId === '').map((person): Entry => ({
          id: person.id,
          label: person.name,
          link: { to: '/members/$personId', params: { personId: person.id } },
          person: person.name,
        })),
      },
    ];

    return result;
  }, [boards, meetings, people, memberships]);

  return (
    <SimpleGrid type="container" cols={{ base: 1, '48rem': 2 }} spacing="md">
      {checks.map(({ key, entries }) => (
        <Paper key={key} withBorder p="md" radius="sm">
          <Stack gap="xs">
            <Group justify="space-between" wrap="nowrap" align="flex-start">
              <Stack gap={0}>
                <Text fw={600}>{t(`home.attention.${key}`)}</Text>
                <Text size="xs" c="dimmed">{t(`home.attention.${key}Hint`)}</Text>
              </Stack>
              <Badge variant="light" color={entries.length === 0 ? 'gray' : undefined}>{entries.length}</Badge>
            </Group>
            {entries.length === 0 && <Text size="sm" c="dimmed">{t('home.attention.allGood')}</Text>}
            {entries.slice(0, LIMIT).map((entry) => (
              <Group key={entry.id} gap="xs" wrap="nowrap">
                {entry.person !== undefined && <Avatar name={entry.person} color={primaryColor} size="sm" />}
                <AnchorLink {...entry.link} size="sm" truncate>{entry.label}</AnchorLink>
              </Group>
            ))}
            {entries.length > LIMIT && (
              <Text size="xs" c="dimmed">{t('home.attention.more', { count: entries.length - LIMIT })}</Text>
            )}
          </Stack>
        </Paper>
      ))}
    </SimpleGrid>
  );
}
