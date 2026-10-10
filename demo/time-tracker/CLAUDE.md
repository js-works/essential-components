# Time Tracker

The "Time Tracker" app of the root's demo page (a mini-app of its app cockpit): a demo of the root (not of a package).
The clock (clock in and out, breaks), the timesheet of a week with corrections, leave requests and their approval, sick
calls with the doctor's note, a team calendar of who is off when, and the employees. Same look as the Board Manager
(Mantine, the same theme, its full-height layout); built like the File Center and the User Manager (the decided target
structure). Four packages: data tables for the lists, the dialogs and toasts of the overlays package,
form-validation (Zod) for the forms, the file upload for the doctor's notes. The rules of the root's `CLAUDE.md` apply.
Started 2026-10-06.

## Model

- Employees in teams; each team has a lead (its first member). An employee has weekly hours (spread over Monday to
  Friday: the daily target is a fifth), vacation days per year, a start date, and may be inactive (a former employee
  keeps their history).
- Time entries: stretches of a day, `work` or `break`, from `start` to `end` (`HH:mm`); the open one (no end) is where
  the clock runs now. The clock's state follows from the day's entries: out, working, on a break. Stamps: clock in,
  start break, end break, clock out (from a break too); the server refuses one that does not fit the state. A stamp in
  the same minute as the open entry's start drops that entry (no stretches of 0 minutes).
- Corrections: a forgotten stretch of work of a past day, with a reason; the team lead approves it (it becomes an entry
  of the day, `source: 'correction'`) or rejects it. Refused: a coming day, an end before the start, an overlap with the
  day's work.
- Leave requests: vacation, special leave or unpaid leave, from a first to a last day, a half day (morning or afternoon,
  only for a single day), a note. Pending until the team lead approves or rejects it (a rejection needs a comment);
  cancelled by its employee while pending, or while approved and not begun. Refused: an end before the start, no
  working day, an overlap with another approved or pending leave or a sick call, more vacation than is left.
- Sick calls: from a first to a last day (as far as known, changeable), a note; nothing to approve. From the fourth
  calendar day on (`CERTIFICATE_FROM_DAY`), a doctor's note is due (uploaded, then attached).
- Public holidays: the German ones that every state has (`publicHolidays`, Easter computed), for the year before, of and
  after today. Regional ones are a later step.
- The rules are pure functions of the domain: `daySheet` (a day of a timesheet: entries, target, worked, breaks,
  balance, absence; the target is none on a weekend, a holiday, a full day of approved leave or a sick day, half on an
  approved half day; a pending leave does not count yet), `vacationBalance` (the days of a year: taken, planned,
  pending, left), `absenceOn` (a sick call first, then a leave, then a holiday), `todayStatus`, `workingDays`,
  `leaveDays` (a half day is 0.5).
- Dates are local `yyyy-mm-dd` strings, times `HH:mm` (no time zones; they compare as strings).

## Structure

- `domain/`: `dates.ts` (dates, times, the public holidays), `employee.ts` (Employee, Team), `time.ts` (TimeEntry, the
  clock's rules, Correction), `absence.ts` (LeaveRequest, SickNote, the balance, absences), `timesheet.ts` (TimeData,
  `daySheet`, `todayStatus`), the repositories' interfaces. Pure TypeScript.
- `infra/in-memory/`: `seed.ts` (made-up data relative to today, from a fixed random seed: 40 employees in 5 teams, one
  former; the clock's entries of the last three months and of today up to now, not for the viewer today; leave over,
  now and coming, pending and decided, never overlapping; past sick calls, two running today, one of them without its
  doctor's note; three forgotten afternoons a week ago, two with a pending correction), `repositories.ts` (one store;
  the server's rules and refusals; waits like a server), `errors.ts` (`AppError`: a key of the texts, `errors.<key>`,
  and its values). Only `app/` (and the translation of errors) imports it.
- `features/`:
  - `tracker/`: the service (`createTimeService`: the repositories' methods, and `data()`: everything in one read, with
    the holidays), its context, the query keys, `useTimeData()`, `useChanged()` (invalidates every read after a
    change), `useTableSource()` (a data table's source over rows made from the data, searched, filtered, sorted and
    paged locally; each page a TanStack query).
  - `viewer/`: who uses the app (the signed-in employee, `VIEWER_ID`: Lena Hoffmann, the lead of Product) and the role,
    a switch of the demo in the app header's user menu: "Employee" or "Team lead" (the default), remembered per browser
    (`time-tracker:role`). A real app would take it from the user's permissions.
  - `home/` (the overview), `clock/`, `timesheet/` (with the corrections), `leave/`, `sick/`, `calendar/`,
    `approvals/`, `employees/`. Each with an `index.ts`; they import each other only through it.
