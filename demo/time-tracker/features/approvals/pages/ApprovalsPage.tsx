import { Badge, Loader, Stack, Tabs } from '@mantine/core';
import { useState } from 'react';
import type { ReactElement } from 'react';
import { membersOf } from '../../../domain';
import { useTranslate } from '../../../shared/lib/i18n';
import { appIcons } from '../../../shared/ui/icons';
import { LeadOnly, PageHeader } from '../../../shared/ui/parts';
import { LeaveTable } from '../../leave';
import { CorrectionTable } from '../../timesheet';
import { useTimeData } from '../../tracker';
import { useViewer } from '../../viewer';

export { ApprovalsPage };

// What a team lead has to decide: the pending leave requests and corrections of their team, each in a tab with its
// number.
function ApprovalsPage(): ReactElement {
  const t = useTranslate();
  const data = useTimeData();
  const viewer = useViewer();
  const [tab, setTab] = useState<string | null>('leave');

  if (!viewer.isLead) {
    return <LeadOnly />;
  }

  const self = data?.employees.find((employee) => employee.id === viewer.employeeId);

  if (data === undefined || self === undefined) {
    return <Loader size="sm" />;
  }

  const team = membersOf(data.employees, self.teamId).filter((member) => member.id !== self.id);
  const ids = team.map((member) => member.id);
  const leave = data.leave.filter((request) => ids.includes(request.employeeId) && request.status === 'pending');
  const corrections = data.corrections.filter((correction) =>
    ids.includes(correction.employeeId) && correction.status === 'pending'
  );
  const count = (value: number) => value > 0 && <Badge size="sm" variant="filled" circle={value < 10}>{value}</Badge>;

  return (
    <Stack gap="md">
      <PageHeader title={t('nav.approvals')} subtitle={t('approvals.subtitle')} />
      <Tabs value={tab} onChange={setTab} keepMounted={false}>
        <Tabs.List className="time-tracker__tabs" mb="md">
          <Tabs.Tab value="leave" leftSection={appIcons.leave} rightSection={count(leave.length)}>
            {t('approvals.leave')}
          </Tabs.Tab>
          <Tabs.Tab value="corrections" leftSection={appIcons.correction} rightSection={count(corrections.length)}>
            {t('approvals.corrections')}
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="leave">
          <LeaveTable
            data={data}
            employees={team}
            mine={false}
            pendingOnly
            title={t('approvals.leaveTitle')}
            subtitle={t('approvals.leaveSubtitle')}
          />
        </Tabs.Panel>
        <Tabs.Panel value="corrections">
          <CorrectionTable
            data={data}
            employees={team}
            title={t('approvals.correctionsTitle')}
            subtitle={t('approvals.correctionsSubtitle')}
          />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
