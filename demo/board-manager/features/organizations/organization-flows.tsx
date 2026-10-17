import { useNavigate } from 'react-router';

import type { Organization } from '../../domain/index.js';
import { OrganizationForm } from '../../shared/forms.js';
import { useFlowKit } from '../../shared/lib/flows.js';
import { useOrganizationService } from './context.js';
import { useOrganizationList } from './reads.js';

export { useCreateOrganizationFlow, useDeleteOrganizationsFlow, useEditOrganizationFlow };

// The flows of the organizations feature, one hook per use case. A flow changes the data through the service
// (which says so: every read loads again); it knows no table.

// "New organization": the organization form in a dialog, saved before it closes; then a toast, and the new
// organization's page.
function useCreateOrganizationFlow(): () => Promise<void> {
  const { formFlow, t } = useFlowKit();
  const navigate = useNavigate();
  const service = useOrganizationService();
  const organizations = useOrganizationList();

  return async () => {
    let created = '';
    const done = await formFlow({
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
      success: t('organizations.created'),
    });

    if (done) {
      void navigate(`/organizations/${created}`);
    }
  };
}

// "Edit" of an organization (in the list and on its overview): the organization form in a dialog, saved before it
// closes, then a toast. Resolves `true` when saved.
function useEditOrganizationFlow(): (organization: Organization) => Promise<boolean> {
  const { formFlow, t } = useFlowKit();
  const service = useOrganizationService();
  const organizations = useOrganizationList();

  return (organization) => {
    let name = organization.name;

    return formFlow({
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
      success: () => t('organizations.saved', { name }),
    });
  };
}

// "Delete" of organizations (in the list and on an overview): a critical confirmation that says how many people lose
// their organization, then a toast. Resolves `true` when deleted.
function useDeleteOrganizationsFlow(): (
  organizations: readonly { id: string; name: string; people: number }[],
) => Promise<boolean> {
  const { confirmFlow, t } = useFlowKit();
  const service = useOrganizationService();

  return (organizations) => {
    const count = organizations.length;
    const name = organizations[0]?.name ?? '';
    const people = organizations.reduce((sum, organization) => sum + organization.people, 0);
    const belong = people === 0 ? '' : `\n${t('organizations.leaves', { count: people })}`;

    return confirmFlow({
      critical: true,
      title: t('organizations.deleteTitle', { count }),
      content: `${t('organizations.deleteQuestion', { count, name })}${belong}\n${t('common.cannotBeUndone')}`,
      buttons: { confirm: t('common.delete') },
      run: () => service.delete(organizations.map((organization) => organization.id)),
      success: t('organizations.deleted', { count, name }),
    });
  };
}
