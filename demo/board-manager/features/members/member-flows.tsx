import type { PersonSummary, PersonValues } from '../../domain/index.js';
import { PersonForm } from '../../shared/forms.js';
import { useCrudFlows } from '../../shared/lib/crud-flows.js';
import { useTranslate } from '../../shared/lib/i18n/index.js';
import { useOrganizationList } from '../organizations/organization-data.js';
import { useMemberService } from './member-data.js';

export { useMemberFlows };

// "New", "Edit" and "Delete" of people (a new one of the organization, when given); deleting says from how many boards
// they are removed (the memberships go with them; their agenda items keep no presenter).
function useMemberFlows(organizationId?: string) {
  const t = useTranslate();
  const service = useMemberService();
  const organizations = useOrganizationList();

  return useCrudFlows<PersonSummary, PersonValues>({
    texts: 'members',
    form: ({ record, save }) => (
      <PersonForm person={record} organizationId={organizationId} organizations={organizations} save={save} />
    ),
    create: service.create,
    update: service.update,
    remove: service.delete,
    deleteContent: (records) => {
      const count = records.length;
      const boards = new Set(records.flatMap((record) => record.boardIds)).size;
      const memberships = boards === 0 ? '' : `\n${t('members.alsoRemoved', { count: boards })}`;

      return `${t('members.deleteQuestion', { count, name: records[0]?.name ?? '' })}${memberships}\n${
        t('common.cannotBeUndone')
      }`;
    },
  });
}
