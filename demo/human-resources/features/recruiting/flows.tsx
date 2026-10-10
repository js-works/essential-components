import { useNavigate } from 'react-router';
import { useDialogs, useToast } from '../../../../packages/overlays/src/main/bindings/react';
import type { Candidate, Employee, HrData, Opening, Stage } from '../../domain';
import { errorText } from '../../shared/lib/errorText';
import { translate } from '../../shared/lib/i18n';
import { useChanged, useHrService } from '../hr';
import { CandidateForm, HireForm, OpeningForm } from './components/forms';

export { useRecruitingFlows };

// The changes of recruiting: openings (new, then its page; edit), candidates (add, edit, move to a stage, reject), and
// the hire (the candidate becomes an employee: then their page).
function useRecruitingFlows() {
  const service = useHrService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();
  const navigate = useNavigate();

  const createOpening = async (data: HrData) => {
    let created: Opening | undefined;
    const result = await dialogs.form({
      title: translate('openings.newTitle'),
      content: (
        <OpeningForm
          data={data}
          save={async (values) => void (created = await service.createOpening(values))}
        />
      ),
      buttons: { confirm: translate('common.create') },
    });

    if (!result.canceled && created !== undefined) {
      await changed();
      toasts.success(translate('openings.created', { title: created.title }));
      void navigate(`/recruiting/${created.id}`);
    }
  };

  const editOpening = async (opening: Opening, data: HrData) => {
    const result = await dialogs.form({
      title: translate('openings.editTitle'),
      content: (
        <OpeningForm
          data={data}
          opening={opening}
          save={async (values) => void (await service.updateOpening(opening.id, values))}
        />
      ),
      buttons: { confirm: translate('common.save') },
    });

    if (!result.canceled) {
      await changed();
      toasts.success(translate('openings.saved', { title: opening.title }));
    }
  };

  const addCandidate = async (opening: Opening) => {
    let name = '';
    const result = await dialogs.form({
      title: translate('candidates.newTitle'),
      content: (
        <CandidateForm
          save={async (values) =>
            void (name = (await service.createCandidate({ ...values, openingId: opening.id })).name)}
        />
      ),
      buttons: { confirm: translate('common.add') },
    });

    if (!result.canceled) {
      await changed();
      toasts.success(translate('candidates.created', { name, title: opening.title }));
    }
  };

  const editCandidate = async (candidate: Candidate) => {
    const result = await dialogs.form({
      title: translate('candidates.editTitle'),
      content: (
        <CandidateForm
          candidate={candidate}
          save={async (values) =>
            void (await service.updateCandidate(candidate.id, { ...values, openingId: candidate.openingId }))}
        />
      ),
      buttons: { confirm: translate('common.save') },
    });

    if (!result.canceled) {
      await changed();
      toasts.success(translate('candidates.saved', { name: candidate.name }));
    }
  };

  // To another stage (not `hired`: that is `hire`). A hired one stays (the server refuses it: a toast).
  const move = async (candidates: readonly Candidate[], stage: Exclude<Stage, 'hired'>) => {
    const moving = candidates.filter((candidate) => candidate.stage !== stage);

    if (moving.length === 0) {
      return;
    }

    try {
      await service.moveCandidates(moving.map((candidate) => candidate.id), stage);
      await changed();

      const [first] = moving;
      const stageName = translate(`stage.${stage}`);

      toasts.success(
        moving.length === 1 && first !== undefined
          ? translate('candidates.movedOne', { name: first.name, stage: stageName })
          : translate('candidates.movedMany', { count: moving.length, stage: stageName }),
      );
    } catch (cause) {
      toasts.error(errorText(cause));
    }
  };

  const hire = async (candidate: Candidate, opening: Opening, data: HrData) => {
    let employee: Employee | undefined;
    const result = await dialogs.form({
      title: translate('hire.title', { name: candidate.name }),
      content: (
        <HireForm
          data={data}
          candidate={candidate}
          opening={opening}
          save={async (values) => void (employee = await service.hireCandidate(candidate.id, values))}
        />
      ),
      buttons: { confirm: translate('hire.confirm') },
    });

    if (!result.canceled && employee !== undefined) {
      await changed();
      toasts.success(translate('hire.done', { name: candidate.name }));
      void navigate(`/employees/${employee.id}`);
    }
  };

  return { createOpening, editOpening, addCandidate, editCandidate, move, hire };
}
