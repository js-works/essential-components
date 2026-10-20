import { Anchor } from '@mantine/core';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { AnchorLink } from '@local/micro-app';

import { MeetingTable } from '../../features/meetings/meeting-table.js';
import { usePerson } from '../../features/members/member-data.js';
import { useMemberFlows } from '../../features/members/member-flows.js';
import { MembershipTable } from '../../features/members/membership-table.js';
import { useTranslate } from '../../shared/lib/i18n/index.js';
import { appIcons } from '../../shared/shared.js';
import { NotFound } from '../../shared/ui/not-found.js';
import { RecordPage } from '../../shared/ui/record-page.js';

export const Route = createFileRoute('/members/$personId')({
  staticData: { crumb: (params) => <MemberCrumb id={params['personId'] ?? ''} /> },
  component: MemberPage,
});

function MemberCrumb({ id }: { id: string }) {
  const t = useTranslate();

  return usePerson(id).person?.name ?? t('entities.member');
}

// One member: their contact and organization ("Overview"), their boards, and the meetings of their boards (each opens
// below its board).
function MemberPage() {
  const t = useTranslate();
  const navigate = useNavigate();
  const { personId } = Route.useParams();
  const { person, isPending } = usePerson(personId);
  const flows = useMemberFlows();

  return (
    <RecordPage
      record={person}
      isPending={isPending}
      notFound={<NotFound what="member" />}
      title={(record) => record.name}
      subtitle={(record) => (record.organization === '' ? undefined : record.organization)}
      fields={(record) => [
        [t('members.columns.name'), record.name],
        [t('members.columns.email'), <Anchor href={`mailto:${record.email}`} size="sm">{record.email}</Anchor>],
        [
          t('members.columns.organization'),
          record.organizationId === ''
            ? ''
            : (
              <AnchorLink
                to="/organizations/$organizationId"
                params={{ organizationId: record.organizationId }}
                size="sm"
              >
                {record.organization}
              </AnchorLink>
            ),
        ],
        [t('members.columns.boards'), String(record.boardIds.length)],
      ]}
      onEdit={flows.edit}
      onDelete={async (record) => {
        if (await flows.remove([record])) {
          void navigate({ to: '/members' });
        }
      }}
      tabs={[
        {
          key: 'boards',
          label: t('modules.boards'),
          icon: appIcons.boards,
          render: (record) => <MembershipTable personId={record.id} />,
        },
        {
          key: 'meetings',
          label: t('modules.meetings'),
          icon: appIcons.meetings,
          render: (record) => (
            <MeetingTable
              personId={record.id}
              title={t('modules.meetings')}
              subtitle={t('members.meetingsSubtitle', { name: record.name })}
            />
          ),
        },
      ]}
    />
  );
}
