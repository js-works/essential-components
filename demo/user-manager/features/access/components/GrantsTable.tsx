import { Anchor, Badge } from '@mantine/core';
import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { Link } from 'react-router';
import {
  dateRangeColumnFilter,
  selectColumnFilter,
  useDataNavigatorController,
} from '../../../../../packages/data-navigator/src/react';
import type { DataNavigatorComponent } from '../../../../../packages/data-navigator/src/react';
import { useDialogs, useToast } from '../../../../../packages/overlays/src/main/bindings/react';
import { scopeLabel } from '../../../domain';
import type { AccessData, Grant, PrincipalRef } from '../../../domain';
import { formatDateTime } from '../../../shared/lib/format';
import { matchesText, oneOf, within } from '../../../shared/lib/localQuery';
import { appIcons } from '../../../shared/ui/icons';
import { Navigator } from '../../../shared/ui/navigator';
import { PrincipalLabel, principalName } from '../../../shared/ui/parts';
import { useAccessData, useChanged, useIamService, useTableSource } from '../../iam';
import { GrantForm } from './GrantForm';

export { GrantsTable, useGrantAccess };

// A row of a grants table: the grant, with what the table shows of it.
type GrantRow = {
  id: string;
  who: string;
  type: 'User' | 'Group';
  role: string;
  scope: string;
  created: string;
  grantedBy: string;
  grant: Grant;
};

function grantRows(data: AccessData, filter: (grant: Grant) => boolean): GrantRow[] {
  return data.grants.filter(filter).map((grant) => ({
    id: grant.id,
    who: principalName(data, grant.principal),
    type: grant.principal.type === 'user' ? 'User' : 'Group',
    role: data.roles.find((role) => role.id === grant.roleId)?.name ?? '',
    scope: scopeLabel(data.scopes, grant.scopeId),
    created: grant.created,
    grantedBy: grant.grantedBy,
    grant,
  }));
}

// "Grant access": the form in a dialog (with what is given already), then a toast.
function useGrantAccess(): (preset?: { principal?: PrincipalRef; roleId?: string; scopeId?: string }) => Promise<void> {
  const service = useIamService();
  const data = useAccessData();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();

  return async (preset = {}) => {
    if (data === undefined) {
      return;
    }

    let granted: Grant | undefined;
    const result = await dialogs.form({
      title: 'Grant access',
      content: (
        <GrantForm
          data={data}
          {...preset}
          save={async (principal, roleId, scopeId) => {
            granted = await service.grant(principal, roleId, scopeId);
          }}
        />
      ),
      buttons: { confirm: 'Grant' },
    });

    if (!result.canceled && granted !== undefined) {
      await changed();
      toasts.success(
        `${principalName(data, granted.principal)} is now ${
          data.roles.find((role) => role.id === granted?.roleId)?.name ?? ''
        } on ${scopeLabel(data.scopes, granted.scopeId)}`,
      );
    }
  };
}

