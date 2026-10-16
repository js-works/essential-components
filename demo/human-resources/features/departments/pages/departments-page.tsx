import { Button, Loader, Stack, Tabs } from '@mantine/core';
import { useState } from 'react';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { appIcons } from '../../../shared/ui/icons.js';
import { PageHeader } from '../../../shared/ui/parts.js';
import { useHrData } from '../../hr/index.js';
import { DepartmentTable } from '../components/department-table.js';
import { OrgChart } from '../components/org-chart.js';
import { useCreateDepartmentFlow } from '../department-flows.js';

export { DepartmentsPage };

// The departments: an org chart (the tree from the top down), and a list. New, edit, delete.
function DepartmentsPage() {
  const t = useTranslate();
  const data = useHrData();
  const createDepartment = useCreateDepartmentFlow();
  const [tab, setTab] = useState<string | null>('chart');

  if (data === undefined) {
    return <Loader size="sm" />;
  }

  return (
    <Stack gap="md">
      <PageHeader
        title={t('departments.title')}
        subtitle={t('departments.subtitle', { count: data.departments.length })}
        actions={
          <Button size="xs" leftSection={appIcons.add} onClick={() => void createDepartment(data)}>
            {t('departments.new')}
          </Button>
        }
      />
      <Tabs value={tab} onChange={setTab} keepMounted={false}>
        <Tabs.List className="human-resources__tabs" mb="md">
          <Tabs.Tab value="chart" leftSection={appIcons.orgChart}>{t('departments.tabChart')}</Tabs.Tab>
          <Tabs.Tab value="list">{t('departments.tabList')}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="chart">
          <OrgChart data={data} />
        </Tabs.Panel>
        <Tabs.Panel value="list">
          <DepartmentTable data={data} />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
