import {
  absenceOn,
  addDays,
  dateOf,
  datesBetween,
  holidaysAround,
  isWorkingDay,
  minutesOf,
  timeOf,
} from '../../domain';
import type { Correction, Employee, LeaveRequest, LeaveType, SickNote, Team, TimeEntry } from '../../domain';

export { seed, VIEWER_ID };
export type { Data };

// The made-up data of the time tracker, relative to today: 40 employees in 5 teams, the clock's entries of the last
// three months (and of today up to now), leave requests (over, now, coming; pending, decided), sick calls (one is
// running without its doctor's note) and corrections. Random, but always the same (a fixed seed).

type Data = {
  employees: Employee[];
  teams: Team[];
  entries: TimeEntry[];
  leave: LeaveRequest[];
  sick: SickNote[];
  corrections: Correction[];
  // The uploaded files (the doctor's notes): id to name and size.
  uploads: Map<string, { name: string; size: number }>;
};

// The signed-in user: Lena Hoffmann, the lead of the Product team.
const VIEWER_ID = 'e1';

// A small seeded random generator (mulberry32).
function random(seedValue: number): () => number {
  let state = seedValue;

  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);

    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const TEAMS: readonly { id: string; name: string; titles: readonly string[] }[] = [
  { id: 't1', name: 'Product', titles: ['Head of Product', 'Product Manager', 'UX Designer', 'Product Analyst'] },
  {
    id: 't2',
    name: 'Engineering',
    titles: ['Engineering Lead', 'Software Engineer', 'QA Engineer', 'DevOps Engineer'],
  },
  { id: 't3', name: 'Sales', titles: ['Head of Sales', 'Account Executive', 'Sales Assistant', 'Key Account Manager'] },
  { id: 't4', name: 'Customer Support', titles: ['Support Lead', 'Support Specialist', 'Technical Support'] },
  { id: 't5', name: 'Finance & HR', titles: ['Head of Finance', 'Accountant', 'HR Manager', 'Payroll Specialist'] },
];

const NAMES = [
  'Lena Hoffmann',
  'Jonas Becker',
  'Mia Schneider',
  'Lukas Wagner',
  'Sofia Rossi',
  'Felix Braun',
  'Emma Fischer',
  'Noah Klein',
  'David Chen',
  'Hannah Weber',
  'Paul Richter',
  'Amira Haddad',
  'Tim Neumann',
  'Laura Schmitt',
  'Ben Wolf',
  'Clara Zimmermann',
  'Sarah Krüger',
  'Max Hartmann',
  'Julia Lange',
  'Elias Schulz',
  'Nina Kowalski',
  'Leon Meyer',
  'Marie Dubois',
  'Finn Köhler',
  'Anna Lehmann',
  'Ole Jansen',
  'Lea Peters',
  'Tom Berger',
  'Zoe Martin',
  'Jan Vogel',
  'Katharina Roth',
  'Moritz Frank',
  'Ida Schröder',
  'Luis García',
  'Greta Möller',
  'Erik Lindqvist',
  'Aylin Demir',
  'Simon Keller',
  'Paula Horn',
  'Henrik Walter',
];

const emailOf = (name: string) =>
  `${
    name
      .toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/í/g, 'i')
      .replace(/ /g, '.')
  }@acme.example`;

