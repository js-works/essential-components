export { pathOf, scopeChildren, scopeLabel };
export type { Scope, ScopeRepository };

// Where access is granted: a node of the resource tree (the organization, an app, a folder, a board, ...). A grant on a
// scope applies to everything below it.
type Scope = {
  id: string;
  // `null` only for the root (the organization).
  parentId: string | null;
  name: string;
  // What it is (`organization`, `app`, `folder`, `board`, ...): only shown, never interpreted.
  kind: string;
  // The app it belongs to (an app and everything below it), matching the apps of the permissions (`media`); none for
  // the organization. A permission of an app means something only on the organization and in that app's scopes.
  app?: string;
};

interface ScopeRepository {
  all(signal?: AbortSignal): Promise<readonly Scope[]>;
}

// The scopes from the root down to the scope, both included (empty for an unknown id).
function pathOf(scopes: readonly Scope[], id: string): Scope[] {
  const path: Scope[] = [];

  for (let scope = scopes.find((candidate) => candidate.id === id); scope !== undefined;) {
    path.unshift(scope);
    scope = scope.parentId === null ? undefined : scopes.find((candidate) => candidate.id === scope?.parentId);
  }

  return path;
}

function scopeChildren(scopes: readonly Scope[], id: string): Scope[] {
  return scopes.filter((scope) => scope.parentId === id);
}

// "File Center › Marketing › Logos" (without the root, unless it is the scope itself).
function scopeLabel(scopes: readonly Scope[], id: string): string {
  const path = pathOf(scopes, id);

  return (path.length > 1 ? path.slice(1) : path).map((scope) => scope.name).join(' › ');
}
