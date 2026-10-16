import type { Page, Paging, Range, Sort } from './query.js';

export { ROLES };
export type {
  BoardMember,
  BoardMemberCriteria,
  BoardMemberSortKey,
  Membership,
  MembershipRepository,
  PersonMembership,
  PersonMembershipSortKey,
  Role,
};

const ROLES = ['Chair', 'Vice chair', 'Secretary', 'Member'] as const;

type Role = (typeof ROLES)[number];

type Membership = { id: string; boardId: string; personId: string; role: Role; since: string };

// A member of a board: the membership with the person's name, email and organization (its name, `''`: none).
type BoardMember = Membership & { name: string; email: string; organization: string };

// Which members of a board a list asks for: a text in the name, the email, the organization or the role; one of the
// names, roles, organizations (by name); a member since a range of days.
type BoardMemberCriteria = {
  text?: string;
  names?: readonly string[];
  roles?: readonly Role[];
  organizations?: readonly string[];
  since?: Range<string>;
};

type BoardMemberSortKey = 'name' | 'role' | 'organization' | 'since';

// A board of a person: the membership with the board's name.
type PersonMembership = Membership & { board: string };

type PersonMembershipSortKey = 'board' | 'role' | 'since';

// What can be done with the memberships. Without a sort, the members come by their role: chair first, then vice chair,
// secretary, members.
interface MembershipRepository {
  findOfBoard(
    boardId: string,
    criteria: BoardMemberCriteria,
    sort: Sort<BoardMemberSortKey> | undefined,
    paging: Paging,
    signal?: AbortSignal,
  ): Promise<Page<BoardMember>>;
  findOfPerson(
    personId: string,
    text: string | undefined,
    sort: Sort<PersonMembershipSortKey> | undefined,
    paging: Paging,
    signal?: AbortSignal,
  ): Promise<Page<PersonMembership>>;
  all(signal?: AbortSignal): Promise<readonly Membership[]>;
  add(boardId: string, personId: string, role: Role): Promise<void>;
  changeRole(id: string, role: Role): Promise<void>;
  remove(ids: readonly string[]): Promise<void>;
}
