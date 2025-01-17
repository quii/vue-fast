import { rawClassifications } from "@/domain/raw_classifications";
import { gameTypeConfig } from "@/domain/game_types";
import { convertToValue } from "@/domain/scores";

const sortByScore = (a, b) => a.score - b.score;

export const classificationList = [
  "A3",
  "A2",
  "A1",
  "B3",
  "B2",
  "B1",
  "MB",
  "GMB",
  "EMB",
  "PB"
];

let roundScoresCache = {};

export function createClassificationCalculator(roundName, sex, age, bowtype, personalBest) {
  if (roundName === "frostbite") {
    return createFrostbiteClassificationCalculator(roundName, sex, age, bowtype, personalBest);
  }
  const cacheKey = `${roundName}-${sex}-${age}-${bowtype}`;
  let roundScores = roundScoresCache[cacheKey];

  if (!roundScores) {
    roundScores = calculateRoundScores(sex, bowtype, age, roundName, personalBest);
    roundScoresCache[cacheKey] = roundScores;
  }

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


export function calculateRoundScores(sex, bowtype, age, roundName, personalBest) {
  if (sex === "male") {
    sex = "men";
  }

  if (sex === "female") {
    sex = "women";
  }

  const classificationFilter = c => c.gender.toLowerCase() === sex &&
    c.bowType.toLowerCase() === bowtype &&
    c.age.toLowerCase() === age &&
    c.round.toLowerCase() === roundName;

  const roundScores = rawClassifications
    .filter(c => classificationFilter(c))
  if (personalBest) {
    roundScores.push({id: 10, gender: sex, bowType: bowtype, age: age, round: roundName, score: personalBest ?? 0});
  } 
  roundScores.sort(sortByScore);
  return roundScores;
}

export function calculateClassification(sex, age, bowtype) {
  return (roundName, score) => {
    const calculator = createClassificationCalculator(roundName, sex, age, bowtype);
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

export function addClassificationsToHistory(sex, age, bowType, scoringHistory) {
  const classificationCalculator = calculateClassification(sex, age, bowType);
  return scoringHistory.map(x => {
    const classification = classificationCalculator(x.gameType, x.score);
    return { ...x, classification };
  });
}

export function getRelevantClassifications(classifications) {
  const achieved = classifications?.filter(c => c.achieved).sort((a, b) => b.score - a.score) ?? [];
  const notAchieved = classifications?.filter(c => !c.achieved).sort((a, b) => a.score - b.score) ?? [];

  const result = [];
  if (achieved.length > 0) {
    if (achieved[0].name === "PB" && achieved.length > 1) {
      result.push(achieved[1]);
    }
    result.push(achieved[0]);

  }
  if (notAchieved.length > 0) {
    result.push(notAchieved[0]); // Next unachieved
  }

  return result;
}

export function calculateIfArcherIsOnTrackForNextClassification(currentEnd, currentClassification, roundName, sex, age, bowtype) {
  const calculator = createClassificationCalculator(roundName, sex, age, bowtype);

  if (!calculator) {
    return false;
  }

  const classifications = calculator(0, currentEnd);

  const currentIndex = classifications.findIndex(c => c.name === currentClassification);


  if (currentIndex === -1 || currentIndex === classifications.length - 1) {
    return undefined;
  }

  const nextClassification = classifications[currentIndex + 1];

  return currentEnd >= nextClassification.scorePerEnd;
}

export function calculatePotentialClassificationWithoutOutliers(scores, currentClassification, roundName, sex, age, bowtype) {
  const calculator = createClassificationCalculator(roundName, sex, age, bowtype);

  if (!calculator || scores.length === 0) {
    return null;
  }

  const numericScores = scores.map(convertToValue);
  const sortedScores = [...numericScores].sort((a, b) => a - b);

  const classifications = calculator(0, 0);
  const filteredClassifications = classifications.filter(c => c.name !== "PB");
  const currentIndex = filteredClassifications.findIndex(c => c.name === currentClassification);

  if (currentIndex === -1 || currentIndex === filteredClassifications.length - 1) {
    return null;
  }

  const nextClassification = filteredClassifications[currentIndex + 1];
  const targetTotal = nextClassification.score;
  const currentTotal = sortedScores.reduce((sum, score) => sum + score, 0);

  if (currentTotal >= targetTotal) {
    return null;
  }

  let potentialTotal = currentTotal;
  let arrowsToImprove = 0;

  for (const score of sortedScores) {
    if (potentialTotal >= targetTotal) {
      break;
    }

    const averageScore = Math.floor(currentTotal / scores.length);
    const reasonableImprovement = score < 5 ? averageScore : Math.min(10, score + 2);
    const improvement = reasonableImprovement - score;

    if (improvement > 0) {
      potentialTotal += improvement;
      arrowsToImprove++;
    }
  }

  const pointsNeeded = targetTotal - currentTotal;
  const averageImprovementNeeded = pointsNeeded / scores.length;

  return {
    classification: nextClassification.name,
    potentialScore: Math.round(potentialTotal),
    arrowsToImprove,
    achievable: averageImprovementNeeded <= 0.5
  };
}

