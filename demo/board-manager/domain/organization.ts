import type { Page, Paging, Sort, TextMatch } from './query.js';

export type {
  Organization,
  OrganizationCriteria,
  OrganizationOption,
  OrganizationRepository,
  OrganizationSortKey,
  OrganizationSummary,
  OrganizationValues,
  SuggestOrganizations,
};
export { normalizeWebsite, ORGANIZATION_SORT_KEYS };

// The address is optional, each of its parts; `country` is an ISO code (`DE`, see `countries.ts`), `website` a full URL
// (`https://…`, see `normalizeWebsite()`).
type Organization = {
  id: string;
  name: string;
  description: string;
  street: string;
  zipCode: string;
  city: string;
  country: string;
  website: string;
};

// A website as it is stored: trimmed, with `https://` when it has no scheme; `''` stays empty. `undefined`: no valid
// web address (a scheme other than http(s), or a host without a dot).
function normalizeWebsite(value: string): string | undefined {
  const text = value.trim();

  if (text === '') {
    return '';
  }

  const url = URL.parse(/^[a-z][a-z\d+.-]*:/i.test(text) ? text : `https://${text}`);

  return url !== null && (url.protocol === 'https:' || url.protocol === 'http:') && url.hostname.includes('.')
    ? url.href
    : undefined;
}

// What a new organization or a change of one gives.
type OrganizationValues = Omit<Organization, 'id'>;

// An organization with how many people belong to it.
type OrganizationSummary = Organization & { people: number };

// Which organizations a list asks for: a text in the name, the description, the city, the country or the website; one
// of the names; the city matching; one of the countries (ISO codes).
type OrganizationCriteria = {
  text?: string;
  names?: readonly string[];
  city?: TextMatch;
  countries?: readonly string[];
};

// `country`: by the country's name in the page's language.
// What the organizations can be sorted by.
const ORGANIZATION_SORT_KEYS = ['name', 'city', 'country', 'people'] as const;

type OrganizationSortKey = (typeof ORGANIZATION_SORT_KEYS)[number];

// An organization to choose (an autocomplete): the name, the city as its second line.
type OrganizationOption = { name: string; city: string };

// The organizations whose name contains the query, by name.
type SuggestOrganizations = (query: string, signal?: AbortSignal) => Promise<readonly OrganizationOption[]>;

// What can be done with organizations. A new or changed one is checked: a name is required and unique (ignoring the
// case), a website valid (`AppError`). Deleting one keeps its people, without an organization.
interface OrganizationRepository {
  find(
    criteria: OrganizationCriteria,
    sort: Sort<OrganizationSortKey> | undefined,
    paging: Paging,
    signal?: AbortSignal,
  ): Promise<Page<OrganizationSummary>>;
  get(id: string, signal?: AbortSignal): Promise<OrganizationSummary | undefined>;
  all(signal?: AbortSignal): Promise<readonly Organization[]>;
  suggest: SuggestOrganizations;
  create(values: OrganizationValues): Promise<Organization>;
  update(id: string, values: OrganizationValues): Promise<void>;
  delete(ids: readonly string[]): Promise<void>;
}
