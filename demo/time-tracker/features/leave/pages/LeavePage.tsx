import { Loader, Stack, Tabs } from '@mantine/core';
import { useState } from 'react';
import type { ReactElement } from 'react';
import type { DataTableComponent } from '../../../../../packages/data-table/src/react';
import { membersOf, todayDate, vacationBalance } from '../../../domain';
import { useTranslate } from '../../../shared/lib/i18n';
import { appIcons } from '../../../shared/ui/icons';
import { PageHeader } from '../../../shared/ui/parts';
import { sharedBy, useSavedFilters } from '../../../shared/ui/savedFilters';
import { useTimeData } from '../../tracker';
import { useViewer } from '../../viewer';
import { BalanceCards } from '../components/BalanceCards';
import { LeaveTable } from '../components/LeaveTable';

export { LeavePage };

// The colleagues' shared filters of the team's requests (2026-10-11, the user's wish: to show sharing).
const COLLEAGUES_FILTERS: readonly DataTableComponent.SavedFilter[] = [
  sharedBy('Julia Wagner', 'Pending requests', { status: ['pending'] }),
  sharedBy('Felix Braun', 'Vacation', { type: ['vacation'] }),
];

// Leave: the viewer's vacation of this year and their requests; a team lead also sees the requests of their team, to
// approve or reject them.
function LeavePage(): ReactElement {
  const savedFilters = useSavedFilters('time-tracker:saved-filters:team-leave', COLLEAGUES_FILTERS);
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
            savedFilters={savedFilters}
          />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
