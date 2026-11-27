import { describe, expect, it } from 'vitest';

import {
  createAntdFileUploadTheme,
  createFileUploadTheme,
  createMantineFileUploadTheme,
} from '../../main/themes/index.js';

describe('createMantineFileUploadTheme', () => {
  it('maps every value onto Mantine\'s variables', () => {
    const { focusRingWidth, focusRingOffset, ...mapped } = createMantineFileUploadTheme();

    expect([focusRingWidth, focusRingOffset]).toEqual(['2px', '2px']);

    for (const value of Object.values(mapped)) {
      expect(value).toContain('var(--mantine-');
      expect(value).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    }
  });
});

describe('createAntdFileUploadTheme', () => {
  it('maps every value onto antd\'s variables', () => {
    const { focusRingWidth, focusRingOffset, ...mapped } = createAntdFileUploadTheme();

    expect([focusRingWidth, focusRingOffset]).toEqual(['2px', '2px']);

    for (const value of Object.values(mapped)) {
      expect(value).toMatch(/^var\(--ant-[\w-]+\)$/);
    }
  });
});

describe('the ready themes', () => {
  it('the given keys on top, an undefined one hides nothing; a new object each call', () => {
    const theme = createMantineFileUploadTheme({ progressColor: 'teal', borderRadius: undefined });

    expect(theme.progressColor).toBe('teal');
    expect(theme.borderRadius).toBe(createMantineFileUploadTheme().borderRadius);
    expect(createFileUploadTheme()).not.toBe(createFileUploadTheme());
    expect(createFileUploadTheme().progressColor).not.toBe('teal');
  });
});
