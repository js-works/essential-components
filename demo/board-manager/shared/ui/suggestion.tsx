import { Text } from '@mantine/core';
import type { ReactElement } from 'react';

export { suggestion };

// The content of an option of an autocomplete filter: its label, and a second line (dimmed) when there is one.
function suggestion(label: string, second: string): () => ReactElement {
  return () => (
    <span>
      {label}
      {second !== '' && <Text size="xs" c="dimmed">{second}</Text>}
    </span>
  );
}
