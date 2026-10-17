import { useDialogs, useToast } from '@local/overlays/react';

import type { Grant, PrincipalRef } from '../../domain/index.js';
import { scopeLabel } from '../../domain/index.js';
import { principalName } from '../../shared/ui/parts.js';
import { useAccessData, useChanged, useIamService } from '../iam/index.js';
import { GrantForm } from './components/grant-form.js';

export type { GrantPreset };
export { useGrantAccessFlow, useRevokeGrantsFlow };

// The flows of grants, one hook per use case: each gives the function a button or an action calls. A flow
// changes the data and says so; the tables follow the data themselves (the queries).

// What a new grant may start with (e.g. the user of the page).
type GrantPreset = { principal?: PrincipalRef; roleId?: string; scopeId?: string };

// "Grant access": the form in a dialog (with what is given already), then a toast.
function useGrantAccessFlow() {
  const service = useIamService();
  const data = useAccessData();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();

  return async (preset: GrantPreset = {}) => {
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

    if (result.canceled || granted === undefined) {
      return;
    }

    await changed();
    toasts.success(
      `${principalName(data, granted.principal)} is now ${
        data.roles.find((role) => role.id === granted?.roleId)?.name ?? ''
      } on ${scopeLabel(data.scopes, granted.scopeId)}`,
    );
  };
}

// "Revoke": a critical confirmation (in a scope: it stays open while the grants are revoked), then a toast.
function useRevokeGrantsFlow() {
  const service = useIamService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();

  return async (rows: readonly { id: string; who: string; role: string; scope: string }[]) => {
    using scope = dialogs.open();
    const [first] = rows;
    const result = await scope.confirmCritical({
      title: 'Revoke access',
      content: rows.length === 1 && first !== undefined
        ? `Revoke "${first.role}" on ${first.scope} from ${first.who}?`
        : `Revoke the ${rows.length} selected grants?`,
      buttons: { confirm: 'Revoke' },
    });

    if (result.canceled) {
      return;
    }

    await service.revoke(rows.map((row) => row.id));

    await changed();
    toasts.success(rows.length === 1 ? 'Access revoked' : `${rows.length} grants revoked`);
  };
}
