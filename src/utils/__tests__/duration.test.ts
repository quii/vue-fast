import { describe, expect, test } from 'vitest';
import { formatShootDuration } from '../duration';

describe('formatShootDuration', () => {
  test('formats duration correctly for hours and minutes', () => {
    const oneHourThirtyMin = 90 * 60 * 1000; // 90 minutes in milliseconds
    expect(formatShootDuration(oneHourThirtyMin)).toBe('1h 30m');
  });

  test('formats duration correctly for minutes only', () => {
    const fortyFiveMin = 45 * 60 * 1000; // 45 minutes in milliseconds
    expect(formatShootDuration(fortyFiveMin)).toBe('45m');
  });

  test('formats duration correctly for hours only', () => {
    const twoHours = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    expect(formatShootDuration(twoHours)).toBe('2h');
  });

  test('formats single minute correctly', () => {
    const oneMin = 60 * 1000; // 1 minute in milliseconds
    expect(formatShootDuration(oneMin)).toBe('1m');
  });

  test('returns undefined for durations less than a minute', () => {
    const thirtySeconds = 30 * 1000; // 30 seconds in milliseconds
    expect(formatShootDuration(thirtySeconds)).toBeUndefined();
  });

  test('returns undefined for zero duration', () => {
    expect(formatShootDuration(0)).toBeUndefined();
  });

  test('returns undefined for negative duration', () => {
    expect(formatShootDuration(-1000)).toBeUndefined();
  });

  test('returns undefined for undefined input', () => {
    expect(formatShootDuration(undefined)).toBeUndefined();
  });

  test('rounds to nearest minute', () => {
    const oneMinThirtySeconds = 90 * 1000; // 1.5 minutes in milliseconds
    expect(formatShootDuration(oneMinThirtySeconds)).toBe('2m');
    
    const oneMinTwentySeconds = 80 * 1000; // 1.33 minutes in milliseconds
    expect(formatShootDuration(oneMinTwentySeconds)).toBe('1m');
  });
});
