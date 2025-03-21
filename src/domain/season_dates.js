/**
 * Calculates default season start dates based on the current date
 * @returns {{indoor: string, outdoor: string}} Object containing ISO date strings for indoor and outdoor season start dates
 */
export function calculateDefaultSeasonDates() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  // Indoor season typically runs October to March
  // Outdoor season typically runs April to September

  // For indoor, use October 1st of previous year if we're currently in Jan-Sep
  // or October 1st of current year if we're in Oct-Dec
  const indoorYear = currentDate.getMonth() < 9 ? currentYear - 1 : currentYear;
  const indoorDate = `${indoorYear}-10-01`; // Use string format directly

  // For outdoor, use April 1st of current year
  const outdoorDate = `${currentYear}-04-01`; // Use string format directly

  return {
    indoor: indoorDate,
    outdoor: outdoorDate
  };
}

/**
 * Determines if a date is within the indoor season
 * @param {string|Date} date - The date to check
 * @param {string} seasonStartDate - The indoor season start date (YYYY-MM-DD)
 * @returns {boolean} True if the date is within the indoor season
 */
export function isIndoorSeason(date, seasonStartDate) {
  const checkDate = new Date(date);
  const startDate = new Date(seasonStartDate);

  // Indoor season runs from October to March (6 months)
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 6);

  return checkDate >= startDate && checkDate < endDate;
}

/**
 * Determines if a date is within the outdoor season
 * @param {string|Date} date - The date to check
 * @param {string} seasonStartDate - The outdoor season start date (YYYY-MM-DD)
 * @returns {boolean} True if the date is within the outdoor season
 */
export function isOutdoorSeason(date, seasonStartDate) {
  const checkDate = new Date(date);
  const startDate = new Date(seasonStartDate);

  // Outdoor season runs from April to September (6 months)
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 6);

  return checkDate >= startDate && checkDate < endDate;
}
