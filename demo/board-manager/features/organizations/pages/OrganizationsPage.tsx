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
import { translate, useTranslate } from '../../../shared/lib/i18n';
import { appIcons, Navigator, organizationFilter, useDb } from '../../../shared/shared';

export { deleteOrganizationsFlow, editOrganization, OrganizationsPage, WebsiteLink };

type Toasts = ReturnType<typeof useToast>;

// The values of the organization form.
// "Edit" of an organization (in the list and on its overview): the organization form in a dialog, saved before it
// closes, then a toast. Resolves `true` when saved.
async function editOrganization(dialogs: Dialogs, toasts: Toasts, id: string): Promise<boolean> {
  const saved = !(await dialogs.form({
    title: translate('organizations.editTitle'),
    content: (
      <OrganizationForm
        organization={getOrganization(db.getState(), id)}
        save={(values) => updateOrganization(id, values)}
      />
    ),
    buttons: { confirm: translate('common.save') },
  })).canceled;

  if (saved) {
    toasts.success(translate('organizations.saved', { name: getOrganization(db.getState(), id)?.name ?? '' }));
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
  const ids = organizations.map((organization) => organization.id);
  const people = db.getState().people.filter((person) => ids.includes(person.organizationId)).length;
  const question = translate('organizations.deleteQuestion', {
    count: organizations.length,
    name: first?.name ?? '',
  });
  const belong = people === 0 ? '' : `\n${translate('organizations.leaves', { count: people })}`;
  const done = await confirmAndRun(
    dialogs,
    {
      title: translate('organizations.deleteTitle', { count: organizations.length }),
      content: `${question}${belong}\n${translate('common.cannotBeUndone')}`,
      buttons: { confirm: translate('common.delete') },
    },
    () => deleteOrganizations(ids),
  );

  if (done) {
    toasts.success(translate('organizations.deleted', { count: organizations.length, name: first?.name ?? '' }));
  }

  return done;
}

// A website as a link that opens in a new tab, without `https://` and a trailing `/` in its text, marked as external
// (an arrow out of a box after it; for screen readers, "opens in a new tab").
function WebsiteLink({ url }: { url: string }): ReactElement | null {
  const t = useTranslate();

  if (url === '') {
    return null;
  }

  return (
    <Anchor href={url} target="_blank" rel="noopener noreferrer" size="sm" className="board-manager__external-link">
      {url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
      {appIcons.external}
      <VisuallyHidden>{t('organizations.opensInNewTab')}</VisuallyHidden>
    </Anchor>
  );
}

// The "Organizations" module: every organization, with a new one, editing and deleting (its people stay, without an
// organization). One opens on its own page, with its people.
function OrganizationsPage(): ReactElement {
  const t = useTranslate();
  const nav = useDataNavigatorController<OrganizationRow>();
  const dialogs = useDialogs();
  const toasts = useToast();
  const navigate = useNavigate();
  const organizations = useDb((state) => state.organizations);

  const columns = useMemo<readonly DataNavigatorComponent.Column<OrganizationRow>[]>(() => [
    {
      key: 'name',
      header: t('organizations.columns.organization'),
      width: 3,
      sortable: true,
      filter: organizationFilter,
      render: (row) => <Anchor component={Link} to={`/organizations/${row.id}`} size="sm">{row.name}</Anchor>,
    },
    {
      key: 'description',
      header: t('organizations.columns.description'),
      width: 4,
      hideable: true,
      hidden: true,
      wrap: true,
    },
    {
      key: 'city',
      header: t('organizations.columns.city'),
      width: 2,
      sortable: true,
      hideable: true,
      filter: textColumnFilter(),
    },
    {
      key: 'countryName',
      header: t('organizations.columns.country'),
      render: (row) => countryName(row.country),
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
      header: t('organizations.columns.website'),
      width: 3,
      hideable: true,
      render: (row) => <WebsiteLink url={row.website} />,
    },
    {
      key: 'people',
      header: t('organizations.columns.members'),
      width: 1,
      sortable: true,
      hideable: true,
      align: 'end',
    },
  ], [t, organizations]);

  const actions = useMemo<readonly DataNavigatorComponent.Action<OrganizationRow>[]>(() => {
    const create = async () => {
      let created = '';
      const saved = !(await dialogs.form({
        title: t('organizations.new'),
        content: (
          <OrganizationForm
            save={async (values) => {
              created = (await createOrganization(values)).id;
            }}
          />
        ),
        buttons: { confirm: t('common.create') },
      })).canceled;

      if (saved) {
        toasts.success(t('organizations.created'));
        navigate(`/organizations/${created}`);
      }
    };

    return [
      { type: 'general', key: 'new', label: t('organizations.new'), icon: appIcons.add, onClick: () => void create() },
      {
        type: 'singleRow',
        key: 'open',
        icon: appIcons.open,
        tip: t('common.open'),
        show: 'column',
        default: true,
        onClick: (row) => navigate(`/organizations/${row.id}`),
      },
      {
        type: 'singleRow',
        key: 'edit',
        icon: appIcons.edit,
        label: t('common.edit'),
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
        label: t('common.delete'),
        icon: appIcons.remove,
        onClick: async (rows) => {
          if (await deleteOrganizationsFlow(dialogs, toasts, rows)) {
            nav.reload();
          }
        },
      },
    ];
  }, [t, nav, dialogs, toasts, navigate]);

  return (
    <Navigator
      controller={nav}
      title={t('modules.organizations')}
      subtitle={t('organizations.listSubtitle')}
      density="compact"
      searchable
      reloadable
      source={fetchOrganizations}
      rowKey="id"
      columns={columns}
      actions={actions}
      pageSize={10}
      pageSizeOptions={[10, 25, 50]}
      defaultSort={{ key: 'name', direction: 'asc' }}
    />
  );
}
