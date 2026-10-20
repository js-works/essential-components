import { useNavigate } from '@tanstack/react-router';

import type { Board, BoardMember, BoardSummary, BoardValues } from '../../domain/index.js';
import { BoardForm, MemberForm } from '../../shared/forms.js';
import { useCrudFlows } from '../../shared/lib/crud-flows.js';
import { useFlowKit } from '../../shared/lib/flows.js';
import { useRead } from '../../shared/lib/queries.js';
import { useBoardService } from './board-data.js';

export { useAddMemberFlow, useBoardFlows, useChangeRoleFlow, useRemoveMembersFlow };

// "New", "Edit" and "Delete" of boards; deleting says that the meetings (with their agendas, minutes and documents)
// go with them.
function useBoardFlows() {
  const { t } = useFlowKit();
  const navigate = useNavigate();
  const service = useBoardService();

  return useCrudFlows<BoardSummary, BoardValues, Board>({
    texts: 'boards',
    form: ({ record, save }) => <BoardForm board={record} save={save} />,
    create: service.create,
    update: service.update,
    remove: service.delete,
    deleteContent: (records) =>
      t('boards.deleteContent', {
        count: records.length,
        name: records[0]?.name ?? '',
        meetings: records.reduce((sum, record) => sum + record.meetings, 0),
      }),
    created: (board) => void navigate({ to: '/boards/$boardId', params: { boardId: board.id } }),
  });
}

// "Add member": one of the people who are not on the board yet, with a role, in a form dialog (saved before it
// closes), then a toast. When everyone is a member, a note says so instead.
function useAddMemberFlow(boardId: string): () => Promise<void> {
  const { dialogs, formFlow, t } = useFlowKit();
  const service = useBoardService();
  const candidates = useRead(['boards', 'candidates', boardId], (signal) => service.candidates(boardId, signal));

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
