import { boardIdsOf, createPerson, db, deletePeople, getPerson, updatePerson } from '../../../infra/in-memory/index.js';
import type { PersonRow } from '../../../infra/in-memory/index.js';
import { PersonForm } from '../../../shared/forms.js';
import { confirmAndRun } from '../../../shared/lib/flows.js';
import type { Dialogs, TableContext, Toasts } from '../../../shared/lib/flows.js';
import { translate } from '../../../shared/lib/i18n/index.js';

export { createPersonFlow, deletePeopleFlow, editPerson };

// "New person": the person form in a dialog (of the organization, when given), saved before it closes; then the
// table reloads and a toast says so.
async function createPersonFlow({ dialogs, toasts, nav }: TableContext<PersonRow>, organizationId?: string) {
  const saved = !(await dialogs.form({
    title: translate('members.new'),
    content: <PersonForm organizationId={organizationId} save={createPerson} />,
    buttons: { confirm: translate('common.create') },
  })).canceled;

  if (saved) {
    nav.reload();
    toasts.success(translate('members.created'));
  }
}

// "Edit" of a person (in the people tables and on the member's overview): the person form in a dialog, saved before it
// closes, then a toast. Resolves `true` when saved.
async function editPerson(dialogs: Dialogs, toasts: Toasts, id: string): Promise<boolean> {
  const saved = !(await dialogs.form({
    title: translate('members.editTitle'),
    content: <PersonForm person={getPerson(db.getState(), id)} save={(values) => updatePerson(id, values)} />,
    buttons: { confirm: translate('common.save') },
  })).canceled;

  if (saved) {
    toasts.success(translate('members.saved'));
  }

  return saved;
}

// "Delete" of people (in the people tables and on a member's overview): a critical confirmation that says from how many
// boards they are removed (the memberships go with them; their agenda items keep no presenter), then a toast. Resolves
// `true` when deleted.
async function deletePeopleFlow(
  dialogs: Dialogs,
  toasts: Toasts,
  people: readonly { id: string; name: string }[],
): Promise<boolean> {
  const [first] = people;
  const state = db.getState();
  const boardCount = new Set(people.flatMap((person) => boardIdsOf(state, person.id))).size;
  const question = translate('members.deleteQuestion', { count: people.length, name: first?.name ?? '' });
  const memberships = boardCount === 0 ? '' : `\n${translate('members.alsoRemoved', { count: boardCount })}`;
  const done = await confirmAndRun(
    dialogs,
    {
      title: translate('members.deleteTitle', { count: people.length }),
      content: `${question}${memberships}\n${translate('common.cannotBeUndone')}`,
      buttons: { confirm: translate('common.delete') },
    },
    () => deletePeople(people.map((person) => person.id)),
  );

  if (done) {
    toasts.success(translate('members.deleted', { count: people.length, name: first?.name ?? '' }));
  }

  return done;
}
