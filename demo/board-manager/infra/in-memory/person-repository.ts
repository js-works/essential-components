import type { Person, PersonRepository, PersonSummary } from '../../domain/index.js';
import { getBoard, organizationOf } from './lookups.js';
import { containsText, inList, pageOf, sorted } from './query.js';
import type { Db } from './store.js';
import { db, LOADING_TIME, newId, save, wait } from './store.js';

export { createPersonRepository };

// The people with their organization's name, their boards and their roles.
function summaries(state: Db, people: readonly Person[] = state.people): PersonSummary[] {
  return people.map((person) => {
    const memberships = state.memberships.filter((membership) => membership.personId === person.id);

    return {
      ...person,
      organization: organizationOf(state, person),
      boardIds: memberships.map((membership) => membership.boardId),
      boards: memberships.map((membership) => getBoard(state, membership.boardId)?.name ?? ''),
      roles: [...new Set(memberships.map((membership) => membership.role))],
    };
  });
}

// The people of the in-memory store.
function createPersonRepository(): PersonRepository {
  return {
    async find(criteria, sort, paging, signal) {
      await wait(LOADING_TIME, signal);

      const found = summaries(db.getState()).filter((person) =>
        (criteria.organizationId === undefined || person.organizationId === criteria.organizationId)
        && containsText([person.name, person.email, person.organization, ...person.boards], criteria.text)
        && inList(person.name, criteria.names)
        && inList(person.organization, criteria.organizations)
        && (criteria.boards === undefined || criteria.boards.length === 0
          || person.boards.some((board) => criteria.boards?.includes(board)))
      );

      return pageOf(sorted(found, sort), paging);
    },

    async get(id, signal) {
      await wait(LOADING_TIME, signal);

      const state = db.getState();

      return summaries(state, state.people.filter((person) => person.id === id))[0];
    },

    async all(signal) {
      await wait(LOADING_TIME, signal);

      return db.getState().people;
    },

    async suggest(query, among, signal) {
      await wait(LOADING_TIME, signal);

      const state = db.getState();

      return state.people
        .filter((person) => among === undefined || among.includes(person.id))
        .map((person) => ({ id: person.id, name: person.name, organization: organizationOf(state, person) }))
        .filter((option) => containsText([option.name, option.organization], query))
        .sort((a, b) => a.name.localeCompare(b.name));
    },

    async create(values) {
      const person: Person = { id: newId('p'), ...values };

      await save((state) => ({ people: [...state.people, person] }));

      return person;
    },

    async update(id, values) {
      await save((state) => ({
        people: state.people.map((person) => (person.id === id ? { ...person, ...values } : person)),
      }));
    },

    async delete(ids) {
      await save((state) => ({
        people: state.people.filter((person) => !ids.includes(person.id)),
        memberships: state.memberships.filter((membership) => !ids.includes(membership.personId)),
        agendaItems: state.agendaItems.map((item) =>
          ids.includes(item.presenterId) ? { ...item, presenterId: '' } : item
        ),
      }));
    },
  };
}