- `shared/`: the Mantine scope (`.time-tracker`), the data table in Mantine's look (`DataTable`: every table in a
  `time-tracker__table`, `footer="auto"` and `showTotal`, like the Board Manager's), the file upload in Mantine's look,
  icons, page parts (header, an employee's avatar and link, the badges of absences, requests and the clock, the cards,
  the notice of a page only for team leads), the decision dialog of a team lead, the translations, formatting,
  `useForm` (form-validation plus the overlays' dialog form), `useNow`, `errorText`.
- `app/`: `TimeTrackerDemo.tsx` (the element `time-tracker-demo`; the wiring, Mantine's `DatesProvider` in the page's
  language with Monday first), `App.tsx` (routes, app header, breadcrumb, user menu, history, the hash), `look.tsx` (the
  User Manager's, i.e. the Board Manager's look), `time-tracker.css`.

## Look

- The theme: `modernTheme` of `packages/mantine-themes` merged with the app's own, like the Board Manager's.
- Two custom properties of its own (2026-10-06, allowed by the user), set by the host page's CSS (the root page maps the
  cockpit's onto them in `demo/demo.css`): `--time-tracker-accent-color` (Mantine's ten accent shades as mixes of it,
  straight in Mantine's own variables; without it, mixes of indigo) and `--time-tracker-font-size` (the app's normal
  text, Mantine's `sm`). No font family and no scale (the User Manager has them), and no other custom property: the
  color of an absence (the team calendar's blocks, the calendar's dots, the legend) is set inline as `color` (Mantine's
  variable of its filled shade) and drawn with `currentColor`.
- The calendars' colors (the blocks, the dots, the legend): vacation the accent, special leave teal, unpaid leave
  grape, sick the danger color, public holidays gray; a pending leave striped.
- The pills (badges), everywhere in the app (2026-10-07, the user's wish, like the Board Manager's): only the accent;
  the variant tells the states apart, gray only for what is over or out (`parts.tsx`). Absences `light`, pending
  `outline`. Requests: pending `outline`, approved `filled`, rejected `light`, cancelled gray. The clock: working
  `filled`, on a break `outline`, out gray. Doctor's note: missing `filled`, uploaded `light`, not needed gray; "now"
  `filled`. Employees: active `light`, inactive gray.
- The full-height layout of the Board Manager: the app header stays, the page scrolls below it, and a page's table fills
  the rest of the height (its rows scroll, its header and footer stay).

## Data access

- TanStack Query, like the User Manager: one query for all the data (without the query's signal, see the User
  Manager); every table's page a query; every change invalidates all (`trackerKeys.all`).

## Texts

- English and German with i18next (its own instance; `shared/lib/i18n/`), following `<html lang>`, like the Board
  Manager. The keys are flat (`'leave.title'`, `keySeparator: false`) and typed by `en.ts` (`TextKey`); `de.ts` has the
  same keys (its type says so). Plurals as `_one` and `_other`. No declaration of i18next's types
  (`CustomTypeOptions`): it is global, and the Board Manager's would clash.
- The labels of the forms: `<form>.<field>` (form-validation's `labels`); the server's refusals and the schemas' own
  messages: `errors.<key>`.
- Dates, times and numbers with `Intl` in the page's language (`shared/lib/format.ts`); Mantine's dates by its
  `DatesProvider` (`dayjs/locale/de`).

## App

- App header (`AppHeader`, 2026-10-08; "top bar" before) like the Board Manager's, two lines (2026-10-08, the Human Resources' trial, rolled out; a menu of the modules
  on the title, the breadcrumb in the same line before): the app icon (`TbClock`, also the cockpit's), "Time Tracker",
  the modules as tabs (Overview, Time clock, Timesheet, Leave, Sick calls, Team calendar; for a team lead also Approvals
  and Employees; the current one, also on an employee's page, in the accent's light ground; below 80rem of the bar a
  menu in their place: the current module and a chevron), the user menu (the viewer's avatar and role: "My page", the
  role switch), Back and Forward; below them the breadcrumb (a house icon with "Home", a link to the start page; then
  module › employee). The role and the history go when the bar is narrow.
- Routes: `/`, `/clock`, `/timesheet`, `/leave`, `/sick`, `/calendar`, `/approvals`, `/employees`,
  `/employees/:employeeId`; mirrored in the hash after `#time-tracker`, with the browser's Back and Forward (`app/hashHistory.ts`, see the
  root's `CLAUDE.md`). A page only for team leads (Approvals,
  Employees, another's page) shows a notice to an employee.
- Overview (the start page): the clock, four cards (vacation left, my open requests (side by side: both open Leave),
  this week's balance; a team lead:
  what waits for approval, an employee: their sick calls this year; each a link, the name of its page with an arrow
  at its top right, in the accent on hover, 2026-10-07), who of the team is off today, my month (Mantine's
  `Calendar`, a dot per absence), my coming leave. No greeting (the root's rule).
- Time clock: the clock (the time to the second, the state, the buttons that fit it, today's worked time against the
  target with a progress bar, the breaks, a timeline of the day from 6:00 to 22:00), today's stretches, this week so
  far. Today's absence is said, but the clock still works.
- Timesheet: a week (previous, next, this week), a row per day (first and last stamp, breaks, worked, target, balance,
  absence; days off dimmed, today marked; totals), and the corrections of the week. On the viewer's own past days a
  button requests a correction. A team lead may choose a member of their team.
- Leave: the vacation of the year (days, taken, planned, pending, left) and "My requests" (request, cancel); a team lead
  also "Requests of my team" (approve, reject). The request form shows the working days and what is left, live.
- Sick calls: "My sick calls" (report, change, upload the doctor's note; a reminder while one is missing); a team lead
  also the team's.
- Team calendar: a month (previous, next, this month), a row per employee by team (the viewer's team by default, one
  other or all), a column per day; absences as blocks in their color (pending striped, half days half), weekends shaded,
  today framed; the names stay at the left, the days at the top; a legend.
- Approvals (a team lead): the pending leave requests and corrections of their team, in tabs with their numbers;
  approve or reject (one dialog and one comment for all the selected).
- Employees (a team lead): a table (name and title, team, today: the clock's state or the absence, hours, vacation
  left, email, status); new, edit, open. An employee's page: Overview (vacation, details, two months of absences),
  Timesheet, Leave, Sick calls.
- Forms: Mantine inputs in the overlays' form dialogs, validated by form-validation (a Zod schema each); native selects
  in dialogs (a Mantine select would open outside the modal dialog), Mantine's date pickers with a fixed position.
  - Unsaved changes (2026-10-09, the user's wish, like the Board Manager's): `DialogForm` passes form-validation's
    `isDirty` to the overlays' `<Form dirty>`: after a change, closing a form dialog asks first, in place of the dialog's content
    ("Discard your changes?"). Escape there answers Discard (2026-10-09, the user's wish: Escape, Escape leaves a changed form), said in a line below the question ("Press Esc to discard them.", the overlays' text; only with a keyboard).
  - The message of an invalid field is a popover below it (2026-10-06, the user's wish; first the Board Manager's
    absolutely placed badge, the same day): `FieldError` (`shared/ui/`), given as Mantine's `error` by `useForm` (it
    wraps every field function). A native `popover="manual"` in the top layer (a dialog's scrolling body never cuts it
    off), opened while the field has the focus and no date picker's calendar of it is open, placed by script below the
    field, 2px away (2026-10-07; 4px before) (above it when there is no room, the arrow turned; inside the window;
    following scrolling and resizing).
    Mantine's error element only holds it (its id stays for `aria-describedby`). The doctor's note upload's error (a
    slot of the upload, shown in its `::part(error)` of `time-tracker__upload`) cannot be a popover: there the message
    is plain text, in the same look as a badge below the upload, always shown.
- Every page has a headline (2026-10-07, the user's wish): the page header (`PageHeader`: the title, a line below it),
  above the tabs, if any; on Employees the table's title is the headline (the table is the whole page).
- "My requests" and "My sick calls" have no search (2026-10-07, the user's wish: it searched the name, which is always
  the viewer's); the team's tables and Approvals have one.
- Only pending requests are decided and only cancellable ones cancelled: the data table's actions do not depend on
  the row, so the others among the selected rows are skipped, and a toast says so when none is left.
