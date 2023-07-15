import splitIntoChunksofSizes, { splitIntoChunks } from "@/domain/splitter";
import { gameTypeConfig } from "@/domain/game_types";
import { calculateSubtotals } from "@/domain/subtotals";
import { endsPerRound, scoresPerEnd } from "@/domain/scores";

export function calculateRounds(scores, gameType = "national") {
  const rounds = calculateRoundSummaries(scores);
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

function calculateRoundSummaries(scores) {
  let runningTotal = 0;

  const scoresPerRound = splitIntoChunks(splitIntoChunks(scores, scoresPerEnd), endsPerRound);

  return scoresPerRound.map((e) => {
    const scores = e.flat();
    const subTotals = calculateSubtotals(scores);
    subTotals.runningTotal = runningTotal + subTotals.totalScore;
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