import { Anchor, VisuallyHidden } from '@mantine/core';
import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  selectColumnFilter,
  textColumnFilter,
  useDataNavigatorController,
} from '../../../../../packages/data-navigator/src/react';
import type { DataNavigatorComponent } from '../../../../../packages/data-navigator/src/react';
import { useDialogs, useToast } from '../../../../../packages/overlays/src/main/bindings/react';
import {
  createOrganization,
  db,
  deleteOrganizations,
  fetchOrganizations,
  getOrganization,
  updateOrganization,
} from '../../../infra/in-memory';
import type { OrganizationRow } from '../../../infra/in-memory';
import { OrganizationForm } from '../../../shared/forms';
import { countryName } from '../../../shared/lib/countries';
import { confirmAndRun } from '../../../shared/lib/flows';
import type { Dialogs } from '../../../shared/lib/flows';
import { appIcons, countText, Navigator, organizationFilter, useDb } from '../../../shared/shared';

export { deleteOrganizationsFlow, editOrganization, OrganizationsPage, WebsiteLink };

type Toasts = ReturnType<typeof useToast>;

// The values of the organization form.
// "Edit" of an organization (in the list and on its overview): the organization form in a dialog, saved before it
// closes, then a toast. Resolves `true` when saved.
async function editOrganization(dialogs: Dialogs, toasts: Toasts, id: string): Promise<boolean> {
  const saved = !(await dialogs.form({
    title: 'Edit organization',
    content: (
      <OrganizationForm
        organization={getOrganization(db.getState(), id)}
        save={(values) => updateOrganization(id, values)}
      />
    ),
    buttons: { confirm: 'Save' },
  })).canceled;

  if (saved) {
    toasts.success(`"${getOrganization(db.getState(), id)?.name ?? ''}" saved`);
  }

  return saved;
}

// "Delete" of organizations (in the list and on an overview): a critical confirmation that says how many people lose
// their organization, then a toast. Resolves `true` when deleted.
async function deleteOrganizationsFlow(
  dialogs: Dialogs,
  toasts: Toasts,
  organizations: readonly { id: string; name: string }[],
): Promise<boolean> {
  const [first] = organizations;
  const single = organizations.length === 1 && first !== undefined;
  const ids = organizations.map((organization) => organization.id);
  const people = db.getState().people.filter((person) => ids.includes(person.organizationId)).length;
  const question = single
    ? `Delete "${first.name}"?`
    : `Delete the ${organizations.length} selected organizations?`;
  const belong = people === 0
    ? ''
    : `\n${people === 1 ? '1 person belongs' : `${people} people belong`} to ${
      single ? 'it' : 'them'
    }; they keep no organization.`;
  const done = await confirmAndRun(
    dialogs,
    {
      title: single ? 'Delete organization' : 'Delete organizations',
      content: `${question}${belong}\nThis cannot be undone.`,
      buttons: { confirm: 'Delete' },
    },
    () => deleteOrganizations(ids),
  );

  if (done) {
    toasts.success(`${countText(organizations.map((organization) => organization.name), 'organizations')} deleted`);
  }

  return done;
}

// A website as a link that opens in a new tab, without `https://` and a trailing `/` in its text, marked as external
// (an arrow out of a box after it; for screen readers, "opens in a new tab").
function WebsiteLink({ url }: { url: string }): ReactElement | null {
  if (url === '') {
    return null;
  }

  return (
    <Anchor href={url} target="_blank" rel="noopener noreferrer" size="sm" className="board-manager__external-link">
      {url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
      {appIcons.external}
      <VisuallyHidden>(opens in a new tab)</VisuallyHidden>
    </Anchor>
  );
}

// The "Organizations" module: every organization, with a new one, editing and deleting (its people stay, without an
// organization). One opens on its own page, with its people.
function OrganizationsPage(): ReactElement {
  const nav = useDataNavigatorController<OrganizationRow>();
  const dialogs = useDialogs();
  const toasts = useToast();
  const navigate = useNavigate();
  const organizations = useDb((state) => state.organizations);

  const columns = useMemo<readonly DataNavigatorComponent.Column<OrganizationRow>[]>(() => [
    {
      key: 'name',
      header: 'Organization',
      width: 3,
      sortable: true,
      filter: organizationFilter,
      render: (row) => <Anchor component={Link} to={`/organizations/${row.id}`} size="sm">{row.name}</Anchor>,
    },
    { key: 'description', header: 'Description', width: 4, hideable: true, hidden: true, wrap: true },
    { key: 'city', header: 'City', width: 2, sortable: true, hideable: true, filter: textColumnFilter() },
    {
      key: 'countryName',
      header: 'Country',
      width: 2,
      sortable: true,
      hideable: true,
      filter: selectColumnFilter({
        options: [...new Set(organizations.map((organization) => countryName(organization.country)))]
          .filter((name) => name !== '')
          .sort(),
        multiple: true,
      }),
    },
    {
      key: 'website',
      header: 'Website',
      width: 3,
      hideable: true,
      render: (row) => <WebsiteLink url={row.website} />,
    },
    { key: 'people', header: 'Members', width: 1, sortable: true, hideable: true, align: 'end' },
  ], [organizations]);

  const actions = useMemo<readonly DataNavigatorComponent.Action<OrganizationRow>[]>(() => {
    const create = async () => {
      let created = '';
      const saved = !(await dialogs.form({
        title: 'New organization',
        content: (
          <OrganizationForm
            save={async (values) => {
              created = (await createOrganization(values)).id;
            }}
          />
        ),
        buttons: { confirm: 'Create' },
      })).canceled;

      if (saved) {
        toasts.success('Organization created');
        navigate(`/organizations/${created}`);
      }
    };

    return [
      { type: 'general', key: 'new', label: 'New organization', icon: appIcons.add, onClick: () => void create() },
      {
        type: 'singleRow',
        key: 'open',
        icon: appIcons.open,
        tip: 'Open',
        show: 'column',
        default: true,
        onClick: (row) => navigate(`/organizations/${row.id}`),
      },
      {
        type: 'singleRow',
        key: 'edit',
        icon: appIcons.edit,
        label: 'Edit',
        show: 'both',
        onClick: async (row) => {
          if (await editOrganization(dialogs, toasts, row.id)) {
            nav.reload();
          }
        },
      },
      {
        type: 'multiRow',
        key: 'delete',
        label: 'Delete',
        icon: appIcons.remove,
        onClick: async (rows) => {
          if (await deleteOrganizationsFlow(dialogs, toasts, rows)) {
            nav.reload();
          }
        },
      },
    ];
  }, [nav, dialogs, toasts, navigate]);

  return (
    <Navigator
      controller={nav}
      title="Organizations"
      subtitle="The organizations the members belong to. Open one for its address and its people."
      density="compact"
      searchable
      reloadable
      source={fetchOrganizations}
      rowKey="id"
      columns={columns}
      actions={actions}
      pageSize={10}
      pageSizeOptions={[10, 25]}
      defaultSort={{ key: 'name', direction: 'asc' }}
    />
  );
}
