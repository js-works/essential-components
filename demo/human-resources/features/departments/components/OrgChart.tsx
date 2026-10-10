import { ActionIcon, Anchor, Badge, Group, Menu, Stack, Text } from '@mantine/core';
import { useLayoutEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import { Link } from 'react-router';
import { childrenOf, todayDate } from '../../../domain';
import type { Department, HrData } from '../../../domain';
import { useTranslate } from '../../../shared/lib/i18n';
import { appIcons } from '../../../shared/ui/icons';
import { EmployeeAvatar } from '../../../shared/ui/parts';
import { employeeOf } from '../../hr';
import { useDepartmentFlows } from '../flows';
import { headcount } from '../headcount';

export { OrgChart };

// The departments as a chart from the top down: a card per department (its name, its head, how many work there and
// below it, its cost center, a menu: add one below, edit, delete), joined by lines (`human-resources.css`). Wider than
// the page: it scrolls sideways, and starts with the top in the middle.
function OrgChart({ data }: { data: HrData }): ReactElement {
  const roots = childrenOf(data.departments, null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const scroll = scrollRef.current;

    if (scroll !== null) {
      scroll.scrollLeft = (scroll.scrollWidth - scroll.clientWidth) / 2;
    }
  }, []);

  return (
    <div className="human-resources__org-scroll" ref={scrollRef}>
      <ul className="human-resources__org" role="tree">
        {roots.map((department) => <OrgNode key={department.id} data={data} department={department} />)}
      </ul>
    </div>
  );
}

function OrgNode({ data, department }: { data: HrData; department: Department }): ReactElement {
  const children = childrenOf(data.departments, department.id);

  return (
    <li role="treeitem" aria-expanded={children.length > 0 || undefined}>
      <OrgCard data={data} department={department} />
      {children.length > 0 && (
        <ul role="group">
          {children.map((child) => <OrgNode key={child.id} data={data} department={child} />)}
        </ul>
      )}
    </li>
  );
}

function OrgCard({ data, department }: { data: HrData; department: Department }): ReactElement {
  const t = useTranslate();
  const flows = useDepartmentFlows();
  const today = todayDate();
  const head = employeeOf(data, department.headId);
  const own = headcount(data, department.id, today);
  const all = headcount(data, department.id, today, true);

  return (
    <div className="human-resources__org-card">
      <Group justify="space-between" gap={4} wrap="nowrap" mb={6}>
        <Text fw={600} size="sm" truncate>{department.name}</Text>
        {/* Fixed: the chart's scrolling box would cut off a menu inside it. */}
        <Menu position="bottom-end" shadow="md" width={200} floatingStrategy="fixed">
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              aria-label={t('departments.actions', { name: department.name })}
            >
              {appIcons.more}
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={appIcons.add} onClick={() => void flows.create(data, department.id)}>
              {t('departments.addBelow')}
            </Menu.Item>
            <Menu.Item leftSection={appIcons.edit} onClick={() => void flows.edit(department, data)}>
              {t('common.edit')}
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item color="danger" leftSection={appIcons.remove} onClick={() => void flows.remove(department)}>
              {t('common.delete')}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
      {head === undefined
        ? <Text size="xs" c="dimmed" mb={6}>{t('departments.noHead')}</Text>
        : (
          <Group gap={6} wrap="nowrap" mb={6}>
            <EmployeeAvatar name={head.name} size={24} />
            <Stack gap={0} style={{ minWidth: 0 }}>
              <Anchor component={Link} to={`/employees/${head.id}`} size="xs" truncate>{head.name}</Anchor>
              <Text size="xs" c="dimmed" truncate>{head.title}</Text>
            </Stack>
          </Group>
        )}
      <Group gap={6} justify="space-between" wrap="nowrap">
        <Badge variant="light" size="sm">
          {all === own ? t('departments.people', { count: own }) : t('departments.peopleBelow', { count: all, own })}
        </Badge>
        {department.costCenter !== '' && (
          <Text size="xs" c="dimmed" className="human-resources__figures">{department.costCenter}</Text>
        )}
      </Group>
    </div>
  );
}
