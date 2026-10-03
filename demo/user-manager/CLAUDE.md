# User Manager

The "User Manager" app of the root's demo page (a mini-app of its app cockpit): a demo of the root (not of a package).
Users, groups, roles, and who may do what where, with a generic permission model that fits many apps. Same look as the
Board Manager (Mantine, the same theme); built like the Media Manager (the decided target structure). Two packages: data
navigators for the lists, the dialogs and toasts of the overlays package. The rules of the root's `CLAUDE.md` apply.
Started 2026-10-03.

## Permission model (IAM style, like Azure RBAC or Google Cloud IAM)

- Principals: users and groups (a group is a set of users; no nested groups). What a group is granted, its members get.
- Permissions: a catalog of `<app>.<resource>.<action>` (`media.file.delete`), registered by the apps; the user manager
  does not know what they mean. Today four apps: `media`, `boards`, `users`, `intranet` (32 permissions).
- Roles: named sets of permissions. Built-in roles ("Owner": all, "Reader": all `*.read`) cannot be changed or deleted;
  custom roles can, a role still granted cannot be deleted.
- Scopes: a resource tree (the organization › apps › their resources: folders, boards, sections). A scope may belong to
  an app (`app`: the app and everything below it); the organization has none.
- Grants (role assignments): who (a user or a group) gets which role where (a scope). A grant applies to its scope and
  everything below it.
- Allow only (no deny, no conditions): a user may do something somewhere if a grant gives a role with that permission
  to the user or one of their groups, on that scope or one above it, and only where the permission means something (a
  scope without an app, or of the permission's own app: "Reader on Intranet" gives no media permission, though the role
  contains it). A disabled user may do nothing (their grants stay).
- The rules are pure functions of the domain (`domain/access.ts`): `checkAccess()` (allowed, with every reason) and
  `effectivePermissions()` (every permission of a user, with where and why).

## Structure

- `domain/`: `principal.ts` (User, Group, PrincipalRef, repositories), `permission.ts` (Permission, Role,
  repositories), `scope.ts`, `grant.ts`, `access.ts` (the rules), `query.ts`. Pure TypeScript.
- `infra/in-memory/`: `seed.ts` (40 users in 8 departments, two disabled; 9 groups; 8 roles; the catalog; 18 scopes; 24
  grants), `repositories.ts` (one store; deleting a user or a group deletes its grants and memberships). Waits like a
  server. Only `app/` imports it.
- `features/`:
  - `iam/`: the service (`createIamService`: the repositories' methods, and `data()`: everything access depends on, in
    one read), its context, the query keys, `useAccessData()`, `useChanged()` (invalidates every read after a change),
    `useTableSource()` (a data navigator's source over rows made from the access data, searched, filtered, sorted and
    paged locally, `shared/lib/localQuery.ts`; each page is a TanStack query).
  - `users/`, `groups/`, `roles/` (with the permission catalog), `access/` (grants, "Grant access", the effective
    permissions, the check), `home/`. Each with an `index.ts`; they import each other only through it.
- `shared/`: the Mantine scope (`.user-manager`), the data navigator in Mantine's look, icons, page parts (header,
  avatar, a user's or group's label), formatting, `useDialogSave` (the confirmation of a form dialog: check, save, show
  the refusal), `useQuerySource`.
- `app/`: `UserManagerDemo.tsx` (the element `user-manager-demo`; the wiring), `App.tsx` (routes, top bar, breadcrumb,
  history, the hash), `look.tsx` (taken from the Media Manager, i.e. the Board Manager's look), `user-manager.css`.

## Data access

- TanStack Query, like the Media Manager: one query for the access data (without the query's signal: TanStack cancels a
  request that uses its signal when its last observer goes, e.g. in React's StrictMode, and a table's read that shares
  it would fail; it is a cheap read); every table's page a query; every change invalidates all (`iamKeys.all`).

## App

- Top bar like the Board Manager's: the app icon (`TbShieldLock`, also the cockpit's), "User Manager" with the menu of
  the modules (Main, Users, Groups, Roles, Access, Check access, Permissions), the breadcrumb (a house icon only, a link to the start
  page with the tooltip "Overview", like the Board Manager's; then module › name; none on
  the start page; the app icon is a link to it too),
  Back and Forward.
- Routes: `/`, `/users`, `/users/:userId`, `/groups`, `/groups/:groupId`, `/roles`, `/roles/:roleId`, `/access`,
  `/check`, `/permissions`; mirrored in the hash after `#user-manager`.
- Main (the start page, titled "Main"): six cards (counts) and a short explanation of the model.
- Users: a table (avatar, name with title, email, department and status filters, groups); New user, Edit, Grant access
  (for one selected), Enable, Disable, Delete (a critical confirmation: memberships and own grants go too).
  - A user's page: Overview (details, groups as links), Granted access (their own grants; "Grant access" preset to the
    user), Effective permissions (by app: each permission, where and why: "Media editor on Media Manager › Marketing,
    via group Marketing").
- Groups: a table (members, grants); New group, Edit, Grant access, Delete. A group's page: Members (add: a filtered
  checklist of the others; remove), Granted access.
- Roles: a table (built-in badge, number of permissions, number of grants); New role, Duplicate (a copy of the
  permissions), Delete (refusals in a warning: built-in, still granted). A role's page: the permission matrix (by app:
  a row per resource, a checkbox per action, with "all" per resource and per app; edited in place, then Save or Reset;
  read only for a built-in role), and where it is granted.
- Access: every grant (who, type, role, where, granted, by); Grant access, Revoke (a critical confirmation).
- Grant access: a form dialog: who (native select, groups and users), role (native select), where (the scope tree);
  any of them may be preset; the server refuses a grant that exists already. A toast: "Tim Neumann is now Media editor
  on Media Manager".
- Check access: user, permission (searchable Mantine selects, by app) and where (the scope tree) give "Allowed" or
  "Denied", with every reason, or why not; a disabled user is denied (said so).
- Forms: Mantine inputs in the overlays' form dialogs (`<Form confirm>`, `useDialogSave`); refusals of the server under
  the fields; native selects in dialogs (a Mantine select would open outside the modal dialog).
