import { rawClassifications } from "@/domain/raw_classifications";
import { gameTypeConfig } from "@/domain/game_types";
import { useHistoryStore } from "../stores/history";

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

export function createClassificationCalculator(roundName, sex, age, bowtype) {
  const cacheKey = `${roundName}-${sex}-${age}-${bowtype}`;
  let roundScores = roundScoresCache[cacheKey];

  if (!roundScores) {
    roundScores = calculateRoundScores(sex, bowtype, age, roundName);
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
      const item = { name, score: classification.score, achieved, shortBy, scorePerEnd, perEndDiff };
      result.push(item);
    })
    return result;
  };
}

export function calculateRoundScores(sex, bowtype, age, roundName) {
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
    .sort(sortByScore);

  const personalBest = calculatePersonalBest(roundName);
  roundScores.push({id: 10, gender: sex, bowType: bowtype, age: age, round: roundName, score: personalBest})
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
      const wat = sorted.find(x => x.score <= score);
      return wat?.name ?? "U/C";
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

function calculatePersonalBest(roundName) {
  const historyStore = useHistoryStore();
  const filteredHistory = [];
  historyStore.history.map((shoot)=>{
    if (shoot['gameType'] === roundName)  {
      filteredHistory.push(shoot['score']) 
    }
  });
  if (filteredHistory.length == 0) {
    return 0
  }
  return Math.max(...filteredHistory)
}