import { useDialogs, useToast } from '@local/overlays/react';
import { todayDate } from '../../domain/index.js';
import type { Employee, SickNote } from '../../domain/index.js';
import { useTranslate } from '../../shared/lib/i18n/index.js';
import { useChanged, useTimeService } from '../tracker/index.js';
import { CertificateForm, SickForm } from './components/sick-form.js';

export { useEditSickNoteFlow, useReportSickFlow, useUploadCertificateFlow };

// The flows of sick calls, one hook per use case: each gives the function a button or an action calls. A flow
// changes the data and says so; the tables follow the data themselves (the queries).

// "Report sick": a sick call of the employee, in a form dialog, then a toast.
function useReportSickFlow() {
  const t = useTranslate();
  const service = useTimeService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();

  return async (employee: Employee) => {
    const today = todayDate();
    const result = await dialogs.form({
      title: t('sick.reportTitle'),
      content: (
        <SickForm
          initial={{ from: today, to: today }}
          save={async (values) => void (await service.reportSick({ ...values, employeeId: employee.id }))}
        />
      ),
      buttons: { confirm: t('sick.reportConfirm') },
    });

    if (result.canceled) {
      return;
    }

    await changed();
    toasts.success(t('sick.reported'));
  };
}

// "Change" of a sick call (its days, its note), in a form dialog, then a toast.
function useEditSickNoteFlow() {
  const t = useTranslate();
  const service = useTimeService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();

  return async (note: SickNote) => {
    const result = await dialogs.form({
      title: t('sick.editTitle'),
      content: (
        <SickForm
          initial={note}
          save={async (values) => void (await service.updateSick(note.id, { ...values, employeeId: note.employeeId }))}
        />
      ),
      buttons: { confirm: t('common.save') },
    });

    if (result.canceled) {
      return;
    }

    await changed();
    toasts.success(t('sick.saved'));
  };
}

// "Upload" of the doctor's note of a sick call, in a form dialog, then a toast.
function useUploadCertificateFlow() {
  const t = useTranslate();
  const service = useTimeService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();

  return async (note: SickNote) => {
    const result = await dialogs.form({
      title: t('sick.certificateTitle'),
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
      buttons: { confirm: t('common.save') },
    });

    if (result.canceled) {
      return;
    }

    await changed();
    toasts.success(t('sick.certificateSaved'));
  };
}
