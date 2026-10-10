# User Manager

The "User Manager" app of the root's demo page (a mini-app of its app cockpit): a demo of the root (not of a package).
Users, groups, roles, and who may do what where, with a generic permission model that fits many apps. Same look as the
Board Manager (Mantine, the same theme); built like the File Center (the decided target structure). Three packages:
data tables for the lists (all compact, 2026-10-06), the dialogs and toasts of the overlays package, form-validation
for the forms (2026-10-06). The rules of the root's `CLAUDE.md` apply.
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
    `useTableSource()` (a data table's source over rows made from the access data, searched, filtered, sorted and
    paged locally, `shared/lib/localQuery.ts`; each page is a TanStack query).
  - `users/`, `groups/`, `roles/` (with the permission catalog), `access/` (grants, "Grant access", the effective
    permissions, the check), `home/`. Each with an `index.ts`; they import each other only through it.
- `shared/`: the Mantine scope (`.user-manager`), the data table in Mantine's look (`DataTable`: `density="compact"`
  by default, 2026-10-06, the user's wish), icons, page parts (header, avatar, a user's or group's label), formatting,
  `useForm` (form-validation plus the overlays' dialog form, like the Board Manager's and the Time Tracker's;
  `useDialogSave`, the app's own check, is gone), `FieldError` (the message of an invalid field as a popover),
  `useQuerySource`.
- `app/`: `UserManagerDemo.tsx` (the element `user-manager-demo`; the wiring), `App.tsx` (routes, app header, breadcrumb,
  history, the hash), `look.tsx` (taken from the File Center, i.e. the Board Manager's look), `user-manager.css`.
  - The theme (2026-10-04): `modernTheme` of `packages/mantine-themes` merged with the app's own, like the Board Manager's:
    smaller corners and a bit more contrast (see its `CLAUDE.md`).
  - The accent (2026-10-03): `--user-manager-accent-color` (any CSS color, set by the host page's CSS; the root page
    maps its `--app-accent-color` to it), live in CSS like the Board Manager's (`accentVariables()` in `look.tsx`);
    without it, Mantine's indigo.

## Data access

- TanStack Query, like the File Center: one query for the access data (without the query's signal: TanStack cancels a
  request that uses its signal when its last observer goes, e.g. in React's StrictMode, and a table's read that shares
  it would fail; it is a cheap read); every table's page a query; every change invalidates all (`iamKeys.all`).

## App

- The full-height layout of the Board Manager (2026-10-08, the user's wish): the app fills its element (the root
  page: `user-manager-demo { height: 100% }` in `demo/demo.css`), the app header stays, `.user-manager__main` scrolls
  below it, and a page's table takes the rest of the height (its rows scroll, its toolbar, header and footer stay;
  `DataTable` wraps every table in a `user-manager__table` without a box, the layout's hook). Without a height (a host
  page that scrolls) the app header is sticky.
- App header (`AppHeader`, 2026-10-08; "top bar" before) like the Board Manager's, two lines (2026-10-08, the Human Resources' trial, rolled out; a menu of the modules
  on the title, the breadcrumb in the same line before): the app icon (`TbShieldLock`, also the cockpit's), "User
  Manager", the modules as tabs (Overview, Users, Groups, Roles, Access, Check access, Permissions; the current one,
  also on its records' pages, in the accent's light ground; below 60rem of the bar a menu in their place: the current
  module and a chevron), Back and Forward; below them the breadcrumb (a house icon with the label "Home" (2026-10-04),
  a link to the start page, like the Board Manager's; then module › name; on the start page only "Home", not a link;
  the app icon is no link, 2026-10-04).
- Routes: `/`, `/users`, `/users/:userId`, `/groups`, `/groups/:groupId`, `/roles`, `/roles/:roleId`, `/access`,
  `/check`, `/permissions`; mirrored in the hash after `#user-manager`, with the browser's Back and Forward
  (`app/hashHistory.ts`, see the root's `CLAUDE.md`).
- Overview (the start page, titled "Overview" since 2026-10-08, the user's wish, like the Board Manager's; "Main"
  before; also its menu entry and the history's tooltips): six cards (counts) and a short explanation of the model.
- Users: a table (avatar, name with title, email, department and status filters, groups); New user, Edit, Grant access
  (for one selected), Enable, Disable, Delete (a critical confirmation: memberships and own grants go too).
  - A user's page: Overview (details, groups as links), Granted access (their own grants; "Grant access" preset to the
    user), Effective permissions (by app: each permission, where and why: "Media editor on File Center › Marketing,
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
  on File Center".
- Check access: user, permission (searchable Mantine selects, by app) and where (the scope tree) give "Allowed" or
  "Denied", with every reason, or why not; a disabled user is denied (said so).
- Forms: Mantine inputs in the overlays' form dialogs, validated by form-validation (2026-10-06, the user's wish; a
  Zod schema each: the user, the group, the role, "Grant access", "Add members"); a refusal of the server (its `Error`'s
  message) is the dialog's note; native selects in dialogs (a Mantine select would open outside the modal dialog).
  - The app is English only: its adapter (`useForm.tsx`) keeps form-validation's messages English whatever
    `<html lang>` says; the forms give their labels (`field.name({ label: 'Name' })`).
  - The scope tree of "Grant access" is a field of its own (`ScopeField`: Mantine's `Input.Wrapper` with the label, the
    hint below the tree and the error; a controlled binding), the checklist of "Add members" Mantine's
    `Checkbox.Group` (controlled; at least one user; the filter only hides users, a chosen one stays chosen).
  - The message of an invalid field is a popover, like in the Board Manager and the Time Tracker (`FieldError`, see
    the Board Manager's `CLAUDE.md`).
  - Unsaved changes (2026-10-09, the user's wish, like the Board Manager's): `DialogForm` passes form-validation's
    `isDirty` to the overlays' `<Form dirty>`: after a change, closing a form dialog asks first, in place of the dialog's content
    ("Discard your changes?"). Escape there answers Discard (2026-10-09, the user's wish: Escape, Escape leaves a changed form), said in a line below the question ("Press Esc to discard them.", the overlays' text; only with a keyboard).
