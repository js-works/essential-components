import { addDays, daysBetween, nextYearly, yearsBetween } from './dates';

export {
  currentSalary,
  DOCUMENT_CATEGORIES,
  EMPLOYEE_STATUSES,
  EMPLOYMENT_TYPES,
  fullName,
  reportsOf,
  SALARY_REASONS,
  splitName,
  statusOf,
  upcomingEvents,
};
export type {
  DocumentCategory,
  DocumentRepository,
  Employee,
  EmployeeDocument,
  EmployeeRepository,
  EmployeeStatus,
  EmployeeValues,
  EmploymentType,
  SalaryChange,
  SalaryReason,
  SalaryRepository,
  SalaryValues,
  UpcomingEvent,
};

type EmploymentType = 'fullTime' | 'partTime' | 'contractor' | 'intern';

const EMPLOYMENT_TYPES: readonly EmploymentType[] = ['fullTime', 'partTime', 'contractor', 'intern'];

// Someone employed by the company: their contact (the birth date may be unknown yet: empty), their job (title, department, manager, place, kind of contract,
// hours) and the dates of their employment. A former employee stays with their records (an end date in the past).
// The name in two parts (2026-10-10): the first name(s) and the last name; `name` is both, kept by the server (the one
// everything shows).
type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  title: string;
  departmentId: string;
  managerId: string | null;
  location: string;
  employmentType: EmploymentType;
  weeklyHours: number;
  startDate: string;
  endDate: string | null;
  // Free notes of HR (2026-10-10), empty for none.
  notes: string;
};

type EmployeeValues = Omit<Employee, 'id' | 'endDate' | 'name'>;

// The full name: the first name(s), then the last name.
const fullName = (firstName: string, lastName: string): string => `${firstName} ${lastName}`.trim();

// A full name in two parts: the first word, and the rest as the last name ("Fatima El Amrani": "Fatima", "El Amrani").
// For names that have one part only (the seed, a candidate).
const splitName = (name: string): { firstName: string; lastName: string } => {
  const [firstName = '', ...rest] = name.trim().split(/\s+/);

  return { firstName, lastName: rest.join(' ') };
};

// Follows from the dates: not started yet, active, leaving (an end date to come), former (gone).
type EmployeeStatus = 'upcoming' | 'active' | 'leaving' | 'former';

const EMPLOYEE_STATUSES: readonly EmployeeStatus[] = ['upcoming', 'active', 'leaving', 'former'];

interface EmployeeRepository {
  all(signal?: AbortSignal): Promise<readonly Employee[]>;
  // The email is unique (ignoring the case); with the first salary (the hire), and the onboarding checklist if wanted.
  create(values: EmployeeValues, salary: number, onboarding: boolean): Promise<Employee>;
  // Refused: a manager below the employee (a cycle), or themselves.
  update(id: string, values: EmployeeValues): Promise<Employee>;
  // The last day of the employment; refused before the start.
  terminate(id: string, endDate: string): Promise<void>;
}

// The yearly gross salary from a date on: the hire, a raise, a promotion, an adjustment (e.g. other hours).
type SalaryReason = 'hire' | 'raise' | 'promotion' | 'adjustment';

const SALARY_REASONS: readonly SalaryReason[] = ['hire', 'raise', 'promotion', 'adjustment'];

type SalaryChange = {
  id: string;
  employeeId: string;
  from: string;
  amount: number;
  reason: SalaryReason;
  note: string;
};

type SalaryValues = Omit<SalaryChange, 'id'>;

interface SalaryRepository {
  all(signal?: AbortSignal): Promise<readonly SalaryChange[]>;
  add(values: SalaryValues): Promise<SalaryChange>;
}

type DocumentCategory = 'contract' | 'certificate' | 'review' | 'other';

const DOCUMENT_CATEGORIES: readonly DocumentCategory[] = ['contract', 'certificate', 'review', 'other'];

// A file in an employee's records.
type EmployeeDocument = {
  id: string;
  employeeId: string;
  name: string;
  size: number;
  category: DocumentCategory;
  // `yyyy-mm-ddTHH:mm`
  uploaded: string;
};

interface DocumentRepository {
  all(signal?: AbortSignal): Promise<readonly EmployeeDocument[]>;
  // The upload of a file, with progress; returns its id, to be attached.
  upload(file: File, context: { signal: AbortSignal; onProgress: (fraction: number) => void }): Promise<string>;
  attach(employeeId: string, fileIds: readonly string[], category: DocumentCategory): Promise<void>;
  remove(ids: readonly string[]): Promise<void>;
}

function statusOf(employee: Employee, today: string): EmployeeStatus {
  return employee.startDate > today
    ? 'upcoming'
    : employee.endDate === null
    ? 'active'
    : employee.endDate >= today
    ? 'leaving'
    : 'former';
}

// Who reports to the employee (former ones not).
function reportsOf(employees: readonly Employee[], id: string, today: string): Employee[] {
  return employees.filter((employee) => employee.managerId === id && statusOf(employee, today) !== 'former');
}

// The salary of a day: the last change from that day or before.
function currentSalary(changes: readonly SalaryChange[], employeeId: string, date: string): SalaryChange | undefined {
  return changes
    .filter((change) => change.employeeId === employeeId && change.from <= date)
    .sort((a, b) => a.from.localeCompare(b.from))
    .at(-1);
}

// What comes in the next days: birthdays, work anniversaries (full years), first and last days.
type UpcomingEvent = {
  kind: 'birthday' | 'anniversary' | 'start' | 'end';
  employee: Employee;
  date: string;
  // The years of service of an anniversary.
  years?: number;
};

function upcomingEvents(employees: readonly Employee[], today: string, days: number): UpcomingEvent[] {
  const last = addDays(today, days);
  const events: UpcomingEvent[] = [];

  for (const employee of employees) {
    const status = statusOf(employee, today);

    if (status === 'former') {
      continue;
    }

    if (status === 'upcoming') {
      if (employee.startDate <= last) {
        events.push({ kind: 'start', employee, date: employee.startDate });
      }

      continue;
    }

    const birthday = employee.birthDate === '' ? undefined : nextYearly(employee.birthDate, today);
    const anniversary = nextYearly(employee.startDate, today);
    const years = yearsBetween(employee.startDate, anniversary);

    if (birthday !== undefined && birthday <= last) {
      events.push({ kind: 'birthday', employee, date: birthday });
    }

    if (anniversary <= last && years > 0) {
      events.push({ kind: 'anniversary', employee, date: anniversary, years });
    }

    if (employee.endDate !== null && employee.endDate <= last) {
      events.push({ kind: 'end', employee, date: employee.endDate });
    }
  }

  return events.sort((a, b) => daysBetween(b.date, a.date) || a.employee.name.localeCompare(b.employee.name));
}
