// The domain of human resources: departments, employees (their job, salary history and documents), recruiting
// (openings and candidates) and the checklists of joiners and leavers. Pure TypeScript; imports nothing from outside.

import type { Checklist } from './checklist';
import type { Employee, EmployeeDocument, SalaryChange } from './employee';
import type { Department } from './organization';
import type { Candidate, Opening } from './recruiting';

export type { HrData };

export {
  CHECKLIST_KINDS,
  CHECKLIST_TEMPLATES,
  checklistAnchor,
  isOverdue,
  nextTask,
  progressOf,
  TASK_OWNERS,
  tasksFromTemplate,
} from './checklist';
export type {
  Checklist,
  ChecklistKind,
  ChecklistRepository,
  ChecklistTask,
  TaskOwner,
  TaskValues,
  TemplateTask,
} from './checklist';
export { addDays, dateOf, daysBetween, nextYearly, todayDate, yearsBetween } from './dates';
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
} from './employee';
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
} from './employee';
export { childrenOf, departmentPath, descendantIds } from './organization';
export type { Department, DepartmentRepository, DepartmentValues } from './organization';
export { CANDIDATE_SOURCES, isInProcess, OPENING_STATUSES, PIPELINE, STAGES } from './recruiting';
export type {
  Candidate,
  CandidateRepository,
  CandidateSource,
  CandidateValues,
  HireValues,
  Opening,
  OpeningRepository,
  OpeningStatus,
  OpeningValues,
  Stage,
} from './recruiting';

// Everything the app shows, in one read (the lists are small).
type HrData = {
  departments: readonly Department[];
  employees: readonly Employee[];
  salaries: readonly SalaryChange[];
  documents: readonly EmployeeDocument[];
  openings: readonly Opening[];
  candidates: readonly Candidate[];
  checklists: readonly Checklist[];
};
