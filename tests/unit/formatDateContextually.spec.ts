import { describe, afterEach, it, expect } from 'vitest'
import { formatDateContextually } from '@/domain/scoring/round/formatting'

describe('formatDateContextually', () => {
  // Save original Date implementation
  const RealDate = global.Date

  // Mock date for consistent testing
  function mockDate(isoDate: string): void {
    global.Date = class extends RealDate {
      constructor(...args: any[]) {
        if (args.length === 0) {
          return new RealDate(isoDate)
        }
        return new RealDate(...args)
      }

      static now(): number {
        return new RealDate(isoDate).getTime()
      }
    } as DateConstructor
  }

  // Restore original Date after tests
  afterEach(() => {
    global.Date = RealDate
  })

  it('returns "Today" for the current date', () => {
    // Mock current date as 2023-05-15
    mockDate('2023-05-15T12:00:00Z')

    // Test with various time formats of the same day
    expect(formatDateContextually('2023-05-15')).toBe('Today')
    expect(formatDateContextually('2023-05-15T08:30:00')).toBe('Today')
    expect(formatDateContextually('2023-05-15T23:59:59')).toBe('Today')
    expect(formatDateContextually(new Date('2023-05-15'))).toBe('Today')
  })

  it('returns "Yesterday" for the previous day', () => {
    mockDate('2023-05-15T12:00:00Z')
    expect(formatDateContextually('2023-05-14')).toBe('Yesterday')
    expect(formatDateContextually(new Date('2023-05-14T18:30:00'))).toBe('Yesterday')
  })

  it('returns "X days ago" for dates within the last week', () => {
    mockDate('2023-05-15T12:00:00Z')
    expect(formatDateContextually('2023-05-13')).toBe('2 days ago')
    expect(formatDateContextually('2023-05-12')).toBe('3 days ago')
    expect(formatDateContextually('2023-05-09')).toBe('6 days ago')
    expect(formatDateContextually('2023-05-08')).toBe('7 days ago')
  })

  it('returns formatted date for dates beyond a week', () => {
    mockDate('2023-05-15T12:00:00Z')
    expect(formatDateContextually('2023-05-07')).toBe('07/05/23')
    expect(formatDateContextually('2023-04-15')).toBe('15/04/23')
    expect(formatDateContextually('2022-12-25')).toBe('25/12/22')
  })

  it('handles invalid dates gracefully', () => {
    expect(formatDateContextually(null as unknown as string)).toBe('')
    expect(formatDateContextually(undefined as unknown as string)).toBe('')
    expect(formatDateContextually('invalid-date')).toBe('')
  })

  it('handles future dates as formatted dates', () => {
    mockDate('2023-05-15T12:00:00Z')
    expect(formatDateContextually('2023-05-16')).toBe('16/05/23')
    expect(formatDateContextually('2023-06-15')).toBe('15/06/23')
  })
})