import { useDialogs, useToast } from '@local/overlays/react';
import { useNavigate } from 'react-router';
import {
  createOrganization,
  db,
  deleteOrganizations,
  getOrganization,
  updateOrganization,
} from '../../infra/in-memory/index.js';

import { OrganizationForm } from '../../shared/forms.js';
import { confirmAndRun } from '../../shared/lib/flows.js';
import { useTranslate } from '../../shared/lib/i18n/index.js';

export { useCreateOrganizationFlow, useDeleteOrganizationsFlow, useEditOrganizationFlow };

// The flows of the organizations feature, one hook per use case. The tables follow the data themselves.

// "New organization": the organization form in a dialog, saved before it closes; then a toast, and the new
// organization's page.
function useCreateOrganizationFlow(): () => Promise<void> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const navigate = useNavigate();
  const t = useTranslate();

  return async () => {
    let created = '';
    const result = await dialogs.form({
      title: t('organizations.new'),
      content: (
        <OrganizationForm
          save={async (values) => {
            created = (await createOrganization(values)).id;
          }}
        />
      ),
      buttons: { confirm: t('common.create') },
    });

    if (result.canceled) {
      return;
    }

    toasts.success(t('organizations.created'));
    void navigate(`/organizations/${created}`);
  };
}

// "Edit" of an organization (in the list and on its overview): the organization form in a dialog, saved before it
// closes, then a toast. Resolves `true` when saved.
function useEditOrganizationFlow(): (organizationId: string) => Promise<boolean> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const t = useTranslate();

  return async (organizationId) => {
    const result = await dialogs.form({
      title: t('organizations.editTitle'),
      content: (
        <OrganizationForm
          organization={getOrganization(db.getState(), organizationId)}
          save={(values) => updateOrganization(organizationId, values)}
        />
      ),
      buttons: { confirm: t('common.save') },
    });

    if (result.canceled) {
      return false;
    }

    toasts.success(t('organizations.saved', { name: getOrganization(db.getState(), organizationId)?.name ?? '' }));

    return true;
  };
}

// "Delete" of organizations (in the list and on an overview): a critical confirmation that says how many people lose
// their organization, then a toast. Resolves `true` when deleted.
function useDeleteOrganizationsFlow(): (organizations: readonly { id: string; name: string }[]) => Promise<boolean> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const t = useTranslate();

  return async (organizations) => {
    const [first] = organizations;
    const ids = organizations.map((organization) => organization.id);
    const people = db.getState().people.filter((person) => ids.includes(person.organizationId)).length;
    const question = t('organizations.deleteQuestion', { count: organizations.length, name: first?.name ?? '' });
    const belong = people === 0 ? '' : `\n${t('organizations.leaves', { count: people })}`;
    const done = await confirmAndRun(
      dialogs,
      {
        title: t('organizations.deleteTitle', { count: organizations.length }),
        content: `${question}${belong}\n${t('common.cannotBeUndone')}`,
        buttons: { confirm: t('common.delete') },
      },
      () => deleteOrganizations(ids),
    );

    if (!done) {
      return false;
    }

    toasts.success(t('organizations.deleted', { count: organizations.length, name: first?.name ?? '' }));

    return true;
  };
}
