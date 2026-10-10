# Human Resources

The "Human Resources" app of the root's demo page (a mini-app of its app cockpit): a demo of the root (not of a
package). The employees (their job, salary history and documents), the departments with an org chart, recruiting
(openings, a pipeline board of candidates, the hire), and the checklists of joiners and leavers. Same look and UX as
the Board Manager (Mantine, the same theme, its full-height layout); built like the Time Tracker (the decided target
structure). Four packages: data tables for the lists, the dialogs and toasts of the overlays package,
form-validation (Zod) for the forms, the file upload for the documents. The rules of the root's `CLAUDE.md` apply.
Started 2026-10-08.

- No leave, absences or time: the Time Tracker has them. Its own made-up data (no data shared with the Time Tracker:
  each app stays self-contained, 2026-10-08).

## Model

- Departments in a tree (`parentId`, Management at the top), each with a head (an employee) and a cost center.
- Employees: the first and the last name (2026-10-10, the user's wish; one `name` before, which stays: both parts,
  kept by the server, what everything shows; `splitName` gives the parts of a one-part name, the seed's and a hired
  candidate's: the first word and the rest), contact, birth date (empty for a hire until edited), notes (2026-10-10, free text, empty for none), job (title, department, manager, location, contract:
  full-time, part-time, contractor, intern; hours a week), first day, last day (`endDate`). The status follows from the
  dates (`statusOf`): joining (`upcoming`), active, leaving (a last day to come), former.
- Salary changes (yearly gross in euros, from a date: hire, raise, promotion, adjustment); today's is the last one from
  today or before (`currentSalary`).
- Documents of an employee (contract, certificate, performance review, other): uploaded, then attached.
- Openings (a department, a hiring manager, positions, open / on hold / closed) and candidates with a stage: applied,
  screening, interview, offer, hired, or rejected; a rating 0 to 5. The hire makes the candidate an employee (with the
  first salary, the onboarding checklist if wanted); the opening closes when all positions are filled.
- Checklists: onboarding and offboarding, one of each kind per employee, made from a template (`CHECKLIST_TEMPLATES`:
  tasks for HR, IT, the manager, the employee, due days before or after the first or last day; their titles are texts,
  `task.<key>`); tasks can be added by hand and removed. Overdue: open and due before today.
- The server refuses (`AppError`, `errors.<key>`): a taken email, a department below itself, deleting a department with
  employees or departments below it, a manager who reports to the employee, a last day or a salary before the first
  day, moving a hired candidate, a second checklist of a kind, an offboarding without a last day.

## Structure

- `domain/`: `dates.ts`, `organization.ts`, `employee.ts`, `recruiting.ts`, `checklist.ts`, `HrData` (`index.ts`).
- `infra/in-memory/`: `seed.ts` (48 employees in 12 departments; two joining soon and one ten days ago, one leaving,
  one gone; anniversaries and birthdays in the coming weeks; salary histories; documents; 6 openings with 32
  candidates; 5 checklists; ids short per kind: `e1`, `o1`, `l1`), `repositories.ts` (one store, waits like a server),
  `errors.ts`. Only `app/` (and the translation of errors) imports it.
- `features/`: `hr/` (the service `createHrService`, `useHrData()`, `useChanged()`, `useTableSource()`, the lookups),
  `viewer/` (the signed-in employee: Sarah Krüger, HR Manager, `VIEWER_ID`; no roles), `home/`, `employees/`,
  `departments/`, `recruiting/`, `checklists/`. Each with an `index.ts`; they import each other only through it.
- `shared/`: the Mantine scope (`.human-resources`), `DataTable` (the data table in Mantine's look, every table in
  a `human-resources__table`, `footer="auto"` and `showTotal`; all compact, `density="compact"`, 2026-10-08, the user's
  wish, like the User Manager's), `DocumentUpload`, icons, page parts (header, avatar, labels, the pills, the stat card, `Detail`, the
  rating, a progress cell), `FieldError`, the translations, formatting, `useForm`.
