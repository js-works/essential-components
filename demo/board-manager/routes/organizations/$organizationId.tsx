import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { PersonTable } from '../../features/members/person-table.js';
import { WebsiteLink } from '../../features/organizations/organization-components.js';
import { useOrganization } from '../../features/organizations/organization-data.js';
import { useOrganizationFlows } from '../../features/organizations/organization-flows.js';
import { countryName } from '../../shared/lib/countries.js';
import { useTranslate } from '../../shared/lib/i18n/index.js';
import { appIcons } from '../../shared/shared.js';
import { NotFound } from '../../shared/ui/not-found.js';
import { RecordPage } from '../../shared/ui/record-page.js';

export const Route = createFileRoute('/organizations/$organizationId')({
  staticData: { crumb: (params) => <OrganizationCrumb id={params['organizationId'] ?? ''} /> },
  component: OrganizationPage,
});

function OrganizationCrumb({ id }: { id: string }) {
  const t = useTranslate();

  return useOrganization(id).organization?.name ?? t('entities.organization');
}

// One organization: its address and website ("Overview"), and its people.
function OrganizationPage() {
  const t = useTranslate();
  const navigate = useNavigate();
  const { organizationId } = Route.useParams();
  const { organization, isPending } = useOrganization(organizationId);
  const flows = useOrganizationFlows();

  return (
    <RecordPage
      record={organization}
      isPending={isPending}
      notFound={<NotFound what="organization" />}
      title={(record) => record.name}
      subtitle={(record) => (record.description === '' ? undefined : record.description)}
      fields={(record) => [
        [t('organizations.overview.name'), record.name],
        [t('organization.street'), record.street],
        [t('organizations.overview.zipCity'), [record.zipCode, record.city].filter((part) => part !== '').join(' ')],
        [t('organization.country'), countryName(record.country)],
        [t('organization.website'), record.website === '' ? '' : <WebsiteLink url={record.website} />],
        [t('organizations.overview.people'), String(record.people)],
      ]}
      onEdit={flows.edit}
      onDelete={async (record) => {
        if (await flows.remove([record])) {
          void navigate({ to: '/organizations' });
        }
      }}
      tabs={[{
        key: 'people',
        label: t('organizations.people'),
        icon: appIcons.members,
        render: (record) => (
          <PersonTable
            organizationId={record.id}
            title={t('organizations.people')}
            subtitle={t('organizations.peopleSubtitle', { name: record.name })}
          />
        ),
      }]}
    />
  );
}
