import { useDialogs, useToast } from '@local/overlays/react';
import { useNavigate } from 'react-router';
import {
  addMember,
  changeRole,
  createBoard,
  db,
  deleteBoards,
  getBoard,
  removeMembers,
  updateBoard,
} from '../../../infra/in-memory/index.js';

import type { MemberRow } from '../../../infra/in-memory/index.js';
import { BoardForm, MemberForm } from '../../../shared/forms.js';
import { confirmAndRun } from '../../../shared/lib/flows.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';

export {
  useAddMemberFlow,
  useChangeRoleFlow,
  useCreateBoardFlow,
  useDeleteBoardsFlow,
  useEditBoardFlow,
  useRemoveMembersFlow,
};

// The flows of the boards feature, one hook per use case: each gives the function an action or a button calls. A flow
// changes the data and says so; the tables follow the data themselves (`useReloadOnChange`).

// "New board": the board form in a dialog, saved before it closes; then a toast, and the new board's page.
function useCreateBoardFlow(): () => Promise<void> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const navigate = useNavigate();
  const t = useTranslate();

  return async () => {
    let created = '';
    const result = await dialogs.form({
      title: t('boards.new'),
      content: (
        <BoardForm
          save={async (values) => {
            created = (await createBoard(values)).id;
          }}
        />
      ),
      buttons: { confirm: t('common.create') },
    });

    if (result.canceled) {
      return;
    }

    toasts.success(t('boards.created'));
    void navigate(`/boards/${created}`);
  };
}

// "Edit" of a board (in the boards list and on the board's overview): the board form in a dialog, saved before it
// closes, then a toast. Resolves `true` when saved.
function useEditBoardFlow(): (boardId: string) => Promise<boolean> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const t = useTranslate();

  return async (boardId) => {
    const board = getBoard(db.getState(), boardId);
    const result = await dialogs.form({
      title: t('boards.editTitle'),
      content: <BoardForm board={board} save={(values) => updateBoard(boardId, values)} />,
      buttons: { confirm: t('common.save') },
    });

    if (result.canceled) {
      return false;
    }

    // the name after the save (the caller's row may still have the old one)
    toasts.success(t('boards.saved', { name: getBoard(db.getState(), boardId)?.name ?? board?.name ?? '' }));

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
      () => deleteBoards(boards.map((board) => board.id)),
    );

    if (!done) {
      return false;
    }

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

  return async () => {
    const state = db.getState();
    const members = new Set(
      state.memberships.filter((membership) => membership.boardId === boardId).map((membership) => membership.personId),
    );
    const people = state.people.filter((person) => !members.has(person.id));

    if (people.length === 0) {
      void dialogs.info({ title: t('boards.addMember'), content: t('boards.allAreMembers') });
      return;
    }

    const result = await dialogs.form({
      title: t('boards.addMember'),
      content: <MemberForm people={people} save={(values) => addMember(boardId, values.personId ?? '', values.role)} />,
      buttons: { confirm: t('common.add') },
    });

    if (result.canceled) {
      return;
    }

    toasts.success(t('boards.memberAdded'));
  };
}

// "Change role" of a board's member, in a form dialog (saved before it closes), then a toast.
function useChangeRoleFlow(): (member: MemberRow) => Promise<void> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const t = useTranslate();

  return async (member) => {
    const result = await dialogs.form({
      title: t('boards.roleOf', { name: member.name }),
      content: <MemberForm role={member.role} save={(values) => changeRole(member.id, values.role)} />,
      buttons: { confirm: t('common.save') },
    });

    if (result.canceled) {
      return;
    }

    toasts.success(t('boards.roleChanged'));
  };
}

// "Remove" of members from a board: a critical confirmation that removes them before it closes, then a toast.
function useRemoveMembersFlow(boardId: string): (members: readonly MemberRow[]) => Promise<void> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const t = useTranslate();

  return async (members) => {
    const [first] = members;
    const board = getBoard(db.getState(), boardId)?.name ?? '';
    const done = await confirmAndRun(
      dialogs,
      {
        title: t('boards.removeTitle', { count: members.length }),
        content: t('boards.removeContent', { count: members.length, name: first?.name ?? '', board }),
        buttons: { confirm: t('common.remove') },
      },
      () => removeMembers(members.map((member) => member.id)),
    );

    if (!done) {
      return;
    }

    toasts.success(t('boards.removed', { count: members.length, name: first?.name ?? '' }));
  };
}
