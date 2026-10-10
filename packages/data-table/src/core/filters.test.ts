import { describe, expect, it } from 'vitest';
import { optionsOf, sameValue } from './filters';

describe('sameValue', () => {
  it('treats equal JSON values as the same', () => {
    expect(sameValue(undefined, undefined)).toBe(true);
    expect(sameValue('a', 'a')).toBe(true);
    expect(sameValue(1, 1)).toBe(true);
    expect(sameValue(null, null)).toBe(true);
    expect(sameValue(['a', 'b'], ['a', 'b'])).toBe(true);
    expect(sameValue({ from: '2024-01-01', to: '2024-02-01' }, { to: '2024-02-01', from: '2024-01-01' })).toBe(true);
    expect(sameValue({ list: [1, { x: true }] }, { list: [1, { x: true }] })).toBe(true);
  });

  it('treats different values as different', () => {
    expect(sameValue(undefined, 'a')).toBe(false);
    expect(sameValue('a', 'b')).toBe(false);
    expect(sameValue('1', 1)).toBe(false);
    expect(sameValue(null, undefined)).toBe(false);
    expect(sameValue(['a', 'b'], ['b', 'a'])).toBe(false);
    expect(sameValue(['a'], ['a', 'b'])).toBe(false);
    expect(sameValue(['a'], { 0: 'a' })).toBe(false);
    expect(sameValue({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(sameValue({ a: 1 }, { b: 1 })).toBe(false);
  });
});

describe('optionsOf', () => {
  it('turns strings into options with the same value and label', () => {
    expect(optionsOf(['Admin', { value: 'e', label: 'Editor' }])).toEqual([
      { value: 'Admin', label: 'Admin' },
      { value: 'e', label: 'Editor' },
    ]);
  });
});
