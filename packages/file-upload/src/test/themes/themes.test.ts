import { describe, expect, it } from 'vitest';

import { MANTINE_THEME } from '../../main/themes/index.js';

describe('MANTINE_THEME', () => {
  it('maps every value onto Mantine\'s variables', () => {
    for (const value of Object.values(MANTINE_THEME)) {
      expect(value).toMatch(/^var\(--mantine-[\w-]+\)$/);
    }
  });

  it('is frozen', () => {
    expect(Object.isFrozen(MANTINE_THEME)).toBe(true);
  });
});
