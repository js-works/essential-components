import { useDialogs, useToast } from '@local/overlays/react';
import { useNavigate } from 'react-router';
import { addDays, currentSalary, todayDate } from '../../domain/index.js';
import type { Employee, EmployeeDocument, HrData } from '../../domain/index.js';
import { errorText } from '../../shared/lib/error-text.js';
import { useTranslate } from '../../shared/lib/i18n/index.js';
import { useChanged, useHrService } from '../hr/index.js';
import { DocumentsForm } from './components/documents-form.js';
import { EmployeeForm } from './components/employee-form.js';
import { EndForm } from './components/end-form.js';
import { SalaryForm } from './components/salary-form.js';

export {
  useChangeSalaryFlow,
  useCreateEmployeeFlow,
  useDownloadDocumentFlow,
  useEditEmployeeFlow,
  useEndEmploymentFlow,
  useRemoveDocumentsFlow,
  useUploadDocumentsFlow,
};

// The flows of the employees, one hook per use case: each gives the function a button or an action calls. A flow
// changes the data and says so; the tables follow the data themselves (the queries).

// "New employee": the employee form in a dialog; then a toast, and their page.
function useCreateEmployeeFlow() {
  const t = useTranslate();
  const service = useHrService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();
  const navigate = useNavigate();

  return async (data: HrData) => {
    let created: Employee | undefined;
    const result = await dialogs.form({
      title: t('employees.newTitle'),
      // Two columns (the person, the job): wide (2026-10-10).
      width: 'wide',
      content: (
        <EmployeeForm
          data={data}
          save={async ({ salary, onboarding, ...values }) =>
            void (created = await service.createEmployee(values, salary ?? 0, onboarding))}
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
  const service = useHrService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();

  return async (employee: Employee, data: HrData) => {
    const result = await dialogs.form({
      title: t('employees.editTitle'),
      width: 'wide',
      content: (
        <EmployeeForm
          data={data}
          employee={employee}
          save={async ({ salary: _salary, onboarding: _onboarding, ...values }) =>
            void (await service.updateEmployee(employee.id, values))}
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

// "New salary" of an employee from a date, in a form dialog, then a toast.
function useChangeSalaryFlow() {
  const t = useTranslate();
  const service = useHrService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();

  return async (employee: Employee, data: HrData) => {
    const today = todayDate();
    const result = await dialogs.form({
      title: t('salary.newTitle'),
      content: (
        <SalaryForm
          current={currentSalary(data.salaries, employee.id, today)}
          from={employee.startDate > today ? employee.startDate : `${addDays(today, 32).slice(0, 7)}-01`}
          save={async (values) => void (await service.addSalary({ ...values, employeeId: employee.id }))}
        />
      ),
      buttons: { confirm: t('common.save') },
    });

    if (result.canceled) {
      return;
    }

    await changed();
    toasts.success(t('salary.saved', { name: employee.name }));
  };
}

// The last day; then the offboarding checklist, if wanted and there is none yet.
function useEndEmploymentFlow() {
  const t = useTranslate();
  const service = useHrService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();
  const navigate = useNavigate();

  return async (employee: Employee, data: HrData) => {
    const hasOffboarding = data.checklists.some((checklist) =>
      checklist.employeeId === employee.id && checklist.kind === 'offboarding'
    );
    let checklistId: string | undefined;
    const result = await dialogs.form({
      title: t('employees.endTitle'),
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
      buttons: { confirm: t('common.save') },
    });

    if (result.canceled) {
      return;
    }

    await changed();
    toasts.success(t('employees.ended', { name: employee.name }));

    if (checklistId !== undefined) {
      void navigate(`/onboarding/${checklistId}`);
    }
  };
}

// "Upload" of documents of an employee: a category and files, in a form dialog, then a toast.
function useUploadDocumentsFlow() {
  const t = useTranslate();
  const service = useHrService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();

  return async (employee: Employee) => {
    const result = await dialogs.form({
      title: t('documents.uploadTitle'),
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
      buttons: { confirm: t('common.save') },
    });

    if (result.canceled) {
      return;
    }

    await changed();
    toasts.success(t('documents.saved', { name: employee.name }));
  };
}

// "Delete" of documents: a critical confirmation, then a toast (or the error).
function useRemoveDocumentsFlow() {
  const t = useTranslate();
  const service = useHrService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();

  return async (documents: readonly EmployeeDocument[]) => {
    const [first] = documents;
    const result = await dialogs.confirmCritical({
      title: t('documents.deleteTitle'),
      content: documents.length === 1 && first !== undefined
        ? t('documents.deleteOne', { name: first.name })
        : t('documents.deleteMany', { count: documents.length }),
      buttons: { confirm: t('common.delete') },
    });

    if (result.canceled) {
      return;
    }

    try {
      await service.removeDocuments(documents.map((document) => document.id));
      await changed();
      toasts.success(t('documents.deleted', { count: documents.length }));
    } catch (cause) {
      toasts.error(errorText(cause));
    }
  };
}

// "Download" of a document: not in the demo, a toast says so.
function useDownloadDocumentFlow() {
  const t = useTranslate();
  const toasts = useToast();

  return () => toasts.warn(t('documents.notInDemo'));
}
