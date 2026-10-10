import { Alert, Loader, Stack, Tabs } from '@mantine/core';
import { useState } from 'react';
import type { ReactElement } from 'react';
import { certificateRequired, membersOf } from '../../../domain';
import { useTranslate } from '../../../shared/lib/i18n';
import { appIcons } from '../../../shared/ui/icons';
import { PageHeader } from '../../../shared/ui/parts';
import { useTimeData } from '../../tracker';
import { useViewer } from '../../viewer';
import { SickTable } from '../components/SickTable';

export { SickPage };

// Sick calls: the viewer's own (a reminder when a doctor's note is missing); a team lead also sees their team's.
function SickPage(): ReactElement {
  const t = useTranslate();
  const data = useTimeData();
  const viewer = useViewer();
  const [tab, setTab] = useState<string | null>('mine');
  const self = data?.employees.find((employee) => employee.id === viewer.employeeId);

  if (data === undefined || self === undefined) {
    return <Loader size="sm" />;
  }

  const missing = data.sick.filter((note) => note.employeeId === self.id && certificateRequired(note)).length;
  const team = membersOf(data.employees, self.teamId).filter((member) => member.id !== self.id);
  const mine = (
    <Stack gap="md">
      {missing > 0 && (
        <Alert variant="light" color="danger" title={t('sick.missingTitle')}>
          {t('sick.missingText', { count: missing })}
        </Alert>
      )}
      <SickTable employees={[self]} mine title={t('sick.mine')} subtitle={t('sick.mineSubtitle')} />
    </Stack>
  );

  const header = <PageHeader title={t('nav.sick')} subtitle={t('sick.subtitle')} />;

  if (!viewer.isLead) {
    return (
      <Stack gap="md">
        {header}
        {mine}
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      {header}
      <Tabs value={tab} onChange={setTab} keepMounted={false}>
        <Tabs.List className="time-tracker__tabs" mb="md">
          <Tabs.Tab value="mine" leftSection={appIcons.sick}>{t('sick.mine')}</Tabs.Tab>
          <Tabs.Tab value="team" leftSection={appIcons.employees}>{t('sick.team')}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="mine">{mine}</Tabs.Panel>
        <Tabs.Panel value="team">
          <SickTable employees={team} mine={false} title={t('sick.team')} subtitle={t('sick.teamSubtitle')} />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
