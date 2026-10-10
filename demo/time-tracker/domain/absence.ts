import { datesBetween, isWeekend } from './dates';
import type { Holiday } from './dates';
import type { Employee } from './employee';
import type { Decision, RequestStatus } from './time';

export {
  absenceOn,
  CERTIFICATE_FROM_DAY,
  certificateRequired,
  isWorkingDay,
  leaveDays,
  sickDays,
  vacationBalance,
  workingDays,
};
export type {
  Absence,
  AbsenceKind,
  HalfDay,
  LeaveRepository,
  LeaveRequest,
  LeaveType,
  LeaveValues,
  SickNote,
  SickNoteValues,
  SickRepository,
  VacationBalance,
};

// Vacation counts against the yearly allowance; special leave (a wedding, a move, a funeral) and unpaid leave do not.
type LeaveType = 'vacation' | 'special' | 'unpaid';

// A single day may be taken as a half: the morning or the afternoon off.
type HalfDay = 'none' | 'am' | 'pm';

// A request for leave, decided by the team lead.
type LeaveRequest = {
  id: string;
  employeeId: string;
  type: LeaveType;
  from: string;
  to: string;
  halfDay: HalfDay;
  note: string;
  status: RequestStatus;
  // An ISO date and time.
  created: string;
  decidedBy: string | null;
  comment: string;
};

type LeaveValues = Pick<LeaveRequest, 'employeeId' | 'type' | 'from' | 'to' | 'halfDay' | 'note'>;

// A sick call: reported by the employee, nothing to approve. From the fourth calendar day on, a doctor's note is due.
type SickNote = {
  id: string;
  employeeId: string;
  from: string;
  // The last day, as far as known (it may be extended).
  to: string;
  note: string;
  // An ISO date and time.
  reported: string;
  // The uploaded doctor's note.
  certificate: { name: string; size: number } | null;
};

type SickNoteValues = Pick<SickNote, 'employeeId' | 'from' | 'to' | 'note'>;

interface LeaveRepository {
  all(signal?: AbortSignal): Promise<readonly LeaveRequest[]>;
  // Refused for an end before the start, a half of more than one day, no working day, an overlap with another
  // absence, or more vacation than is left.
  create(values: LeaveValues): Promise<LeaveRequest>;
  // A pending one, or an approved one that has not started.
  cancel(id: string): Promise<void>;
  // Only a pending one.
  decide(id: string, decision: Decision, comment: string, decidedBy: string): Promise<void>;
}

interface SickRepository {
  all(signal?: AbortSignal): Promise<readonly SickNote[]>;
  report(values: SickNoteValues): Promise<SickNote>;
  // A changed end (better or worse), or note.
  update(id: string, values: SickNoteValues): Promise<void>;
  // The doctor's note: the id of an uploaded file.
  attachCertificate(id: string, fileId: string): Promise<void>;
  // The upload of a file, with its progress (0 to 1). Resolves to its id.
  upload(file: File, context: { signal: AbortSignal; onProgress: (fraction: number) => void }): Promise<string>;
}

const CERTIFICATE_FROM_DAY = 4;

function isWorkingDay(date: string, holidays: readonly Holiday[]): boolean {
  return !isWeekend(date) && !holidays.some((holiday) => holiday.date === date);
}

function workingDays(from: string, to: string, holidays: readonly Holiday[]): number {
  return datesBetween(from, to).filter((date) => isWorkingDay(date, holidays)).length;
}

// The days a request takes: its working days, a half day as 0.5.
function leaveDays(request: Pick<LeaveRequest, 'from' | 'to' | 'halfDay'>, holidays: readonly Holiday[]): number {
  const days = workingDays(request.from, request.to, holidays);

  return request.halfDay === 'none' ? days : days * 0.5;
}

// Calendar days, as for the doctor's note.
function sickDays(note: Pick<SickNote, 'from' | 'to'>): number {
  return datesBetween(note.from, note.to).length;
}

function certificateRequired(note: Pick<SickNote, 'from' | 'to' | 'certificate'>): boolean {
  return note.certificate === null && sickDays(note) >= CERTIFICATE_FROM_DAY;
}

type VacationBalance = {
  allowance: number;
  // Approved and over (or begun).
  taken: number;
  // Approved and coming.
  planned: number;
  // Waiting for the team lead.
  pending: number;
  // What is left once the pending ones are approved too.
  remaining: number;
};

// The vacation of a year: the requests that start in it count (a request over the turn of the year is rare here).
function vacationBalance(
  employee: Employee,
  requests: readonly LeaveRequest[],
  year: number,
  today: string,
  holidays: readonly Holiday[],
): VacationBalance {
  const own = requests.filter((request) =>
    request.employeeId === employee.id && request.type === 'vacation' && request.from.startsWith(`${year}-`)
  );
  const sum = (list: readonly LeaveRequest[]) =>
    list.reduce((total, request) => total + leaveDays(request, holidays), 0);
  const approved = own.filter((request) => request.status === 'approved');
  const taken = sum(approved.filter((request) => request.from <= today));
  const planned = sum(approved.filter((request) => request.from > today));
  const pending = sum(own.filter((request) => request.status === 'pending'));

  return {
    allowance: employee.vacationDays,
    taken,
    planned,
    pending,
    remaining: employee.vacationDays - taken - planned - pending,
  };
}

type AbsenceKind = LeaveType | 'sick' | 'holiday';

// Why someone is not working on a day: an approved or pending leave, a sick call, a public holiday.
type Absence = {
  kind: AbsenceKind;
  // Pending leave is shown, but does not count yet.
  pending: boolean;
  halfDay: HalfDay;
};

// The absence of an employee on a day: a sick call first, then a leave (approved or pending), then a public holiday.
// Weekends are no absence.
function absenceOn(
  employeeId: string,
  date: string,
  data: { leave: readonly LeaveRequest[]; sick: readonly SickNote[]; holidays: readonly Holiday[] },
): Absence | undefined {
  if (data.sick.some((note) => note.employeeId === employeeId && note.from <= date && date <= note.to)) {
    return { kind: 'sick', pending: false, halfDay: 'none' };
  }

  const leave = data.leave.find((request) =>
    request.employeeId === employeeId && (request.status === 'approved' || request.status === 'pending')
    && request.from <= date && date <= request.to
  );

  if (leave !== undefined && !isWeekend(date)) {
    return { kind: leave.type, pending: leave.status === 'pending', halfDay: leave.halfDay };
  }

  if (data.holidays.some((holiday) => holiday.date === date)) {
    return { kind: 'holiday', pending: false, halfDay: 'none' };
  }

  return undefined;
}
