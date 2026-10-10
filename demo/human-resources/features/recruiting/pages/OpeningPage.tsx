import { Button, Group, Loader, Paper, SimpleGrid, Stack, Tabs, Text } from '@mantine/core';
import { useState } from 'react';
import type { ReactElement } from 'react';
import { useParams } from 'react-router';
import { daysBetween, isInProcess, todayDate } from '../../../domain';
import { formatDate } from '../../../shared/lib/format';
import { useTranslate } from '../../../shared/lib/i18n';
import { appIcons } from '../../../shared/ui/icons';
import { Detail, EmployeeLabel, OpeningStatusBadge, PageHeader } from '../../../shared/ui/parts';
import { departmentName, employeeOf, useHrData } from '../../hr';
import { CandidatesTable } from '../components/CandidatesTable';
import { PipelineBoard } from '../components/PipelineBoard';
import { useRecruitingFlows } from '../flows';

export { OpeningPage };

// An opening: its facts, then its candidates as a board (Pipeline) or a table (Candidates), and its description.
function OpeningPage(): ReactElement {
  const t = useTranslate();
  const { openingId } = useParams();
  const data = useHrData();
  const flows = useRecruitingFlows();
  const [tab, setTab] = useState<string | null>('pipeline');

  if (data === undefined) {
    return <Loader size="sm" />;
  }

  const opening = data.openings.find((candidate) => candidate.id === openingId);

  if (opening === undefined) {
    return <Text c="dimmed">{t('openings.notFound')}</Text>;
  }

  const candidates = data.candidates.filter((candidate) => candidate.openingId === opening.id);
  const manager = employeeOf(data, opening.hiringManagerId);
  const hired = candidates.filter((candidate) => candidate.stage === 'hired').length;

  return (
    <Stack gap="md">
      <PageHeader
        title={opening.title}
        badges={<OpeningStatusBadge status={opening.status} />}
        subtitle={[
          departmentName(data, opening.departmentId),
          opening.location,
          t(`employmentType.${opening.employmentType}`),
        ]
          .filter(Boolean)
          .join(' · ')}
        actions={
          <>
            <Button
              variant="default"
              size="xs"
              leftSection={appIcons.edit}
              onClick={() => void flows.editOpening(opening, data)}
            >
              {t('common.edit')}
            </Button>
            <Button size="xs" leftSection={appIcons.addEmployee} onClick={() => void flows.addCandidate(opening)}>
              {t('candidates.new')}
            </Button>
          </>
        }
      />
      <Paper withBorder p="md" radius="sm">
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
          <Detail label={t('openingForm.hiringManagerId')}>
            {manager === undefined ? '' : <EmployeeLabel employee={manager} />}
          </Detail>
          <Detail label={t('openings.opened')}>
            {`${formatDate(opening.opened)} · ${
              t('openings.daysOpen', { count: daysBetween(opening.opened, todayDate()) })
            }`}
          </Detail>
          <Detail label={t('openings.inProcess')}>
            {`${candidates.filter(isInProcess).length} / ${candidates.length}`}
          </Detail>
          <Detail label={t('openings.filled')}>{`${hired} / ${opening.positions}`}</Detail>
        </SimpleGrid>
      </Paper>
      <Tabs value={tab} onChange={setTab} keepMounted={false}>
        <Tabs.List className="human-resources__tabs" mb="md">
          <Tabs.Tab value="pipeline">{t('openings.tabPipeline')}</Tabs.Tab>
          <Tabs.Tab value="candidates">{t('openings.tabCandidates', { count: candidates.length })}</Tabs.Tab>
          <Tabs.Tab value="description">{t('openings.tabDescription')}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="pipeline">
          <Stack gap="xs">
            <Text size="xs" c="dimmed">{t('openings.boardHint')}</Text>
            <PipelineBoard data={data} opening={opening} />
          </Stack>
        </Tabs.Panel>
        <Tabs.Panel value="candidates">
          <CandidatesTable data={data} opening={opening} />
        </Tabs.Panel>
        <Tabs.Panel value="description">
          <Paper withBorder p="md" radius="sm" maw={720}>
            <Group>
              <Text size="sm" style={{ whiteSpace: 'pre-line' }} c={opening.description === '' ? 'dimmed' : undefined}>
                {opening.description === '' ? t('openings.noDescription') : opening.description}
              </Text>
            </Group>
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
