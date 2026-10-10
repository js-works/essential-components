import { SimpleGrid } from '@mantine/core';
import type { ReactElement } from 'react';
import type { VacationBalance } from '../../../domain';
import { formatDays } from '../../../shared/lib/format';
import { useTranslate } from '../../../shared/lib/i18n';
import { StatCard } from '../../../shared/ui/parts';

export { BalanceCards };

// The vacation of a year at a glance: the days of the year, taken, planned, pending, left.
function BalanceCards({ balance, year }: { balance: VacationBalance; year: number }): ReactElement {
  const t = useTranslate();

  return (
    <SimpleGrid cols={{ base: 2, sm: 5 }} spacing="sm">
      <StatCard label={t('balance.allowance', { year })} value={formatDays(balance.allowance)} />
      <StatCard label={t('balance.taken')} value={formatDays(balance.taken)} />
      <StatCard label={t('balance.planned')} value={formatDays(balance.planned)} />
      <StatCard label={t('balance.pending')} value={formatDays(balance.pending)} />
      <StatCard label={t('balance.remaining')} value={formatDays(balance.remaining)} />
    </SimpleGrid>
  );
}
