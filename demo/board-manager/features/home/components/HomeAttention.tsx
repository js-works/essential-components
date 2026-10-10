import { Anchor, Avatar, Badge, Group, Paper, SimpleGrid, Stack, Text, useMantineTheme } from '@mantine/core';
import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { Link } from 'react-router';
import { localDateTime } from '../../../infra/in-memory';
import { useTranslate } from '../../../shared/lib/i18n';
import { useDb } from '../../../shared/shared';

export { HomeAttention };

const LIMIT = 5;

// `person`: the name for an avatar with initials.
type Entry = { id: string; label: string; to: string; person?: string };
type Check = { key: 'overdue' | 'noUpcoming' | 'noChair' | 'noOrganization'; entries: Entry[] };

// What needs a look: data that is probably incomplete or overdue, each check with its count and the first entries as
// links.
function HomeAttention(): ReactElement {
  const t = useTranslate();
  const { primaryColor } = useMantineTheme();
  const boards = useDb((state) => state.boards);
  const meetings = useDb((state) => state.meetings);
  const people = useDb((state) => state.people);
  const memberships = useDb((state) => state.memberships);

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
      to: `/boards/${item.id}`,
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
            to: `/boards/${meeting.boardId}/meetings/${meeting.id}`,
          })),
      },
      { key: 'noUpcoming', entries: boards.filter((item) => !hasPlanned.has(item.id)).map(board) },
      { key: 'noChair', entries: boards.filter((item) => !hasChair.has(item.id)).map(board) },
      {
        key: 'noOrganization',
        entries: people.filter((person) => person.organizationId === '').map((person): Entry => ({
          id: person.id,
          label: person.name,
          to: `/members/${person.id}`,
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
                <Anchor component={Link} to={entry.to} size="sm" truncate>{entry.label}</Anchor>
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
