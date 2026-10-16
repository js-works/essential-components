import { useDialogs, useToast } from '@local/overlays/react';
import type { Person } from '../../domain/index.js';
import { PersonForm } from '../../shared/forms.js';
import { confirmAndRun } from '../../shared/lib/flows.js';
import { useTranslate } from '../../shared/lib/i18n/index.js';
import { useChanged } from '../../shared/lib/use-changed.js';
import { useOrganizationList } from '../organizations/reads.js';
import { useMemberService } from './context.js';

export { useCreatePersonFlow, useDeletePeopleFlow, useEditPersonFlow };

// The flows of the members feature (the people), one hook per use case. A flow changes the data through the service and
// says so (`changed()`); it knows no table.

// "New person": the person form in a dialog (of the organization, when given), saved before it closes, then a toast.
function useCreatePersonFlow(organizationId?: string): () => Promise<void> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const t = useTranslate();
  const service = useMemberService();
  const changed = useChanged();
  const organizations = useOrganizationList();

  return async () => {
    const result = await dialogs.form({
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
    });

    if (result.canceled) {
      return;
    }

    void changed();
    toasts.success(t('members.created'));
  };
}

// "Edit" of a person (in the people tables and on the member's overview): the person form in a dialog, saved before it
// closes, then a toast. Resolves `true` when saved.
function useEditPersonFlow(): (person: Person) => Promise<boolean> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const t = useTranslate();
  const service = useMemberService();
  const changed = useChanged();
  const organizations = useOrganizationList();

  return async (person) => {
    const result = await dialogs.form({
      title: t('members.editTitle'),
      content: (
        <PersonForm
          person={person}
          organizations={organizations}
          save={(values) => service.update(person.id, values)}
        />
      ),
      buttons: { confirm: t('common.save') },
    });

    if (result.canceled) {
      return false;
    }

    void changed();
    toasts.success(t('members.saved'));

    return true;
  };
}

// "Delete" of people (in the people tables and on a member's overview): a critical confirmation that says from how many
// boards they are removed (the memberships go with them; their agenda items keep no presenter), then a toast. Resolves
// `true` when deleted.
function useDeletePeopleFlow(): (
  people: readonly { id: string; name: string; boardIds: readonly string[] }[],
) => Promise<boolean> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const t = useTranslate();
  const service = useMemberService();
  const changed = useChanged();

  return async (people) => {
    const [first] = people;
    const boardCount = new Set(people.flatMap((person) => person.boardIds)).size;
    const question = t('members.deleteQuestion', { count: people.length, name: first?.name ?? '' });
    const memberships = boardCount === 0 ? '' : `\n${t('members.alsoRemoved', { count: boardCount })}`;
    const done = await confirmAndRun(
      dialogs,
      {
        title: t('members.deleteTitle', { count: people.length }),
        content: `${question}${memberships}\n${t('common.cannotBeUndone')}`,
        buttons: { confirm: t('common.delete') },
      },
      () => service.delete(people.map((person) => person.id)),
    );

    if (!done) {
      return false;
    }

    void changed();
    toasts.success(t('members.deleted', { count: people.length, name: first?.name ?? '' }));

    return true;
  };
}
