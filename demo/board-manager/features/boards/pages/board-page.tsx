import { Button, Group, SimpleGrid, Stack, Tabs, Text } from '@mantine/core';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Fragment, useState } from 'react';

import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { appIcons, formatDateTime, PageHeader } from '../../../shared/shared.js';
import { NotFound } from '../../../shared/ui/not-found.js';
import { MeetingTable } from '../../meetings/components/meeting-table.js';
import { boardMeetingLink } from '../../meetings/index.js';
import { MemberTable } from '../components/member-table.js';
import { useDeleteBoardsFlow, useEditBoardFlow } from '../flows/board-flows.js';
import { useBoard } from '../reads.js';

export { BoardPage };

// A meeting of a board opens below the board (the breadcrumb: Boards › board › meeting).
// One board: its base information ("Overview"), its meetings and its members, in three tabs.
function BoardPage() {
  const t = useTranslate();
  const { boardId } = useParams({ from: '/boards/$boardId' });
  const { board, isPending } = useBoard(boardId);
  const [tab, setTab] = useState<string | null>('overview');

  if (isPending) {
    return null;
  }

  if (board === undefined) {
    return <NotFound what="board" />;
  }

  return (
    <Stack gap="md">
      <PageHeader title={board.name} subtitle={board.description} />
      <Tabs value={tab} onChange={setTab} keepMounted={false}>
        <Tabs.List>
          <Tabs.Tab value="overview">{t('common.overview')}</Tabs.Tab>
          <Tabs.Tab value="meetings" leftSection={appIcons.meetings}>{t('modules.meetings')}</Tabs.Tab>
          <Tabs.Tab value="members" leftSection={appIcons.members}>{t('modules.members')}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="overview" pt="md">
          <BoardOverview boardId={board.id} />
        </Tabs.Panel>
        <Tabs.Panel value="meetings" pt="md">
          <MeetingTable
            boardId={board.id}
            linkOf={boardMeetingLink}
            title={t('modules.meetings')}
            subtitle={t('boards.meetingsSubtitle')}
          />
        </Tabs.Panel>
        <Tabs.Panel value="members" pt="md">
          <MemberTable board={board} />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

// The base information as labels and values, with "Edit" (the board form in a dialog, like "Edit" in the list) and
// "Delete" (then back to the list).
function BoardOverview({ boardId }: { boardId: string }) {
  const t = useTranslate();
  const editBoard = useEditBoardFlow();
  const deleteBoards = useDeleteBoardsFlow();
  const navigate = useNavigate();
  const { board } = useBoard(boardId);

  if (board === undefined) {
    return null;
  }

  const fields: readonly (readonly [string, string])[] = [
    [t('boards.overview.name'), board.name],
    [t('boards.columns.description'), board.description],
    [t('boards.columns.chair'), board.chair],
    [t('boards.columns.members'), String(board.members)],
    [t('boards.columns.meetings'), String(board.meetings)],
    [t('boards.columns.nextMeeting'), board.nextMeeting === '' ? '' : formatDateTime(board.nextMeeting)],
  ];

  const remove = async () => {
    if (await deleteBoards([board])) {
      navigate({ to: '/boards' });
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
            onClick={() => void editBoard(board)}
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
            <Text size="sm">{value === '' ? '–' : value}</Text>
          </Fragment>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
