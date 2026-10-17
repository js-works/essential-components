import { MantineProvider } from '@mantine/core';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { RichText } from './rich-text.js';
import { RichTextEditor } from './rich-text-editor.js';

// jsdom has no `matchMedia` (Mantine reads the color scheme with it).
beforeAll(() => {
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

afterEach(cleanup);

const wrap = (node: ReactNode) => render(<MantineProvider>{node}</MantineProvider>);

const minutes = JSON.stringify([
  {
    type: 'paragraph',
    content: [{ type: 'text', text: 'Asked ', styles: {} }, { type: 'mention', props: { id: 'p1' } }],
  },
]);
const mentions = {
  suggest: () => [],
  labelOf: (id: string) => (id === 'p1' ? 'Ann' : '(deleted)'),
  hrefOf: () => '/p/1',
};

describe('RichTextEditor', () => {
  it('is a Mantine field: the label, the description, the error, and the text of its value', async () => {
    wrap(
      <RichTextEditor
        label="Minutes"
        description="Type @ to mention"
        error="Too long"
        defaultValue="First line"
      />,
    );

    expect(screen.getByText('Minutes')).toBeTruthy();
    expect(screen.getByText('Type @ to mention')).toBeTruthy();
    expect(screen.getByText('Too long')).toBeTruthy();
    await waitFor(() => expect(screen.getByText('First line')).toBeTruthy());
  });

  it('shows a mention by the app\'s label', async () => {
    wrap(<RichTextEditor defaultValue={minutes} mentions={mentions} />);

    await waitFor(() => expect(screen.getByText('@Ann')).toBeTruthy());
  });
});

describe('RichText', () => {
  it('shows the text read-only, a mention as the app\'s link, and nothing for an empty value', async () => {
    const { container } = wrap(<RichText value={minutes} mentions={mentions} />);

    await waitFor(() => expect(screen.getByText('@Ann').closest('a')?.getAttribute('href')).toBe('/p/1'));
    expect(container.querySelector('[contenteditable="true"]')).toBeNull();

    cleanup();

    const empty = wrap(<RichText value="" />);

    expect(empty.container.querySelector('.rich-text')).toBeNull();
  });
});
