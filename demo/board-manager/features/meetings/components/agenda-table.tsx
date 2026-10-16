import { generalAction, singleRowAction, useDataTableController } from '@local/data-table/react';
import type { RowGroup, RowMove, TableActions, TableColumns } from '@local/data-table/react';
import { Stack, Text } from '@mantine/core';
import { useMemo } from 'react';
import type { Meeting } from '../../../domain/index.js';
import { agendaNumbers, agendaOf } from '../../../domain/index.js';
import { fetchAgenda, reorderAgenda } from '../../../infra/in-memory/index.js';
import type { AgendaRow } from '../../../infra/in-memory/index.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { appIcons, DataTable, useDb, useReloadOnChange } from '../../../shared/shared.js';
import { deleteAction, editAction, newAction } from '../../../shared/ui/table-actions.js';
import {
  useAddAgendaItemFlow,
  useDeleteAgendaItemsFlow,
  useEditAgendaItemFlow,
  useManageSectionsFlow,
  useRecordMinutesFlow,
} from '../agenda-flows.js';

import { numbered } from './agenda.js';
import { MinutesText } from './minutes.js';

export { AgendaTable };

// The minutes, the decision and the description of an item, in its detail row.
function AgendaDetail({ row }: { row: AgendaRow }) {
  const t = useTranslate();

  return (
    <Stack gap={6} py={4}>
      {row.description !== '' && <Text size="sm" c="dimmed">{row.description}</Text>}
      {row.minutes !== '' && <MinutesText minutes={row.minutes} empty="" />}
      {row.decision !== '' && (
        <Text size="sm" fw={600}>{t('meetings.agenda.decision', { decision: row.decision })}</Text>
      )}
      {row.minutes === '' && row.decision === '' && (
        <Text size="sm" c="dimmed">{t('meetings.agenda.noMinutesYet')}</Text>
      )}
    </Stack>
  );
}

function useColumns(): TableColumns<AgendaRow> {
  const t = useTranslate();

  return [
    { key: 'number', header: '#', width: 0.5, align: 'end' },
    { key: 'title', header: t('meetings.agenda.columns.item'), width: 4, wrap: true },
    { key: 'presenter', header: t('meetings.agenda.columns.presenter'), width: 2 },
    {
      key: 'duration',
      header: t('meetings.agenda.columns.duration'),
      width: 1,
      align: 'end',
      render: (row) => t('meetings.durationMin', { count: row.duration }),
    },
    {
      key: 'recorded',
      header: t('meetings.agenda.columns.minutes'),
      width: 1,
      align: 'center',
      // The fake server says "Yes" or "No".
      render: (row) => t(row.recorded === 'Yes' ? 'common.yes' : 'common.no'),
    },
  ];
}

function useActions(meeting: Meeting): TableActions<AgendaRow> {
  const t = useTranslate();
  const addItem = useAddAgendaItemFlow(meeting);
  const manageSections = useManageSectionsFlow(meeting);
  const recordMinutes = useRecordMinutesFlow(meeting);
  const editItem = useEditAgendaItemFlow(meeting);
  const deleteItems = useDeleteAgendaItemsFlow();

  return [
    newAction(t('meetings.agenda.addItem'), addItem),
    generalAction('sections', manageSections, { label: t('meetings.sections.manage'), icon: appIcons.section }),
    singleRowAction('minutes', recordMinutes, {
      icon: appIcons.minutes,
      label: t('meetings.agenda.columns.minutes'),
      show: 'both',
      default: true,
    }),
    editAction(editItem),
    deleteAction(deleteItems),
  ];
}

// The agenda: in the order of its items (no sorting: the rows are moved with their handle, and every move is saved).
// Each item has its minutes and decision ("Minutes", also a double click), shown in its detail row. Sections are the
// groups of the table (`groupBy`): an item is moved within its section or into another one by dragging. The sections
// themselves are managed in a dialog ("Manage sections": add, rename, delete, reorder). Without a section, the table
// is not grouped: plain rows.
function AgendaTable({ meeting }: { meeting: Meeting }) {
  const t = useTranslate();
  const tableCtrl = useDataTableController<AgendaRow>();
  const columns = useColumns();
  const actions = useActions(meeting);
  const agendaItems = useDb((state) => state.agendaItems);
  const agendaSections = useDb((state) => state.agendaSections);
  const numbers = useMemo(
    () => agendaNumbers(agendaOf({ agendaItems, agendaSections }, meeting.id)),
    [agendaItems, agendaSections, meeting.id],
  );
  const grouped = agendaSections.some((section) => section.meetingId === meeting.id);

  useReloadOnChange(tableCtrl);

  // The positions (and the numbers) change with a move: saved, and the table follows the data.
  const reorder = (move: RowMove<AgendaRow>) => reorderAgenda(move);

  // The header of a section: its number and name, and the duration of its items.
  // The items without a section are the table's blank group (`''`): "Other", always the last one.
  const renderGroup = (group: RowGroup<AgendaRow>) => {
    const section = agendaSections.find((candidate) => candidate.id === group.key);
    const duration = agendaItems
      .filter((item) => item.meetingId === meeting.id && item.sectionId === group.key)
      .reduce((sum, item) => sum + item.duration, 0);

    return (
      <>
        <span>{numbered(numbers.get(group.key) ?? '', section?.title ?? t('meetings.agenda.other'))}</span>
        <Text span size="xs" c="dimmed" fw={400}>{t('meetings.durationMin', { count: duration })}</Text>
      </>
    );
  };

  return (
    <DataTable
      // A new table when the first section comes or the last one goes: no group state is carried over.
      key={grouped ? 'grouped' : 'flat'}
      controller={tableCtrl}
      title={t('meetings.agenda.title')}
      subtitle={grouped ? t('meetings.agenda.subtitleGrouped') : t('meetings.agenda.subtitle')}
      density="compact"
      layout="table"
      footer="auto"
      searchable
      reloadable
      source={fetchAgenda(meeting.id)}
      reorder={reorder}
      groupBy={grouped ? 'sectionId' : undefined}
      renderGroup={grouped ? renderGroup : undefined}
      rowKey="id"
      columns={columns}
      actions={actions}
      renderDetail={(row) => <AgendaDetail row={row} />}
      // One page for the whole agenda: with `footer="auto"`, the footer comes only for more than 50 items.
      pageSize={50}
      pageSizeOptions={[50]}
    />
  );
}
