import type { DataNavigatorComponent } from '../../../../packages/data-navigator/src/react';
import { ROLES } from '../../domain';
import type { Membership, Role } from '../../domain';
import { localDate } from './helpers';
import { getBoard, getPerson, organizationOf } from './lookups';
import { oneOf, runQuery, within } from './query';
import { db, LOADING_TIME, newId, save, wait } from './store';

export { addMember, changeRole, fetchBoardMembers, fetchMemberships, removeMembers };
export type { MemberRow, MembershipRow };

type MemberRow = Membership & { name: string; email: string; organization: string };

// A membership of a person, with the name of its board.
type MembershipRow = Membership & { board: string };

function fetchBoardMembers(boardId: string): DataNavigatorComponent.Source<MemberRow> {
  return async (query, signal) => {
    await wait(LOADING_TIME, signal);

    const state = db.getState();
    const rows = state.memberships
      .filter((membership) => membership.boardId === boardId)
      // Chair first, then vice chair, secretary, members (the table's order without a sort).
      .sort((a, b) => ROLES.indexOf(a.role) - ROLES.indexOf(b.role))
      .map((membership): MemberRow => {
        const person = getPerson(state, membership.personId);

        return {
          ...membership,
          name: person?.name ?? '',
          email: person?.email ?? '',
          organization: organizationOf(state, person),
        };
      });

    return runQuery(rows, query, {
      search: ['name', 'email', 'organization', 'role'],
      filters: {
        name: (row, value) => oneOf(row.name, value),
        role: (row, value) => oneOf(row.role, value),
        organization: (row, value) => oneOf(row.organization, value),
        since: (row, value) => within(row.since, value),
      },
    });
  };
}

// The memberships of one person: chair first, then vice chair, secretary, members (the table's order without a sort).
function fetchMemberships(personId: string): DataNavigatorComponent.Source<MembershipRow> {
  return async (query, signal) => {
    await wait(LOADING_TIME, signal);

    const state = db.getState();
    const rows = state.memberships
      .filter((membership) => membership.personId === personId)
      .sort((a, b) => ROLES.indexOf(a.role) - ROLES.indexOf(b.role))
      .map((membership): MembershipRow => ({ ...membership, board: getBoard(state, membership.boardId)?.name ?? '' }));

    return runQuery(rows, query, { search: ['board', 'role'] });
  };
}

async function addMember(boardId: string, personId: string, role: Role): Promise<void> {
  const membership: Membership = { id: newId('ms'), boardId, personId, role, since: localDate(new Date()) };

  await save((state) => ({ memberships: [...state.memberships, membership] }));
}

async function changeRole(id: string, role: Role): Promise<void> {
  await save((state) => ({
    memberships: state.memberships.map((membership) => (membership.id === id ? { ...membership, role } : membership)),
  }));
}

async function removeMembers(ids: readonly string[]): Promise<void> {
  await save((state) => ({ memberships: state.memberships.filter((membership) => !ids.includes(membership.id)) }));
}
