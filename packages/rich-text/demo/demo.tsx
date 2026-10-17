import '@mantine/core/styles.layer.css';
import '../src/styles.css';
import { Code, MantineProvider, SegmentedControl, Stack, Text } from '@mantine/core';
import { useEffect, useState } from 'react';

import type { MentionOption, RichTextFormat } from '../src/index.js';
import { RichText, RichTextEditor } from '../src/index.js';

export { Demo };

// The class of the demo's Mantine scope: Mantine's variables and color scheme are set on it, not on `:root` (the demo
// shares its page with others).
const SCOPE_CLASS = 'rich-text-demo';

// Made-up people to mention.
const PEOPLE: readonly MentionOption[] = [
  { id: 'p1', label: 'Helena Brandt' },
  { id: 'p2', label: 'Jonas Weber' },
  { id: 'p3', label: 'Maria Keller' },
  { id: 'p4', label: 'Lena Hoffmann' },
];

const mentions = {
  suggest: (query: string) => PEOPLE.filter((person) => person.label.toLowerCase().includes(query.toLowerCase())),
  labelOf: (id: string) => PEOPLE.find((person) => person.id === id)?.label ?? '(deleted)',
  hrefOf: (id: string) => `#people/${id}`,
};

const START = JSON.stringify([
  { type: 'heading', props: { level: 2 }, content: 'Minutes' },
  {
    type: 'paragraph',
    content: [
      { type: 'text', text: 'The budget was approved. ', styles: {} },
      { type: 'mention', props: { id: 'p2' } },
      { type: 'text', text: ' presents the plan next time.', styles: {} },
    ],
  },
  { type: 'bulletListItem', content: 'Type / for the blocks' },
  { type: 'bulletListItem', content: 'Type @ to mention someone' },
]);

// The page's color scheme (`<html>`: its computed `color-scheme`), followed while it changes.
function useScheme(): 'light' | 'dark' {
  const read = (): 'light' | 'dark' => {
    const scheme = getComputedStyle(document.documentElement).colorScheme;

    return scheme.includes('dark') && !scheme.includes('light') ? 'dark' : 'light';
  };
  const [scheme, setScheme] = useState(read);

  useEffect(() => {
    const observer = new MutationObserver(() => setScheme(read()));

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  return scheme;
}

// The demo: the editor (with mentions), the value in the chosen format, and the read-only view of it. A new format
// starts the editor again with the start text in that format.
function Demo() {
  const scheme = useScheme();
  const [format, setFormat] = useState<RichTextFormat>('blocknote');
  const [value, setValue] = useState(START);

  return (
    <MantineProvider
      forceColorScheme={scheme}
      cssVariablesSelector={`.${SCOPE_CLASS}`}
      deduplicateCssVariables={false}
      getRootElement={() => undefined}
    >
      <div className={SCOPE_CLASS} data-mantine-color-scheme={scheme}>
        <Stack gap="lg">
          <SegmentedControl
            value={format}
            onChange={(next) => {
              setFormat(next as RichTextFormat);
              setValue('');
            }}
            data={[
              { value: 'blocknote', label: 'BlockNote' },
              { value: 'html', label: 'HTML' },
              { value: 'markdown', label: 'Markdown' },
            ]}
          />
          <RichTextEditor
            key={format}
            label="Minutes"
            description="Type / for the blocks, @ to mention someone"
            placeholder="Write the minutes…"
            withAsterisk
            value={value}
            onChange={setValue}
            format={format}
            mentions={mentions}
            minRows={6}
            maxRows={16}
          />
          <Stack gap={4}>
            <Text size="sm" fw={500}>Read-only (RichText)</Text>
            <RichText value={value} format={format} mentions={mentions} />
          </Stack>
          <Stack gap={4}>
            <Text size="sm" fw={500}>The value ({format})</Text>
            <Code block className="rich-text-demo__value">{value === '' ? '(empty)' : value}</Code>
          </Stack>
        </Stack>
      </div>
    </MantineProvider>
  );
}
