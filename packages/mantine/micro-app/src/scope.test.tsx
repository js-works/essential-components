import { render } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { MantineScope } from './scope.js';

describe('MantineScope', () => {
  // jsdom has no `matchMedia`: a system in the light scheme.
  beforeAll(() => {
    window.matchMedia ??= (query: string) =>
      ({ matches: false, media: query, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList;
  });

  it('sets the app\'s class and the page\'s color scheme, or the one the app gives', () => {
    const { container } = render(
      <>
        <MantineScope className="my-app">page</MantineScope>
        <MantineScope className="my-app" scheme="dark">own</MantineScope>
      </>,
    );
    const [page, own] = container.querySelectorAll('.my-app');

    expect(page?.getAttribute('data-mantine-color-scheme')).toBe('light');
    expect(own?.getAttribute('data-mantine-color-scheme')).toBe('dark');
  });
});
