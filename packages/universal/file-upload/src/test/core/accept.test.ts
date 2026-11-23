import { describe, expect, it } from 'vitest';

import { matchesAccept } from '../../main/core/accept.js';
import { constant } from '../../main/core/utils.js';

const PDF = constant({ name: 'Report.PDF', type: 'application/pdf' });
const PHOTO = constant({ name: 'photo.jpg', type: 'image/jpeg' });
const UNKNOWN = constant({ name: 'data.bin', type: '' });

describe('matchesAccept', () => {
  it('accepts everything without a list', () => {
    expect(matchesAccept(PDF, undefined)).toBe(true);
    expect(matchesAccept(PDF, '')).toBe(true);
    expect(matchesAccept(PDF, ' , ')).toBe(true);
  });

  it('matches extensions, ignoring the case', () => {
    expect(matchesAccept(PDF, '.pdf')).toBe(true);
    expect(matchesAccept(PHOTO, '.PDF, .png')).toBe(false);
    expect(matchesAccept(UNKNOWN, '.bin')).toBe(true);
  });

  it('matches MIME types and wildcards', () => {
    expect(matchesAccept(PDF, 'application/pdf')).toBe(true);
    expect(matchesAccept(PHOTO, 'image/*')).toBe(true);
    expect(matchesAccept(PDF, 'image/*')).toBe(false);
    expect(matchesAccept(UNKNOWN, 'image/*')).toBe(false);
  });

  it('accepts a file that matches any entry', () => {
    expect(matchesAccept(PHOTO, '.PDF, image/*')).toBe(true);
    expect(matchesAccept(PDF, 'image/png,.pdf')).toBe(true);
  });
});
