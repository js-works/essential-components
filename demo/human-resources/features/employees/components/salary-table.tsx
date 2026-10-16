import { useDataTableController } from '@local/data-table/react';
import type { TableActions, TableColumns } from '@local/data-table/react';
import { Badge, SimpleGrid, Stack, Text } from '@mantine/core';
import { currentSalary, todayDate } from '../../../domain/index.js';
import type { Employee, HrData, SalaryChange } from '../../../domain/index.js';
import { formatDate, formatMoney, formatNumber } from '../../../shared/lib/format.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { DataTable } from '../../../shared/ui/data-table.js';
import { StatCard } from '../../../shared/ui/parts.js';
import { newAction } from '../../../shared/ui/table-actions.js';
import { useTableSource } from '../../hr/index.js';
import { useChangeSalaryFlow } from '../employee-flows.js';

export { SalaryTable };

type SalaryRow = SalaryChange & {
  // The change to the one before, in percent (none for the first).
  change: number | null;
  current: boolean;
};

function salaryRows(data: HrData, employeeId: string): SalaryRow[] {
  const today = todayDate();
  const current = currentSalary(data.salaries, employeeId, today);
  const changes = data.salaries
    .filter((change) => change.employeeId === employeeId)
    .sort((a, b) => a.from.localeCompare(b.from));

  return changes.map((change, index) => {
    const before = changes[index - 1];

    return {
      ...change,
      change: before === undefined ? null : ((change.amount - before.amount) / before.amount) * 100,
      current: change.id === current?.id,
    };
  });
}

function useColumns(): TableColumns<SalaryRow> {
  const t = useTranslate();

  return [
    {
      key: 'from',
      header: t('salary.from'),
      width: 1.4,
      sortable: true,
      render: (row) => formatDate(row.from),
    },
    {
      key: 'amount',
      header: t('salary.amount'),
      width: 1.4,
      align: 'end',
      sortable: true,
      render: (row) => <span className="human-resources__figures">{formatMoney(row.amount)}</span>,
    },
    {
      key: 'change',
      header: t('salary.change'),
      width: 1,
      align: 'end',
      sortable: true,
      render: (row) =>
        row.change === null
          ? ''
          : (
            <span className="human-resources__figures">
              {`${row.change > 0 ? '+' : ''}${formatNumber(row.change, 1)} %`}
            </span>
          ),
    },
    {
      key: 'reason',
      header: t('salary.reason'),
      width: 1.6,
      sortable: true,
      render: (row) => (
        <>
          {t(`salaryReason.${row.reason}`)}
          {row.current && <Badge variant="light" ml="xs">{t('salary.currentBadge')}</Badge>}
        </>
      ),
    },
    { key: 'note', header: t('salary.note'), width: 3 },
  ];
}

function useActions(employee: Employee, data: HrData): TableActions<SalaryRow> {
  const t = useTranslate();
  const changeSalary = useChangeSalaryFlow();

  return [newAction(t('salary.new'), () => changeSalary(employee, data))];
}

// The salary of an employee: today's (with the change to the one before), and its history, the latest first. A new
// salary from a date on (a raise, a promotion).
function SalaryTable({ data, employee }: { data: HrData; employee: Employee }) {
  const t = useTranslate();
  const tableCtrl = useDataTableController<SalaryRow>();
  const columns = useColumns();
  const actions = useActions(employee, data);
  const source = useTableSource<SalaryRow>(
    `salaries:${employee.id}`,
    (all) => salaryRows(all, employee.id),
    { search: ['note'] },
    tableCtrl.reload,
  );
  const rows = salaryRows(data, employee.id);
  const current = rows.find((row) => row.current);
  const coming = rows.filter((row) => row.from > todayDate());
  const first = rows[0];

  const growth = current !== undefined && first !== undefined && first.id !== current.id
    ? ((current.amount - first.amount) / first.amount) * 100
    : null;

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <StatCard
          label={t('salary.currentLabel')}
          value={current === undefined ? '–' : formatMoney(current.amount)}
          detail={current === undefined
            ? t('salary.notStarted')
            : t('salary.since', { date: formatDate(current.from) })}
        />
        <StatCard
          label={t('salary.growthLabel')}
          value={growth === null ? '–' : `+${formatNumber(growth, 1)} %`}
          detail={first === undefined ? '' : t('salary.growthDetail', { date: formatDate(first.from) })}
        />
        <StatCard
          label={t('salary.comingLabel')}
          value={coming.length === 0 ? '–' : formatMoney(coming[0]!.amount)}
          detail={coming.length === 0
            ? t('salary.noneComing')
            : t('salary.since', { date: formatDate(coming[0]!.from) })}
        />
      </SimpleGrid>
      <DataTable
        controller={tableCtrl}
        title={t('salary.history')}
        source={source}
        rowKey="id"
        columns={columns}
        actions={actions}
        defaultSort={{ key: 'from', direction: 'desc' }}
      />
      <Text size="xs" c="dimmed">{t('salary.footnote')}</Text>
    </Stack>
  );
}
