import splitIntoChunksofSizes, { splitIntoChunks } from "@/domain/splitter";
import { gameTypeConfig } from "@/domain/game_types";
import { calculateSubtotals } from "@/domain/subtotals";

const endsPerRound = 2;

export function calculateRounds(scores, gameType = "national", endSize) {
  const rounds = calculateRoundSummaries(scores, endSize);
  const roundsPerDistance = splitIntoChunksofSizes(rounds, gameTypeConfig[gameType].distancesRoundSizes);

  return roundsPerDistance.map(rounds => {
    const scoresForDistance = flattenScoresInRounds(rounds);
    rounds.forEach((e) => delete e.scores);

    return {
      roundBreakdown: rounds ?? [],
      subTotals: calculateSubtotals(scoresForDistance)
    };
  });
}

function calculateRoundSummaries(scores, endSize) {
  let runningTotal = 0;

  const scoresPerRound = splitIntoChunks(splitIntoChunks(scores, endSize), endsPerRound);

  return scoresPerRound.map((e) => {
    const scores = e.flat();
    const subTotals = calculateSubtotals(scores);
    subTotals.runningTotal = runningTotal + subTotals.totalScore;
    // subTotals.onTrackFor252 = subTotals.runningTotal >= (index+1)*84
    runningTotal = subTotals.runningTotal;

    return { firstEnd: e[0] ?? [], secondEnd: e[1] ?? [], subTotals, scores };
  });
}

function flattenScoresInRounds(rounds) {
  return rounds.reduce((scores, round) => {
    scores.push(...round.scores);
    return scores;
  }, []);
}