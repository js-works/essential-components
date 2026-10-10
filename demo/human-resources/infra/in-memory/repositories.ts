import { checklistAnchor, dateOf, descendantIds, fullName, splitName, tasksFromTemplate } from '../../domain';
import type {
  CandidateRepository,
  ChecklistRepository,
  DepartmentRepository,
  DocumentRepository,
  Employee,
  EmployeeRepository,
  OpeningRepository,
  SalaryRepository,
} from '../../domain';
import { AppError } from './errors';
import { seed } from './seed';
import type { Data } from './seed';

export { createInMemoryRepositories };
export type { Repositories };

type Repositories = {
  departments: DepartmentRepository;
  employees: EmployeeRepository;
  salaries: SalaryRepository;
  documents: DocumentRepository;
  openings: OpeningRepository;
  candidates: CandidateRepository;
  checklists: ChecklistRepository;
};

// A server takes a while: reading a little, saving (the spinners of the dialogs show) a bit longer.
const LOADING_TIME = 250;
const SAVE_TIME = 500;

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }

    const timer = setTimeout(resolve, ms);

    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    }, { once: true });
  });
}

const nowStamp = () => {
  const now = new Date();

  return `${dateOf(now)}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

// The in-memory implementation of the repositories, on one store (seeded) for as long as the page is open. A real
// backend would come as `infra/http/` with the same interfaces. Lists are given out as copies, so a change is only seen
// after a new read.
function createInMemoryRepositories(): Repositories {
  const data: Data = seed();
  let next = 10_000;
  const newId = (prefix: string) => `${prefix}${next++}`;
  const copy = <T extends object>(items: readonly T[]): T[] => items.map((item) => structuredClone(item));

  const found = <T extends { id: string }>(items: readonly T[], id: string): T => {
    const item = items.find((candidate) => candidate.id === id);

    if (item === undefined) {
      throw new AppError('notFound');
    }

    return item;
  };

  const uniqueEmail = (email: string, id?: string) => {
    if (data.employees.some((employee) => employee.id !== id && employee.email.toLowerCase() === email.toLowerCase())) {
      throw new AppError('emailTaken', { email });
    }
  };

  // A manager may not be the employee, nor anyone who reports to them (directly or not).
  const checkManager = (id: string, managerId: string | null) => {
    let current = managerId;

    for (let depth = 0; current !== null && depth < 50; depth++) {
      if (current === id) {
        throw new AppError('managerCycle');
      }

      current = data.employees.find((employee) => employee.id === current)?.managerId ?? null;
    }
  };

  const createEmployee = (values: Omit<Employee, 'id' | 'endDate' | 'name'>, salary: number): Employee => {
    uniqueEmail(values.email);

    const employee: Employee = {
      ...values,
      id: newId('e'),
      name: fullName(values.firstName, values.lastName),
      endDate: null,
    };

    data.employees.push(employee);
    data.salaries.push({
      id: newId('s'),
      employeeId: employee.id,
      from: employee.startDate,
      amount: salary,
      reason: 'hire',
      note: '',
    });

    return employee;
  };

  const createChecklist = (employeeId: string, kind: 'onboarding' | 'offboarding') => {
    const employee = found(data.employees, employeeId);
    const anchor = checklistAnchor(kind, employee);

    if (anchor === null) {
      throw new AppError('noEndDate');
    }

    if (data.checklists.some((checklist) => checklist.employeeId === employeeId && checklist.kind === kind)) {
      throw new AppError('checklistExists');
    }

    const checklist = {
      id: newId('l'),
      employeeId,
      kind,
      created: nowStamp().slice(0, 10),
      tasks: tasksFromTemplate(kind, anchor, () => newId('k')),
    };

    data.checklists.push(checklist);
    return checklist;
  };

  return {
    departments: {
      async all(signal) {
        await wait(LOADING_TIME, signal);
        return copy(data.departments);
      },
      async create(values) {
        await wait(SAVE_TIME);

        const department = { ...values, id: newId('d') };

        data.departments.push(department);
        return { ...department };
      },
      async update(id, values) {
        await wait(SAVE_TIME);

        const department = found(data.departments, id);

        if (values.parentId !== null && descendantIds(data.departments, id).includes(values.parentId)) {
          throw new AppError('departmentCycle');
        }

        Object.assign(department, values);
        return { ...department };
      },
      async remove(id) {
        await wait(SAVE_TIME);

        const department = found(data.departments, id);
        const employees = data.employees.filter((employee) => employee.departmentId === id && employee.endDate === null)
          .length;
        const children = data.departments.filter((candidate) => candidate.parentId === id).length;

        if (employees > 0 || children > 0) {
          throw new AppError('departmentNotEmpty', { name: department.name, employees, departments: children });
        }

        data.departments = data.departments.filter((candidate) => candidate.id !== id);
      },
    },
    employees: {
      async all(signal) {
        await wait(LOADING_TIME, signal);
        return copy(data.employees);
      },
      async create(values, salary, onboarding) {
        await wait(SAVE_TIME);

        const employee = createEmployee(values, salary);

        if (onboarding) {
          createChecklist(employee.id, 'onboarding');
        }

        return { ...employee };
      },
      async update(id, values) {
        await wait(SAVE_TIME);
        uniqueEmail(values.email, id);
        checkManager(id, values.managerId);

        const employee = found(data.employees, id);

        Object.assign(employee, values, { name: fullName(values.firstName, values.lastName) });
        return { ...employee };
      },
      async terminate(id, endDate) {
        await wait(SAVE_TIME);

        const employee = found(data.employees, id);

        if (endDate < employee.startDate) {
          throw new AppError('endBeforeStart');
        }

        employee.endDate = endDate;
      },
    },
    salaries: {
      async all(signal) {
        await wait(LOADING_TIME, signal);
        return copy(data.salaries);
      },
      async add(values) {
        await wait(SAVE_TIME);

        const employee = found(data.employees, values.employeeId);

        if (values.from < employee.startDate) {
          throw new AppError('endBeforeStart');
        }

        const change = { ...values, id: newId('s') };

        data.salaries.push(change);
        return { ...change };
      },
    },
    documents: {
      async all(signal) {
        await wait(LOADING_TIME, signal);
        return copy(data.documents);
      },
      // The upload of a file: in steps, with progress, about a second. Returns its id.
      async upload(file, { signal, onProgress }) {
        for (let step = 1; step <= 10; step++) {
          await wait(100, signal);
          onProgress(step / 10);
        }

        const fileId = newId('u');

        data.uploads.set(fileId, { name: file.name, size: file.size });
        return fileId;
      },
      async attach(employeeId, fileIds, category) {
        await wait(SAVE_TIME);
        found(data.employees, employeeId);

        for (const fileId of fileIds) {
          const upload = data.uploads.get(fileId);

          if (upload === undefined) {
            throw new AppError('notFound');
          }

          data.documents.push({ id: newId('f'), employeeId, ...upload, category, uploaded: nowStamp() });
          data.uploads.delete(fileId);
        }
      },
      async remove(ids) {
        await wait(SAVE_TIME);
        data.documents = data.documents.filter((document) => !ids.includes(document.id));
      },
    },
    openings: {
      async all(signal) {
        await wait(LOADING_TIME, signal);
        return copy(data.openings);
      },
      async create(values) {
        await wait(SAVE_TIME);

        const opening = { ...values, id: newId('o'), opened: nowStamp().slice(0, 10) };

        data.openings.push(opening);
        return { ...opening };
      },
      async update(id, values) {
        await wait(SAVE_TIME);

        const opening = found(data.openings, id);

        Object.assign(opening, values);
        return { ...opening };
      },
    },
    candidates: {
      async all(signal) {
        await wait(LOADING_TIME, signal);
        return copy(data.candidates);
      },
      async create(values) {
        await wait(SAVE_TIME);
        found(data.openings, values.openingId);

        const candidate = {
          ...values,
          id: newId('c'),
          applied: nowStamp().slice(0, 10),
          stage: 'applied' as const,
          employeeId: null,
        };

        data.candidates.push(candidate);
        return { ...candidate };
      },
      async update(id, values) {
        await wait(SAVE_TIME);

        const candidate = found(data.candidates, id);

        Object.assign(candidate, values);
        return { ...candidate };
      },
      async move(ids, stage) {
        await wait(SAVE_TIME / 2);

        const candidates = ids.map((id) => found(data.candidates, id));

        if (candidates.some((candidate) => candidate.stage === 'hired')) {
          throw new AppError('alreadyHired');
        }

        for (const candidate of candidates) {
          candidate.stage = stage;
        }
      },
      async hire(id, { salary, onboarding, ...job }) {
        await wait(SAVE_TIME);

        const candidate = found(data.candidates, id);
        const opening = found(data.openings, candidate.openingId);

        if (candidate.stage === 'hired') {
          throw new AppError('alreadyHired');
        }

        const employee = createEmployee({
          ...job,
          ...splitName(candidate.name),
          email: `${
            candidate.name.toLowerCase().normalize('NFD').replace(/[^a-z ]/g, '').replace(/ +/g, '.')
          }@acme.example`,
          phone: '',
          birthDate: '',
          notes: '',
        }, salary);

        candidate.stage = 'hired';
        candidate.employeeId = employee.id;

        const hired = data.candidates.filter((c) => c.openingId === opening.id && c.stage === 'hired').length;

        if (hired >= opening.positions) {
          opening.status = 'closed';
        }

        if (onboarding) {
          createChecklist(employee.id, 'onboarding');
        }

        return { ...employee };
      },
    },
    checklists: {
      async all(signal) {
        await wait(LOADING_TIME, signal);
        return copy(data.checklists);
      },
      async create(employeeId, kind) {
        await wait(SAVE_TIME);
        return structuredClone(createChecklist(employeeId, kind));
      },
      async remove(ids) {
        await wait(SAVE_TIME);
        data.checklists = data.checklists.filter((checklist) => !ids.includes(checklist.id));
      },
      async setDone(id, taskIds, done) {
        await wait(SAVE_TIME / 3);

        for (const task of found(data.checklists, id).tasks) {
          if (taskIds.includes(task.id)) {
            task.done = done;
          }
        }
      },
      async addTask(id, values) {
        await wait(SAVE_TIME);
        found(data.checklists, id).tasks.push({ ...values, id: newId('k'), template: null, done: false });
      },
      async removeTask(id, taskId) {
        await wait(SAVE_TIME / 2);

        const checklist = found(data.checklists, id);

        checklist.tasks = checklist.tasks.filter((task) => task.id !== taskId);
      },
    },
  };
}
