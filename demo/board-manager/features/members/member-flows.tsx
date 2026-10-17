import type { Person } from '../../domain/index.js';
import { PersonForm } from '../../shared/forms.js';
import { useFlowKit } from '../../shared/lib/flows.js';
import { useOrganizationList } from '../organizations/reads.js';
import { useMemberService } from './context.js';

export { useCreatePersonFlow, useDeletePeopleFlow, useEditPersonFlow };

// The flows of the members feature (the people), one hook per use case. A flow changes the data through the service
// (which says so: every read loads again); it knows no table.

// "New person": the person form in a dialog (of the organization, when given), saved before it closes, then a toast.
function useCreatePersonFlow(organizationId?: string): () => Promise<boolean> {
  const { formFlow, t } = useFlowKit();
  const service = useMemberService();
  const organizations = useOrganizationList();

  return () =>
    formFlow({
      title: t('members.new'),
      content: (
        <PersonForm
          organizationId={organizationId}
          organizations={organizations}
          save={async (values) => {
            await service.create(values);
          }}
        />
      ),
      buttons: { confirm: t('common.create') },
      success: t('members.created'),
    });
}

// "Edit" of a person (in the people tables and on the member's overview): the person form in a dialog, saved before it
// closes, then a toast. Resolves `true` when saved.
function useEditPersonFlow(): (person: Person) => Promise<boolean> {
  const { formFlow, t } = useFlowKit();
  const service = useMemberService();
  const organizations = useOrganizationList();

  return (person) =>
    formFlow({
      title: t('members.editTitle'),
      content: (
        <PersonForm
          person={person}
          organizations={organizations}
          save={(values) => service.update(person.id, values)}
        />
      ),
      buttons: { confirm: t('common.save') },
      success: t('members.saved'),
    });
}

// "Delete" of people (in the people tables and on a member's overview): a critical confirmation that says from how many
// boards they are removed (the memberships go with them; their agenda items keep no presenter), then a toast. Resolves
// `true` when deleted.
function useDeletePeopleFlow(): (
  people: readonly { id: string; name: string; boardIds: readonly string[] }[],
) => Promise<boolean> {
  const { confirmFlow, t } = useFlowKit();
  const service = useMemberService();

  return (people) => {
    const count = people.length;
    const name = people[0]?.name ?? '';
    const boardCount = new Set(people.flatMap((person) => person.boardIds)).size;
    const memberships = boardCount === 0 ? '' : `\n${t('members.alsoRemoved', { count: boardCount })}`;

    return confirmFlow({
      critical: true,
      title: t('members.deleteTitle', { count }),
      content: `${t('members.deleteQuestion', { count, name })}${memberships}\n${t('common.cannotBeUndone')}`,
      buttons: { confirm: t('common.delete') },
      run: () => service.delete(people.map((person) => person.id)),
      success: t('members.deleted', { count, name }),
    });
  };
}
