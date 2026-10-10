import { useDialogs, useToast } from '../../../../packages/overlays/src/main/bindings/react';
import type { Department, HrData } from '../../domain';
import { errorText } from '../../shared/lib/errorText';
import { translate } from '../../shared/lib/i18n';
import { useChanged, useHrService } from '../hr';
import { DepartmentForm } from './components/DepartmentForm';

export { useDepartmentFlows };

// The changes of departments: a new one (below another, if given), edit one, delete an empty one (the server refuses
// one with employees or departments below it: a warning says why).
function useDepartmentFlows() {
  const service = useHrService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();

  const create = async (data: HrData, parentId?: string) => {
    let name = '';
    const result = await dialogs.form({
      title: translate('departments.newTitle'),
      content: (
        <DepartmentForm
          data={data}
          parentId={parentId}
          save={async (values) => void (name = (await service.createDepartment(values)).name)}
        />
      ),
      buttons: { confirm: translate('common.create') },
    });

    if (!result.canceled) {
      await changed();
      toasts.success(translate('departments.created', { name }));
    }
  };

  const edit = async (department: Department, data: HrData) => {
    const result = await dialogs.form({
      title: translate('departments.editTitle'),
      content: (
        <DepartmentForm
          data={data}
          department={department}
          save={async (values) => void (await service.updateDepartment(department.id, values))}
        />
      ),
      buttons: { confirm: translate('common.save') },
    });

    if (!result.canceled) {
      await changed();
      toasts.success(translate('departments.saved', { name: department.name }));
    }
  };

  const remove = async (department: Department) => {
    const scope = dialogs.open();

    try {
      const result = await scope.confirmCritical({
        title: translate('departments.deleteTitle'),
        content: translate('departments.deleteText', { name: department.name }),
        buttons: { confirm: translate('common.delete') },
      });

      if (result.canceled) {
        return;
      }

      try {
        await service.removeDepartment(department.id);
      } catch (cause) {
        scope.dispose();
        await dialogs.warn({ title: translate('departments.notDeleted'), content: errorText(cause) });
        return;
      }
    } finally {
      scope.dispose();
    }

    await changed();
    toasts.success(translate('departments.deleted', { name: department.name }));
  };

  return { create, edit, remove };
}
