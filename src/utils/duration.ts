/**
 * Formats a duration in milliseconds to a human-readable string
 * @param durationMs - Duration in milliseconds
 * @returns Formatted duration string (e.g., "1h 30m", "45m", "2h")
 */
export function formatShootDuration(durationMs: number | undefined): string | undefined {
  if (!durationMs || durationMs < 0) {
    return undefined;
  }

  const totalMinutes = Math.round(durationMs / (1000 * 60));
  
  // Don't show durations less than a minute (before rounding)
  if (durationMs < 60 * 1000) {
    return undefined;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${minutes}m`;
  }
}
