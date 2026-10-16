import { useDialogs, useToast } from '@local/overlays/react';
import { useNavigate } from 'react-router';
import type { Candidate, Employee, HrData, Opening, Stage } from '../../domain/index.js';
import { errorText } from '../../shared/lib/error-text.js';
import { useTranslate } from '../../shared/lib/i18n/index.js';
import { useChanged, useHrService } from '../hr/index.js';
import { CandidateForm, HireForm, OpeningForm } from './components/forms.js';

export {
  useAddCandidateFlow,
  useCreateOpeningFlow,
  useEditCandidateFlow,
  useEditOpeningFlow,
  useHireFlow,
  useMoveCandidatesFlow,
};

// The flows of recruiting (openings and candidates), one hook per use case: each gives the function a button or an action calls. A flow
// changes the data and says so; the tables follow the data themselves (the queries).

// "New opening", in a form dialog; then a toast, and its page.
function useCreateOpeningFlow() {
  const t = useTranslate();
  const service = useHrService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();
  const navigate = useNavigate();

  return async (data: HrData) => {
    let created: Opening | undefined;
    const result = await dialogs.form({
      title: t('openings.newTitle'),
      content: (
        <OpeningForm
          data={data}
          save={async (values) => void (created = await service.createOpening(values))}
        />
      ),
      buttons: { confirm: t('common.create') },
    });

    if (result.canceled || created === undefined) {
      return;
    }

    await changed();
    toasts.success(t('openings.created', { title: created.title }));
    void navigate(`/recruiting/${created.id}`);
  };
}

// "Edit" of an opening, in a form dialog, then a toast.
function useEditOpeningFlow() {
  const t = useTranslate();
  const service = useHrService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();

  return async (opening: Opening, data: HrData) => {
    const result = await dialogs.form({
      title: t('openings.editTitle'),
      content: (
        <OpeningForm
          data={data}
          opening={opening}
          save={async (values) => void (await service.updateOpening(opening.id, values))}
        />
      ),
      buttons: { confirm: t('common.save') },
    });

    if (result.canceled) {
      return;
    }

    await changed();
    toasts.success(t('openings.saved', { title: opening.title }));
  };
}

// "New candidate" of an opening, in a form dialog, then a toast.
function useAddCandidateFlow() {
  const t = useTranslate();
  const service = useHrService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();

  return async (opening: Opening) => {
    let name = '';
    const result = await dialogs.form({
      title: t('candidates.newTitle'),
      content: (
        <CandidateForm
          save={async (values) =>
            void (name = (await service.createCandidate({ ...values, openingId: opening.id })).name)}
        />
      ),
      buttons: { confirm: t('common.add') },
    });

    if (result.canceled) {
      return;
    }

    await changed();
    toasts.success(t('candidates.created', { name, title: opening.title }));
  };
}

// "Edit" of a candidate, in a form dialog, then a toast.
function useEditCandidateFlow() {
  const t = useTranslate();
  const service = useHrService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();

  return async (candidate: Candidate) => {
    const result = await dialogs.form({
      title: t('candidates.editTitle'),
      content: (
        <CandidateForm
          candidate={candidate}
          save={async (values) =>
            void (await service.updateCandidate(candidate.id, { ...values, openingId: candidate.openingId }))}
        />
      ),
      buttons: { confirm: t('common.save') },
    });

    if (result.canceled) {
      return;
    }

    await changed();
    toasts.success(t('candidates.saved', { name: candidate.name }));
  };
}

// To another stage (not `hired`: that is `hire`). A hired one stays (the server refuses it: a toast).
function useMoveCandidatesFlow() {
  const t = useTranslate();
  const service = useHrService();
  const toasts = useToast();
  const changed = useChanged();

  return async (candidates: readonly Candidate[], stage: Exclude<Stage, 'hired'>) => {
    const moving = candidates.filter((candidate) => candidate.stage !== stage);

    if (moving.length === 0) {
      return;
    }

    try {
      await service.moveCandidates(moving.map((candidate) => candidate.id), stage);
      await changed();

      const [first] = moving;
      const stageName = t(`stage.${stage}`);

      toasts.success(
        moving.length === 1 && first !== undefined
          ? t('candidates.movedOne', { name: first.name, stage: stageName })
          : t('candidates.movedMany', { count: moving.length, stage: stageName }),
      );
    } catch (cause) {
      toasts.error(errorText(cause));
    }
  };
}

// "Hire" of a candidate: the hire's form (the first salary, the onboarding checklist if wanted), then a toast.
function useHireFlow() {
  const t = useTranslate();
  const service = useHrService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();
  const navigate = useNavigate();

  return async (candidate: Candidate, opening: Opening, data: HrData) => {
    let employee: Employee | undefined;
    const result = await dialogs.form({
      title: t('hire.title', { name: candidate.name }),
      content: (
        <HireForm
          data={data}
          candidate={candidate}
          opening={opening}
          save={async (values) => void (employee = await service.hireCandidate(candidate.id, values))}
        />
      ),
      buttons: { confirm: t('hire.confirm') },
    });

    if (result.canceled || employee === undefined) {
      return;
    }

    await changed();
    toasts.success(t('hire.done', { name: candidate.name }));
    void navigate(`/employees/${employee.id}`);
  };
}
