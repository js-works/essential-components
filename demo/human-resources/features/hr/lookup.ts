import { departmentPath, statusOf } from '../../domain';
import type { Employee, HrData } from '../../domain';

export { departmentName, departmentOptions, employeeOf, managerOptions };

// The lookups the pages share: by id, and the options of the forms' selects.

function employeeOf(data: HrData, id: string | null): Employee | undefined {
  return id === null ? undefined : data.employees.find((employee) => employee.id === id);
}

function departmentName(data: HrData, id: string): string {
  return data.departments.find((department) => department.id === id)?.name ?? '';
}

// Every department with its path (`Engineering › Platform`), in the order of the paths.
function departmentOptions(data: HrData): { value: string; label: string }[] {
  return data.departments
    .map((department) => ({
      value: department.id,
      label: departmentPath(data.departments, department.id).join(' › '),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

// The employees who can be a manager (not former ones), by name, without `except` (the employee themselves).
function managerOptions(data: HrData, today: string, except?: string): { value: string; label: string }[] {
  return data.employees
    .filter((employee) => employee.id !== except && statusOf(employee, today) !== 'former')
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((employee) => ({ value: employee.id, label: `${employee.name} (${employee.title})` }));
}
