import { Anchor, Grid, Group, Loader, Paper, Progress, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import type { ReactElement, ReactNode } from 'react';
import { Link } from 'react-router';
import { ROOT_ID } from '../../domain';
import type { Folder } from '../../domain';
import { formatDateTime, formatSize } from '../../shared/lib/format';
import { appIcons, kindIcon } from '../../shared/ui/icons';
import { browserKeys, folderPath, KIND_LABELS, useBrowserService } from '../browser';
import type { Overview } from '../browser';

export { OverviewPage };

// The start page (2026-10-08): four cards (files, their size, storages, modified in the last week), the space by kind
// and by storage, and the last modified files.
function OverviewPage(): ReactElement {
  const service = useBrowserService();
  const { data: overview } = useQuery({
    queryKey: browserKeys.overview(),
    queryFn: ({ signal }) => service.overview(signal),
  });
  const { data: folders = [] } = useQuery({
    queryKey: browserKeys.folders(),
    queryFn: ({ signal }) => service.folders(signal),
  });

  if (overview === undefined) {
    return <Loader size="sm" />;
  }

  return (
    <Stack gap="md">
      <Stack gap={4} className="file-center__page-header">
        <Title order={2} size="h3">Overview</Title>
        <Text size="sm" c="dimmed">The files in all storages at a glance.</Text>
      </Stack>
      <Numbers overview={overview} />
      <Grid gap="md">
        <Grid.Col span={{ base: 12, md: 6, xl: 4 }}>
          <ByKind overview={overview} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, xl: 4 }}>
          <ByStorage overview={overview} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 12, xl: 4 }}>
          <Recent overview={overview} folders={folders} />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

function Numbers({ overview }: { overview: Overview }): ReactElement {
  return (
    <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} spacing="md">
      <StatCard
        label="Files"
        value={overview.files.toLocaleString()}
        detail={`in ${overview.folders} folders`}
        to={folderPath(ROOT_ID)}
        toLabel="Files"
      />
      <StatCard label="Space used" value={formatSize(overview.size)} detail="by all files" />
      <StatCard
        label="Storages"
        value={overview.storages}
        detail="where the files are kept"
        to={folderPath(ROOT_ID)}
        toLabel="Files"
      />
      <StatCard label="Modified this week" value={overview.thisWeek} detail="in the last 7 days" />
    </SimpleGrid>
  );
}

// A number of the start page, a link to the page it is about (its name at the top right) where there is one.
function StatCard({ label, value, detail, to, toLabel }: {
  label: string;
  value: ReactNode;
  detail: string;
  to?: string;
  toLabel?: string;
}): ReactElement {
  const content = (
    <Stack gap={4}>
      <Group justify="space-between" wrap="nowrap" gap="xs">
        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>{label}</Text>
        {to !== undefined && toLabel !== undefined && (
          <Text size="xs" className="file-center__card-target">
            {toLabel}
            {appIcons.target}
          </Text>
        )}
      </Group>
      <Text fz={28} fw={600} lh={1.2}>{value}</Text>
      <Text size="sm" c="dimmed">{detail}</Text>
    </Stack>
  );

  return to === undefined
    ? <Paper withBorder p="md" radius="sm" className="file-center__card">{content}</Paper>
    : (
      <Paper withBorder p="md" radius="sm" component={Link} to={to} className="file-center__card" data-link>
        {content}
      </Paper>
    );
}

// The space of each kind of file, as bars (the largest first), with the number of files.
function ByKind({ overview }: { overview: Overview }): ReactElement {
  const max = Math.max(1, ...overview.byKind.map((entry) => entry.size));

  return (
    <Paper withBorder p="md" radius="sm" h="100%">
      <Title order={3} size="h5" mb="sm">Space by kind</Title>
      <Stack gap={8}>
        {overview.byKind.map((entry) => (
          <div key={entry.kind}>
            <Group justify="space-between" gap="xs" wrap="nowrap" mb={2}>
              <Group gap={8} wrap="nowrap" className="file-center__entry" data-kind={entry.kind}>
                <Text component="span" className="file-center__kind" display="inline-flex">
                  {kindIcon(entry.kind, 16)}
                </Text>
                <Text size="sm">{KIND_LABELS[entry.kind]}</Text>
              </Group>
              <Text size="sm" c="dimmed" className="file-center__figures">
                {formatSize(entry.size)} · {entry.files}
              </Text>
            </Group>
            <Progress value={(entry.size / max) * 100} size="sm" aria-hidden />
          </div>
        ))}
      </Stack>
    </Paper>
  );
}

// The space of each storage (a link that opens it), as a share of all files.
function ByStorage({ overview }: { overview: Overview }): ReactElement {
  return (
    <Paper withBorder p="md" radius="sm" h="100%">
      <Title order={3} size="h5" mb="sm">Storages</Title>
      <Stack gap="sm">
        {overview.byStorage.map((entry) => (
          <div key={entry.storage.id}>
            <Group justify="space-between" gap="xs" wrap="nowrap" mb={2}>
              <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
                <Text component="span" c="dimmed" display="inline-flex">{appIcons.storage}</Text>
                <Anchor component={Link} to={folderPath(entry.storage.id)} size="sm" truncate>
                  {entry.storage.name}
                </Anchor>
              </Group>
              <Text size="sm" c="dimmed" className="file-center__figures">
                {formatSize(entry.size)} · {entry.files} files
              </Text>
            </Group>
            <Progress value={overview.size === 0 ? 0 : (entry.size / overview.size) * 100} size="sm" aria-hidden />
          </div>
        ))}
      </Stack>
    </Paper>
  );
}

// The last modified files: each with its folder (a link that opens it) and when.
function Recent({ overview, folders }: { overview: Overview; folders: readonly Folder[] }): ReactElement {
  return (
    <Paper withBorder p="md" radius="sm" h="100%">
      <Title order={3} size="h5" mb="sm">Recently modified</Title>
      <Stack gap="xs">
        {overview.recent.map((file) => (
          <Group key={file.id} gap="sm" wrap="nowrap" justify="space-between">
            <Group gap={8} wrap="nowrap" className="file-center__entry" data-kind={file.kind} style={{ minWidth: 0 }}>
              <Text component="span" className="file-center__kind" display="inline-flex">{kindIcon(file.kind)}</Text>
              <Stack gap={0} style={{ minWidth: 0 }}>
                <Text size="sm" truncate>{file.name}</Text>
                <Anchor component={Link} to={folderPath(file.folderId)} size="xs" truncate>
                  {folders.find((folder) => folder.id === file.folderId)?.name ?? ''}
                </Anchor>
              </Stack>
            </Group>
            <Text size="xs" c="dimmed" style={{ flex: 'none' }}>{formatDateTime(file.modified)}</Text>
          </Group>
        ))}
      </Stack>
    </Paper>
  );
}
