import { isIndoorSeason, isOutdoorSeason } from "@/domain/season_dates";
import { getNextClassification } from "@/domain/scoring/classificationList";
import { gameTypeConfig } from "@/domain/scoring/game_types";

/**
 * Calculate the dozen arrows required for the next classification based on tier
 * @param {string} classification - Next classification to achieve
 * @param {string} environment - 'indoor' or 'outdoor'
 * @returns {number} - Number of dozen arrows required
 */
function getDozenArrowsRequired(classification, environment) {
  // Unclassified doesn't need any arrows to achieve
  if (classification === "Unclassified") return 0;

  // Master Bowman and above have special requirements (record status shoots)
  if (["MB", "GMB", "EMB"].includes(classification)) return 0;

  // Archer tier (A3, A2, A1)
  if (classification.startsWith("A")) {
    return environment === "indoor" ? 10 : 12;
  }

  // Bowmen tier (B3, B2, B1)
  if (classification.startsWith("B")) {
    return environment === "indoor" ? 15 : 18;
  }

  return 0;
}

/**
 * Check if a shoot meets the standard for the next classification
 * @param {Object} shoot - Shoot to check
 * @param {string} nextClassification - Next classification to achieve
 * @returns {boolean} - Whether the shoot meets the standard
 */
function meetsClassificationStandard(shoot, nextClassification) {
  if (!shoot.classification || !shoot.classification.name) {
    return false;
  }

  // For next classification B3, B2, B1, need at least B3 standard
  if (nextClassification.startsWith("B")) {
    return ["B3", "B2", "B1", "MB", "GMB", "EMB"].includes(shoot.classification.name);
  }

  // For A2, need at least A2 standard
  if (nextClassification === "A2") {
    return ["A2", "A1", "B3", "B2", "B1", "MB", "GMB", "EMB"].includes(shoot.classification.name);
  }

  // For A1, need at least A1 standard
  if (nextClassification === "A1") {
    return ["A1", "B3", "B2", "B1", "MB", "GMB", "EMB"].includes(shoot.classification.name);
  }

  // For A3, any classification is qualifying
  return true;
}

/**
 * Calculate classification progress for a specific bow type and environment
 * @param {Array} history - Array of shoot history items
 * @param {string} bowType - Bow type to calculate progress for
 * @param {string} currentClassification - Current classification for this bow type
 * @param {string} environment - 'indoor' or 'outdoor'
 * @param {string} seasonStartDate - Start date of the season in ISO format
 * @returns {Object} - Progress information
 */
export function calculateClassificationProgress(history, bowType, currentClassification, environment, seasonStartDate) {
  if (!history || !bowType || !currentClassification || !environment || !seasonStartDate) {
    return {
      dozenArrowsShot: 0,
      dozenArrowsRequired: 0,
      qualifyingShoots: [],
      nextClassification: currentClassification
    };
  }

  // Get the next classification to achieve
  const nextClassification = getNextClassification(currentClassification);

  // If there's no next classification (already at highest) or still unclassified
  if (nextClassification === currentClassification || currentClassification === "Unclassified") {
    return {
      dozenArrowsShot: 0,
      dozenArrowsRequired: 0,
      qualifyingShoots: [],
      nextClassification: currentClassification
    };
  }

  const dozenArrowsRequired = getDozenArrowsRequired(nextClassification, environment);

  // If no arrows required, return early
  if (dozenArrowsRequired === 0) {
    return {
      dozenArrowsShot: 0,
      dozenArrowsRequired: 0,
      qualifyingShoots: [],
      nextClassification
    };
  }

  // Filter shoots by bow type, season, and environment
  const qualifyingShoots = history.filter(shoot => {
    // Must have the correct bow type
    if (!shoot.userProfile || shoot.userProfile.bowType !== bowType) {
      return false;
    }

    // Must be in the current season
    const shootDate = new Date(shoot.date);
    if (environment === "indoor") {
      if (!isIndoorSeason(shootDate, seasonStartDate)) {
        return false;
      }
    } else {
      if (!isOutdoorSeason(shootDate, seasonStartDate)) {
        return false;
      }
    }

    // Check if the round is appropriate for the environment (indoor/outdoor)
    const gameType = shoot.gameType?.toLowerCase();
    if (!gameType || !gameTypeConfig[gameType]) {
      return false;
    }

    const isOutdoorRound = gameTypeConfig[gameType].isOutdoor;

    if (environment === "indoor" && isOutdoorRound) {
      return false;
    }

    if (environment === "outdoor" && !isOutdoorRound) {
      return false;
    }

    // Check if the shoot meets the standard for the next classification
    return meetsClassificationStandard(shoot, nextClassification);
  });

  // Calculate total dozen arrows shot
  const dozenArrowsShot = qualifyingShoots.reduce((total, shoot) => {
    // Determine number of arrows in the round
    let arrowCount = 0;

    if (shoot.scores && Array.isArray(shoot.scores)) {
      arrowCount = shoot.scores.length;
    } else {
      // Get arrow count from gameTypeConfig if available
      const gameType = shoot.gameType?.toLowerCase();
      if (gameType && gameTypeConfig[gameType]) {
        arrowCount = gameTypeConfig[gameType].maxArrows || 0;
      }
    }

    return total + (arrowCount / 12); // Convert to dozen
  }, 0);

  return {
    dozenArrowsShot: Math.min(dozenArrowsShot, dozenArrowsRequired),
    dozenArrowsRequired,
    qualifyingShoots,
    nextClassification
  };
}

/**
 * Calculate classification progress for all bow types and environments
 * @param {Array} history - Array of shoot history items
 * @param {Object} indoorClassifications - Indoor classifications by bow type
 * @param {Object} outdoorClassifications - Outdoor classifications by bow type
 * @param {string} indoorSeasonStartDate - Start date of indoor season
 * @param {string} outdoorSeasonStartDate - Start date of outdoor season
 * @param {Array} bowTypes - Array of bow types to calculate progress for
 * @returns {Object} - Progress information for all bow types and environments
 */
export function calculateAllClassificationProgress(
  history,
  indoorClassifications,
  outdoorClassifications,
  indoorSeasonStartDate,
  outdoorSeasonStartDate,
  bowTypes
) {
  if (!history || !bowTypes || !bowTypes.length) {
    return {};
  }

  const result = {};

  bowTypes.forEach(bowType => {
    const indoorClassification = indoorClassifications[bowType] || "Unclassified";
    const outdoorClassification = outdoorClassifications[bowType] || "Unclassified";

    result[bowType] = {
      indoor: calculateClassificationProgress(
        history,
        bowType,
        indoorClassification,
        "indoor",
        indoorSeasonStartDate
      ),
      outdoor: calculateClassificationProgress(
        history,
        bowType,
        outdoorClassification,
        "outdoor",
        outdoorSeasonStartDate
      )
    };
  });

  return result;
}