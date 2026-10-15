import { addMember, changeRole, db, getBoard, removeMembers } from '../../../infra/in-memory/index.js';
import type { MemberRow } from '../../../infra/in-memory/index.js';
import { MemberForm } from '../../../shared/forms.js';
import { confirmAndRun } from '../../../shared/lib/flows.js';
import type { TableContext } from '../../../shared/lib/flows.js';
import { translate } from '../../../shared/lib/i18n/index.js';

export { addMemberFlow, changeRoleFlow, removeMembersFlow };
export type { MemberContext };

// What the flows of a board's members need: the table's context and the board.
type MemberContext = TableContext<MemberRow> & { boardId: string };

// "Add member": one of the people who are not on the board yet, with a role, in a form dialog (saved before it
// closes); then the table reloads and a toast says so. When everyone is a member, a note says so instead.
async function addMemberFlow({ dialogs, toasts, nav, boardId }: MemberContext): Promise<void> {
  const state = db.getState();
  const members = new Set(
    state.memberships.filter((membership) => membership.boardId === boardId).map((membership) => membership.personId),
  );
  const people = state.people.filter((person) => !members.has(person.id));

  if (people.length === 0) {
    void dialogs.info({ title: translate('boards.addMember'), content: translate('boards.allAreMembers') });
    return;
  }

  const saved = !(await dialogs.form({
    title: translate('boards.addMember'),
    content: <MemberForm people={people} save={(values) => addMember(boardId, values.personId ?? '', values.role)} />,
    buttons: { confirm: translate('common.add') },
  })).canceled;

  if (saved) {
    nav.reload();
    toasts.success(translate('boards.memberAdded'));
  }
}

// "Change role" of a member, in a form dialog; then the table reloads and a toast says so.
async function changeRoleFlow({ dialogs, toasts, nav }: MemberContext, row: MemberRow): Promise<void> {
  const saved = !(await dialogs.form({
    title: translate('boards.roleOf', { name: row.name }),
    content: <MemberForm role={row.role} save={(values) => changeRole(row.id, values.role)} />,
    buttons: { confirm: translate('common.save') },
  })).canceled;

  if (saved) {
    nav.reload();
    toasts.success(translate('boards.roleChanged'));
  }
}

// "Remove" of members from the board: a critical confirmation that removes them before it closes; then the table
// reloads and a toast says so.
async function removeMembersFlow(
  { dialogs, toasts, nav, boardId }: MemberContext,
  rows: readonly MemberRow[],
): Promise<void> {
  const [first] = rows;
  const board = getBoard(db.getState(), boardId)?.name ?? '';
  const done = await confirmAndRun(
    dialogs,
    {
      title: translate('boards.removeTitle', { count: rows.length }),
      content: translate('boards.removeContent', { count: rows.length, name: first?.name ?? '', board }),
      buttons: { confirm: translate('common.remove') },
    },
    () => removeMembers(rows.map((row) => row.id)),
  );

  if (done) {
    nav.reload();
    toasts.success(translate('boards.removed', { count: rows.length, name: first?.name ?? '' }));
  }
}
