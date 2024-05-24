import { rawClassifications } from "@/domain/raw_classifications";
import { gameTypeConfig } from "@/domain/game_types";
const sortByScore = (a, b) => a.score - b.score;

const classificationList = [
  "A3",
  "A2",
  "A1",
  "B3",
  "B2",
  "B1",
  "MB",
  "GMB",
  "EMB"
];

export function calculateClassifications(roundName, sex, age, bowtype, score) {
  const roundScores = calculateRoundScores(sex, bowtype, age, roundName);

  const numberOfEnds = gameTypeConfig[roundName].numberOfEnds;

  if (roundScores.length === 0) {
    return undefined;
  }

  return roundScores.reduce((acc, classification, index) => {
    const name = classificationList[index];
    const achieved = score >= classification.score;
    let shortBy = null;
    if (!achieved) {
      shortBy = classification.score - score;
    }
    const scorePerEnd = Math.ceil(classification.score / numberOfEnds);
    const item = { name, score: classification.score, achieved, shortBy, scorePerEnd };
    return [...acc, item];
  }, []);

}

function calculateRoundScores(sex, bowtype, age, roundName) {
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
  return roundScores;
}
