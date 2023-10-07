import { validImperialScores, validMetricScores } from "@/domain/scores";

export const gameTypes = ["national", "warwick", "western", "windsor", "frostbite"];
export const gameTypeConfig = {
  national: {
    distancesRoundSizes: [4, 2],
    scores: validImperialScores,
    unit: "yd"
  },
  warwick: {
    distancesRoundSizes: [2, 2],
    scores: validImperialScores,
    unit: "yd"
  },
  western: {
    distancesRoundSizes: [4, 4],
    scores: validImperialScores,
    unit: "yd"
  },
  windsor: {
    distancesRoundSizes: [3, 3, 3],
    scores: validImperialScores,
    unit: "yd"
  },
  frostbite: {
    distancesRoundSizes: [3],
    scores: validMetricScores,
    unit: "m"
  }
}
