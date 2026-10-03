import '@mantine/core/styles.css';
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  ColorInput,
  Group,
  MantineProvider,
  NativeSelect,
  Paper,
  Progress,
  SegmentedControl,
  Select,
  Stack,
  Switch,
  Table,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { colorSetups, createMantineTheme } from '../src';
import type { MantineThemes } from '../src';

// The demo: the themes of `createMantineTheme()` on a page of Mantine's components, with the choices on top: the color
// setup, the size, the variant, the color scheme, and a live accent (a color input that sets the custom property
// `--demo-accent-color`, which the accent follows without a new theme).
const ACCENT_PROPERTY = '--demo-accent-color';

function App() {
  const [colors, setColors] = useState<string>('mantine');
  const [size, setSize] = useState<MantineThemes.Size>('default');
  const [variant, setVariant] = useState<MantineThemes.Variant>('default');
  const [scheme, setScheme] = useState<'light' | 'dark'>('light');
  const [live, setLive] = useState(false);
  const [liveColor, setLiveColor] = useState('#e64980');
  const kit = useMemo(
    () =>
      createMantineTheme({
        colors: colors === 'mantine' ? undefined : colors as MantineThemes.ColorName,
        size,
        variant,
        accentProperty: ACCENT_PROPERTY,
      }),
    [colors, size, variant],
  );

  // The live accent: only a custom property on `<html>` (none: the theme's own accent).
  if (live) {
    document.documentElement.style.setProperty(ACCENT_PROPERTY, liveColor);
  } else {
    document.documentElement.style.removeProperty(ACCENT_PROPERTY);
  }

  return (
    <MantineProvider theme={kit.theme} cssVariablesResolver={kit.cssVariablesResolver} forceColorScheme={scheme}>
      <Stack p="lg" gap="lg" maw={1100} mx="auto">
        <Title order={1}>Mantine themes</Title>
        <Paper withBorder p="md">
          <Group align="end" gap="lg">
            <Select
              label="Colors"
              data={[{ value: 'mantine', label: 'Mantine (indigo)' }, ...Object.keys(colorSetups)]}
              value={colors}
              allowDeselect={false}
              onChange={(value) => setColors(value ?? 'mantine')}
            />
            <Stack gap={4}>
              <Text size="sm" fw={500}>Size</Text>
              <SegmentedControl
                data={['default', 'compact']}
                value={size}
                onChange={(value) => setSize(value as MantineThemes.Size)}
              />
            </Stack>
            <Stack gap={4}>
              <Text size="sm" fw={500}>Variant</Text>
              <SegmentedControl
                data={['default', 'modern']}
                value={variant}
                onChange={(value) => setVariant(value as MantineThemes.Variant)}
              />
            </Stack>
            <Stack gap={4}>
              <Text size="sm" fw={500}>Scheme</Text>
              <SegmentedControl
                data={['light', 'dark']}
                value={scheme}
                onChange={(value) => setScheme(value as 'light' | 'dark')}
              />
            </Stack>
            <Switch label="Live accent" checked={live} onChange={(event) => setLive(event.currentTarget.checked)} />
            <ColorInput value={liveColor} onChange={setLiveColor} disabled={!live} w={140} />
          </Group>
        </Paper>
        <Showcase />
      </Stack>
    </MantineProvider>
  );
}

function Showcase() {
  return (
    <Stack gap="lg">
      <Group>
        <Button>Filled</Button>
        <Button variant="light">Light</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="default">Default</Button>
        <Button variant="subtle">Subtle</Button>
        <Button color="danger">Danger</Button>
        <Button color="success">Success</Button>
        <Button color="warning">Warning</Button>
        <Button loading>Loading</Button>
        <Button disabled>Disabled</Button>
      </Group>
      <Group>
        <Badge>Accent</Badge>
        <Badge color="success">Success</Badge>
        <Badge color="warning">Warning</Badge>
        <Badge color="danger">Danger</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="dot">Dot</Badge>
      </Group>
      <Group align="start" grow>
        <Stack>
          <TextInput label="Text input" placeholder="Type here" description="With a description" />
          <TextInput label="With an error" defaultValue="oops" error="This is not valid" />
          <NativeSelect label="Native select" data={['One', 'Two', 'Three']} />
          <Select label="Select" data={['One', 'Two', 'Three']} defaultValue="Two" />
          <Checkbox label="A checkbox" defaultChecked />
          <Switch label="A switch" defaultChecked />
          <Progress value={62} />
        </Stack>
        <Stack>
          <Alert title="Information">An alert in the accent color.</Alert>
          <Alert color="success" title="Saved">Everything went fine.</Alert>
          <Alert color="warning" title="Careful">Something needs a look.</Alert>
          <Alert color="danger" title="Error">Something went wrong.</Alert>
        </Stack>
      </Group>
      <Tabs defaultValue="one">
        <Tabs.List>
          <Tabs.Tab value="one">First</Tabs.Tab>
          <Tabs.Tab value="two">Second</Tabs.Tab>
          <Tabs.Tab value="three">Third</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="one" pt="md">
          <Table striped withTableBorder highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {[['Ada Hamilton', 'Admin', 'Active'], ['Ben Carter', 'Editor', 'Invited'], [
                'Claire Dubois',
                'Viewer',
                'Active',
              ]]
                .map(([name, role, status]) => (
                  <Table.Tr key={name}>
                    <Table.Td>{name}</Table.Td>
                    <Table.Td>{role}</Table.Td>
                    <Table.Td>
                      <Badge color={status === 'Active' ? 'success' : 'warning'}>{status}</Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </Tabs.Panel>
        <Tabs.Panel value="two" pt="md">Second panel</Tabs.Panel>
        <Tabs.Panel value="three" pt="md">Third panel</Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
