import { rawClassifications } from "@/domain/raw_classifications";

const classificationList = [
  "A3",
  "A2",
  "A1",
  "B3",
  "B2",
  "B1"
];

export function newClassificationCalculator(roundName, sex, age, bowtype) {
  if (sex === "male") {
    sex = "men";
  }

  const classificationFilter = c => c.gender.toLowerCase() == sex &&
    c.bowType.toLowerCase() == bowtype &&
    c.age.toLowerCase() == age &&
    c.round.toLowerCase() == roundName;

  const roundScores = rawClassifications
    .filter(c => classificationFilter(c))
    .sort((a, b) => a.score - b.score);


  if (!roundScores) {
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
