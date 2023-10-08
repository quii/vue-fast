import { indoorMetricScores, validImperialScores, validMetricScores } from "@/domain/scores";

export const gameTypeConfig = {
  national: {
    distancesRoundSizes: [4, 2],
    scores: validImperialScores,
    unit: "yd",
    endSize: 6
  },
  warwick: {
    distancesRoundSizes: [2, 2],
    scores: validImperialScores,
    unit: "yd",
    endSize: 6
  },
  western: {
    distancesRoundSizes: [4, 4],
    scores: validImperialScores,
    unit: "yd",
    endSize: 6
  },
  windsor: {
    distancesRoundSizes: [3, 3, 3],
    scores: validImperialScores,
    unit: "yd",
    endSize: 6
  },
  frostbite: {
    distancesRoundSizes: [3],
    scores: validMetricScores,
    unit: "m",
    endSize: 6
  },
  postsmouth: {
    distancesRoundSizes: [5],
    scores: indoorMetricScores,
    unit: "m",
    endSize: 3
  },
  bray1: {
    distancesRoundSizes: [3],
    scores: indoorMetricScores,
    unit: "m",
    endSize: 3
  }
};

export const gameTypes = Object.keys(gameTypeConfig);

