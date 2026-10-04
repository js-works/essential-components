import type { useToast } from '../../../../../packages/overlays/src/main/bindings/react';
import { db, deleteBoards, getBoard, updateBoard } from '../../../infra/in-memory';
import { BoardForm } from '../../../shared/forms';
import { confirmAndRun } from '../../../shared/lib/flows';
import type { Dialogs } from '../../../shared/lib/flows';
import { translate } from '../../../shared/lib/i18n';

export { deleteBoardsFlow, editBoard };

type Toasts = ReturnType<typeof useToast>;

// "Edit" of a board (in the boards list and on the board's overview): the board form in a dialog, saved before it
// closes, then a toast. Resolves `true` when saved.
async function editBoard(dialogs: Dialogs, toasts: Toasts, id: string): Promise<boolean> {
  const board = getBoard(db.getState(), id);
  const saved = !(await dialogs.form({
    title: translate('boards.editTitle'),
    content: <BoardForm board={board} save={(values) => updateBoard(id, values)} />,
    buttons: { confirm: translate('common.save') },
  })).canceled;

  if (saved) {
    // the name after the save (the caller's row may still have the old one)
    toasts.success(translate('boards.saved', { name: getBoard(db.getState(), id)?.name ?? board?.name ?? '' }));
  }

  return saved;
}

// "Delete" of boards (in the boards list and on a board's overview): a critical confirmation (the meetings with their
// agendas, minutes and documents go with them), then a toast. Resolves `true` when deleted.
async function deleteBoardsFlow(
  dialogs: Dialogs,
  toasts: Toasts,
  boards: readonly { id: string; name: string; meetings: number }[],
): Promise<boolean> {
  const [first] = boards;
  const meetings = boards.reduce((sum, board) => sum + board.meetings, 0);
  const done = await confirmAndRun(
    dialogs,
    {
      title: translate('boards.deleteTitle', { count: boards.length }),
      content: translate('boards.deleteContent', { count: boards.length, name: first?.name ?? '', meetings }),
      buttons: { confirm: translate('common.delete') },
    },
    () => deleteBoards(boards.map((board) => board.id)),
  );

  if (done) {
    toasts.success(translate('boards.deleted', { count: boards.length, name: first?.name ?? '' }));
  }

  return done;
}
