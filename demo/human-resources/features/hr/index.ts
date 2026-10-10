// The app's service and its data access (TanStack Query), for every feature of human resources.

export { HrServiceContext, useChanged, useHrData, useHrService, useTableSource } from './context';
export { hrKeys } from './keys';
export { departmentName, departmentOptions, employeeOf, managerOptions } from './lookup';
export { createHrService } from './service';
export type { HrService } from './service';
