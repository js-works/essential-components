import { describe, expect, it } from 'vitest';

import { ANTD_THEME, MANTINE_THEME } from '../../main/themes/index.js';

describe('MANTINE_THEME', () => {
  it('maps every value onto Mantine\'s variables', () => {
    const { focusRingWidth, focusRingOffset, ...mapped } = MANTINE_THEME;

    expect([focusRingWidth, focusRingOffset]).toEqual(['2px', '2px']);

    for (const value of Object.values(mapped)) {
      expect(value).toContain('var(--mantine-');
      expect(value).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    }
  });

  it('is frozen', () => {
    expect(Object.isFrozen(MANTINE_THEME)).toBe(true);
  });
});

describe('ANTD_THEME', () => {
  it('maps every value onto antd\'s variables', () => {
    const { focusRingWidth, focusRingOffset, ...mapped } = ANTD_THEME;

    expect([focusRingWidth, focusRingOffset]).toEqual(['2px', '2px']);

    for (const value of Object.values(mapped)) {
      expect(value).toMatch(/^var\(--ant-[\w-]+\)$/);
    }
  });

  it('is frozen', () => {
    expect(Object.isFrozen(ANTD_THEME)).toBe(true);
  });
});
