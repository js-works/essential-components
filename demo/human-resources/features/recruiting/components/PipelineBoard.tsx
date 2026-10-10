import { ActionIcon, Anchor, Group, Menu, Stack, Text } from '@mantine/core';
import { useState } from 'react';
import type { DragEvent, ReactElement } from 'react';
import { Link } from 'react-router';
import { PIPELINE, STAGES } from '../../../domain';
import type { Candidate, HrData, Opening, Stage } from '../../../domain';
import { formatDate } from '../../../shared/lib/format';
import { useTranslate } from '../../../shared/lib/i18n';
import { appIcons } from '../../../shared/ui/icons';
import { EmployeeAvatar, Rating } from '../../../shared/ui/parts';
import { useRecruitingFlows } from '../flows';

export { PipelineBoard };

// The type of the dragged data: only the board's own cards are dropped on it.
const DRAG_TYPE = 'application/x-human-resources-candidate';

// The candidates of an opening as a board: a column per stage of the pipeline and one for the rejected, a card per
// candidate. A card is dragged into another column (into "Hired": the hire's dialog), or moved by its menu (the same
// for the keyboard). A hired candidate's card links to the employee and stays.
function PipelineBoard({ data, opening }: { data: HrData; opening: Opening }): ReactElement {
  const t = useTranslate();
  const flows = useRecruitingFlows();
  const [over, setOver] = useState<Stage | null>(null);
  const candidates = data.candidates.filter((candidate) => candidate.openingId === opening.id);

  const moveTo = (candidate: Candidate, stage: Stage) => {
    if (candidate.stage === stage || candidate.stage === 'hired') {
      return;
    }

    if (stage === 'hired') {
      void flows.hire(candidate, opening, data);
    } else {
      void flows.move([candidate], stage);
    }
  };

  const drop = (stage: Stage) => (event: DragEvent) => {
    event.preventDefault();
    setOver(null);

    const candidate = candidates.find((c) => c.id === event.dataTransfer.getData(DRAG_TYPE));

    if (candidate !== undefined) {
      moveTo(candidate, stage);
    }
  };

  return (
    <div className="human-resources__board">
      {STAGES.map((stage) => {
        const inStage = candidates
          .filter((candidate) => candidate.stage === stage)
          .sort((a, b) => b.rating - a.rating || a.applied.localeCompare(b.applied));

        return (
          <section
            key={stage}
            className="human-resources__board-column"
            data-stage={stage}
            data-over={over === stage || undefined}
            aria-label={t(`stage.${stage}`)}
            onDragOver={(event) => {
              if (event.dataTransfer.types.includes(DRAG_TYPE)) {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
                setOver(stage);
              }
            }}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setOver(null);
              }
            }}
            onDrop={drop(stage)}
          >
            <Group justify="space-between" className="human-resources__board-head" wrap="nowrap">
              <Text size="xs" fw={700} tt="uppercase" c="dimmed">{t(`stage.${stage}`)}</Text>
              <Text size="xs" c="dimmed" className="human-resources__figures">{inStage.length}</Text>
            </Group>
            <Stack gap={8}>
              {inStage.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onMove={(to) => moveTo(candidate, to)}
                />
              ))}
              {inStage.length === 0 && <Text size="xs" c="dimmed" ta="center" py="sm">{t('candidates.none')}</Text>}
            </Stack>
          </section>
        );
      })}
    </div>
  );
}

function CandidateCard({ candidate, onMove }: {
  candidate: Candidate;
  onMove: (stage: Stage) => void;
}): ReactElement {
  const t = useTranslate();
  const flows = useRecruitingFlows();
  const hired = candidate.stage === 'hired';

  return (
    <article
      className="human-resources__candidate"
      draggable={!hired}
      data-hired={hired || undefined}
      onDragStart={(event) => {
        event.dataTransfer.setData(DRAG_TYPE, candidate.id);
        event.dataTransfer.effectAllowed = 'move';
      }}
    >
      <Group gap={8} wrap="nowrap" align="flex-start">
        <EmployeeAvatar name={candidate.name} size={28} />
        <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
          {hired && candidate.employeeId !== null
            ? (
              <Anchor component={Link} to={`/employees/${candidate.employeeId}`} size="sm" fw={500} truncate>
                {candidate.name}
              </Anchor>
            )
            : <Text size="sm" fw={500} truncate>{candidate.name}</Text>}
          <Text size="xs" c="dimmed" truncate>
            {`${t(`source.${candidate.source}`)} · ${formatDate(candidate.applied)}`}
          </Text>
          <Rating value={candidate.rating} />
        </Stack>
        {!hired && (
          <Menu position="bottom-end" shadow="md" width={200} floatingStrategy="fixed">
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                aria-label={t('candidates.actions', { name: candidate.name })}
              >
                {appIcons.more}
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={appIcons.edit} onClick={() => void flows.editCandidate(candidate)}>
                {t('common.edit')}
              </Menu.Item>
              <Menu.Divider />
              <Menu.Label>{t('candidates.moveTo')}</Menu.Label>
              {PIPELINE.filter((stage) => stage !== candidate.stage).map((stage) => (
                <Menu.Item
                  key={stage}
                  leftSection={stage === 'hired' ? appIcons.hire : appIcons.move}
                  onClick={() => onMove(stage)}
                >
                  {stage === 'hired' ? t('hire.action') : t(`stage.${stage}`)}
                </Menu.Item>
              ))}
              {candidate.stage !== 'rejected' && (
                <>
                  <Menu.Divider />
                  <Menu.Item color="danger" leftSection={appIcons.reject} onClick={() => onMove('rejected')}>
                    {t('candidates.reject')}
                  </Menu.Item>
                </>
              )}
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>
      {candidate.note !== '' && <Text size="xs" mt={6} lineClamp={2}>{candidate.note}</Text>}
    </article>
  );
}
