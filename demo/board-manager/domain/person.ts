import type { Role } from './membership.js';
import type { Page, Paging, Sort } from './query.js';

export type {
  Person,
  PersonCriteria,
  PersonOption,
  PersonRepository,
  PersonSortKey,
  PersonSummary,
  PersonValues,
  SuggestPeople,
};

// `organizationId`: `''` for none.
type Person = { id: string; name: string; email: string; organizationId: string };

// What a new person or a change of one gives.
type PersonValues = Pick<Person, 'name' | 'email' | 'organizationId'>;

// A person with what a list shows of their relations: the organization's name (`''`: none), their boards (ids and
// names) and their roles on them (each once).
type PersonSummary = Person & {
  organization: string;
  boardIds: readonly string[];
  boards: readonly string[];
  roles: readonly Role[];
};

// Which people a list asks for: a text in the name, the email, the organization or the boards; one of the names, of
// the organizations (by name), of the boards (by name); the people of one organization.
type PersonCriteria = {
  text?: string;
  names?: readonly string[];
  organizations?: readonly string[];
  boards?: readonly string[];
  organizationId?: string;
};

type PersonSortKey = 'name' | 'organization';

// A person to choose (an autocomplete): the name, the organization as its second line.
type PersonOption = { id: string; name: string; organization: string };

// Of the people `among` (their ids; all without it), those whose name or organization contains the query, by name.
type SuggestPeople = (
  query: string,
  among: readonly string[] | undefined,
  signal?: AbortSignal,
) => Promise<readonly PersonOption[]>;

// What can be done with people. Deleting a person deletes their memberships; the agenda items they present keep no
// presenter.
interface PersonRepository {
  find(
    criteria: PersonCriteria,
    sort: Sort<PersonSortKey> | undefined,
    paging: Paging,
    signal?: AbortSignal,
  ): Promise<Page<PersonSummary>>;
  get(id: string, signal?: AbortSignal): Promise<PersonSummary | undefined>;
  all(signal?: AbortSignal): Promise<readonly Person[]>;
  suggest: SuggestPeople;
  create(values: PersonValues): Promise<Person>;
  update(id: string, values: PersonValues): Promise<void>;
  delete(ids: readonly string[]): Promise<void>;
}
