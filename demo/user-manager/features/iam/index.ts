// The app's service and its data access (TanStack Query), for every feature of the user manager.

export { IamServiceContext, useAccessData, useChanged, useIamService, useTableSource } from './context.js';
export { iamKeys } from './keys.js';
export { createIamService } from './service.js';
export type { IamService } from './service.js';
