import { selectFilter } from '@local/data-table/react';
import { DEPARTMENTS } from './components/user-form.js';

export { departmentFilter, userStatusFilter };

// The filter of a user's department.
const departmentFilter = selectFilter({
  options: DEPARTMENTS.map((value) => ({ value, label: value })),
  multiple: true,
});

// The filter of a user's status: active or disabled.
const userStatusFilter = selectFilter({
  options: [{ value: 'Active', label: 'Active' }, { value: 'Disabled', label: 'Disabled' }],
  multiple: true,
});