// Grants in a table: all of them (the access page), or those of a user, a group or a role (`filter`). "Grant access"
// (with `preset`: e.g. the user of the page) and "Revoke" (a critical confirmation).
function GrantsTable({ name, filter = () => true, preset, hide = [], title, subtitle }: {
  name: string;
  filter?: (grant: Grant) => boolean;
  preset?: { principal?: PrincipalRef; roleId?: string; scopeId?: string };
  // Columns the context makes clear (e.g. "who" on a user's page).
  hide?: readonly ('who' | 'role')[];
  title?: string;
  subtitle?: string;
}): ReactElement {
  const nav = useDataNavigatorController<GrantRow>();
  const data = useAccessData();
  const service = useIamService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();
  const grantAccess = useGrantAccess();
  const source = useTableSource<GrantRow>(
    name,
    (all) => grantRows(all, filter),
    {
      search: ['who', 'role', 'scope', 'grantedBy'],
      filters: {
        who: (row, value) => matchesText(row.who, value),
        type: (row, value) => oneOf(row.type, value),
        role: (row, value) => oneOf(row.role, value),
        created: (row, value) => within(row.created, value),
      },
    },
    nav.reload,
  );

  const columns = useMemo((): readonly DataNavigatorComponent.Column<GrantRow>[] => [
    ...(hide.includes('who') ? [] : [
      {
        key: 'who' as const,
        header: 'Who',
        width: 3,
        sortable: true,
        render: (row: GrantRow) =>
          data === undefined ? row.who : <PrincipalLabel data={data} principal={row.grant.principal} />,
      },
      {
        key: 'type' as const,
        header: 'Type',
        width: 1.2,
        hideable: true,
        render: (row: GrantRow) => (
          <Badge variant="light" color={row.type === 'User' ? 'gray' : undefined}>{row.type}</Badge>
        ),
        filter: selectColumnFilter({
          options: [{ value: 'User', label: 'User' }, { value: 'Group', label: 'Group' }],
          multiple: true,
        }),
      },
    ]),
    ...(hide.includes('role') ? [] : [
      {
        key: 'role' as const,
        header: 'Role',
        width: 2.2,
        sortable: true,
        render: (row: GrantRow) => (
          <Anchor component={Link} to={`/roles/${row.grant.roleId}`} size="sm">{row.role}</Anchor>
        ),
        filter: selectColumnFilter({
          options: (data?.roles ?? []).map((role) => ({ value: role.name, label: role.name })),
          multiple: true,
        }),
      },
    ]),
    { key: 'scope', header: 'Where', width: 3.5, sortable: true },
    {
      key: 'created',
      header: 'Granted',
      width: 2,
      sortable: true,
      hideable: true,
      render: (row) => formatDateTime(row.created),
      filter: dateRangeColumnFilter(),
    },
    { key: 'grantedBy', header: 'By', width: 1.2, hideable: true, hidden: true },
  ], [data, hide]);

  const actions = useMemo((): readonly DataNavigatorComponent.Action<GrantRow>[] => {
    const revoke = async (rows: readonly GrantRow[]) => {
      const scope = dialogs.open();

      try {
        const [first] = rows;
        const result = await scope.confirmCritical({
          title: rows.length === 1 ? 'Revoke access' : 'Revoke access',
          content: rows.length === 1 && first !== undefined
            ? `Revoke "${first.role}" on ${first.scope} from ${first.who}?`
            : `Revoke the ${rows.length} selected grants?`,
          buttons: { confirm: 'Revoke' },
        });

        if (result.canceled) {
          return;
        }

        await service.revoke(rows.map((row) => row.id));
      } finally {
        scope.dispose();
      }

      await changed();
      toasts.success(rows.length === 1 ? 'Access revoked' : `${rows.length} grants revoked`);
    };

    return [
      {
        type: 'general',
        key: 'grant',
        label: 'Grant access',
        icon: appIcons.add,
        onClick: () => void grantAccess(preset),
      },
      {
        type: 'singleRow',
        key: 'revoke-row',
        icon: appIcons.remove,
        tip: 'Revoke',
        show: 'column',
        contextMenu: false,
        onClick: (row) => void revoke([row]),
      },
      {
        type: 'multiRow',
        key: 'revoke',
        label: 'Revoke',
        icon: appIcons.remove,
        variant: 'danger',
        onClick: (rows) => void revoke(rows),
      },
    ];
  }, [dialogs, toasts, service, changed, grantAccess, preset]);

  return (
    <Navigator
      controller={nav}
      {...(title === undefined ? {} : { title })}
      {...(subtitle === undefined ? {} : { subtitle })}
      source={source}
      rowKey="id"
      columns={columns}
      actions={actions}
      searchable
      pageSize={10}
      pageSizeOptions={[10, 25, 50]}
      defaultSort={{ key: hide.includes('who') ? 'scope' : 'who', direction: 'asc' }}
      empty="No access granted."
    />
  );
}
