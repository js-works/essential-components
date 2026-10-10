export { dailyTargetMinutes, membersOf };
export type { Employee, EmployeeRepository, EmployeeValues, Team, TeamRepository };

// A team, led by one of its members (the lead approves the team's requests).
type Team = {
  id: string;
  name: string;
  leadId: string;
};

// Someone whose time is tracked. A former employee stays (inactive) with their history.
type Employee = {
  id: string;
  name: string;
  email: string;
  title: string;
  teamId: string;
  // The contractual hours of a week, spread over Monday to Friday.
  weeklyHours: number;
  // The vacation days of a year.
  vacationDays: number;
  // Since when (yyyy-mm-dd).
  startDate: string;
  active: boolean;
};

type EmployeeValues = Omit<Employee, 'id'>;

interface EmployeeRepository {
  all(signal?: AbortSignal): Promise<readonly Employee[]>;
  // The email is unique (ignoring the case).
  create(values: EmployeeValues): Promise<Employee>;
  update(id: string, values: EmployeeValues): Promise<Employee>;
}

interface TeamRepository {
  all(signal?: AbortSignal): Promise<readonly Team[]>;
}

// The hours of a working day: a fifth of the week.
function dailyTargetMinutes(employee: Employee): number {
  return Math.round((employee.weeklyHours * 60) / 5);
}

function membersOf(employees: readonly Employee[], teamId: string): Employee[] {
  return employees.filter((employee) => employee.teamId === teamId);
}