- `app/`: `HumanResourcesDemo.tsx` (the element `human-resources-demo`), `App.tsx`, `look.tsx` (the Time Tracker's),
  `hashHistory.ts` (the same file in all five apps), `human-resources.css`.

## Look

- Two custom properties of its own (2026-10-08, allowed by the user), set by the host page's CSS (`demo/demo.css`):
  `--human-resources-accent-color` and `--human-resources-font-size`. No other.
- The pills only in the accent; the variant tells the states apart, gray for what is over: employees (joining
  `outline`, active `light`, leaving `filled`, former gray), openings (open `filled`, on hold `outline`, closed gray),
  stages (applied `outline`, hired `filled`, rejected gray, the others `light`), checklists (in progress `outline`,
  complete gray). Overdue texts in the error color.
- The org chart: a card per department from the top down, joined by lines (nested lists, CSS only); it scrolls
  sideways and starts with the top in the middle. The pipeline board: a column per stage plus "Rejected"; cards are
  dragged between columns (native drag and drop; into "Hired": the hire's dialog) or moved by their menu.

## App

- App header (`AppHeader`, 2026-10-08; "top bar" before): the app icon (`TbUsersGroup`; the cockpit's the same Tabler icon), "Human Resources" ("Personal" in German),
  the user menu (the viewer's avatar and title, "My page"), Back and Forward.
  - The modules as tabs (2026-10-08, the user's wish: tried here first, then rolled out to the Board Manager, the User
    Manager and the Time Tracker; before, a menu of the modules on the title, the breadcrumb in the same line):
    Overview, Employees, Departments, Recruiting, Onboarding (`NavLink`s; the current one, also on its records' pages,
    in the accent's light ground). Below 64rem of the bar a menu in their place (the current module and a chevron).
  - The breadcrumb in a second line of the bar (Home, then module › record).
- Routes: `/`, `/employees`, `/employees/:employeeId`, `/departments`, `/recruiting`, `/recruiting/:openingId`,
  `/onboarding`, `/onboarding/:checklistId`; mirrored in the hash after `#human-resources`.
- Overview: four cards (headcount, open positions, candidates in process, running checklists), the headcount by
  department, the next 30 days (birthdays, anniversaries, first and last days), the recruiting pipeline, the next
  tasks.
- Employees: the directory (filters: department, location, contract, since, status; "New employee"; the placeholders
  Import, Export and Print, 2026-10-09, to try the data table's filter drawer with a fuller toolbar, removed
  2026-10-10, the user's wish; the dialogs "New employee" and "Edit employee" in two columns, 2026-10-10, the user's
  wish: the person on the left (first name | last name, email, phone | birth date, notes: a textarea of 3 to 6 rows), the job on the right, a wide
  dialog, one column in a narrow window; a new one with the switch "Start the onboarding checklist" below both, on by
  default, like the hire's: the server makes the checklist with the employee); an employee's page:
  Overview
  (person with the notes when there are some, job, team with manager and direct reports, checklists), Compensation (cards and the salary history), Documents
  (upload, download: not in the demo, delete); "More": new salary, upload, start onboarding/offboarding, end employment.
- Departments: the org chart (each card's menu: add below, edit, delete) and the list.
- Recruiting: the openings; an opening's page: its facts, Pipeline (the board), Candidates (a table: move the selected,
  reject, hire), Description.
- Onboarding: the checklists (progress, next task, overdue); a checklist's page: the first or last day, the progress,
  the tasks by owner (ticked off with a click).
- English and German (i18next, like the Time Tracker's: flat keys typed by `en.ts`).
- Unsaved changes (2026-10-09, the user's wish; the pilot, then the Board Manager, the Time Tracker and the User
  Manager; not the File Center, whose dialogs have one field or a tree): `DialogForm`
  (`useForm.tsx`) passes form-validation's `isDirty` to the overlays' `<Form dirty>`. Cancel, Escape and the close
  button of a form dialog then ask in place of the dialog's content, "Discard your changes?" (Discard, Keep editing; the overlays'
  own texts, English and German), when a value differs from its initial one; without changes they close at once. Escape there answers Discard (2026-10-09, the user's wish: Escape, Escape leaves a changed form), said in a line below the question ("Press Esc to discard them.", the overlays' text; only with a keyboard).
  (An `openForm` helper with a `guardClose` loop per call was tried first and dropped the same day: the library does
  it now.)
- The selects of the forms are Mantine's (`FormSelect`, 2026-10-08, the user's wish; native ones before, like the Time
  Tracker's): the popup in the dialog with a fixed position (no portal), as wide as its longest option and at least as
  the field, from the field's start (2026-10-10, the user's wish: in the narrow fields of the two columns the options
  wrapped), searchable from 8 options on; a field that may
  stay empty (a manager, a head, the department above) is `clearable` with "(none)" as its placeholder, and gives
  `undefined` (the schemas make it `null`); a required one cannot be deselected. Escape with the list open closes only
  the list (it closed the dialog). The message of an invalid field (`FieldError`) hides while the list is open
  (`aria-expanded`), like for a date picker's calendar.
