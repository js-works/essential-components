import { minutesOf } from './dates';

export { clockStateOf, entriesOf, nextClockActions, spentMinutes };
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
};

// A stretch of a day: working or a break. The open one (no `end`) is the one the clock runs on now.
type TimeEntry = {
  id: string;
  employeeId: string;
  date: string;
  kind: 'work' | 'break';
  start: string;
  end: string | null;
  // Stamped with the clock, or added by an approved correction.
  source: 'clock' | 'correction';
};

// Where the clock of an employee is: not clocked in, working, or on a break.
type ClockState = 'out' | 'working' | 'break';

type ClockAction = 'in' | 'breakStart' | 'breakEnd' | 'out';

// The state of a request (a leave request, a correction): waiting for the team lead, or decided; a pending or a coming
// approved request may be cancelled by its employee.
type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

type Decision = 'approved' | 'rejected';

// A missing stretch of work of a past day (the clock was forgotten), added when the team lead approves it.
type Correction = {
  id: string;
  employeeId: string;
  date: string;
  start: string;
  end: string;
  reason: string;
  status: RequestStatus;
  // An ISO date and time.
  created: string;
  decidedBy: string | null;
  comment: string;
};

type CorrectionValues = Pick<Correction, 'employeeId' | 'date' | 'start' | 'end' | 'reason'>;

interface EntryRepository {
  all(signal?: AbortSignal): Promise<readonly TimeEntry[]>;
  // A stamp of the clock, now. Refused when it does not fit the state (e.g. a break while clocked out).
  clock(employeeId: string, action: ClockAction): Promise<void>;
}

interface CorrectionRepository {
  all(signal?: AbortSignal): Promise<readonly Correction[]>;
  // Refused for a coming day, an end before the start, or a stretch that overlaps the day's work.
  create(values: CorrectionValues): Promise<Correction>;
  // Only a pending one; an approved one becomes an entry of the day.
  decide(id: string, decision: Decision, comment: string, decidedBy: string): Promise<void>;
}

// The entries of an employee on a day, in their order.
function entriesOf(entries: readonly TimeEntry[], employeeId: string, date: string): TimeEntry[] {
  return entries
    .filter((entry) => entry.employeeId === employeeId && entry.date === date)
    .sort((a, b) => a.start.localeCompare(b.start));
}

// The state of the clock: the kind of the open entry of the day.
function clockStateOf(dayEntries: readonly TimeEntry[]): ClockState {
  const open = dayEntries.find((entry) => entry.end === null);

  return open === undefined ? 'out' : open.kind === 'work' ? 'working' : 'break';
}

// What the clock offers in a state.
function nextClockActions(state: ClockState): ClockAction[] {
  return state === 'out' ? ['in'] : state === 'working' ? ['breakStart', 'out'] : ['breakEnd', 'out'];
}

// The minutes of one kind in a day's entries; an open entry counts up to `now` (`HH:mm`, the time of today).
function spentMinutes(dayEntries: readonly TimeEntry[], kind: TimeEntry['kind'], now: string): number {
  return dayEntries
    .filter((entry) => entry.kind === kind)
    .reduce((sum, entry) => sum + Math.max(0, minutesOf(entry.end ?? now) - minutesOf(entry.start)), 0);
}
