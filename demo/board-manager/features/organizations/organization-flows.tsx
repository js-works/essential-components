import { useNavigate } from '@tanstack/react-router';

import type { Organization, OrganizationSummary, OrganizationValues } from '../../domain/index.js';
import { OrganizationForm } from '../../shared/forms.js';
import { useCrudFlows } from '../../shared/lib/crud-flows.js';
import { useTranslate } from '../../shared/lib/i18n/index.js';
import { useOrganizationList, useOrganizationService } from './organization-data.js';

export { useOrganizationFlows };

// "New", "Edit" and "Delete" of organizations; deleting says how many people lose their organization.
function useOrganizationFlows() {
  const t = useTranslate();
  const navigate = useNavigate();
  const service = useOrganizationService();
  const organizations = useOrganizationList();

  return useCrudFlows<OrganizationSummary, OrganizationValues, Organization>({
    texts: 'organizations',
    form: ({ record, save }) => <OrganizationForm organization={record} organizations={organizations} save={save} />,
    create: service.create,
    update: service.update,
    remove: service.delete,
    deleteContent: (records) => {
      const count = records.length;
      const people = records.reduce((sum, record) => sum + record.people, 0);
      const leaves = people === 0 ? '' : `\n${t('organizations.leaves', { count: people })}`;

      return `${t('organizations.deleteQuestion', { count, name: records[0]?.name ?? '' })}${leaves}\n${
        t('common.cannotBeUndone')
      }`;
    },
    created: (organization) =>
      void navigate({ to: '/organizations/$organizationId', params: { organizationId: organization.id } }),
  });
}
