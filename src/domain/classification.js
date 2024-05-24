import { rawClassifications } from "@/domain/raw_classifications";


export function newClassificationCalculator(roundName, sex, age, bowtype) {
  const roundScores = calculateRoundScores(sex, bowtype, age, roundName);

  if (roundScores.length === 0) {
    return undefined;
  }

  return (score) =>
    roundScores.reduce((acc, classification, index) => {
      if (acc.next) {
        return acc;
      }

      const classificationLabel = classificationList[index];

      if (score >= classification.score) {
        return { classification: classificationLabel };
      }

      const nextRoundNode = roundScores[index] ? {
        next: classificationLabel,
        shortBy: roundScores[index].score - score
      } : {};

      return { ...acc, ...nextRoundNode };
    }, unclassified);
}

const unclassified = { classification: "Unclassified" };

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

export function calculateClassifications(roundName, sex, age, bowtype) {
  const roundScores = calculateRoundScores(sex, bowtype, age, roundName);

  if (roundScores.length === 0) {
    return undefined;
  }

  return roundScores.reduce((acc, classification, index) => {
    const classificationLabel = classificationList[index];
    return [...acc, { [classificationLabel]: classification.score }];
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
