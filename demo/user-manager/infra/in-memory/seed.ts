import type { Grant, Group, Permission, Role, Scope, User } from '../../domain';

export { seed };
export type { Data };

type Data = {
  users: User[];
  groups: Group[];
  roles: Role[];
  grants: Grant[];
  scopes: Scope[];
  permissions: Permission[];
};

// The made-up organization: stable data, the dates relative to today.

const DEPARTMENTS = ['Management', 'Marketing', 'Sales', 'Finance', 'Human Resources', 'IT', 'Legal', 'Operations'];

// Name, title, department (index), active.
const PEOPLE: readonly (readonly [string, string, number, boolean?])[] = [
  ['Helena Brandt', 'Chief Executive Officer', 0],
  ['Markus Weller', 'Chief Financial Officer', 0],
  ['Sofia Lindqvist', 'Head of Marketing', 1],
  ['Jonas Albrecht', 'Content Manager', 1],
  ['Amira Haddad', 'General Counsel', 6],
  ['Thomas Keller', 'Head of IT', 5],
  ['Claire Dubois', 'Brand Designer', 1],
  ['Viktor Horvath', 'Works Council Chair', 7],
  ['Mei-Ling Chen', 'Sales Director', 2],
  ['Daniel Fischer', 'Controller', 3],
  ['Laura Moreno', 'Account Manager', 2],
  ['Peter Novak', 'System Administrator', 5],
  ['Anna Schröder', 'HR Manager', 4],
  ['Omar Farouk', 'Key Account Manager', 2],
  ['Katharina Wolf', 'Accountant', 3],
  ['Lukas Berger', 'Developer', 5],
  ['Isabel Costa', 'Social Media Manager', 1],
  ['Felix Hartmann', 'Operations Manager', 7],
  ['Nadia Petrova', 'Recruiter', 4],
  ['Ben Carter', 'External Auditor', 3, false],
  ['Julia Richter', 'Executive Assistant', 0],
  ['Hannes Vogel', 'Support Engineer', 5],
  ['Lea Zimmermann', 'Payroll Specialist', 4],
  ['Martin Kovács', 'Logistics Coordinator', 7],
  ['Sarah Klein', 'Paralegal', 6],
  ['Wei Zhang', 'Data Analyst', 3],
  ['Elena Popescu', 'Office Manager', 7],
  ['Robert Stein', 'Board Secretary', 0],
  ['Nina Braun', 'Photographer', 1, false],
  ['Paul Meier', 'Sales Representative', 2],
  ['Clara Hofmann', 'Event Manager', 1],
  ['Jan Schmitt', 'Security Officer', 5],
  ['Maria Lopez', 'Customer Success', 2],
  ['David Wagner', 'Treasurer', 3],
  ['Sophie Becker', 'Copywriter', 1],
  ['Tim Neumann', 'Trainee', 5],
  ['Eva Schulz', 'Compliance Officer', 6],
  ['Leon Krause', 'Facility Manager', 7],
  ['Mila Weber', 'Talent Partner', 4],
  ['Noah Fuchs', 'Sales Assistant', 2],
];

const email = (name: string) =>
  `${name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]+/g, '.')}@acme.example`;

// The permissions the apps register: `<app>.<resource>.<action>`.
const CATALOG: Readonly<Record<string, Readonly<Record<string, readonly (readonly [string, string])[]>>>> = {
  media: {
    folder: [['read', 'See folders'], ['create', 'Create folders'], ['rename', 'Rename folders'], [
      'delete',
      'Delete folders with their contents',
    ]],
    file: [
      ['read', 'See files and their details'],
      ['upload', 'Upload files'],
      ['rename', 'Rename files'],
      ['move', 'Move files'],
      ['delete', 'Delete files'],
      ['download', 'Download files'],
    ],
  },
  boards: {
    board: [['read', 'See boards and their members'], ['edit', 'Edit boards'], ['members', 'Add and remove members']],
    meeting: [['read', 'See meetings and agendas'], ['create', 'Create meetings'], [
      'edit',
      'Edit meetings and agendas',
    ]],
    minutes: [['edit', 'Record minutes'], ['approve', 'Approve minutes']],
    document: [['upload', 'Upload meeting documents'], ['delete', 'Delete meeting documents']],
  },
  users: {
    user: [['read', 'See users'], ['edit', 'Create, edit and disable users']],
    group: [['read', 'See groups'], ['edit', 'Create and edit groups, manage members']],
    role: [['read', 'See roles'], ['edit', 'Create and edit roles']],
    grant: [['read', 'See who has access'], ['manage', 'Grant and revoke access']],
  },
  intranet: {
    page: [['read', 'Read pages'], ['edit', 'Edit pages'], ['publish', 'Publish pages']],
    news: [['publish', 'Publish news']],
  },
};

