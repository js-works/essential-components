import { addDays } from './dates';
import type { Employee } from './employee';

export {
  CHECKLIST_KINDS,
  CHECKLIST_TEMPLATES,
  checklistAnchor,
  isOverdue,
  nextTask,
  progressOf,
  TASK_OWNERS,
  tasksFromTemplate,
};
export type { Checklist, ChecklistKind, ChecklistRepository, ChecklistTask, TaskOwner, TaskValues, TemplateTask };

// The checklists of a joiner (onboarding) and a leaver (offboarding): tasks for HR, IT, the manager and the employee,
// each due some days before or after the first (last) day.
type ChecklistKind = 'onboarding' | 'offboarding';

const CHECKLIST_KINDS: readonly ChecklistKind[] = ['onboarding', 'offboarding'];

type TaskOwner = 'hr' | 'it' | 'manager' | 'employee';

const TASK_OWNERS: readonly TaskOwner[] = ['hr', 'it', 'manager', 'employee'];

type ChecklistTask = {
  id: string;
  // A task of the template has its key (its title is a text of the app); one added by hand only its title.
  template: string | null;
  title: string;
  owner: TaskOwner;
  due: string;
  done: boolean;
};

type Checklist = {
  id: string;
  employeeId: string;
  kind: ChecklistKind;
  // `yyyy-mm-dd`
  created: string;
  tasks: ChecklistTask[];
};

type TaskValues = Pick<ChecklistTask, 'title' | 'owner' | 'due'>;

interface ChecklistRepository {
  all(signal?: AbortSignal): Promise<readonly Checklist[]>;
  // From the template, due around the employee's first (or last) day. Refused: one of the kind exists already, or an
  // offboarding without an end date.
  create(employeeId: string, kind: ChecklistKind): Promise<Checklist>;
  remove(ids: readonly string[]): Promise<void>;
  setDone(id: string, taskIds: readonly string[], done: boolean): Promise<void>;
  addTask(id: string, values: TaskValues): Promise<void>;
  removeTask(id: string, taskId: string): Promise<void>;
}

type TemplateTask = { key: string; owner: TaskOwner; offset: number };

// The template tasks (their titles are texts of the app, `task.<key>`): due `offset` days from the first day
// (onboarding) or the last day (offboarding).
const CHECKLIST_TEMPLATES: Readonly<Record<ChecklistKind, readonly TemplateTask[]>> = {
  onboarding: [
    { key: 'contract', owner: 'hr', offset: -21 },
    { key: 'payroll', owner: 'hr', offset: -10 },
    { key: 'hardware', owner: 'it', offset: -5 },
    { key: 'accounts', owner: 'it', offset: -2 },
    { key: 'buddy', owner: 'manager', offset: -3 },
    { key: 'welcome', owner: 'manager', offset: 0 },
    { key: 'policies', owner: 'employee', offset: 3 },
    { key: 'goals', owner: 'manager', offset: 30 },
    { key: 'probation', owner: 'hr', offset: 90 },
  ],
  offboarding: [
    { key: 'confirmation', owner: 'hr', offset: -20 },
    { key: 'handover', owner: 'manager', offset: -10 },
    { key: 'exitInterview', owner: 'hr', offset: -5 },
    { key: 'returnHardware', owner: 'employee', offset: 0 },
    { key: 'revokeAccess', owner: 'it', offset: 0 },
    { key: 'finalPay', owner: 'hr', offset: 5 },
    { key: 'reference', owner: 'hr', offset: 14 },
  ],
};

// The day the tasks are due around: the first day of a joiner, the last day of a leaver.
function checklistAnchor(kind: ChecklistKind, employee: Employee): string | null {
  return kind === 'onboarding' ? employee.startDate : employee.endDate;
}

function tasksFromTemplate(
  kind: ChecklistKind,
  anchor: string,
  newId: () => string,
): ChecklistTask[] {
  return CHECKLIST_TEMPLATES[kind].map((task) => ({
    id: newId(),
    template: task.key,
    title: '',
    owner: task.owner,
    due: addDays(anchor, task.offset),
    done: false,
  }));
}

function progressOf(checklist: Checklist): { done: number; total: number; complete: boolean } {
  const done = checklist.tasks.filter((task) => task.done).length;

  return { done, total: checklist.tasks.length, complete: done === checklist.tasks.length };
}

function isOverdue(task: ChecklistTask, today: string): boolean {
  return !task.done && task.due < today;
}

// The open task due first.
function nextTask(checklist: Checklist): ChecklistTask | undefined {
  return checklist.tasks.filter((task) => !task.done).sort((a, b) => a.due.localeCompare(b.due))[0];
}
