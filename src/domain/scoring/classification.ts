import { gameTypeConfig } from "@/domain/scoring/game_types";
import { convertToValue } from "@shared/utils/scores";
import {
  classificationList,
  getNextClassification,
  isHigherOrEqualClassification
} from "@/domain/scoring/classificationList";
import { HistoryItem } from '@/domain/repositories/player_history'

const sortByScore = (a, b) => a.score - b.score;

export async function createClassificationCalculator(roundName, sex, age, bowtype, personalBest) {
  if (!roundName || !sex || !age || !bowtype) {
    return null;
  }

  if (roundName === "frostbite") {
    return createFrostbiteClassificationCalculator(roundName, sex, age, bowtype, personalBest);
  }

  const roundScores = await calculateRoundScores(sex, bowtype, age, roundName, personalBest);
  const numberOfEnds = gameTypeConfig[roundName].numberOfEnds;

  if (roundScores.length === 0) {
    return undefined;
  }

  return (score, avgPerEnd) => {
    const result = [];
    roundScores.map((classification) => {
      const name = classificationList[classification['id']-1]
      const achieved = score >= classification['score']
      let shortBy = null;
      if (!achieved) {
        shortBy = classification['score'] - score;
      }
      const scorePerEnd = Math.ceil(classification['score'] / numberOfEnds);
      const perEndDiff = avgPerEnd - scorePerEnd;
      const item = { name, score: classification["score"], achieved, shortBy, scorePerEnd, perEndDiff, scheme: "AGB" };
      result.push(item);
    })
    return result;
  };
}

function createFrostbiteClassificationCalculator(roundName, sex, age, bowtype, personalBest) {
  const frostbiteBadges = [
    { id: 1, score: 100, name: "100" },
    { id: 2, score: 150, name: "150" },
    { id: 3, score: 200, name: "200" },
    { id: 4, score: 225, name: "225" },
    { id: 5, score: 250, name: "250" },
    { id: 6, score: 275, name: "275" },
    { id: 7, score: 300, name: "300" },
    { id: 8, score: 315, name: "315" },
    { id: 9, score: 330, name: "330" },
    { id: 10, score: 340, name: "340" },
    { id: 11, score: 350, name: "350" },
    { id: 12, score: 355, name: "355" }
  ];

  const numberOfEnds = gameTypeConfig[roundName].numberOfEnds;

  if (personalBest) {
    frostbiteBadges.push({ id: 13, score: personalBest, name: "PB" });
  }

  return (score, avgPerEnd) => {
    const result = [];
    frostbiteBadges.map((badge) => {
      const achieved = score >= badge.score;
      let shortBy = null;
      if (!achieved) {
        shortBy = badge.score - score;
      }
      const scorePerEnd = Math.ceil(badge.score / numberOfEnds);
      const perEndDiff = avgPerEnd - scorePerEnd;
      const item = {
        name: badge.name,
        score: badge.score,
        achieved,
        shortBy,
        scorePerEnd,
        perEndDiff,
        scheme: "Frostbite"
      };
      result.push(item);
    });
    return result;
  };
}

export async function calculateRoundScores(sex, bowtype, age, roundName, personalBest?: Number) {
  if (sex === "male") {
    sex = "Men";
  }

  if (sex === "female") {
    sex = "Women";
  }

  const roundScores = await loadClassificationData(sex, bowtype, age);

  const filteredScores = roundScores.filter(c => {
    return c.round.toLowerCase() === roundName.toLowerCase();
  });

  if (personalBest) {
    filteredScores.push({
      id: 10,
      gender: sex,
      bowType: bowtype,
      age: age,
      round: roundName,
      score: personalBest
    });
  }

  return filteredScores.sort(sortByScore);
}

const classificationDataCache = new Map();

async function loadClassificationData(sex, bowtype, age) {
  if (sex === "male") sex = "men";
  if (sex === "female") sex = "women";

  bowtype = bowtype.charAt(0).toUpperCase() + bowtype.slice(1);
  age = age.charAt(0).toUpperCase() + age.slice(1);

  const cacheKey = `${sex}/${bowtype}/${age}`;
  if (classificationDataCache.has(cacheKey)) {
    return classificationDataCache.get(cacheKey);
  }

  const path = `/data/classifications/${sex}/${bowtype}/${age}.json`;
  const response = await fetch(path);
  const data = await response.json();
  classificationDataCache.set(cacheKey, data);
  return data;
}

export function calculateClassification(sex, age, bowtype) {
  return async (roundName, score) => {
    const calculator = await createClassificationCalculator(roundName, sex, age, bowtype);
    if (calculator) {
      const classifications = calculator(score, 1);
      const sorted = classifications.sort((a, b) => {
        return b.score - a.score;
      });
      const wat = sorted.find(x => x.score <= score && x.name !=='PB');
      return { name: wat?.name ?? "U/C", scheme: wat?.scheme };
    }
  };
}

