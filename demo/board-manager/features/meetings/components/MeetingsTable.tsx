import { Anchor, Badge } from '@mantine/core';
import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  dateRangeColumnFilter,
  selectColumnFilter,
  textColumnFilter,
  useDataNavigatorController,
} from '../../../../../packages/data-navigator/src/react';
import type { DataNavigatorComponent } from '../../../../../packages/data-navigator/src/react';
import { useDialogs, useToast } from '../../../../../packages/overlays/src/main/bindings/react';
import { MEETING_STATUSES } from '../../../domain';
import type { MeetingStatus } from '../../../domain';
import {
  boardIdsOf,
  createMeeting,
  db,
  deleteMeetings,
  fetchMeetings,
  getMeeting,
  setMeetingStatus,
  updateMeeting,
} from '../../../infra/in-memory';
import type { MeetingRow } from '../../../infra/in-memory';
import { MeetingForm } from '../../../shared/forms';
import { confirmAndRun } from '../../../shared/lib/flows';
import type { Dialogs } from '../../../shared/lib/flows';
import { translate, useTranslate } from '../../../shared/lib/i18n';
import { appIcons, formatDateTime, Navigator, useDb } from '../../../shared/shared';

export { deleteMeetingsFlow, editMeeting, MeetingsTable, MinutesBadge, StatusBadge };

type Toasts = ReturnType<typeof useToast>;

// The values of the meeting form.
// "Edit" of a meeting (in the meetings list and on the meeting's overview): the meeting form in a dialog, saved before
// it closes, then a toast. Resolves `true` when saved.
async function editMeeting(dialogs: Dialogs, toasts: Toasts, id: string): Promise<boolean> {
  const saved = !(await dialogs.form({
    title: translate('meetings.editTitle'),
    content: <MeetingForm meeting={getMeeting(db.getState(), id)} save={(values) => updateMeeting(id, values)} />,
    buttons: { confirm: translate('common.save') },
  })).canceled;

  if (saved) {
    toasts.success(translate('meetings.saved'));
  }

  return saved;
}

// "Delete" of meetings (in the meetings list and on a meeting's overview): a critical confirmation (the agenda, the
// minutes and the documents go with them), then a toast. Resolves `true` when deleted.
async function deleteMeetingsFlow(
  dialogs: Dialogs,
  toasts: Toasts,
  meetings: readonly { id: string; title: string }[],
): Promise<boolean> {
  const [first] = meetings;
  const done = await confirmAndRun(
    dialogs,
    {
      title: translate('meetings.deleteTitle', { count: meetings.length }),
      content: translate('meetings.deleteContent', { count: meetings.length, name: first?.title ?? '' }),
      buttons: { confirm: translate('common.delete') },
    },
    () => deleteMeetings(meetings.map((meeting) => meeting.id)),
  );

  if (done) {
    toasts.success(translate('meetings.deleted', { count: meetings.length, name: first?.title ?? '' }));
  }

  return done;
}

const STATUS_COLORS: Readonly<Record<MeetingStatus, string>> = {
  Planned: 'accent',
  Held: 'success',
  Cancelled: 'gray',
};

function StatusBadge({ status }: { status: MeetingStatus }): ReactElement {
  const t = useTranslate();

  return <Badge size="sm" variant="light" color={STATUS_COLORS[status]}>{t(`statuses.${status}`)}</Badge>;
}

// Only a held meeting has minutes: a draft until they are approved.
function MinutesBadge(
  { meeting }: { meeting: { status: MeetingStatus; minutesApproved: boolean } },
): ReactElement | null {
  const t = useTranslate();

  if (meeting.status !== 'Held') {
    return null;
  }

  return meeting.minutesApproved
    ? <Badge size="sm" variant="outline" color="success">{t('meetings.minutesApproved')}</Badge>
    : <Badge size="sm" variant="outline" color="warning">{t('meetings.minutesDraft')}</Badge>;
}

