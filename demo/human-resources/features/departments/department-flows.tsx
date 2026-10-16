import { useDialogs, useToast } from '@local/overlays/react';
import type { Department, HrData } from '../../domain/index.js';
import { errorText } from '../../shared/lib/error-text.js';
import { useTranslate } from '../../shared/lib/i18n/index.js';
import { useChanged, useHrService } from '../hr/index.js';
import { DepartmentForm } from './components/department-form.js';

export { useCreateDepartmentFlow, useDeleteDepartmentFlow, useEditDepartmentFlow };

// The flows of the departments, one hook per use case: each gives the function a button or an action calls. A flow
// changes the data and says so; the tables follow the data themselves (the queries).

// "New department" (below one, when given), in a form dialog, then a toast.
function useCreateDepartmentFlow() {
  const t = useTranslate();
  const service = useHrService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();

  return async (data: HrData, parentId?: string) => {
    let name = '';
    const result = await dialogs.form({
      title: t('departments.newTitle'),
      content: (
        <DepartmentForm
          data={data}
          parentId={parentId}
          save={async (values) => void (name = (await service.createDepartment(values)).name)}
        />
      ),
      buttons: { confirm: t('common.create') },
    });

    if (result.canceled) {
      return;
    }

    await changed();
    toasts.success(t('departments.created', { name }));
  };
}

// "Edit" of a department, in a form dialog, then a toast.
function useEditDepartmentFlow() {
  const t = useTranslate();
  const service = useHrService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();

  return async (department: Department, data: HrData) => {
    const result = await dialogs.form({
      title: t('departments.editTitle'),
      content: (
        <DepartmentForm
          data={data}
          department={department}
          save={async (values) => void (await service.updateDepartment(department.id, values))}
        />
      ),
      buttons: { confirm: t('common.save') },
    });

    if (result.canceled) {
      return;
    }

    await changed();
    toasts.success(t('departments.saved', { name: department.name }));
  };
}

// "Delete" of a department: a critical confirmation; the server refuses it while it has employees or departments below
// it (a note says why), else a toast.
function useDeleteDepartmentFlow() {
  const t = useTranslate();
  const service = useHrService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();

  return async (department: Department) => {
    using scope = dialogs.open();
    const result = await scope.confirmCritical({
      title: t('departments.deleteTitle'),
      content: t('departments.deleteText', { name: department.name }),
      buttons: { confirm: t('common.delete') },
    });

    if (result.canceled) {
      return;
    }

    try {
      await service.removeDepartment(department.id);
    } catch (cause) {
      scope.dispose();
      await dialogs.warn({ title: t('departments.notDeleted'), content: errorText(cause) });
      return;
    }

    await changed();
    toasts.success(t('departments.deleted', { name: department.name }));
  };
}
