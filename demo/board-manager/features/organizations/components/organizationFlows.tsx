import type { NavigateFunction } from 'react-router';
import {
  createOrganization,
  db,
  deleteOrganizations,
  getOrganization,
  updateOrganization,
} from '../../../infra/in-memory/index.js';
import { OrganizationForm } from '../../../shared/forms.js';
import { confirmAndRun } from '../../../shared/lib/flows.js';
import type { Dialogs, Toasts } from '../../../shared/lib/flows.js';
import { translate } from '../../../shared/lib/i18n/index.js';

export { createOrganizationFlow, deleteOrganizationsFlow, editOrganization };

// "New organization": the organization form in a dialog, saved before it closes; then a toast, and the new
// organization's page.
async function createOrganizationFlow(
  { dialogs, toasts, navigate }: { dialogs: Dialogs; toasts: Toasts; navigate: NavigateFunction },
): Promise<void> {
  let created = '';
  const saved = !(await dialogs.form({
    title: translate('organizations.new'),
    content: (
      <OrganizationForm
        save={async (values) => {
          created = (await createOrganization(values)).id;
        }}
      />
    ),
    buttons: { confirm: translate('common.create') },
  })).canceled;

  if (saved) {
    toasts.success(translate('organizations.created'));
    void navigate(`/organizations/${created}`);
  }
}

// "Edit" of an organization (in the list and on its overview): the organization form in a dialog, saved before it
// closes, then a toast. Resolves `true` when saved.
async function editOrganization(dialogs: Dialogs, toasts: Toasts, id: string): Promise<boolean> {
  const saved = !(await dialogs.form({
    title: translate('organizations.editTitle'),
    content: (
      <OrganizationForm
        organization={getOrganization(db.getState(), id)}
        save={(values) => updateOrganization(id, values)}
      />
    ),
    buttons: { confirm: translate('common.save') },
  })).canceled;

  if (saved) {
    toasts.success(translate('organizations.saved', { name: getOrganization(db.getState(), id)?.name ?? '' }));
  }

  return saved;
}

// "Delete" of organizations (in the list and on an overview): a critical confirmation that says how many people lose
// their organization, then a toast. Resolves `true` when deleted.
async function deleteOrganizationsFlow(
  dialogs: Dialogs,
  toasts: Toasts,
  organizations: readonly { id: string; name: string }[],
): Promise<boolean> {
  const [first] = organizations;
  const ids = organizations.map((organization) => organization.id);
  const people = db.getState().people.filter((person) => ids.includes(person.organizationId)).length;
  const question = translate('organizations.deleteQuestion', {
    count: organizations.length,
    name: first?.name ?? '',
  });
  const belong = people === 0 ? '' : `\n${translate('organizations.leaves', { count: people })}`;
  const done = await confirmAndRun(
    dialogs,
    {
      title: translate('organizations.deleteTitle', { count: organizations.length }),
      content: `${question}${belong}\n${translate('common.cannotBeUndone')}`,
      buttons: { confirm: translate('common.delete') },
    },
    () => deleteOrganizations(ids),
  );

  if (done) {
    toasts.success(translate('organizations.deleted', { count: organizations.length, name: first?.name ?? '' }));
  }

  return done;
}
