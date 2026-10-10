import { absenceOn } from './absence';
import type { Absence, LeaveRequest, SickNote } from './absence';
import { isWeekend } from './dates';
import type { Holiday } from './dates';
import { dailyTargetMinutes } from './employee';
import type { Employee, Team } from './employee';
import { clockStateOf, entriesOf, spentMinutes } from './time';
import type { ClockState, Correction, TimeEntry } from './time';

export { daySheet, todayStatus };
export type { DaySheet, TimeData, TodayStatus };

// Everything the app shows, in one read (the lists are small).
type TimeData = {
  employees: readonly Employee[];
  teams: readonly Team[];
  entries: readonly TimeEntry[];
  leave: readonly LeaveRequest[];
  sick: readonly SickNote[];
  corrections: readonly Correction[];
  holidays: readonly Holiday[];
};

// A day of an employee's timesheet, in minutes.
type DaySheet = {
  date: string;
  entries: TimeEntry[];
  // What the day asks for: the daily hours on a working day; none on a weekend, a holiday, a full day of approved leave
  // or a sick day; half of them on an approved half day.
  target: number;
  worked: number;
  breaks: number;
  // Worked minus target; none for a coming day (nothing to compare yet).
  balance: number | null;
  absence: Absence | undefined;
};

// `today` and `now` (`HH:mm`): an open entry of today counts up to now.
function daySheet(employee: Employee, date: string, data: TimeData, today: string, now: string): DaySheet {
  const entries = entriesOf(data.entries, employee.id, date);
  const absence = absenceOn(employee.id, date, data);
  const daily = dailyTargetMinutes(employee);
  const counts = absence !== undefined && !absence.pending;
  const target = isWeekend(date) || date < employee.startDate
    ? 0
    : counts
    ? absence.halfDay === 'none' ? 0 : daily / 2
    : daily;
  const time = date === today ? now : '23:59';
  const worked = spentMinutes(entries, 'work', time);

  return {
    date,
    entries,
    target,
    worked,
    breaks: spentMinutes(entries, 'break', time),
    balance: date > today ? null : worked - target,
    absence,
  };
}

// Where an employee is today: the clock's state, or the reason they are away.
type TodayStatus = { kind: 'clock'; state: ClockState } | { kind: 'absent'; absence: Absence };

function todayStatus(employee: Employee, data: TimeData, today: string): TodayStatus {
  const state = clockStateOf(entriesOf(data.entries, employee.id, today));
  const absence = absenceOn(employee.id, today, data);

  return state === 'out' && absence !== undefined && !absence.pending && absence.halfDay === 'none'
    ? { kind: 'absent', absence }
    : { kind: 'clock', state };
}
