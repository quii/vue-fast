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

  it('returns "Just now" for timestamps less than a minute ago', () => {
    mockDate('2023-05-15T12:00:00Z')

    // 30 seconds ago
    expect(formatDateContextually('2023-05-15T11:59:30Z')).toBe('Just now')

    // 59 seconds ago
    expect(formatDateContextually('2023-05-15T11:59:01Z')).toBe('Just now')
  })

  it('returns "X minutes ago" for timestamps less than an hour ago', () => {
    mockDate('2023-05-15T12:00:00Z')

    // 1 minute ago
    expect(formatDateContextually('2023-05-15T11:59:00Z')).toBe('1 min ago')

    // 30 minutes ago
    expect(formatDateContextually('2023-05-15T11:30:00Z')).toBe('30 mins ago')

    // 59 minutes ago
    expect(formatDateContextually('2023-05-15T11:01:00Z')).toBe('59 mins ago')
  })

  it('returns "X hours ago" for timestamps less than a day ago', () => {
    mockDate('2023-05-15T12:00:00Z')

    // 1 hour ago
    expect(formatDateContextually('2023-05-15T11:00:00Z')).toBe('1 hour ago')

    // 6 hours ago
    expect(formatDateContextually('2023-05-15T06:00:00Z')).toBe('6 hours ago')

    // 23 hours ago
    expect(formatDateContextually('2023-05-14T13:00:00Z')).toBe('23 hours ago')
  })

  it('returns "Today" for the current date', () => {
    // Mock current date as 2023-05-15
    mockDate('2023-05-15T12:00:00Z')

    // Test with various time formats of the same day (more than 24 hours ago)
    // Note: This behavior has changed - now we show hours for same-day timestamps less than 24 hours ago
    // For timestamps on the same calendar day but more than 24 hours ago (which is rare), we show "Today"
    expect(formatDateContextually('2023-05-15T00:00:00Z')).toBe('12 hours ago')
    expect(formatDateContextually('2023-05-15T08:30:00Z')).toBe('3 hours ago')
    expect(formatDateContextually('2023-05-15T11:59:00Z')).toBe('1 min ago')
  })

  it('returns "Yesterday" for the previous day', () => {
    mockDate('2023-05-15T12:00:00Z')

    // Test with timestamps from the previous day (more than 24 hours ago)
    expect(formatDateContextually('2023-05-14T11:00:00Z')).toBe('Yesterday')
    expect(formatDateContextually('2023-05-14T00:00:00Z')).toBe('Yesterday')
  })

  it('returns "X days ago" for dates within the last week', () => {
    mockDate('2023-05-15T12:00:00Z')
    expect(formatDateContextually('2023-05-13T12:00:00Z')).toBe('2 days ago')
    expect(formatDateContextually('2023-05-12T12:00:00Z')).toBe('3 days ago')
    expect(formatDateContextually('2023-05-09T12:00:00Z')).toBe('6 days ago')
    expect(formatDateContextually('2023-05-08T12:00:00Z')).toBe('7 days ago')
  })

  it('returns "X weeks ago" for dates within the last month', () => {
    mockDate('2023-05-15T12:00:00Z')
    expect(formatDateContextually('2023-05-07T12:00:00Z')).toBe('1 week ago')
    expect(formatDateContextually('2023-05-01T12:00:00Z')).toBe('2 weeks ago')
    expect(formatDateContextually('2023-04-24T12:00:00Z')).toBe('3 weeks ago')
  })

  it('returns formatted date for dates beyond a month', () => {
    mockDate('2023-05-15T12:00:00Z')
    expect(formatDateContextually('2023-04-15T12:00:00Z')).toBe('15/04/23')
    expect(formatDateContextually('2022-12-25T12:00:00Z')).toBe('25/12/22')
  })

  it('handles invalid dates gracefully', () => {
    expect(formatDateContextually(null as unknown as string)).toBe('')
    expect(formatDateContextually(undefined as unknown as string)).toBe('')
    expect(formatDateContextually('invalid-date')).toBe('')
  })
})