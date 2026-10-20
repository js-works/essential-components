import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { useBoard } from '../../features/boards/board-data.js';
import { useBoardFlows } from '../../features/boards/board-flows.js';
import { BoardMemberTable } from '../../features/boards/board-member-table.js';
import { MeetingTable } from '../../features/meetings/meeting-table.js';
import { useTranslate } from '../../shared/lib/i18n/index.js';
import { appIcons, formatDateTime } from '../../shared/shared.js';
import { NotFound } from '../../shared/ui/not-found.js';
import { RecordPage } from '../../shared/ui/record-page.js';

export const Route = createFileRoute('/boards/$boardId')({
  staticData: { crumb: (params) => <BoardCrumb id={params['boardId'] ?? ''} /> },
  component: BoardPage,
});

function BoardCrumb({ id }: { id: string }) {
  const t = useTranslate();

  return useBoard(id).board?.name ?? t('entities.board');
}

// One board: its base information ("Overview"), its meetings and its members.
function BoardPage() {
  const t = useTranslate();
  const navigate = useNavigate();
  const { boardId } = Route.useParams();
  const { board, isPending } = useBoard(boardId);
  const flows = useBoardFlows();

  return (
    <RecordPage
      record={board}
      isPending={isPending}
      notFound={<NotFound what="board" />}
      title={(record) => record.name}
      subtitle={(record) => record.description}
      fields={(record) => [
        [t('boards.overview.name'), record.name],
        [t('boards.columns.description'), record.description],
        [t('boards.columns.chair'), record.chair],
        [t('boards.columns.members'), String(record.members)],
        [t('boards.columns.meetings'), String(record.meetings)],
        [t('boards.columns.nextMeeting'), record.nextMeeting === '' ? '' : formatDateTime(record.nextMeeting)],
      ]}
      onEdit={flows.edit}
      onDelete={async (record) => {
        if (await flows.remove([record])) {
          void navigate({ to: '/boards' });
        }
      }}
      tabs={[
        {
          key: 'meetings',
          label: t('modules.meetings'),
          icon: appIcons.meetings,
          render: (record) => (
            <MeetingTable
              boardId={record.id}
              title={t('modules.meetings')}
              subtitle={t('boards.meetingsSubtitle')}
            />
          ),
        },
        {
          key: 'members',
          label: t('modules.members'),
          icon: appIcons.members,
          render: (record) => <BoardMemberTable board={record} />,
        },
      ]}
    />
  );
}
