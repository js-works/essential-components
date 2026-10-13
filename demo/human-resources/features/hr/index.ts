// The app's service and its data access (TanStack Query), for every feature of human resources.

export { HrServiceContext, useChanged, useHrData, useHrService, useTableSource } from './context.js';
export { hrKeys } from './keys.js';
export { departmentName, departmentOptions, employeeOf, managerOptions } from './lookup.js';
export { createHrService } from './service.js';
export type { HrService } from './service.js';
