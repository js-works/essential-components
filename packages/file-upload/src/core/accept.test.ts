import { describe, expect, it } from 'vitest';
import { matchesAccept } from './accept';

const pdf = { name: 'Report.PDF', type: 'application/pdf' };
const photo = { name: 'photo.jpg', type: 'image/jpeg' };
const unknown = { name: 'data.bin', type: '' };

describe('matchesAccept', () => {
  it('accepts everything without a list', () => {
    expect(matchesAccept(pdf, undefined)).toBe(true);
    expect(matchesAccept(pdf, '')).toBe(true);
    expect(matchesAccept(pdf, ' , ')).toBe(true);
  });

  it('matches extensions, ignoring the case', () => {
    expect(matchesAccept(pdf, '.pdf')).toBe(true);
    expect(matchesAccept(photo, '.pdf, .png')).toBe(false);
    expect(matchesAccept(unknown, '.bin')).toBe(true);
  });

  it('matches MIME types and wildcards', () => {
    expect(matchesAccept(pdf, 'application/pdf')).toBe(true);
    expect(matchesAccept(photo, 'image/*')).toBe(true);
    expect(matchesAccept(pdf, 'image/*')).toBe(false);
    expect(matchesAccept(unknown, 'image/*')).toBe(false);
  });

  it('accepts a file that matches any entry', () => {
    expect(matchesAccept(photo, '.pdf, image/*')).toBe(true);
    expect(matchesAccept(pdf, 'image/png,.pdf')).toBe(true);
  });
});
