import { addDays, dateOf, daysBetween, splitName, tasksFromTemplate } from '../../domain';
import type {
  Candidate,
  CandidateSource,
  Checklist,
  Department,
  DocumentCategory,
  Employee,
  EmployeeDocument,
  Opening,
  SalaryChange,
  Stage,
} from '../../domain';

export { seed, VIEWER_ID };
export type { Data };

// The made-up data of human resources, relative to today: 48 employees in 12 departments (a tree below Management),
// two joining soon and one recently (with their onboarding), one leaving (offboarding begun) and one gone; their salary
// histories and documents; six openings with their candidates in every stage. Random, but always the same (a fixed
// seed).

type Data = {
  departments: Department[];
  employees: Employee[];
  salaries: SalaryChange[];
  documents: EmployeeDocument[];
  openings: Opening[];
  candidates: Candidate[];
  checklists: Checklist[];
  // The uploaded files: id to name and size, until attached.
  uploads: Map<string, { name: string; size: number }>;
};

// The signed-in user: Sarah Krüger, HR Manager in People & Culture.
const VIEWER_ID = 'e44';

// A small seeded random generator (mulberry32).
function random(seedValue: number): () => number {
  let state = seedValue;

  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);

    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

// The departments: the first employee of each is its head, the others have the titles in turn. `pay` is the yearly
// salary of the head and of the others, in thousands.
const DEPARTMENTS: readonly {
  id: string;
  name: string;
  parentId: string | null;
  costCenter: string;
  size: number;
  head: string;
  titles: readonly string[];
  pay: readonly [number, number];
  location: string;
}[] = [
  {
    id: 'd1',
    name: 'Management',
    parentId: null,
    costCenter: '1000',
    size: 2,
    head: 'Chief Executive Officer',
    titles: ['Executive Assistant'],
    pay: [180, 52],
    location: 'Stuttgart',
  },
  {
    id: 'd2',
    name: 'Engineering',
    parentId: 'd1',
    costCenter: '2000',
    size: 1,
    head: 'VP Engineering',
    titles: [],
    pay: [140, 0],
    location: 'Stuttgart',
  },
  {
    id: 'd3',
    name: 'Platform',
    parentId: 'd2',
    costCenter: '2100',
    size: 7,
    head: 'Engineering Manager',
    titles: ['Senior Software Engineer', 'Software Engineer', 'DevOps Engineer'],
    pay: [105, 72],
    location: 'Stuttgart',
  },
  {
    id: 'd4',
    name: 'Mobile Apps',
    parentId: 'd2',
    costCenter: '2200',
    size: 5,
    head: 'Engineering Manager',
    titles: ['Mobile Developer', 'QA Engineer'],
    pay: [102, 66],
    location: 'Berlin',
  },
  {
    id: 'd5',
    name: 'Product & Design',
    parentId: 'd1',
    costCenter: '3000',
    size: 5,
    head: 'Head of Product',
    titles: ['Product Manager', 'UX Designer', 'UI Designer'],
    pay: [118, 68],
    location: 'Berlin',
  },
  {
    id: 'd6',
    name: 'Sales',
    parentId: 'd1',
    costCenter: '4000',
    size: 1,
    head: 'VP Sales',
    titles: [],
    pay: [135, 0],
    location: 'Stuttgart',
  },
  {
    id: 'd7',
    name: 'Sales DACH',
    parentId: 'd6',
    costCenter: '4100',
    size: 5,
    head: 'Sales Manager DACH',
    titles: ['Account Executive', 'Sales Development Rep'],
    pay: [98, 58],
    location: 'Vienna',
  },
  {
    id: 'd8',
    name: 'International Sales',
    parentId: 'd6',
    costCenter: '4200',
    size: 4,
    head: 'Sales Manager International',
    titles: ['Account Executive', 'Key Account Manager'],
    pay: [100, 64],
    location: 'Amsterdam',
  },
  {
    id: 'd9',
    name: 'Marketing',
    parentId: 'd1',
    costCenter: '5000',
    size: 4,
    head: 'Head of Marketing',
    titles: ['Content Manager', 'Performance Marketer', 'Marketing Intern'],
    pay: [104, 56],
    location: 'Berlin',
  },
  {
    id: 'd10',
    name: 'Customer Success',
    parentId: 'd1',
    costCenter: '6000',
    size: 5,
    head: 'Head of Customer Success',
    titles: ['Customer Success Manager', 'Support Specialist'],
    pay: [96, 50],
    location: 'Stuttgart',
  },
  {
    id: 'd11',
    name: 'Finance',
    parentId: 'd1',
    costCenter: '7000',
    size: 3,
    head: 'Head of Finance',
    titles: ['Accountant', 'Controller'],
    pay: [120, 60],
    location: 'Stuttgart',
  },
  {
    id: 'd12',
    name: 'People & Culture',
    parentId: 'd1',
    costCenter: '8000',
    size: 4,
    head: 'Head of People',
    titles: ['HR Manager', 'Recruiter', 'Payroll Specialist'],
    pay: [108, 60],
    location: 'Stuttgart',
  },
];

