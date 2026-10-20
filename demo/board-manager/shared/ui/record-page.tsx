import { Button, Group, SimpleGrid, Stack, Tabs, Text } from '@mantine/core';
import type { ReactNode } from 'react';
import { Fragment, useState } from 'react';

import { useTranslate } from '../lib/i18n/index.js';
import { appIcons, PageHeader } from '../shared.js';

export type { RecordField, RecordTab };
export { RecordPage };

// A label and its value on the overview; an empty string shows as "–".
type RecordField = readonly [label: string, value: ReactNode];

type RecordTab<R> = { key: string; label: string; icon?: ReactNode; render: (record: R) => ReactNode };

// The page of a record: its title and subtitle (with its badges and actions, e.g. a status and what changes it), then
// tabs: "Overview" (its fields as labels and values, with "Edit"
// and "Delete") and the record's own (`tabs`, e.g. its related tables). Nothing while it loads the first time;
// `notFound` when there is no such record.
function RecordPage<R>(
  { record, isPending, notFound, title, subtitle, badges, actions, fields, onEdit, onDelete, tabs = [] }: {
    record: R | undefined;
    isPending: boolean;
    notFound: ReactNode;
    title: (record: R) => ReactNode;
    subtitle?: (record: R) => ReactNode;
    badges?: (record: R) => ReactNode;
    actions?: (record: R) => ReactNode;
    fields: (record: R) => readonly RecordField[];
    onEdit: (record: R) => unknown;
    onDelete: (record: R) => unknown;
    tabs?: readonly RecordTab<R>[];
  },
) {
  const t = useTranslate();
  const [tab, setTab] = useState<string | null>('overview');

  if (isPending) {
    return null;
  }

  if (record === undefined) {
    return notFound;
  }

  return (
    <Stack gap="md">
      <PageHeader
        title={title(record)}
        subtitle={subtitle?.(record)}
        badges={badges?.(record)}
        actions={actions?.(record)}
      />
      <Tabs value={tab} onChange={setTab} keepMounted={false}>
        <Tabs.List>
          <Tabs.Tab value="overview">{t('common.overview')}</Tabs.Tab>
          {tabs.map((item) => <Tabs.Tab key={item.key} value={item.key} leftSection={item.icon}>{item.label}
          </Tabs.Tab>)}
        </Tabs.List>
        <Tabs.Panel value="overview" pt="md">
          <Overview fields={fields(record)} onEdit={() => onEdit(record)} onDelete={() => onDelete(record)} />
        </Tabs.Panel>
        {tabs.map((item) => <Tabs.Panel key={item.key} value={item.key} pt="md">{item.render(record)}</Tabs.Panel>)}
      </Tabs>
    </Stack>
  );
}

// No frame, like the tables of the other tabs: the title and the buttons in one line, like their toolbars.
function Overview({ fields, onEdit, onDelete }: {
  fields: readonly RecordField[];
  onEdit: () => unknown;
  onDelete: () => unknown;
}) {
  const t = useTranslate();

  return (
    <Stack gap="md" maw={820}>
      <Group justify="space-between" className="board-manager__panel-header">
        <Text fw={700} size="lg">{t('common.overview')}</Text>
        <Group gap="xs">
          <Button size="xs" variant="default" leftSection={appIcons.edit} onClick={() => void onEdit()}>
            {t('common.edit')}
          </Button>
          <Button
            size="xs"
            variant="default"
            color="danger"
            leftSection={appIcons.remove}
            onClick={() => void onDelete()}
          >
            {t('common.delete')}
          </Button>
        </Group>
      </Group>
      <SimpleGrid cols={2} spacing="lg" verticalSpacing="xs" style={{ gridTemplateColumns: 'max-content 1fr' }}>
        {fields.map(([label, value]) => (
          <Fragment key={label}>
            <Text size="sm" c="dimmed">{label}</Text>
            {typeof value === 'string' ? <Text size="sm">{value === '' ? '–' : value}</Text> : value}
          </Fragment>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
