import { useDialogs, useToast } from '@local/overlays/react';
import { useNavigate } from 'react-router';
import type { Board, BoardMember } from '../../../domain/index.js';
import { BoardForm, MemberForm } from '../../../shared/forms.js';
import { confirmAndRun } from '../../../shared/lib/flows.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { useRead } from '../../../shared/lib/queries.js';
import { useChanged } from '../../../shared/lib/use-changed.js';
import { useBoardService } from '../context.js';
import { boardKeys } from '../keys.js';

export {
  useAddMemberFlow,
  useChangeRoleFlow,
  useCreateBoardFlow,
  useDeleteBoardsFlow,
  useEditBoardFlow,
  useRemoveMembersFlow,
};

// The flows of the boards feature, one hook per use case: each gives the function an action or a button calls. A flow
// changes the data through the service and says so (`changed()`: the reads load again); it knows no table.

// "New board": the board form in a dialog, saved before it closes; then a toast, and the new board's page.
function useCreateBoardFlow(): () => Promise<void> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const navigate = useNavigate();
  const t = useTranslate();
  const service = useBoardService();
  const changed = useChanged();

  return async () => {
    let created = '';
    const result = await dialogs.form({
      title: t('boards.new'),
      content: (
        <BoardForm
          save={async (values) => {
            created = (await service.create(values)).id;
          }}
        />
      ),
      buttons: { confirm: t('common.create') },
    });

    if (result.canceled) {
      return;
    }

    void changed();
    toasts.success(t('boards.created'));
    void navigate(`/boards/${created}`);
  };
}

// "Edit" of a board (in the boards list and on the board's overview): the board form in a dialog, saved before it
// closes, then a toast. Resolves `true` when saved.
function useEditBoardFlow(): (board: Board) => Promise<boolean> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const t = useTranslate();
  const service = useBoardService();
  const changed = useChanged();

  return async (board) => {
    let name = board.name;
    const result = await dialogs.form({
      title: t('boards.editTitle'),
      content: (
        <BoardForm
          board={board}
          save={async (values) => {
            await service.update(board.id, values);
            name = values.name;
          }}
        />
      ),
      buttons: { confirm: t('common.save') },
    });

    if (result.canceled) {
      return false;
    }

    void changed();
    toasts.success(t('boards.saved', { name }));

    return true;
  };
}

// "Delete" of boards (in the boards list and on a board's overview): a critical confirmation (the meetings with their
// agendas, minutes and documents go with them), then a toast. Resolves `true` when deleted.
function useDeleteBoardsFlow(): (
  boards: readonly { id: string; name: string; meetings: number }[],
) => Promise<boolean> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const t = useTranslate();
  const service = useBoardService();
  const changed = useChanged();

  return async (boards) => {
    const [first] = boards;
    const meetings = boards.reduce((sum, board) => sum + board.meetings, 0);
    const done = await confirmAndRun(
      dialogs,
      {
        title: t('boards.deleteTitle', { count: boards.length }),
        content: t('boards.deleteContent', { count: boards.length, name: first?.name ?? '', meetings }),
        buttons: { confirm: t('common.delete') },
      },
      () => service.delete(boards.map((board) => board.id)),
    );

    if (!done) {
      return false;
    }

    void changed();
    toasts.success(t('boards.deleted', { count: boards.length, name: first?.name ?? '' }));

    return true;
  };
}

// "Add member": one of the people who are not on the board yet, with a role, in a form dialog (saved before it
// closes), then a toast. When everyone is a member, a note says so instead.
function useAddMemberFlow(boardId: string): () => Promise<void> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const t = useTranslate();
  const service = useBoardService();
  const changed = useChanged();
  const candidates = useRead(boardKeys.candidates(boardId), (signal) => service.candidates(boardId, signal));

  return async () => {
    const people = candidates ?? await service.candidates(boardId);

    if (people.length === 0) {
      void dialogs.info({ title: t('boards.addMember'), content: t('boards.allAreMembers') });
      return;
    }

    const result = await dialogs.form({
      title: t('boards.addMember'),
      content: (
        <MemberForm
          people={people}
          suggest={service.suggestPeople}
          save={(values) => service.addMember(boardId, values.personId ?? '', values.role)}
        />
      ),
      buttons: { confirm: t('common.add') },
    });

    if (result.canceled) {
      return;
    }

    void changed();
    toasts.success(t('boards.memberAdded'));
  };
}

// "Change role" of a board's member, in a form dialog (saved before it closes), then a toast.
function useChangeRoleFlow(): (member: BoardMember) => Promise<void> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const t = useTranslate();
  const service = useBoardService();
  const changed = useChanged();

  return async (member) => {
    const result = await dialogs.form({
      title: t('boards.roleOf', { name: member.name }),
      content: <MemberForm role={member.role} save={(values) => service.changeRole(member.id, values.role)} />,
      buttons: { confirm: t('common.save') },
    });

    if (result.canceled) {
      return;
    }

    void changed();
    toasts.success(t('boards.roleChanged'));
  };
}

// "Remove" of members from a board (`board`: its name): a critical confirmation that removes them before it closes,
// then a toast.
function useRemoveMembersFlow(board: string): (members: readonly BoardMember[]) => Promise<void> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const t = useTranslate();
  const service = useBoardService();
  const changed = useChanged();

  return async (members) => {
    const [first] = members;
    const done = await confirmAndRun(
      dialogs,
      {
        title: t('boards.removeTitle', { count: members.length }),
        content: t('boards.removeContent', { count: members.length, name: first?.name ?? '', board }),
        buttons: { confirm: t('common.remove') },
      },
      () => service.removeMembers(members.map((member) => member.id)),
    );

    if (!done) {
      return;
    }

    void changed();
    toasts.success(t('boards.removed', { count: members.length, name: first?.name ?? '' }));
  };
}
