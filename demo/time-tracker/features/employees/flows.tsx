import { useNavigate } from 'react-router';
import { useDialogs, useToast } from '../../../../packages/overlays/src/main/bindings/react';
import type { Employee, Team } from '../../domain';
import { translate } from '../../shared/lib/i18n';
import { useChanged, useTimeService } from '../tracker';
import { EmployeeForm } from './components/EmployeeForm';

export { useEmployeeFlows };

// The changes of employees (a team lead): a new one (then their page), edit one.
function useEmployeeFlows() {
  const service = useTimeService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();
  const navigate = useNavigate();

  const create = async (teams: readonly Team[]) => {
    let created: Employee | undefined;
    const result = await dialogs.form({
      title: translate('employees.newTitle'),
      content: (
        <EmployeeForm
          teams={teams}
          save={async (values) => void (created = await service.createEmployee(values))}
        />
      ),
      buttons: { confirm: translate('common.create') },
    });

    if (!result.canceled && created !== undefined) {
      await changed();
      toasts.success(translate('employees.created', { name: created.name }));
      void navigate(`/employees/${created.id}`);
    }
  };

  const edit = async (employee: Employee, teams: readonly Team[]) => {
    const result = await dialogs.form({
      title: translate('employees.editTitle'),
      content: (
        <EmployeeForm
          employee={employee}
          teams={teams}
          save={async (values) => void (await service.updateEmployee(employee.id, values))}
        />
      ),
      buttons: { confirm: translate('common.save') },
    });

    if (!result.canceled) {
      await changed();
      toasts.success(translate('employees.saved', { name: employee.name }));
    }
  };

  return { create, edit };
}
