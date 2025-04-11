import { isIndoorSeason, isOutdoorSeason } from "@/domain/season_dates";
import { getNextClassification, isHigherOrEqualClassification } from "@/domain/scoring/classificationList";
import { gameTypeConfig } from "@/domain/scoring/game_types";

const indoorClassificationRequirements = {
  "Unclassified": 0,
  "A1": 10,
  "A2": 10,
  "A3": 10,
  "B3": 15,
  "B2": 15,
  "B1": 15,
  "MB": 15,
  "GMB": 15,
  "EMB": 15
}

const outdoorClassificationRequirements = {
  "Unclassified": 0,
  "A1": 12,
  "A2": 12,
  "A3": 12,
  "B3": 18,
  "B2": 18,
  "B1": 18,
  "MB": 36,
  "GMB": 36,
  "EMB": 36
}

function getDozenArrowsRequired(classification, environment) {
  if(environment==="indoor") {
    return indoorClassificationRequirements[classification]
  }

  return outdoorClassificationRequirements[classification];
}

function meetsClassificationStandard(shoot, nextClassification) {
  // First check if the shoot has the required classification
  if (!shoot.classification || !shoot.classification.name) {
    return false;
  }

  // Check if the classification meets or exceeds the required level
  const meetsClassificationLevel = isHigherOrEqualClassification(shoot.classification.name, nextClassification);

  if (!meetsClassificationLevel) {
    return false;
  }

  // For master bowmen tiers, require record status
  if (["MB", "GMB", "EMB"].includes(nextClassification)) {
    // If no shootStatus is defined (legacy data), it can't qualify for master bowmen tiers
    if (!shoot.shootStatus) {
      return false;
    }

    // Only count record status shoots for master bowmen tiers
    return shoot.shootStatus === "RecordStatus";
  }

  // For other classifications, any shoot with the right classification level qualifies
  return true;
}

export function calculateClassificationProgress(history, bowType, currentClassification, environment, seasonStartDate) {
  const noProgressCanBeMade = {
    dozenArrowsShot: 0,
    dozenArrowsRequired: 0,
    qualifyingShoots: [],
    nextClassification: currentClassification
  };

  if (!history || !bowType || !currentClassification || !environment || !seasonStartDate) {
    return noProgressCanBeMade;
  }

  const nextClassification = getNextClassification(currentClassification);

  if (nextClassification === currentClassification) {
    return noProgressCanBeMade
  }

  const dozenArrowsRequired = getDozenArrowsRequired(nextClassification, environment);

  // If no arrows required, return early
  if (dozenArrowsRequired === 0) {
    return noProgressCanBeMade
  }

  // Filter shoots by bow type, season, and environment
  const qualifyingShoots = history.filter(shoot => {
    if (shoot?.userProfile?.bowType !==bowType) {
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

    const isOutdoorRound = gameTypeConfig[shoot.gameType?.toLowerCase()]?.isOutdoor

    if (environment === "indoor" && isOutdoorRound) {
      return false;
    }

    if (environment === "outdoor" && !isOutdoorRound) {
      return false;
    }

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
    // Check if classifications exist for this bow type
    const hasIndoorClassification = indoorClassifications &&
      Object.keys(indoorClassifications).length > 0 &&
      indoorClassifications[bowType];

    const hasOutdoorClassification = outdoorClassifications &&
      Object.keys(outdoorClassifications).length > 0 &&
      outdoorClassifications[bowType];

    // Get classifications or default to "Unclassified"
    const indoorClassification = hasIndoorClassification ?
      indoorClassifications[bowType] : "Unclassified";

    const outdoorClassification = hasOutdoorClassification ?
      outdoorClassifications[bowType] : "Unclassified";

    result[bowType] = {
      indoor: hasIndoorClassification ?
        calculateClassificationProgress(
          history,
          bowType,
          indoorClassification,
          "indoor",
          indoorSeasonStartDate
        ) :
        {
          dozenArrowsShot: 0,
          dozenArrowsRequired: 0,
          qualifyingShoots: [],
          nextClassification: "Unclassified"
        },

      outdoor: hasOutdoorClassification ?
        calculateClassificationProgress(
          history,
          bowType,
          outdoorClassification,
          "outdoor",
          outdoorSeasonStartDate
        ) :
        {
          dozenArrowsShot: 0,
          dozenArrowsRequired: 0,
          qualifyingShoots: [],
          nextClassification: "Unclassified"
        }
    };
  });

  return result;
}
