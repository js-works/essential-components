import { useDialogs, useToast } from '@local/overlays/react';
import { useNavigate } from 'react-router';
import type { Organization } from '../../domain/index.js';
import { OrganizationForm } from '../../shared/forms.js';
import { confirmAndRun } from '../../shared/lib/flows.js';
import { useTranslate } from '../../shared/lib/i18n/index.js';
import { useChanged } from '../../shared/lib/use-changed.js';
import { useOrganizationService } from './context.js';
import { useOrganizationList } from './reads.js';

export { useCreateOrganizationFlow, useDeleteOrganizationsFlow, useEditOrganizationFlow };

// The flows of the organizations feature, one hook per use case. A flow changes the data through the service and says
// so (`changed()`); it knows no table.

// "New organization": the organization form in a dialog, saved before it closes; then a toast, and the new
// organization's page.
function useCreateOrganizationFlow(): () => Promise<void> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const navigate = useNavigate();
  const t = useTranslate();
  const service = useOrganizationService();
  const changed = useChanged();
  const organizations = useOrganizationList();

  return async () => {
    let created = '';
    const result = await dialogs.form({
      title: t('organizations.new'),
      content: (
        <OrganizationForm
          organizations={organizations}
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
    toasts.success(t('organizations.created'));
    void navigate(`/organizations/${created}`);
  };
}

// "Edit" of an organization (in the list and on its overview): the organization form in a dialog, saved before it
// closes, then a toast. Resolves `true` when saved.
function useEditOrganizationFlow(): (organization: Organization) => Promise<boolean> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const t = useTranslate();
  const service = useOrganizationService();
  const changed = useChanged();
  const organizations = useOrganizationList();

  return async (organization) => {
    let name = organization.name;
    const result = await dialogs.form({
      title: t('organizations.editTitle'),
      content: (
        <OrganizationForm
          organization={organization}
          organizations={organizations}
          save={async (values) => {
            await service.update(organization.id, values);
            name = values.name.trim();
          }}
        />
      ),
      buttons: { confirm: t('common.save') },
    });

    if (result.canceled) {
      return false;
    }

    void changed();
    toasts.success(t('organizations.saved', { name }));

    return true;
  };
}

// "Delete" of organizations (in the list and on an overview): a critical confirmation that says how many people lose
// their organization, then a toast. Resolves `true` when deleted.
function useDeleteOrganizationsFlow(): (
  organizations: readonly { id: string; name: string; people: number }[],
) => Promise<boolean> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const t = useTranslate();
  const service = useOrganizationService();
  const changed = useChanged();

  return async (organizations) => {
    const [first] = organizations;
    const people = organizations.reduce((sum, organization) => sum + organization.people, 0);
    const question = t('organizations.deleteQuestion', { count: organizations.length, name: first?.name ?? '' });
    const belong = people === 0 ? '' : `\n${t('organizations.leaves', { count: people })}`;
    const done = await confirmAndRun(
      dialogs,
      {
        title: t('organizations.deleteTitle', { count: organizations.length }),
        content: `${question}${belong}\n${t('common.cannotBeUndone')}`,
        buttons: { confirm: t('common.delete') },
      },
      () => service.delete(organizations.map((organization) => organization.id)),
    );

    if (!done) {
      return false;
    }

    void changed();
    toasts.success(t('organizations.deleted', { count: organizations.length, name: first?.name ?? '' }));

    return true;
  };
}
