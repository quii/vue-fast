import { gameTypeConfig } from "@/domain/game_types";
import splitIntoChunksofSizes, { splitIntoChunks } from "@/domain/splitter";

const GOLD = 9
export const MISS = 'M'
export const validScores = [GOLD, 7, 5, 3, 1, MISS]
export const scoresPerEnd = 6
export const endsPerRound = 2

export function calculateTotal(scores) {
  return getHits(scores).reduce((totalScore, score) => totalScore + score, 0)
}

export function calculateHitsCount(scores) {
  return getHits(scores).length
}

export function calculateGoldCount(scores) {
  return scores.reduce((total, score) => {
    if (score === GOLD) {
      return total + 1
    }
    return total
  }, 0)
}

export function calculateRounds(scores, gameType = 'national') {
  const rounds = calculateRoundSummaries(scores);
  const roundsPerDistance = splitIntoChunksofSizes(rounds, gameTypeConfig[gameType].distancesRoundSizes)

  return roundsPerDistance.map(rounds => {
    const scoresForDistance = flattenScoresInRounds(rounds)
    rounds.forEach((e) => delete e.scores)

    return {
      roundBreakdown: rounds ?? [],
      subTotals: calculateSubtotals(scoresForDistance)
    }
  })
}

function getHits(scores) {
  return scores.filter((score) => score !== MISS)
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

function calculateSubtotals(scores) {
  return {
    hits: calculateHitsCount(scores),
    totalScore: calculateTotal(scores),
    golds: calculateGoldCount(scores)
  };
}

function flattenScoresInRounds(rounds) {
  return rounds.reduce((scores, round) => {
    scores.push(...round.scores);
    return scores;
  }, []);
}
