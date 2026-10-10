import { useDialogs, useToast } from '../../../../packages/overlays/src/main/bindings/react';
import { todayDate } from '../../domain';
import type { Employee, SickNote } from '../../domain';
import { translate } from '../../shared/lib/i18n';
import { useChanged, useTimeService } from '../tracker';
import { CertificateForm, SickForm } from './components/SickForm';

export { useSickFlows };

// The changes of sick calls: report one (from today), change its end or note, upload the doctor's note.
function useSickFlows() {
  const service = useTimeService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();

  const report = async (employee: Employee) => {
    const today = todayDate();
    const result = await dialogs.form({
      title: translate('sick.reportTitle'),
      content: (
        <SickForm
          initial={{ from: today, to: today }}
          save={async (values) => void (await service.reportSick({ ...values, employeeId: employee.id }))}
        />
      ),
      buttons: { confirm: translate('sick.reportConfirm') },
    });

    if (!result.canceled) {
      await changed();
      toasts.success(translate('sick.reported'));
    }
  };

  const edit = async (note: SickNote) => {
    const result = await dialogs.form({
      title: translate('sick.editTitle'),
      content: (
        <SickForm
          initial={note}
          save={async (values) => void (await service.updateSick(note.id, { ...values, employeeId: note.employeeId }))}
        />
      ),
      buttons: { confirm: translate('common.save') },
    });

    if (!result.canceled) {
      await changed();
      toasts.success(translate('sick.saved'));
    }
  };

  const uploadCertificate = async (note: SickNote) => {
    const result = await dialogs.form({
      title: translate('sick.certificateTitle'),
      content: (
        <CertificateForm
          upload={(file, context) => service.uploadFile(file, context)}
          save={async ({ files }) => {
            const fileId = files[0]?.result;

            if (fileId !== undefined) {
              await service.attachCertificate(note.id, fileId);
            }
          }}
        />
      ),
      buttons: { confirm: translate('common.save') },
    });

    if (!result.canceled) {
      await changed();
      toasts.success(translate('sick.certificateSaved'));
    }
  };

  return { report, edit, uploadCertificate };
}
