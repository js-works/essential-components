import type { Person } from '../../../domain/index.js';
import { getPerson } from '../../../infra/in-memory/index.js';
import type { Db } from '../../../infra/in-memory/index.js';

export { membersOf, numbered };

// The members of a board, as people (the presenters of its agenda items).
function membersOf(state: Pick<Db, 'memberships' | 'people'>, boardId: string): Person[] {
  return state.memberships
    .filter((membership) => membership.boardId === boardId)
    .flatMap((membership) => getPerson(state, membership.personId) ?? []);
}

// The number and the title of an agenda entry: `2. Finance`, `2.1 Annual accounts`.
function numbered(number: string, title: string): string {
  return number.includes('.') ? `${number} ${title}` : `${number}. ${title}`;
}
