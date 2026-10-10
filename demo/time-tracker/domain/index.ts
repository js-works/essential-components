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
} from './absence';
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
} from './absence';
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
} from './dates';
export type { Holiday, HolidayName } from './dates';
export { dailyTargetMinutes, membersOf } from './employee';
export type { Employee, EmployeeRepository, EmployeeValues, Team, TeamRepository } from './employee';
export { clockStateOf, entriesOf, nextClockActions, spentMinutes } from './time';
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
} from './time';
export { daySheet, todayStatus } from './timesheet';
export type { DaySheet, TimeData, TodayStatus } from './timesheet';
