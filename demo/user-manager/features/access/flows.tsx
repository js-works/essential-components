import { useDialogs, useToast } from '@local/overlays/react';
import { scopeLabel } from '../../domain/index.js';
import type { Grant, PrincipalRef } from '../../domain/index.js';
import { principalName } from '../../shared/ui/parts.js';
import { useAccessData, useChanged, useIamService } from '../iam/index.js';
import { GrantForm } from './components/GrantForm.js';

export { useGrantFlows };
export type { GrantFlows, GrantPreset };

// What a new grant may start with (e.g. the user of the page).
type GrantPreset = { principal?: PrincipalRef; roleId?: string; scopeId?: string };

// What `useGrantFlows()` gives: the flows, for the functions that build a table's actions.
type GrantFlows = ReturnType<typeof useGrantFlows>;

// The changes of grants, shared by the grants tables and the users' and groups' tables: grant access, revoke.
function useGrantFlows() {
  const service = useIamService();
  const data = useAccessData();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();

  // "Grant access": the form in a dialog (with what is given already), then a toast.
  const grant = async (preset: GrantPreset = {}) => {
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

  // "Revoke": a critical confirmation (in a scope: it stays open while the grants are revoked), then a toast.
  const revoke = async (rows: readonly { id: string; who: string; role: string; scope: string }[]) => {
    const scope = dialogs.open();

    try {
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
    } finally {
      scope.dispose();
    }

    await changed();
    toasts.success(rows.length === 1 ? 'Access revoked' : `${rows.length} grants revoked`);
  };

  return { grant, revoke };
}
