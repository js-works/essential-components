import type { PrincipalRef } from './principal';

export type { Grant, GrantRepository };

// A role assignment: who (a user or a group) gets which role where (a scope, and everything below it).
type Grant = {
  id: string;
  principal: PrincipalRef;
  roleId: string;
  scopeId: string;
  // An ISO date and time, and who granted it.
  created: string;
  grantedBy: string;
};

interface GrantRepository {
  all(signal?: AbortSignal): Promise<readonly Grant[]>;
  // Refused if the same grant exists already.
  create(principal: PrincipalRef, roleId: string, scopeId: string): Promise<Grant>;
  delete(ids: readonly string[]): Promise<void>;
}