function seed(): Data {
  const rng = random(20261006);
  const pick = <T>(items: readonly T[]): T => items[Math.floor(rng() * items.length)] as T;
  const between = (min: number, max: number) => min + Math.floor(rng() * (max - min + 1));
  const now = new Date();
  const today = dateOf(now);
  const nowTime = timeOf(now.getHours() * 60 + now.getMinutes());
  const holidays = holidaysAround(today);
  const historyStart = addDays(today, -91);
  const stamp = (date: string, time = '09:00') => `${date}T${time}`;
  let next = 1;
  const id = (prefix: string) => `${prefix}${next++}`;

  // Teams of 8: the first of each team is its lead.
  const teams: Team[] = TEAMS.map((team, index) => ({ id: team.id, name: team.name, leadId: `e${index * 8 + 1}` }));
  const employees: Employee[] = NAMES.map((name, index) => {
    const team = TEAMS[Math.floor(index / 8)] ?? TEAMS[0]!;
    const lead = index % 8 === 0;
    const part = !lead && rng() < 0.2;

    return {
      id: `e${index + 1}`,
      name,
      email: emailOf(name),
      title: lead ? team.titles[0]! : pick(team.titles.slice(1)),
      teamId: team.id,
      weeklyHours: part ? pick([20, 30]) : 40,
      vacationDays: part ? 28 : pick([30, 30, 30, 28]),
      startDate: index === 15 ? addDays(today, -40) : `${between(2015, 2025)}-${pick(['01', '04', '07', '10'])}-01`,
      // One former employee, kept with the history.
      active: index !== 38,
    };
  });

  // The first working day at or after a date.
  const workingFrom = (date: string) => {
    let day = date;

    while (!isWorkingDay(day, holidays)) {
      day = addDays(day, 1);
    }

    return day;
  };
  // The day that ends a stretch of `days` working days from a working day.
  const afterWorkingDays = (from: string, days: number) => {
    let day = from;
    let count = 1;

    while (count < days) {
      day = addDays(day, 1);
      count += isWorkingDay(day, holidays) ? 1 : 0;
    }

    return day;
  };

  const leave: LeaveRequest[] = [];
  const sick: SickNote[] = [];
  const request = (
    employeeId: string,
    type: LeaveType,
    from: string,
    to: string,
    status: LeaveRequest['status'],
    extra: Partial<LeaveRequest> = {},
  ) => {
    const lead = teams.find((team) => team.id === employees.find((e) => e.id === employeeId)?.teamId)?.leadId ?? null;

    leave.push({
      id: id('l'),
      employeeId,
      type,
      from,
      to,
      halfDay: 'none',
      note: '',
      status,
      created: stamp(addDays(from, -between(14, 40)), '10:15'),
      decidedBy: status === 'approved' || status === 'rejected' ? lead : null,
      comment: '',
      ...extra,
    });
  };

  // Who is away today: three on vacation, two sick (one since four days, without the doctor's note yet).
  const awayToday = { vacation: ['e10', 'e20', 'e35'], sick: ['e14', 'e27'] };

  for (const employee of employees) {
    const { id: employeeId } = employee;

    // Over: a vacation in the summer of the history (not before the start).
    const pastFrom = workingFrom(addDays(historyStart, between(8, 50)));

    if (employee.startDate <= pastFrom) {
      request(employeeId, 'vacation', pastFrom, afterWorkingDays(pastFrom, between(4, 10)), 'approved');
    }

    if (awayToday.vacation.includes(employeeId)) {
      const from = workingFrom(addDays(today, -between(1, 4)));

      request(employeeId, 'vacation', from, afterWorkingDays(from, between(6, 9)), 'approved');
    }

    // Coming (not for the viewer, whose own come below, nor for a former employee), in windows that never overlap: an
    // approved vacation for most, now and then special leave, a pending vacation for some, a rejection.
    if (employeeId === VIEWER_ID || !employee.active) {
      continue;
    }

    if (rng() < 0.65) {
      const from = workingFrom(addDays(today, between(18, 50)));

      request(employeeId, 'vacation', from, afterWorkingDays(from, between(3, 10)), 'approved');
    }

    if (rng() < 0.15) {
      const day = workingFrom(addDays(today, between(70, 74)));

      request(employeeId, 'special', day, day, 'approved', { note: pick(['Moving house', 'Wedding of my sister']) });
    }

    if (rng() < 0.35) {
      const from = workingFrom(addDays(today, between(80, 110)));

      request(employeeId, 'vacation', from, afterWorkingDays(from, between(2, 8)), 'pending', {
        created: stamp(addDays(today, -between(0, 6)), '14:30'),
        note: pick(['', '', 'Family visit', 'Trip to the coast', 'Bridge days']),
      });
    }

    if (rng() < 0.1) {
      const from = workingFrom(addDays(today, between(12, 16)));

      request(employeeId, 'vacation', from, afterWorkingDays(from, 5), 'rejected', {
        comment: 'Release week, sorry. Can we find another week?',
      });
    }

    // A past sick call for some, in the weeks before the coming ones.
    if (rng() < 0.3) {
      const from = workingFrom(addDays(historyStart, between(64, 80)));
      const to = addDays(from, between(0, 4));

      sick.push({
        id: id('s'),
        employeeId,
        from,
        to,
        note: pick(['', 'Flu', 'Migraine', 'Back pain']),
        reported: stamp(from, '07:40'),
        certificate: datesBetween(from, to).length >= 4 ? { name: 'doctors-note.pdf', size: 184_320 } : null,
      });
    }
  }

  sick.push(
    {
      id: id('s'),
      employeeId: 'e14',
      from: addDays(today, -4),
      to: addDays(today, 1),
      note: 'Bronchitis',
      reported: stamp(addDays(today, -4), '07:12'),
      certificate: null,
    },
    {
      id: id('s'),
      employeeId: 'e27',
      from: addDays(today, -1),
      to: today,
      note: '',
      reported: stamp(addDays(today, -1), '07:55'),
      certificate: null,
    },
  );

  // The viewer's own: a pending half day and week, and an approved vacation, so the overview and the requests have
  // something of theirs.
  {
    const half = workingFrom(addDays(today, 9));
    const week = workingFrom(addDays(today, 30));
    const approved = workingFrom(addDays(today, 60));

    request(VIEWER_ID, 'vacation', half, half, 'pending', { halfDay: 'pm', created: stamp(today, '08:30') });
    request(VIEWER_ID, 'vacation', week, afterWorkingDays(week, 5), 'pending', {
      note: 'Autumn holidays',
      created: stamp(addDays(today, -2), '16:05'),
    });
    request(VIEWER_ID, 'vacation', approved, afterWorkingDays(approved, 8), 'approved', { decidedBy: 'e33' });
  }

  // The clock: every working day of the history that is no absence; today only up to now, and not for the viewer
  // (they clock in themselves). Now and then a forgotten afternoon (a correction fills it).
  const entries: TimeEntry[] = [];
  const absenceData = { leave, sick, holidays };
  const forgotten = new Set(['e2', 'e3', 'e6']);

  for (const employee of employees) {
    const days = datesBetween(employee.startDate > historyStart ? employee.startDate : historyStart, today);
    const lastDay = employee.active ? today : addDays(today, -30);

    for (const date of days) {
      const absence = absenceOn(employee.id, date, absenceData);
      const away = absence !== undefined && !absence.pending && absence.halfDay === 'none';

      if (date > lastDay || !isWorkingDay(date, holidays) || away || (date === today && employee.id === VIEWER_ID)) {
        continue;
      }

      const daily = Math.round((employee.weeklyHours * 60) / 5);
      const half = absence !== undefined && !absence.pending && absence.halfDay !== 'none';
      const start = between(90, 114) * 5; // 7:30 to 9:30
      const lunch = between(144, 153) * 5; // 12:00 to 12:45
      const pause = pick([30, 30, 45, 60]);
      const work = (half ? daily / 2 : daily) + between(-6, 12) * 5;
      const end = start + work + (half || work < 360 ? 0 : pause);
      const push = (kind: TimeEntry['kind'], from: number, to: number) => {
        const [startTime, endTime] = [timeOf(from), timeOf(to)];

        if (date === today && startTime > nowTime) {
          return;
        }

        entries.push({
          id: id('t'),
          employeeId: employee.id,
          date,
          kind,
          start: startTime,
          end: date === today && endTime > nowTime ? null : endTime,
          source: 'clock',
        });
      };

      if (half || work < 360) {
        push('work', start, end);
      } else {
        // The afternoon of one forgotten day a week ago: the clock was not stamped after the lunch break.
        const lapse = forgotten.has(employee.id) && date === workingFrom(addDays(today, -8));

        push('work', start, lunch);
        push('break', lunch, lunch + pause);

        if (!lapse) {
          push('work', lunch + pause, end);
        }
      }
    }
  }

  // The corrections of the forgotten afternoons: two pending (the viewer's team), one approved (its entry is there).
  const corrections: Correction[] = [];
  const lapseDay = workingFrom(addDays(today, -8));

  for (const [employeeId, status] of [['e2', 'pending'], ['e3', 'pending'], ['e6', 'approved']] as const) {
    const lastBreak = entries.filter((entry) => entry.employeeId === employeeId && entry.date === lapseDay).at(-1);
    const start = lastBreak?.end ?? '13:00';
    const end = timeOf(minutesOf(start) + 240);

    corrections.push({
      id: id('c'),
      employeeId,
      date: lapseDay,
      start,
      end,
      reason: 'Forgot to clock back in after lunch.',
      status,
      created: stamp(addDays(lapseDay, 1), '09:10'),
      decidedBy: status === 'approved' ? VIEWER_ID : null,
      comment: '',
    });

    if (status === 'approved') {
      entries.push({ id: id('t'), employeeId, date: lapseDay, kind: 'work', start, end, source: 'correction' });
    }
  }

  return { employees, teams, entries, leave, sick, corrections, uploads: new Map() };
}
