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
  const roundScores = rawClassifications.filter(c => {
    return c.gender.toLowerCase() == sex && c.bowType.toLowerCase() == bowtype && c.age.toLowerCase() == age && c.round.toLowerCase() == roundName;
  }).sort((a, b) => a.score - b.score);


  if (!roundScores) {
    return undefined;
  }

  console.log("the round scores are", roundScores);


  return (score) => {
    return roundScores.reduce((acc, classification, index) => {
      if (acc.next) {
        return acc;
      }
      const currentClassification = classificationList[index];

      const nextRound = roundScores[index];
      let nextRoundNode = null;
      if (nextRound) {
        nextRoundNode = {
          next: classificationList[index],
          shortBy: nextRound.score - score
        };
      }

      if (score >= classification.score) {
        return { classification: currentClassification };
      }
      return { ...acc, ...nextRoundNode };
    }, { classification: "Unclassified" });
  };
}
