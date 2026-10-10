import type { DataTableComponent } from '../../../../packages/data-table/src/react';
import { normalizeWebsite } from '../../domain';
import type { Organization } from '../../domain';
import { countryName } from '../../shared/lib/countries';
import { AppError } from './errors';
import { matches, oneOf, runQuery } from './query';
import { db, LOADING_TIME, newId, save, SAVE_TIME, wait } from './store';
import type { Db } from './store';

export { createOrganization, deleteOrganizations, fetchOrganizations, suggestOrganizations, updateOrganization };
export type { OrganizationRow, OrganizationValues };

// `countryName`: in the page's language; `people`: how many belong to it.
type OrganizationRow = Organization & { countryName: string; people: number };

// The options of the organization filters (autocompletes): the organizations whose name contains the
// query (ignoring the case), by name, with their city. The value is the name, like the column's.
async function suggestOrganizations(
  query: string,
  signal: AbortSignal,
): Promise<readonly { value: string; label: string; city: string }[]> {
  await wait(LOADING_TIME, signal);

  const needle = query.toLowerCase();

  return db.getState().organizations
    .filter((organization) => organization.name.toLowerCase().includes(needle))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((organization) => ({ value: organization.name, label: organization.name, city: organization.city }));
}

async function fetchOrganizations(
  query: DataTableComponent.Query,
  signal: AbortSignal,
): Promise<DataTableComponent.Result<OrganizationRow>> {
  await wait(LOADING_TIME, signal);

  const state = db.getState();
  const rows = state.organizations.map((organization): OrganizationRow => ({
    ...organization,
    countryName: countryName(organization.country),
    people: state.people.filter((person) => person.organizationId === organization.id).length,
  }));

  return runQuery(rows, query, {
    search: ['name', 'description', 'city', 'countryName', 'website'],
    filters: {
      name: (row, value) => oneOf(row.name, value),
      city: (row, value) => matches(row.city, value),
      countryName: (row, value) => oneOf(row.countryName, value),
    },
  });
}

type OrganizationValues = Omit<Organization, 'id'>;

// Trims the values and normalizes the website; refuses an empty name, a name another organization has (ignoring the
// case), and an invalid website.
function checkedOrganization(state: Db, id: string | undefined, values: OrganizationValues): OrganizationValues {
  const name = values.name.trim();
  const website = normalizeWebsite(values.website);

  if (name === '') {
    throw new AppError('nameRequired');
  }

  if (state.organizations.some((other) => other.id !== id && other.name.toLowerCase() === name.toLowerCase())) {
    throw new AppError('organizationExists', { name });
  }

  if (website === undefined) {
    throw new AppError('websiteInvalid');
  }

  return {
    name,
    description: values.description.trim(),
    street: values.street.trim(),
    zipCode: values.zipCode.trim(),
    city: values.city.trim(),
    country: values.country,
    website,
  };
}

async function createOrganization(values: OrganizationValues): Promise<Organization> {
  await wait(SAVE_TIME);

  const organization: Organization = { id: newId('o'), ...checkedOrganization(db.getState(), undefined, values) };

  db.setState((state) => ({ organizations: [...state.organizations, organization] }));

  return organization;
}

async function updateOrganization(id: string, values: OrganizationValues): Promise<void> {
  await wait(SAVE_TIME);

  const checked = checkedOrganization(db.getState(), id, values);

  db.setState((state) => ({
    organizations: state.organizations.map((organization) =>
      organization.id === id ? { ...organization, ...checked } : organization
    ),
  }));
}

// Deletes the organizations; their people stay, without an organization.
async function deleteOrganizations(ids: readonly string[]): Promise<void> {
  await save((state) => ({
    organizations: state.organizations.filter((organization) => !ids.includes(organization.id)),
    people: state.people.map((
      person,
    ) => (ids.includes(person.organizationId) ? { ...person, organizationId: '' } : person)),
  }));
}
