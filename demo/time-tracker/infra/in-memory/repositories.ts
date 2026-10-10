import {
  clockStateOf,
  dateOf,
  entriesOf,
  holidaysAround,
  leaveDays,
  minutesOf,
  timeOf,
  vacationBalance,
} from '../../domain';
import type {
  CorrectionRepository,
  EmployeeRepository,
  EntryRepository,
  LeaveRepository,
  SickRepository,
  TeamRepository,
  TimeEntry,
} from '../../domain';
import { AppError } from './errors';
import { seed } from './seed';
import type { Data } from './seed';

export { createInMemoryRepositories };
export type { Repositories };

type Repositories = {
  employees: EmployeeRepository;
  teams: TeamRepository;
  entries: EntryRepository;
  corrections: CorrectionRepository;
  leave: LeaveRepository;
  sick: SickRepository;
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

  return { date: dateOf(now), time: timeOf(now.getHours() * 60 + now.getMinutes()) };
};

// The in-memory implementation of the time tracker's repositories, on one store (seeded) for as long as the page is
// open. A real backend would come as `infra/http/` with the same interfaces. Lists are given out as copies, so a
// change is only seen after a new read.
function createInMemoryRepositories(): Repositories {
  const data: Data = seed();
  let next = 10_000;
  const newId = (prefix: string) => `${prefix}${next++}`;
  const holidays = () => holidaysAround(nowStamp().date);

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

  // Another approved or pending leave, or a sick call, of the employee in the range.
  const overlaps = (employeeId: string, from: string, to: string, ignoreId?: string) =>
    data.leave.some((request) =>
      request.id !== ignoreId && request.employeeId === employeeId
      && (request.status === 'approved' || request.status === 'pending') && request.from <= to && from <= request.to
    )
    || data.sick.some((note) =>
      note.id !== ignoreId && note.employeeId === employeeId && note.from <= to && from <= note.to
    );

  return {
    employees: {
      async all(signal) {
        await wait(LOADING_TIME, signal);
        return data.employees.map((employee) => ({ ...employee }));
      },
      async create(values) {
        await wait(SAVE_TIME);
        uniqueEmail(values.email);

        const employee = { ...values, id: newId('e') };

        data.employees.push(employee);
        return { ...employee };
      },
      async update(id, values) {
        await wait(SAVE_TIME);
        uniqueEmail(values.email, id);

        const employee = found(data.employees, id);

        Object.assign(employee, values);
        return { ...employee };
      },
    },
    teams: {
      async all(signal) {
        await wait(LOADING_TIME, signal);
        return data.teams.map((team) => ({ ...team }));
      },
    },
    entries: {
      async all(signal) {
        await wait(LOADING_TIME, signal);
        return data.entries.map((entry) => ({ ...entry }));
      },
      async clock(employeeId, action) {
        await wait(SAVE_TIME / 2);

        const { date, time } = nowStamp();
        const day = entriesOf(data.entries, employeeId, date);
        const state = clockStateOf(day);
        const open = day.find((entry) => entry.end === null);
        const allowed = action === 'in'
          ? state === 'out'
          : action === 'breakStart'
          ? state === 'working'
          : action === 'breakEnd'
          ? state === 'break'
          : state !== 'out';

        if (!allowed) {
          throw new AppError('clockState');
        }

        // An entry of no length (stamped twice in a minute) is dropped, not kept as 0 minutes.
        if (open !== undefined) {
          if (open.start === time) {
            data.entries = data.entries.filter((entry) => entry.id !== open.id);
          } else {
            open.end = time;
          }
        }

        const start = (kind: TimeEntry['kind']) =>
          data.entries.push({ id: newId('t'), employeeId, date, kind, start: time, end: null, source: 'clock' });

        if (action === 'in' || action === 'breakEnd') {
          start('work');
        } else if (action === 'breakStart') {
          start('break');
        }
      },
    },
    corrections: {
      async all(signal) {
        await wait(LOADING_TIME, signal);
        return data.corrections.map((correction) => ({ ...correction }));
      },
      async create(values) {
        await wait(SAVE_TIME);

        if (values.date >= nowStamp().date) {
          throw new AppError('futureDate');
        }

        if (minutesOf(values.end) <= minutesOf(values.start)) {
          throw new AppError('endBeforeStart');
        }

        const clash = entriesOf(data.entries, values.employeeId, values.date).some((entry) =>
          entry.kind === 'work' && entry.start < values.end && values.start < (entry.end ?? '23:59')
        );

        if (clash) {
          throw new AppError('overlapEntries');
        }

        const correction = {
          ...values,
          id: newId('c'),
          status: 'pending' as const,
          created: new Date().toISOString().slice(0, 16),
          decidedBy: null,
          comment: '',
        };

        data.corrections.push(correction);
        return { ...correction };
      },
      async decide(id, decision, comment, decidedBy) {
        await wait(SAVE_TIME);

        const correction = found(data.corrections, id);

        if (correction.status !== 'pending') {
          throw new AppError('alreadyDecided');
        }

        Object.assign(correction, { status: decision, comment, decidedBy });

        if (decision === 'approved') {
          const { employeeId, date, start, end } = correction;

          data.entries.push({ id: newId('t'), employeeId, date, kind: 'work', start, end, source: 'correction' });
        }
      },
    },
    leave: {
      async all(signal) {
        await wait(LOADING_TIME, signal);
        return data.leave.map((request) => ({ ...request }));
      },
      async create(values) {
        await wait(SAVE_TIME);

        if (values.to < values.from) {
          throw new AppError('endBeforeStart');
        }

        if (values.halfDay !== 'none' && values.to !== values.from) {
          throw new AppError('halfDayMultiple');
        }

        const days = leaveDays(values, holidays());

        if (days === 0) {
          throw new AppError('noWorkingDays');
        }

        if (overlaps(values.employeeId, values.from, values.to)) {
          throw new AppError('overlap');
        }

        if (values.type === 'vacation') {
          const employee = found(data.employees, values.employeeId);
          const year = Number(values.from.slice(0, 4));
          const { remaining } = vacationBalance(employee, data.leave, year, nowStamp().date, holidays());

          if (days > remaining) {
            throw new AppError('notEnoughDays', { days, left: remaining });
          }
        }

        const request = {
          ...values,
          id: newId('l'),
          status: 'pending' as const,
          created: new Date().toISOString().slice(0, 16),
          decidedBy: null,
          comment: '',
        };

        data.leave.push(request);
        return { ...request };
      },
      async cancel(id) {
        await wait(SAVE_TIME);

        const request = found(data.leave, id);
        const coming = request.status === 'approved' && request.from > nowStamp().date;

        if (request.status !== 'pending' && !coming) {
          throw new AppError('cannotCancel');
        }

        request.status = 'cancelled';
      },
      async decide(id, decision, comment, decidedBy) {
        await wait(SAVE_TIME);

        const request = found(data.leave, id);

        if (request.status !== 'pending') {
          throw new AppError('alreadyDecided');
        }

        Object.assign(request, { status: decision, comment, decidedBy });
      },
    },
    sick: {
      async all(signal) {
        await wait(LOADING_TIME, signal);
        return data.sick.map((note) => ({ ...note, certificate: note.certificate && { ...note.certificate } }));
      },
      async report(values) {
        await wait(SAVE_TIME);

        if (values.to < values.from) {
          throw new AppError('endBeforeStart');
        }

        // Refused over a leave too: the employee cancels the leave first (a real HR process would credit the
        // vacation days back).
        if (overlaps(values.employeeId, values.from, values.to)) {
          throw new AppError('overlap');
        }

        const note = { ...values, id: newId('s'), reported: new Date().toISOString().slice(0, 16), certificate: null };

        data.sick.push(note);
        return { ...note };
      },
      async update(id, values) {
        await wait(SAVE_TIME);

        if (values.to < values.from) {
          throw new AppError('endBeforeStart');
        }

        if (overlaps(values.employeeId, values.from, values.to, id)) {
          throw new AppError('overlap');
        }

        Object.assign(found(data.sick, id), values);
      },
      async attachCertificate(id, fileId) {
        await wait(SAVE_TIME);

        const upload = data.uploads.get(fileId);

        if (upload === undefined) {
          throw new AppError('notFound');
        }

        found(data.sick, id).certificate = { ...upload };
      },
      // The upload of a file (a doctor's note): in steps, with progress, about a second. Returns its id.
      async upload(file, { signal, onProgress }) {
        for (let step = 1; step <= 10; step++) {
          await wait(100, signal);
          onProgress(step / 10);
        }

        const fileId = newId('f');

        data.uploads.set(fileId, { name: file.name, size: file.size });
        return fileId;
      },
    },
  };
}