const APP_NAMES: Readonly<Record<string, string>> = {
  media: 'Media Manager',
  boards: 'Board Manager',
  users: 'User Manager',
  intranet: 'Intranet',
};

// Every scope below an app (and the app itself) belongs to that app: `s-media` and below are `media`.
function withApps(scopes: Scope[]): Scope[] {
  const appOf = (scope: Scope): string | undefined => {
    if (scope.kind === 'app') {
      return scope.id.slice(2);
    }

    const parent = scopes.find((candidate) => candidate.id === scope.parentId);

    return parent === undefined ? undefined : appOf(parent);
  };

  return scopes.map((scope) => {
    const app = appOf(scope);

    return app === undefined ? scope : { ...scope, app };
  });
}

function seed(): Data {
  const now = Date.now();
  const daysAgo = (days: number) => {
    const date = new Date(now - days * 24 * 60 * 60 * 1000);
    const pad = (value: number) => String(value).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${
      pad(date.getMinutes())
    }`;
  };

  const users: User[] = PEOPLE.map(([name, title, department, active = true], index) => ({
    id: `u${index + 1}`,
    name,
    email: email(name),
    title,
    department: DEPARTMENTS[department] ?? '',
    active,
    created: daysAgo(30 + ((index * 37) % 700)),
  }));
  const idOf = (name: string) => users.find((user) => user.name === name)?.id ?? '';
  const inDepartment = (department: string) =>
    users.filter((user) => user.department === department).map((user) => user.id);

  const groups: Group[] = [
    {
      id: 'g-everyone',
      name: 'Everyone',
      description: 'All employees.',
      memberIds: users.filter((user) => user.title !== 'External Auditor').map((user) => user.id),
    },
    {
      id: 'g-management',
      name: 'Management',
      description: 'The executive team.',
      memberIds: inDepartment('Management'),
    },
    { id: 'g-marketing', name: 'Marketing', description: 'The marketing team.', memberIds: inDepartment('Marketing') },
    { id: 'g-sales', name: 'Sales', description: 'The sales team.', memberIds: inDepartment('Sales') },
    {
      id: 'g-finance',
      name: 'Finance',
      description: 'Accounting and controlling.',
      memberIds: inDepartment('Finance'),
    },
    {
      id: 'g-hr',
      name: 'Human Resources',
      description: 'People and payroll.',
      memberIds: inDepartment('Human Resources'),
    },
    { id: 'g-it', name: 'IT Administrators', description: 'They run the systems.', memberIds: inDepartment('IT') },
    {
      id: 'g-board',
      name: 'Supervisory Board',
      description: 'Members of the supervisory board.',
      memberIds: ['Helena Brandt', 'Markus Weller', 'Viktor Horvath', 'Amira Haddad', 'Robert Stein'].map(idOf),
    },
    {
      id: 'g-auditors',
      name: 'Auditors',
      description: 'Read access for the yearly audit.',
      memberIds: ['Ben Carter', 'Eva Schulz'].map(idOf),
    },
  ];

  const permissions: Permission[] = Object.entries(CATALOG).flatMap(([app, resources]) =>
    Object.entries(resources).flatMap(([resource, actions]) =>
      actions.map(([action, description]) => ({ id: `${app}.${resource}.${action}`, app, description }))
    )
  );
  const all = permissions.map((permission) => permission.id);
  const where = (test: (id: string) => boolean) => all.filter(test);

  const roles: Role[] = [
    {
      id: 'r-owner',
      name: 'Owner',
      description: 'Everything, everywhere below its scope.',
      permissionIds: all,
      builtIn: true,
    },
    {
      id: 'r-reader',
      name: 'Reader',
      description: 'Sees everything below its scope, changes nothing.',
      permissionIds: where((id) => id.endsWith('.read')),
      builtIn: true,
    },
    {
      id: 'r-user-admin',
      name: 'User administrator',
      description: 'Manages users, groups, roles and access.',
      permissionIds: where((id) => id.startsWith('users.')),
      builtIn: false,
    },
    {
      id: 'r-media-editor',
      name: 'Media editor',
      description: 'Works with folders and files.',
      permissionIds: where((id) => id.startsWith('media.') && !id.endsWith('folder.delete')),
      builtIn: false,
    },
    {
      id: 'r-media-viewer',
      name: 'Media viewer',
      description: 'Sees and downloads files.',
      permissionIds: ['media.folder.read', 'media.file.read', 'media.file.download'],
      builtIn: false,
    },
    {
      id: 'r-board-member',
      name: 'Board member',
      description: 'Takes part in meetings.',
      permissionIds: ['boards.board.read', 'boards.meeting.read', 'boards.minutes.approve'],
      builtIn: false,
    },
    {
      id: 'r-board-secretary',
      name: 'Board secretary',
      description: 'Prepares meetings and records the minutes.',
      permissionIds: where((id) => id.startsWith('boards.') && id !== 'boards.minutes.approve'),
      builtIn: false,
    },
    {
      id: 'r-intranet-editor',
      name: 'Intranet editor',
      description: 'Writes and publishes pages and news.',
      permissionIds: where((id) => id.startsWith('intranet.')),
      builtIn: false,
    },
  ];

  const scopes: Scope[] = withApps([
    { id: 's-org', parentId: null, name: 'Acme Corporation', kind: 'organization' },
    ...Object.entries(APP_NAMES).map(([app, name]) => ({ id: `s-${app}`, parentId: 's-org', name, kind: 'app' })),
    { id: 's-media-marketing', parentId: 's-media', name: 'Marketing', kind: 'folder' },
    { id: 's-media-logos', parentId: 's-media-marketing', name: 'Logos', kind: 'folder' },
    { id: 's-media-campaigns', parentId: 's-media-marketing', name: 'Campaigns', kind: 'folder' },
    { id: 's-media-photos', parentId: 's-media', name: 'Photos', kind: 'folder' },
    { id: 's-media-documents', parentId: 's-media', name: 'Documents', kind: 'folder' },
    { id: 's-media-contracts', parentId: 's-media-documents', name: 'Contracts', kind: 'folder' },
    { id: 's-boards-supervisory', parentId: 's-boards', name: 'Supervisory Board', kind: 'board' },
    { id: 's-boards-executive', parentId: 's-boards', name: 'Executive Board', kind: 'board' },
    { id: 's-boards-audit', parentId: 's-boards', name: 'Audit Committee', kind: 'board' },
    { id: 's-intranet-news', parentId: 's-intranet', name: 'News', kind: 'section' },
    { id: 's-intranet-hr', parentId: 's-intranet', name: 'HR pages', kind: 'section' },
  ]);

  let next = 1;
  const grant = (type: 'user' | 'group', id: string, roleId: string, scopeId: string, days: number): Grant => ({
    id: `a${next++}`,
    principal: { type, id },
    roleId,
    scopeId,
    created: daysAgo(days),
    grantedBy: 'Admin',
  });

  const grants: Grant[] = [
    grant('group', 'g-it', 'r-owner', 's-org', 600),
    grant('user', idOf('Helena Brandt'), 'r-reader', 's-org', 580),
    grant('group', 'g-hr', 'r-user-admin', 's-users', 400),
    grant('group', 'g-everyone', 'r-media-viewer', 's-media', 500),
    grant('group', 'g-marketing', 'r-media-editor', 's-media-marketing', 320),
    grant('user', idOf('Claire Dubois'), 'r-owner', 's-media-logos', 200),
    grant('group', 'g-management', 'r-media-editor', 's-media-documents', 300),
    grant('user', idOf('Amira Haddad'), 'r-media-editor', 's-media-contracts', 150),
    grant('user', idOf('Sarah Klein'), 'r-media-viewer', 's-media-contracts', 140),
    grant('user', idOf('Nina Braun'), 'r-media-editor', 's-media-photos', 90),
    grant('group', 'g-board', 'r-board-member', 's-boards-supervisory', 450),
    grant('user', idOf('Robert Stein'), 'r-board-secretary', 's-boards', 430),
    grant('group', 'g-management', 'r-board-member', 's-boards-executive', 420),
    grant('user', idOf('Julia Richter'), 'r-board-secretary', 's-boards-executive', 260),
    grant('group', 'g-auditors', 'r-reader', 's-boards-audit', 120),
    grant('group', 'g-auditors', 'r-reader', 's-media-documents', 118),
    grant('user', idOf('Daniel Fischer'), 'r-board-member', 's-boards-audit', 115),
    grant('group', 'g-everyone', 'r-reader', 's-intranet', 520),
    grant('group', 'g-marketing', 'r-intranet-editor', 's-intranet-news', 310),
    grant('group', 'g-hr', 'r-intranet-editor', 's-intranet-hr', 280),
    grant('user', idOf('Isabel Costa'), 'r-intranet-editor', 's-intranet', 75),
    grant('user', idOf('Thomas Keller'), 'r-owner', 's-org', 610),
    grant('user', idOf('Anna Schröder'), 'r-user-admin', 's-users', 60),
    grant('user', idOf('Tim Neumann'), 'r-media-viewer', 's-media-campaigns', 12),
  ];

  return { users, groups, roles, grants, scopes, permissions };
}
