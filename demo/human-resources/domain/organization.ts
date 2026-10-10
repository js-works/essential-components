export { childrenOf, departmentPath, descendantIds };
export type { Department, DepartmentRepository, DepartmentValues };

// A department of the company, in a tree (`parentId`; the top ones have none), with its head (an employee) and its cost
// center.
type Department = {
  id: string;
  name: string;
  parentId: string | null;
  headId: string | null;
  costCenter: string;
};

type DepartmentValues = Omit<Department, 'id'>;

interface DepartmentRepository {
  all(signal?: AbortSignal): Promise<readonly Department[]>;
  create(values: DepartmentValues): Promise<Department>;
  // Refused: a parent inside the department itself (a cycle).
  update(id: string, values: DepartmentValues): Promise<Department>;
  // Refused while it has employees or departments below it.
  remove(id: string): Promise<void>;
}

function childrenOf(departments: readonly Department[], parentId: string | null): Department[] {
  return departments
    .filter((department) => department.parentId === parentId)
    .sort((a, b) => a.name.localeCompare(b.name));
}

// The department and every one below it.
function descendantIds(departments: readonly Department[], id: string): string[] {
  return [id, ...childrenOf(departments, id).flatMap((child) => descendantIds(departments, child.id))];
}

// The names from the top down to the department: `Engineering › Platform`.
function departmentPath(departments: readonly Department[], id: string): string[] {
  const path: string[] = [];
  let current = departments.find((department) => department.id === id);

  while (current !== undefined && path.length < 20) {
    path.unshift(current.name);
    current = departments.find((department) => department.id === current?.parentId);
  }

  return path;
}
