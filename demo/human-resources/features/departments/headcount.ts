import { descendantIds, statusOf } from '../../domain';
import type { HrData } from '../../domain';

export { headcount };

// The people of a department who work there now (active or leaving; not those to come, not former ones); `deep` with
// every department below it.
function headcount(data: HrData, departmentId: string, today: string, deep = false): number {
  const ids = deep ? descendantIds(data.departments, departmentId) : [departmentId];

  return data.employees.filter((employee) => {
    const status = statusOf(employee, today);

    return ids.includes(employee.departmentId) && (status === 'active' || status === 'leaving');
  }).length;
}
