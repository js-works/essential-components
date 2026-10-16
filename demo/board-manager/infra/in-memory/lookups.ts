import type { Board, Organization, Person } from '../../domain/index.js';
import type { Db } from './store.js';

export { boardIdsOf, getBoard, getPerson, organizationOf };

// Lookups in the store's state, for the repositories.
function getBoard(state: Pick<Db, 'boards'>, id: string | undefined): Board | undefined {
  return state.boards.find((board) => board.id === id);
}

function getPerson(state: Pick<Db, 'people'>, id: string | undefined): Person | undefined {
  return state.people.find((person) => person.id === id);
}

function getOrganization(state: Pick<Db, 'organizations'>, id: string | undefined): Organization | undefined {
  return state.organizations.find((organization) => organization.id === id);
}

// The boards a person is a member of.
function boardIdsOf(state: Pick<Db, 'memberships'>, personId: string): string[] {
  return state.memberships.filter((membership) => membership.personId === personId).map((membership) =>
    membership.boardId
  );
}

// The name of a person's organization; `''` for none.
function organizationOf(state: Pick<Db, 'organizations'>, person: Person | undefined): string {
  return getOrganization(state, person?.organizationId)?.name ?? '';
}
