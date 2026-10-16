import { normalizeWebsite } from '../../domain/index.js';
import type {
  Organization,
  OrganizationRepository,
  OrganizationSortKey,
  OrganizationSummary,
  OrganizationValues,
  Sort,
} from '../../domain/index.js';

import { AppError } from '../../shared/lib/app-error.js';
import { countryName } from '../../shared/lib/countries.js';
import { containsText, inList, matchesText, pageOf, sorted } from './query.js';
import { db, LOADING_TIME, newId, save, SAVE_TIME, wait } from './store.js';
import type { Db } from './store.js';

export { createOrganizationRepository };

// The organizations with how many people belong to each.
function summaries(state: Db, organizations: readonly Organization[] = state.organizations): OrganizationSummary[] {
  return organizations.map((organization) => ({
    ...organization,
    people: state.people.filter((person) => person.organizationId === organization.id).length,
  }));
}

// Trims the values and normalizes the website; refuses an empty name, a name another organization has (ignoring the
// case), and an invalid website.
function checked(state: Db, id: string | undefined, values: OrganizationValues): OrganizationValues {
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

// The organizations of the in-memory store.
function createOrganizationRepository(): OrganizationRepository {
  return {
    async find(criteria, sort, paging, signal) {
      await wait(LOADING_TIME, signal);

      const found = summaries(db.getState())
        .map((organization) => ({ ...organization, countryName: countryName(organization.country) }))
        .filter((organization) =>
          containsText(
            [
              organization.name,
              organization.description,
              organization.city,
              organization.countryName,
              organization.website,
            ],
            criteria.text,
          )
          && inList(organization.name, criteria.names)
          && matchesText(organization.city, criteria.city)
          && inList(organization.country, criteria.countries)
        );
      // The country by its name.
      const order: Sort<OrganizationSortKey | 'countryName'> | undefined = sort?.key === 'country'
        ? { ...sort, key: 'countryName' }
        : sort;

      return pageOf(sorted(found, order).map(({ countryName: _, ...organization }) => organization), paging);
    },

    async get(id, signal) {
      await wait(LOADING_TIME, signal);

      const state = db.getState();

      return summaries(state, state.organizations.filter((organization) => organization.id === id))[0];
    },

    async all(signal) {
      await wait(LOADING_TIME, signal);

      return db.getState().organizations;
    },

    async suggest(query, signal) {
      await wait(LOADING_TIME, signal);

      return db.getState().organizations
        .filter((organization) => containsText([organization.name], query))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((organization) => ({ name: organization.name, city: organization.city }));
    },

    async create(values) {
      await wait(SAVE_TIME);

      const organization: Organization = { id: newId('o'), ...checked(db.getState(), undefined, values) };

      db.setState((state) => ({ organizations: [...state.organizations, organization] }));

      return organization;
    },

    async update(id, values) {
      await wait(SAVE_TIME);

      const changed = checked(db.getState(), id, values);

      db.setState((state) => ({
        organizations: state.organizations.map((organization) =>
          organization.id === id ? { ...organization, ...changed } : organization
        ),
      }));
    },

    async delete(ids) {
      await save((state) => ({
        organizations: state.organizations.filter((organization) => !ids.includes(organization.id)),
        people: state.people.map((person) =>
          ids.includes(person.organizationId) ? { ...person, organizationId: '' } : person
        ),
      }));
    },
  };
}
