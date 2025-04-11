/**
 * Represents the status of an archery shoot
 *
 * - Practice: Informal practice session
 * - Competition: Formal competition without record status
 * - RecordStatus: Official record status shoot (scores can be used for classifications/records)
 */
export type ShootStatus = "Practice" | "Competition" | "RecordStatus";

/**
 * Default shoot status to use when none is specified
 */
export const DEFAULT_SHOOT_STATUS: ShootStatus = "Practice";

/**
 * Helper function to check if a string is a valid ShootStatus
 */
export function isValidShootStatus(status: string): status is ShootStatus {
  return ["Practice", "Competition", "RecordStatus"].includes(status);
}

/**
 * Helper function to get a display name for a shoot status
 */
export function getShootStatusDisplayName(status: ShootStatus): string {
  switch (status) {
    case "Practice":
      return "Practice";
    case "Competition":
      return "Competition";
    case "RecordStatus":
      return "Record Status";
    default:
      return status; // TypeScript should prevent this, but added for safety
  }
}

/**
 * Get all available shoot statuses
 */
export function getAllShootStatuses(): ShootStatus[] {
  return ["Practice", "Competition", "RecordStatus"];
}