const NAMES = [
  'Katharina Roth',
  'Ole Jansen',
  'Jonas Becker',
  'Lukas Wagner',
  'David Chen',
  'Noah Klein',
  'Amira Haddad',
  'Tim Neumann',
  'Erik Lindqvist',
  'Simon Keller',
  'Mia Schneider',
  'Felix Braun',
  'Aylin Demir',
  'Ben Wolf',
  'Paul Richter',
  'Lena Hoffmann',
  'Sofia Rossi',
  'Clara Zimmermann',
  'Elias Schulz',
  'Ida Schröder',
  'Henrik Walter',
  'Max Hartmann',
  'Julia Lange',
  'Leon Meyer',
  'Greta Möller',
  'Jan Vogel',
  'Marie Dubois',
  'Luis García',
  'Zoe Martin',
  'Finn Köhler',
  'Hannah Weber',
  'Laura Schmitt',
  'Nina Kowalski',
  'Moritz Frank',
  'Emma Fischer',
  'Tom Berger',
  'Lea Peters',
  'Anna Lehmann',
  'Paula Horn',
  'Thomas Baumann',
  'Yusuf Arslan',
  'Charlotte Wolff',
  'Isabel Navarro',
  'Sarah Krüger',
  'Malte Brandt',
  'Priya Sharma',
  'Jakob Seidel',
  'Mei Lin',
];

const CANDIDATE_NAMES = [
  'Oliver Kraus',
  'Fatima El Amrani',
  'Lukas Hahn',
  'Elena Popescu',
  'Kevin Schuster',
  'Hana Novak',
  'Daniel Fuchs',
  'Sophie Laurent',
  'Mehmet Yilmaz',
  'Johanna Busch',
  'Arjun Patel',
  'Carla Mendes',
  'Philipp Graf',
  'Ingrid Olsen',
  'Robert Kaiser',
  'Lina Haas',
  'Marco Bianchi',
  'Svenja Dietrich',
  'Tobias Engel',
  'Olga Ivanova',
  'Samuel Ortiz',
  'Vanessa Lorenz',
  'Kai Winter',
  'Emily Carter',
  'Dominik Sauer',
  'Leonie Kühn',
  'Rafael Costa',
  'Miriam Albrecht',
  'Florian Jung',
  'Aiko Tanaka',
  'Nils Peters',
  'Ronja Thiel',
];

const emailOf = (name: string, domain: string) =>
  `${
    name
      .toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/[íì]/g, 'i')
      .replace(/ç/g, 'c')
      .replace(/ /g, '.')
  }@${domain}`;