export async function addClassificationsToHistory(scoringHistory: HistoryItem[]): Promise<HistoryItem[]> {
  const updatedHistory = [];

  for (const item of scoringHistory) {
    // Use the stored user profile if available, otherwise skip classification
    if (!item.userProfile) {
      updatedHistory.push(item);
      continue;
    }

    const { gender, ageGroup, bowType } = item.userProfile;

    if (!gender || !ageGroup || !bowType) {
      updatedHistory.push(item);
      continue;
    }

    const classificationCalculator = calculateClassification(gender, ageGroup, bowType);
    const classification = await classificationCalculator(item.gameType, item.score);

    updatedHistory.push({ ...item, classification });
  }

  return updatedHistory;
}

export function getRelevantClassifications(classifications) {
  if (!classifications?.length) {
    return [];
  }

  const achieved = classifications
    .filter(c => c.achieved)
    .sort((a, b) => isHigherOrEqualClassification(a.name, b.name) ? -1 : 1);

  const notAchieved = classifications
    .filter(c => !c.achieved)
    .sort((a, b) => isHigherOrEqualClassification(a.name, b.name) ? 1 : -1);

  const highestNonPB = achieved[0]?.name === "PB" ? achieved[1] : achieved[0];
  const nextUnachieved = notAchieved[0];

  return [
    highestNonPB,
    achieved[0]?.name === "PB" ? achieved[0] : null,
    nextUnachieved
  ].filter(Boolean);
}

export async function calculateIfArcherIsOnTrackForNextClassification(currentEnd, currentClassification, roundName, sex, age, bowtype) {
  const calculator = await createClassificationCalculator(roundName, sex, age, bowtype);

  if (!calculator) {
    return false;
  }

  const classifications = calculator(0, currentEnd);
  const nextClassification = getNextClassification(currentClassification);

  if (nextClassification === currentClassification) {
    return undefined;
  }

  const nextClassificationData = classifications.find(c => c.name === nextClassification);
  if (!nextClassificationData) {
    return undefined;
  }

  return currentEnd >= nextClassificationData.scorePerEnd;
}

export async function calculatePotentialClassificationWithoutOutliers(scores, currentClassification, roundName, sex, age, bowtype) {
  const calculator = await createClassificationCalculator(roundName, sex, age, bowtype);

  if (!calculator || scores.length === 0) {
    return null;
  }

  const numericScores = scores.map(s => convertToValue(s, roundName))
  const sortedScores = [...numericScores].sort((a, b) => a - b);
  const currentTotal = sortedScores.reduce((sum, score) => sum + score, 0);

  const classifications = calculator(0, 0)
    .filter(c => c.name !== "PB")
    .sort((a, b) => isHigherOrEqualClassification(a.name, b.name) ? 1 : -1);

  const nextClassification = classifications
    .find(c => isHigherOrEqualClassification(c.name, currentClassification) && c.name !== currentClassification);

  if (!nextClassification) {
    return null;
  }

  const targetTotal = nextClassification.score;
  if (currentTotal >= targetTotal) {
    return null;
  }

  const topQuartileIndex = Math.floor(sortedScores.length * 0.75);
  const typicalGoodScore = sortedScores[topQuartileIndex];

  const { potentialTotal, arrowCount } = sortedScores.reduce(
    (acc, score) => {
      if (acc.potentialTotal >= targetTotal) {
        return acc;
      }
      if (score < typicalGoodScore) {
        return {
          potentialTotal: acc.potentialTotal + (typicalGoodScore - score),
          arrowCount: acc.arrowCount + 1
        };
      }
      return acc;
    },
    { potentialTotal: currentTotal, arrowCount: 0 }
  );

  return {
    classification: nextClassification.name,
    potentialScore: potentialTotal,
    arrowsToImprove: arrowCount,
    achievable: potentialTotal >= targetTotal
  };
}

/**
 * Gets the highest possible classification that can be achieved based on the current score,
 * arrows remaining, and available classifications.
 *
 * @param availableClassifications Array of classification objects
 * @param maxPossibleScore The maximum possible score that can be achieved
 * @returns The highest achievable classification or null if none can be achieved
 */
export function getHighestPossibleClassification(availableClassifications, maxPossibleScore) {
  if (!availableClassifications || availableClassifications.length === 0) {
    return null;
  }

  // Filter to only include classifications that are achievable with the max possible score
  // and exclude "PB" (Personal Best)
  const achievableClassifications = availableClassifications.filter(c =>
    c.name !== "PB" && c.score <= maxPossibleScore && c.perEndDiff >= 0
  );

  if (achievableClassifications.length === 0) {
    return null;
  }

  // Get the highest classification (last item after sorting)
  return achievableClassifications[achievableClassifications.length - 1];
}
