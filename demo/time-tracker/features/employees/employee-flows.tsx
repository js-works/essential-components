import { useDialogs, useToast } from '@local/overlays/react';
import { useNavigate } from 'react-router';
import type { Employee, Team } from '../../domain/index.js';
import { useTranslate } from '../../shared/lib/i18n/index.js';
import { useChanged, useTimeService } from '../tracker/index.js';
import { EmployeeForm } from './components/employee-form.js';

export { useCreateEmployeeFlow, useEditEmployeeFlow };

// The flows of the employees, one hook per use case: each gives the function a button or an action calls. A flow
// changes the data and says so; the tables follow the data themselves (the queries).

// "New employee": the employee form in a dialog; then a toast, and their page.
function useCreateEmployeeFlow() {
  const t = useTranslate();
  const service = useTimeService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();
  const navigate = useNavigate();

  return async (teams: readonly Team[]) => {
    let created: Employee | undefined;
    const result = await dialogs.form({
      title: t('employees.newTitle'),
      content: (
        <EmployeeForm
          teams={teams}
          save={async (values) => void (created = await service.createEmployee(values))}
        />
      ),
      buttons: { confirm: t('common.create') },
    });

    if (result.canceled || created === undefined) {
      return;
    }

    await changed();
    toasts.success(t('employees.created', { name: created.name }));
    void navigate(`/employees/${created.id}`);
  };
}

// "Edit" of an employee, in the employee form, then a toast.
function useEditEmployeeFlow() {
  const t = useTranslate();
  const service = useTimeService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();

  return async (employee: Employee, teams: readonly Team[]) => {
    const result = await dialogs.form({
      title: t('employees.editTitle'),
      content: (
        <EmployeeForm
          employee={employee}
          teams={teams}
          save={async (values) => void (await service.updateEmployee(employee.id, values))}
        />
      ),
      buttons: { confirm: t('common.save') },
    });

    if (result.canceled) {
      return;
    }

    await changed();
    toasts.success(t('employees.saved', { name: employee.name }));
  };
}
