import { describe, expect, it } from 'vitest';
import { splitLines } from './text';

describe('splitLines', () => {
  it('splits a multi-line string into trimmed, non-empty lines', () => {
    expect(splitLines('A personal portfolio\nA full-stack app\n')).toEqual([
      'A personal portfolio',
      'A full-stack app',
    ]);
  });

  it('trims stray whitespace on each line', () => {
    expect(splitLines('  first  \n  second  ')).toEqual(['first', 'second']);
  });

  it('drops blank lines', () => {
    expect(splitLines('first\n\n\nsecond')).toEqual(['first', 'second']);
  });

  it('returns an empty array for null', () => {
    expect(splitLines(null)).toEqual([]);
  });

  it('returns an empty array for undefined', () => {
    expect(splitLines(undefined)).toEqual([]);
  });

  it('returns an empty array for an empty string', () => {
    expect(splitLines('')).toEqual([]);
  });
});
