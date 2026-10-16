// The time tracker's domain: employees and teams, the clock's entries and their corrections, leave requests and sick
// calls, public holidays, and the rules of a day's timesheet and of the vacation balance. Pure TypeScript; imports
// nothing from outside.

export {
  absenceOn,
  CERTIFICATE_FROM_DAY,
  certificateRequired,
  isWorkingDay,
  leaveDays,
  sickDays,
  vacationBalance,
  workingDays,
} from './absence.js';

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
} from './absence.js';

export {
  addDays,
  dateOf,
  datesBetween,
  holidaysAround,
  isWeekend,
  minutesOf,
  monthDates,
  publicHolidays,
  timeOf,
  todayDate,
  weekdayOf,
  weekStart,
} from './dates.js';

export type { Holiday, HolidayName } from './dates.js';
export { dailyTargetMinutes, membersOf } from './employee.js';
export type { Employee, EmployeeRepository, EmployeeValues, Team, TeamRepository } from './employee.js';
export { clockStateOf, entriesOf, nextClockActions, spentMinutes } from './time.js';
export type {
  ClockAction,
  ClockState,
  Correction,
  CorrectionRepository,
  CorrectionValues,
  Decision,
  EntryRepository,
  RequestStatus,
  TimeEntry,
} from './time.js';

export { daySheet, todayStatus } from './timesheet.js';
export type { DaySheet, TimeData, TodayStatus } from './timesheet.js';
