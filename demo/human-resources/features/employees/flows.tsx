import { useNavigate } from 'react-router';
import { useDialogs, useToast } from '../../../../packages/overlays/src/main/bindings/react';
import { addDays, currentSalary, todayDate } from '../../domain';
import type { Employee, EmployeeDocument, HrData } from '../../domain';
import { errorText } from '../../shared/lib/errorText';
import { translate } from '../../shared/lib/i18n';
import { useChanged, useHrService } from '../hr';
import { DocumentsForm } from './components/DocumentsForm';
import { EmployeeForm } from './components/EmployeeForm';
import { EndForm } from './components/EndForm';
import { SalaryForm } from './components/SalaryForm';

export { useEmployeeFlows };

// The changes of employees: a new one (then their page), edit one, a new salary, the end of the employment (with the
// offboarding, if wanted), documents (upload, delete).
function useEmployeeFlows() {
  const service = useHrService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();
  const navigate = useNavigate();

  const create = async (data: HrData) => {
    let created: Employee | undefined;
    const result = await dialogs.form({
      title: translate('employees.newTitle'),
      // Two columns (the person, the job): wide (2026-10-10).
      width: 'wide',
      content: (
        <EmployeeForm
          data={data}
          save={async ({ salary, onboarding, ...values }) =>
            void (created = await service.createEmployee(values, salary ?? 0, onboarding))}
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

  const edit = async (employee: Employee, data: HrData) => {
    const result = await dialogs.form({
      title: translate('employees.editTitle'),
      width: 'wide',
      content: (
        <EmployeeForm
          data={data}
          employee={employee}
          save={async ({ salary: _salary, onboarding: _onboarding, ...values }) =>
            void (await service.updateEmployee(employee.id, values))}
        />
      ),
      buttons: { confirm: translate('common.save') },
    });

    if (!result.canceled) {
      await changed();
      toasts.success(translate('employees.saved', { name: employee.name }));
    }
  };

  const changeSalary = async (employee: Employee, data: HrData) => {
    const today = todayDate();
    const result = await dialogs.form({
      title: translate('salary.newTitle'),
      content: (
        <SalaryForm
          current={currentSalary(data.salaries, employee.id, today)}
          from={employee.startDate > today ? employee.startDate : `${addDays(today, 32).slice(0, 7)}-01`}
          save={async (values) => void (await service.addSalary({ ...values, employeeId: employee.id }))}
        />
      ),
      buttons: { confirm: translate('common.save') },
    });

    if (!result.canceled) {
      await changed();
      toasts.success(translate('salary.saved', { name: employee.name }));
    }
  };

  // The last day; then the offboarding checklist, if wanted and there is none yet.
  const end = async (employee: Employee, data: HrData) => {
    const hasOffboarding = data.checklists.some((checklist) =>
      checklist.employeeId === employee.id && checklist.kind === 'offboarding'
    );
    let checklistId: string | undefined;
    const result = await dialogs.form({
      title: translate('employees.endTitle'),
      content: (
        <EndForm
          name={employee.name}
          initial={employee.endDate ?? addDays(`${addDays(todayDate(), 62).slice(0, 7)}-01`, -1)}
          canStartOffboarding={!hasOffboarding}
          save={async ({ endDate, offboarding }) => {
            await service.terminateEmployee(employee.id, endDate);

            if (offboarding && !hasOffboarding) {
              checklistId = (await service.createChecklist(employee.id, 'offboarding')).id;
            }
          }}
        />
      ),
      buttons: { confirm: translate('common.save') },
    });

    if (!result.canceled) {
      await changed();
      toasts.success(translate('employees.ended', { name: employee.name }));

      if (checklistId !== undefined) {
        void navigate(`/onboarding/${checklistId}`);
      }
    }
  };

  const uploadDocuments = async (employee: Employee) => {
    const result = await dialogs.form({
      title: translate('documents.uploadTitle'),
      content: (
        <DocumentsForm
          name={employee.name}
          upload={(file, context) => service.uploadFile(file, context)}
          save={async ({ category, files }) => {
            const ids = files.flatMap((file) => file.result === undefined ? [] : [file.result]);

            await service.attachDocuments(employee.id, ids, category);
          }}
        />
      ),
      buttons: { confirm: translate('common.save') },
    });

    if (!result.canceled) {
      await changed();
      toasts.success(translate('documents.saved', { name: employee.name }));
    }
  };

  const removeDocuments = async (documents: readonly EmployeeDocument[]) => {
    const [first] = documents;
    const result = await dialogs.confirmCritical({
      title: translate('documents.deleteTitle'),
      content: documents.length === 1 && first !== undefined
        ? translate('documents.deleteOne', { name: first.name })
        : translate('documents.deleteMany', { count: documents.length }),
      buttons: { confirm: translate('common.delete') },
    });

    if (result.canceled) {
      return;
    }

    try {
      await service.removeDocuments(documents.map((document) => document.id));
      await changed();
      toasts.success(translate('documents.deleted', { count: documents.length }));
    } catch (cause) {
      toasts.error(errorText(cause));
    }
  };

  return { create, edit, changeSalary, end, uploadDocuments, removeDocuments };
}
