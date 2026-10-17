import { useNavigate } from 'react-router';

import type { Board, BoardMember } from '../../../domain/index.js';
import { BoardForm, MemberForm } from '../../../shared/forms.js';
import { useFlowKit } from '../../../shared/lib/flows.js';
import { useRead } from '../../../shared/lib/queries.js';
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
// changes the data through the service (which says so: every read loads again); it knows no table.

// "New board": the board form in a dialog, saved before it closes; then a toast, and the new board's page.
function useCreateBoardFlow(): () => Promise<void> {
  const { formFlow, t } = useFlowKit();
  const navigate = useNavigate();
  const service = useBoardService();

  return async () => {
    let created = '';
    const done = await formFlow({
      title: t('boards.new'),
      content: (
        <BoardForm
          save={async (values) => {
            created = (await service.create(values)).id;
          }}
        />
      ),
      buttons: { confirm: t('common.create') },
      success: t('boards.created'),
    });

    if (done) {
      void navigate(`/boards/${created}`);
    }
  };
}

// "Edit" of a board (in the boards list and on the board's overview): the board form in a dialog, saved before it
// closes, then a toast. Resolves `true` when saved.
function useEditBoardFlow(): (board: Board) => Promise<boolean> {
  const { formFlow, t } = useFlowKit();
  const service = useBoardService();

  return (board) => {
    let name = board.name;

    return formFlow({
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
      success: () => t('boards.saved', { name }),
    });
  };
}

// "Delete" of boards (in the boards list and on a board's overview): a critical confirmation (the meetings with their
// agendas, minutes and documents go with them), then a toast. Resolves `true` when deleted.
function useDeleteBoardsFlow(): (
  boards: readonly { id: string; name: string; meetings: number }[],
) => Promise<boolean> {
  const { confirmFlow, t } = useFlowKit();
  const service = useBoardService();

  return (boards) => {
    const count = boards.length;
    const name = boards[0]?.name ?? '';
    const meetings = boards.reduce((sum, board) => sum + board.meetings, 0);

    return confirmFlow({
      critical: true,
      title: t('boards.deleteTitle', { count }),
      content: t('boards.deleteContent', { count, name, meetings }),
      buttons: { confirm: t('common.delete') },
      run: () => service.delete(boards.map((board) => board.id)),
      success: t('boards.deleted', { count, name }),
    });
  };
}

// "Add member": one of the people who are not on the board yet, with a role, in a form dialog (saved before it
// closes), then a toast. When everyone is a member, a note says so instead.
function useAddMemberFlow(boardId: string): () => Promise<void> {
  const { dialogs, formFlow, t } = useFlowKit();
  const service = useBoardService();
  const candidates = useRead(boardKeys.candidates(boardId), (signal) => service.candidates(boardId, signal));

  return async () => {
    const people = candidates ?? await service.candidates(boardId);

    if (people.length === 0) {
      void dialogs.info({ title: t('boards.addMember'), content: t('boards.allAreMembers') });
      return;
    }

    await formFlow({
      title: t('boards.addMember'),
      content: (
        <MemberForm
          people={people}
          suggest={service.suggestPeople}
          save={(values) => service.addMember(boardId, values.personId ?? '', values.role)}
        />
      ),
      buttons: { confirm: t('common.add') },
      success: t('boards.memberAdded'),
    });
  };
}

// "Change role" of a board's member, in a form dialog (saved before it closes), then a toast.
function useChangeRoleFlow(): (member: BoardMember) => Promise<boolean> {
  const { formFlow, t } = useFlowKit();
  const service = useBoardService();

  return (member) =>
    formFlow({
      title: t('boards.roleOf', { name: member.name }),
      content: <MemberForm role={member.role} save={(values) => service.changeRole(member.id, values.role)} />,
      buttons: { confirm: t('common.save') },
      success: t('boards.roleChanged'),
    });
}

// "Remove" of members from a board (`board`: its name): a critical confirmation that removes them before it closes,
// then a toast.
function useRemoveMembersFlow(board: string): (members: readonly BoardMember[]) => Promise<boolean> {
  const { confirmFlow, t } = useFlowKit();
  const service = useBoardService();

  return (members) => {
    const count = members.length;
    const name = members[0]?.name ?? '';

    return confirmFlow({
      critical: true,
      title: t('boards.removeTitle', { count }),
      content: t('boards.removeContent', { count, name, board }),
      buttons: { confirm: t('common.remove') },
      run: () => service.removeMembers(members.map((member) => member.id)),
      success: t('boards.removed', { count, name }),
    });
  };
}
