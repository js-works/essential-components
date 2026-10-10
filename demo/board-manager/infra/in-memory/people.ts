import type { DataTableComponent } from '../../../../packages/data-table/src/react';
import type { Person } from '../../domain';
import { getBoard, organizationOf } from './lookups';
import { oneOf, runQuery } from './query';
import { db, LOADING_TIME, newId, save, wait } from './store';

export { createPerson, deletePeople, fetchPeople, suggestPeople, updatePerson };
export type { PersonRow, PersonValues };

// `organization`: its name.
type PersonRow = Person & { organization: string; boards: string; roles: string; boardIds: readonly string[] };

// The options of a person (the person of a new member, an `AsyncSelect`; the person filters): of the people `among`
// (their ids; all without it), those whose name or organization contains the query (ignoring the case), by name, with
// the organization as the second line. The value is the id.
async function suggestPeople(
  query: string,
  signal: AbortSignal,
  among?: readonly string[],
): Promise<readonly { value: string; label: string; description: string }[]> {
  await wait(LOADING_TIME, signal);

  const state = db.getState();
  const needle = query.toLowerCase();

  return state.people
    .filter((person) => among === undefined || among.includes(person.id))
    .map((person) => ({ value: person.id, label: person.name, description: organizationOf(state, person) }))
    .filter((option) => [option.label, option.description].some((text) => text.toLowerCase().includes(needle)))
    .sort((a, b) => a.label.localeCompare(b.label));
}

// All people, or those of one organization (`organizationId`).
function fetchPeople(organizationId?: string): DataTableComponent.Source<PersonRow> {
  return async (query, signal) => {
    await wait(LOADING_TIME, signal);

    const state = db.getState();
    const rows = state.people
      .filter((person) => organizationId === undefined || person.organizationId === organizationId)
      .map((person): PersonRow => {
        const memberships = state.memberships.filter((membership) => membership.personId === person.id);

        return {
          ...person,
          organization: organizationOf(state, person),
          boardIds: memberships.map((membership) => membership.boardId),
          boards: memberships.map((membership) => getBoard(state, membership.boardId)?.name ?? '').join(', '),
          roles: [...new Set(memberships.map((membership) => membership.role))].join(', '),
        };
      });

    return runQuery(rows, query, {
      search: ['name', 'email', 'organization', 'boards'],
      filters: {
        name: (row, value) => oneOf(row.name, value),
        organization: (row, value) => oneOf(row.organization, value),
        boards: (row, value) =>
          !Array.isArray(value) || value.length === 0
          || row.boardIds.some((boardId) => value.includes(getBoard(state, boardId)?.name)),
      },
    });
  };
}

type PersonValues = Pick<Person, 'name' | 'email' | 'organizationId'>;

async function createPerson(values: PersonValues): Promise<void> {
  const person: Person = { id: newId('p'), ...values };

  await save((state) => ({ people: [...state.people, person] }));
}

async function updatePerson(id: string, values: PersonValues): Promise<void> {
  await save((state) => ({
    people: state.people.map((person) => (person.id === id ? { ...person, ...values } : person)),
  }));
}

// Deletes the people with their memberships. The agenda items they present keep no presenter.
async function deletePeople(ids: readonly string[]): Promise<void> {
  await save((state) => ({
    people: state.people.filter((person) => !ids.includes(person.id)),
    memberships: state.memberships.filter((membership) => !ids.includes(membership.personId)),
    agendaItems: state.agendaItems.map((
      item,
    ) => (ids.includes(item.presenterId) ? { ...item, presenterId: '' } : item)),
  }));
}
