import { Loader, Stack, Tabs } from '@mantine/core';
import { useState } from 'react';
import type { ReactElement } from 'react';
import { membersOf, todayDate, vacationBalance } from '../../../domain';
import { useTranslate } from '../../../shared/lib/i18n';
import { appIcons } from '../../../shared/ui/icons';
import { PageHeader } from '../../../shared/ui/parts';
import { useTimeData } from '../../tracker';
import { useViewer } from '../../viewer';
import { BalanceCards } from '../components/BalanceCards';
import { LeaveTable } from '../components/LeaveTable';

export { LeavePage };

// Leave: the viewer's vacation of this year and their requests; a team lead also sees the requests of their team, to
// approve or reject them.
function LeavePage(): ReactElement {
  const t = useTranslate();
  const data = useTimeData();
  const viewer = useViewer();
  const [tab, setTab] = useState<string | null>('mine');
  const self = data?.employees.find((employee) => employee.id === viewer.employeeId);

  if (data === undefined || self === undefined) {
    return <Loader size="sm" />;
  }

  const today = todayDate();
  const year = Number(today.slice(0, 4));
  const team = membersOf(data.employees, self.teamId).filter((member) => member.id !== self.id);
  const mine = (
    <Stack gap="md">
      <BalanceCards balance={vacationBalance(self, data.leave, year, today, data.holidays)} year={year} />
      <LeaveTable data={data} employees={[self]} mine title={t('leave.mine')} subtitle={t('leave.mineSubtitle')} />
    </Stack>
  );

  const header = <PageHeader title={t('leave.title')} subtitle={t('leave.subtitle')} />;

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
          <Tabs.Tab value="mine" leftSection={appIcons.leave}>{t('leave.mine')}</Tabs.Tab>
          <Tabs.Tab value="team" leftSection={appIcons.employees}>{t('leave.team')}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="mine">{mine}</Tabs.Panel>
        <Tabs.Panel value="team">
          <LeaveTable
            data={data}
            employees={team}
            mine={false}
            title={t('leave.team')}
            subtitle={t('leave.teamSubtitle')}
          />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