function seed(): Data {
  const rng = random(20261008);
  const pick = <T>(items: readonly T[]): T => items[Math.floor(rng() * items.length)] as T;
  const between = (min: number, max: number) => min + Math.floor(rng() * (max - min + 1));
  const today = dateOf(new Date());
  const year = Number(today.slice(0, 4));
  // Short ids, counted per kind (`o1`, `c12`).
  const counts = new Map<string, number>();
  const id = (prefix: string) => {
    const count = (counts.get(prefix) ?? 0) + 1;

    counts.set(prefix, count);
    return `${prefix}${count}`;
  };

  const departments: Department[] = DEPARTMENTS.map((department) => ({
    id: department.id,
    name: department.name,
    parentId: department.parentId,
    headId: null,
    costCenter: department.costCenter,
  }));

  // The employees, department by department: the head first.
  const employees: Employee[] = [];
  const payOf = new Map<string, number>();

  for (const spec of DEPARTMENTS) {
    for (let index = 0; index < spec.size; index++) {
      const number = employees.length + 1;
      const name = NAMES[number - 1] ?? `Employee ${number}`;
      const head = index === 0;
      const title = head ? spec.head : spec.titles[(index - 1) % spec.titles.length] ?? spec.head;
      const intern = title.includes('Intern');
      const part = !head && !intern && rng() < 0.15;
      const parent = departments.find((department) => department.id === spec.parentId);
      const employee: Employee = {
        id: `e${number}`,
        ...splitName(name),
        name,
        email: emailOf(name, 'acme.example'),
        phone: `+49 711 5550 ${100 + number}`,
        birthDate: `${between(1968, 2001)}-${String(between(1, 12)).padStart(2, '0')}-${
          String(between(1, 28)).padStart(2, '0')
        }`,
        title,
        departmentId: spec.id,
        // The head reports to the head of the department above; the others to their head.
        managerId: head ? parent?.headId ?? null : departments.find((d) => d.id === spec.id)?.headId ?? null,
        location: rng() < 0.15 ? 'Remote' : spec.location,
        employmentType: intern ? 'intern' : part ? 'partTime' : title === 'UI Designer' ? 'contractor' : 'fullTime',
        weeklyHours: intern ? 40 : part ? pick([20, 30]) : 40,
        startDate: intern
          ? addDays(today, -between(40, 120))
          : `${between(2014, year - 1)}-${pick(['01', '03', '04', '07', '09', '10'])}-01`,
        endDate: null,
        notes: '',
      };

      employees.push(employee);
      payOf.set(employee.id, (head ? spec.pay[0] : intern ? 18 : spec.pay[1] * (0.85 + rng() * 0.3)) * 1000);

      if (head) {
        const department = departments.find((d) => d.id === spec.id);

        if (department !== undefined) {
          department.headId = employee.id;
        }
      }
    }
  }

  const employee = (employeeId: string) => employees.find((candidate) => candidate.id === employeeId)!;

  // A joiner of ten days ago, two to come (from the openings), one leaving, one gone; anniversaries and birthdays in the
  // next weeks.
  employee('e20').startDate = addDays(today, -10);
  employee('e20').birthDate = '1997-05-14';
  employee('e26').endDate = addDays(today, 18);
  employee('e14').endDate = addDays(today, -60);
  employee('e5').startDate = `${year - 5}${addDays(today, 6).slice(4)}`;
  employee('e31').startDate = `${year - 10}${addDays(today, 15).slice(4)}`;
  employee('e9').birthDate = `1988${addDays(today, 3).slice(4)}`;
  employee('e37').birthDate = `1993${addDays(today, 11).slice(4)}`;
  employee('e44').birthDate = `1986${addDays(today, 24).slice(4)}`;

  const joiners: { name: string; title: string; departmentId: string; start: number; pay: number }[] = [
    { name: 'Jakob Seidel', title: 'Software Engineer', departmentId: 'd3', start: 12, pay: 68_000 },
    { name: 'Mei Lin', title: 'Customer Success Manager', departmentId: 'd10', start: 5, pay: 54_000 },
  ];

  for (const joiner of joiners) {
    const number = employees.length + 1;
    const department = departments.find((d) => d.id === joiner.departmentId);

    employees.push({
      id: `e${number}`,
      ...splitName(joiner.name),
      name: joiner.name,
      email: emailOf(joiner.name, 'acme.example'),
      phone: `+49 711 5550 ${100 + number}`,
      birthDate: `${between(1990, 2000)}-0${between(1, 9)}-1${between(0, 9)}`,
      title: joiner.title,
      departmentId: joiner.departmentId,
      managerId: department?.headId ?? null,
      location: DEPARTMENTS.find((d) => d.id === joiner.departmentId)?.location ?? 'Stuttgart',
      employmentType: 'fullTime',
      weeklyHours: 40,
      startDate: addDays(today, joiner.start),
      endDate: null,
      notes: '',
    });
    payOf.set(`e${number}`, joiner.pay);
  }

  // The salaries: the hire, then a raise every year or two (3 to 6 percent), a promotion now and then; the last one is
  // today's (the pay above).
  const salaries: SalaryChange[] = [];
  const round = (amount: number) => Math.round(amount / 500) * 500;

  for (const person of employees) {
    const target = payOf.get(person.id) ?? 50_000;
    const startYear = Number(person.startDate.slice(0, 4));
    const changes: { from: string; reason: SalaryChange['reason'] }[] = [{ from: person.startDate, reason: 'hire' }];
    let at = startYear + between(1, 2);

    while (person.startDate <= today && at <= year && `${at}-04-01` <= today) {
      changes.push({ from: `${at}-04-01`, reason: rng() < 0.18 ? 'promotion' : 'raise' });
      at += between(1, 2);
    }

    let amount = target;
    const amounts = changes.map(() => 0);

    for (let index = changes.length - 1; index >= 0; index--) {
      amounts[index] = round(amount);
      amount = amount / (changes[index]!.reason === 'promotion' ? 1.12 : 1 + between(3, 6) / 100);
    }

    changes.forEach((change, index) =>
      salaries.push({
        id: id('s'),
        employeeId: person.id,
        from: change.from,
        amount: amounts[index]!,
        reason: change.reason,
        note: '',
      })
    );
  }

  // The documents: the contract of everyone, a certificate or a review for some.
  const documents: EmployeeDocument[] = [];
  const document = (employeeId: string, name: string, category: DocumentCategory, date: string) =>
    documents.push({
      id: id('f'),
      employeeId,
      name,
      size: between(80, 900) * 1024,
      category,
      uploaded: `${date}T${pick(['09', '10', '11', '14', '15'])}:${pick(['05', '20', '35', '50'])}`,
    });

  for (const person of employees) {
    const slug = person.name.split(' ').at(-1)?.toLowerCase() ?? person.id;

    document(person.id, `employment-contract-${slug}.pdf`, 'contract', addDays(person.startDate, -30));

    if (person.startDate <= today && rng() < 0.45) {
      document(person.id, `certificate-${slug}.pdf`, 'certificate', addDays(person.startDate, between(60, 400)));
    }

    if (person.startDate < `${year - 1}-01-01` && rng() < 0.6) {
      document(person.id, `performance-review-${year - 1}-${slug}.pdf`, 'review', `${year - 1}-12-1${between(0, 9)}`);
    }
  }

  // The openings and their candidates.
  const headOf = (departmentId: string) => departments.find((d) => d.id === departmentId)?.headId ?? null;
  const opening = (
    title: string,
    departmentId: string,
    status: Opening['status'],
    daysAgo: number,
    extra: Partial<Opening> = {},
  ): Opening => ({
    id: id('o'),
    title,
    departmentId,
    hiringManagerId: headOf(departmentId),
    location: DEPARTMENTS.find((d) => d.id === departmentId)?.location ?? 'Stuttgart',
    employmentType: 'fullTime',
    positions: 1,
    status,
    opened: addDays(today, -daysAgo),
    description: '',
    ...extra,
  });

  const openings: Opening[] = [
    opening('Senior Software Engineer', 'd3', 'open', 35, {
      positions: 2,
      description:
        'Backend services in Java and TypeScript, our APIs and their data. Five years of experience or more.',
    }),
    opening('Mobile Developer (iOS)', 'd4', 'open', 20, {
      description: 'Our iOS app in Swift and SwiftUI, from the design to the App Store.',
    }),
    opening('Account Executive DACH', 'd7', 'open', 50, {
      location: 'Vienna',
      description: 'New customers in Germany, Austria and Switzerland; fluent German.',
    }),
    opening('Product Designer', 'd5', 'open', 12, {
      description: 'Research, flows and the visual design of our web and mobile apps.',
    }),
    opening('Performance Marketing Manager', 'd9', 'onHold', 70, {
      employmentType: 'partTime',
      description: 'Paid campaigns and their numbers. On hold until the next budget.',
    }),
    opening('Customer Success Manager', 'd10', 'closed', 90, {
      description: 'The onboarding and the success of our customers in the first year.',
    }),
  ];

  const candidates: Candidate[] = [];
  let nameIndex = 0;
  const SOURCES: readonly CandidateSource[] = ['website', 'website', 'referral', 'linkedin', 'linkedin', 'agency'];
  const candidate = (openingId: string, stage: Stage, extra: Partial<Candidate> = {}) => {
    const name = CANDIDATE_NAMES[nameIndex++ % CANDIDATE_NAMES.length]!;
    const opened = openings.find((o) => o.id === openingId)?.opened ?? today;

    candidates.push({
      id: id('c'),
      openingId,
      name,
      email: emailOf(name, pick(['mail.example', 'post.example', 'inbox.example'])),
      source: pick(SOURCES),
      applied: addDays(opened, between(1, Math.max(1, daysBetween(opened, today)))),
      stage,
      rating: stage === 'applied' ? 0 : between(2, 5),
      note: '',
      employeeId: null,
      ...extra,
    });
  };
  const stages = (openingId: string, list: readonly Stage[]) => list.forEach((stage) => candidate(openingId, stage));

  const [o1, o2, o3, o4, o5, o6] = openings.map((o) => o.id) as [string, string, string, string, string, string];

  stages(o1, [
    'applied',
    'applied',
    'applied',
    'screening',
    'screening',
    'interview',
    'interview',
    'offer',
    'rejected',
  ]);
  candidate(o1, 'hired', { name: 'Jakob Seidel', employeeId: 'e47', rating: 5, source: 'referral' });
  stages(o2, ['applied', 'applied', 'screening', 'interview', 'rejected', 'rejected']);
  stages(o3, ['applied', 'screening', 'screening', 'interview', 'offer', 'rejected', 'rejected']);
  stages(o4, ['applied', 'applied', 'applied', 'applied', 'screening']);
  stages(o5, ['applied', 'screening', 'rejected']);
  stages(o6, ['rejected', 'rejected', 'rejected']);
  candidate(o6, 'hired', { name: 'Mei Lin', employeeId: 'e48', rating: 4, source: 'linkedin' });

  for (const hired of candidates.filter((c) => c.employeeId !== null)) {
    hired.email = emailOf(hired.name, 'mail.example');
  }

  // The checklists: the two joiners and the recent one (done up to today), the leaver (begun), the one gone (done).
  const taskId = () => id('k');
  const checklist = (employeeId: string, kind: Checklist['kind'], anchor: string, doneUntil: string): Checklist => {
    const tasks = tasksFromTemplate(kind, anchor, taskId).map((task) => ({ ...task, done: task.due < doneUntil }));

    return { id: id('l'), employeeId, kind, created: addDays(anchor, kind === 'onboarding' ? -30 : -25), tasks };
  };

  const recent = checklist('e20', 'onboarding', employee('e20').startDate, today);
  const policies = recent.tasks.find((task) => task.template === 'policies');

  if (policies !== undefined) {
    // One task forgotten: overdue.
    policies.done = false;
  }

  const checklists: Checklist[] = [
    checklist('e47', 'onboarding', employee('e47').startDate, today),
    checklist('e48', 'onboarding', employee('e48').startDate, today),
    recent,
    checklist('e26', 'offboarding', employee('e26').endDate!, today),
    checklist('e14', 'offboarding', employee('e14').endDate!, '9999-12-31'),
  ];

  return { departments, employees, salaries, documents, openings, candidates, checklists, uploads: new Map() };
}
