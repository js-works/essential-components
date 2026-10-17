import type { BoardMember, Membership, MembershipRepository, PersonMembership } from '../../domain/index.js';
import { localDate, ROLES } from '../../domain/index.js';
import { getBoard, getPerson, organizationOf } from './lookups.js';
import { containsText, inList, inRange, pageOf, sorted } from './query.js';
import { db, LOADING_TIME, newId, save, wait } from './store.js';

export { createMembershipRepository };

// Chair first, then vice chair, secretary, members.
const byRole = (a: Membership, b: Membership) => ROLES.indexOf(a.role) - ROLES.indexOf(b.role);

// The memberships of the in-memory store.
function createMembershipRepository(): MembershipRepository {
  return {
    async findOfBoard(boardId, criteria, sort, paging, signal) {
      await wait(LOADING_TIME, signal);

      const state = db.getState();
      const found = state.memberships
        .filter((membership) => membership.boardId === boardId)
        .sort(byRole)
        .map((membership): BoardMember => {
          const person = getPerson(state, membership.personId);

          return {
            ...membership,
            name: person?.name ?? '',
            email: person?.email ?? '',
            organization: organizationOf(state, person),
          };
        })
        .filter((member) =>
          containsText([member.name, member.email, member.organization, member.role], criteria.text)
          && inList(member.name, criteria.names)
          && inList(member.role, criteria.roles)
          && inList(member.organization, criteria.organizations)
          && inRange(member.since, criteria.since)
        );

      return pageOf(sorted(found, sort), paging);
    },

    async findOfPerson(personId, text, sort, paging, signal) {
      await wait(LOADING_TIME, signal);

      const state = db.getState();
      const found = state.memberships
        .filter((membership) => membership.personId === personId)
        .sort(byRole)
        .map((membership): PersonMembership => ({
          ...membership,
          board: getBoard(state, membership.boardId)?.name ?? '',
        }))
        .filter((membership) => containsText([membership.board, membership.role], text));

      return pageOf(sorted(found, sort), paging);
    },

    async all(signal) {
      await wait(LOADING_TIME, signal);

      return db.getState().memberships;
    },

    async add(boardId, personId, role) {
      const membership: Membership = { id: newId('ms'), boardId, personId, role, since: localDate(new Date()) };

      await save((state) => ({ memberships: [...state.memberships, membership] }));
    },

    async changeRole(id, role) {
      await save((state) => ({
        memberships: state.memberships.map((
          membership,
        ) => (membership.id === id ? { ...membership, role } : membership)),
      }));
    },

    async remove(ids) {
      await save((state) => ({ memberships: state.memberships.filter((membership) => !ids.includes(membership.id)) }));
    },
  };
}