// The meetings of one board (`boardId`, on the board's page), of the boards of one person (`personId`, on the member's
// page), or of all boards (the "Meetings" module). Without a board, with a board column and filter, and a new meeting
// chooses its board (of the person's boards, with a person). `pathOf` is where a meeting opens: below its board, or
// below "Meetings".
function MeetingsTable(
  { boardId, personId, pathOf, title, subtitle }: {
    boardId?: string;
    personId?: string;
    pathOf: (meeting: { id: string; boardId: string }) => string;
    title: string;
    subtitle: string;
  },
): ReactElement {
  const t = useTranslate();
  const nav = useDataNavigatorController<MeetingRow>();
  const dialogs = useDialogs();
  const toasts = useToast();
  const navigate = useNavigate();
  const boards = useDb((state) => state.boards);
  const source = useMemo(() => fetchMeetings({ boardId, personId }), [boardId, personId]);

  const columns = useMemo<readonly DataNavigatorComponent.Column<MeetingRow>[]>(() => [
    {
      key: 'start',
      header: t('meetings.columns.date'),
      width: 2,
      sortable: true,
      render: (row) => formatDateTime(row.start),
      filter: dateRangeColumnFilter(),
    },
    {
      key: 'title',
      header: t('meetings.columns.meeting'),
      width: 3,
      sortable: true,
      filter: textColumnFilter(),
      render: (row) => <Anchor component={Link} to={pathOf(row)} size="sm">{row.title}</Anchor>,
    },
    ...(boardId === undefined
      ? [
        {
          key: 'board',
          header: t('meetings.columns.board'),
          width: 2.5,
          sortable: true,
          hideable: true,
          filter: selectColumnFilter({ options: boards.map((board) => board.name), multiple: true }),
        } satisfies DataNavigatorComponent.Column<MeetingRow>,
      ]
      : []),
    {
      key: 'location',
      header: t('meetings.columns.location'),
      width: 2,
      hideable: true,
      hidden: boardId === undefined,
    },
    {
      key: 'status',
      header: t('meetings.columns.status'),
      width: 1.3,
      sortable: true,
      hideable: true,
      render: (row) => <StatusBadge status={row.status} />,
      filter: selectColumnFilter({
        options: MEETING_STATUSES.map((value) => ({ value, label: t(`statuses.${value}`) })),
        multiple: true,
      }),
    },
    {
      key: 'minutesApproved',
      header: t('meetings.columns.minutes'),
      width: 1.7,
      hideable: true,
      render: (row) => <MinutesBadge meeting={row} />,
    },
    { key: 'items', header: t('meetings.columns.items'), width: 0.8, sortable: true, hideable: true, align: 'end' },
    {
      key: 'documents',
      header: t('meetings.columns.documents'),
      width: 1,
      sortable: true,
      hideable: true,
      hidden: true,
      align: 'end',
    },
  ], [t, boardId, boards, pathOf]);

  const actions = useMemo<readonly DataNavigatorComponent.Action<MeetingRow>[]>(() => {
    // The boards a new meeting may be for.
    const choices = () => {
      const state = db.getState();
      const boardIds = personId === undefined ? undefined : boardIdsOf(state, personId);

      return state.boards.filter((board) => boardIds === undefined || boardIds.includes(board.id));
    };

    const create = async () => {
      let created: { id: string; boardId: string } | undefined;
      const saved = !(await dialogs.form({
        title: t('meetings.new'),
        content: (
          <MeetingForm
            boards={boardId === undefined ? choices() : undefined}
            save={async (values) => {
              created = await createMeeting(boardId ?? values.boardId ?? '', values);
            }}
          />
        ),
        buttons: { confirm: t('common.create') },
      })).canceled;

      if (saved && created !== undefined) {
        toasts.success(t('meetings.created'));
        navigate(pathOf(created));
      }
    };

    const edit = async (row: MeetingRow) => {
      if (await editMeeting(dialogs, toasts, row.id)) {
        nav.reload();
      }
    };

    // Only a planned meeting can be cancelled.
    const cancel = async (row: MeetingRow) => {
      if (row.status !== 'Planned') {
        void dialogs.warn({
          title: t('meetings.cancel'),
          content: t('meetings.cannotCancel', { title: row.title, status: t(`statuses.${row.status}`).toLowerCase() }),
        });

        return;
      }

      const done = await confirmAndRun(
        dialogs,
        {
          title: t('meetings.cancel'),
          content: t('meetings.cancelContent', { title: row.title, date: formatDateTime(row.start) }),
          buttons: { confirm: t('meetings.cancel'), cancel: t('meetings.keep') },
        },
        () => setMeetingStatus(row.id, 'Cancelled'),
      );

      if (done) {
        nav.reload();
        toasts.success(t('meetings.cancelled', { title: row.title }));
      }
    };

    const remove = async (rows: readonly MeetingRow[]) => {
      if (await deleteMeetingsFlow(dialogs, toasts, rows)) {
        nav.reload();
      }
    };

    return [
      { type: 'general', key: 'new', label: t('meetings.new'), icon: appIcons.add, onClick: () => void create() },
      {
        type: 'singleRow',
        key: 'open',
        icon: appIcons.open,
        tip: t('common.open'),
        show: 'column',
        default: true,
        onClick: (row) => navigate(pathOf(row)),
      },
      {
        type: 'singleRow',
        key: 'edit',
        icon: appIcons.edit,
        label: t('common.edit'),
        show: 'both',
        onClick: (row) => void edit(row),
      },
      {
        type: 'singleRow',
        key: 'cancel',
        label: t('meetings.cancel'),
        show: 'toolbar',
        onClick: (row) => void cancel(row),
      },
      {
        type: 'multiRow',
        key: 'delete',
        label: t('common.delete'),
        icon: appIcons.remove,
        onClick: (rows) => void remove(rows),
      },
    ];
  }, [t, nav, dialogs, toasts, navigate, boardId, personId, pathOf]);

  return (
    <Navigator
      controller={nav}
      title={title}
      subtitle={subtitle}
      density="compact"
      searchable
      reloadable
      source={source}
      rowKey="id"
      columns={columns}
      actions={actions}
      pageSize={10}
      pageSizeOptions={[10, 25, 50]}
      defaultSort={{ key: 'start', direction: 'desc' }}
    />
  );
}
