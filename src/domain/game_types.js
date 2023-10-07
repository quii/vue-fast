import { indoorMetricScores, validImperialScores, validMetricScores } from "@/domain/scores";

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
  },
  postsmouth: {
    distancesRoundSizes: [5],
    scores: indoorMetricScores,
    unit: "m"
  },
  bray1: {
    distancesRoundSizes: [3],
    scores: indoorMetricScores,
    unit: "m"
  }
};

export const gameTypes = Object.keys(gameTypeConfig);

