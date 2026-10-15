import { useDialogs, useToast } from '@local/overlays/react';
import { Button, Group, SimpleGrid, Stack, Tabs, Text } from '@mantine/core';
import { Fragment, useState } from 'react';
import type { ReactElement } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useShallow } from 'zustand/react/shallow';
import { getBoard, getBoardRow } from '../../../infra/in-memory/index.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { appIcons, formatDateTime, PageHeader, useDb } from '../../../shared/shared.js';
import { NotFound } from '../../../shared/ui/NotFound.js';
import { MeetingTable } from '../../meetings/components/MeetingTable.js';
import { deleteBoardsFlow, editBoard } from '../components/boardFlows.js';
import { MemberTable } from '../components/MemberTable.js';

export { BoardPage };

// A meeting of a board opens below the board (the breadcrumb: Boards › board › meeting).
const meetingPath = (meeting: { id: string; boardId: string }) => `/boards/${meeting.boardId}/meetings/${meeting.id}`;

// One board: its base information ("Overview"), its meetings and its members, in three tabs.
function BoardPage(): ReactElement {
  const t = useTranslate();
  const { boardId = '' } = useParams();
  const board = useDb((state) => getBoard(state, boardId));
  const [tab, setTab] = useState<string | null>('overview');

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
            pathOf={meetingPath}
            title={t('modules.meetings')}
            subtitle={t('boards.meetingsSubtitle')}
          />
        </Tabs.Panel>
        <Tabs.Panel value="members" pt="md">
          <MemberTable boardId={board.id} />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

// The base information as labels and values, with "Edit" (the board form in a dialog, like "Edit" in the list) and
// "Delete" (then back to the list).
function BoardOverview({ boardId }: { boardId: string }): ReactElement | null {
  const t = useTranslate();
  const dialogs = useDialogs();
  const toasts = useToast();
  const navigate = useNavigate();
  // a new row object on every call: compared shallowly, else the store would see a change at every read
  const board = useDb(useShallow((state) => getBoardRow(state, boardId)));

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
    if (await deleteBoardsFlow(dialogs, toasts, [board])) {
      navigate('/boards');
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
            onClick={() => void editBoard(dialogs, toasts, board.id)}
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
