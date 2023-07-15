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
  const { distancesRoundSizes } = gameTypeConfig[gameType]

  const roundsPerDistance = splitIntoChunksofSizes(rounds, distancesRoundSizes)

  return [...Array(distancesRoundSizes.length).keys()].map((i) => {
    const round = roundsPerDistance[i]

    const distanceScores = round.reduce((scores, round) => {
      scores.push(...round.scores)
      return scores
    }, [])

    round.forEach((e) => delete e.scores)

    return {
      roundBreakdown: round ?? [],
      subTotals: {
        hits: calculateHitsCount(distanceScores),
        totalScore: calculateTotal(distanceScores),
        golds: calculateGoldCount(distanceScores)
      }
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
    // figure out subtotals
    const flatted = e.flat();
    let roundScore = calculateTotal(flatted);
    const subTotals = {
      hits: calculateHitsCount(flatted),
      golds: calculateGoldCount(flatted),
      score: roundScore,
      runningTotal: runningTotal + roundScore
    };
    runningTotal = subTotals.runningTotal;

    return { firstEnd: e[0] ?? [], secondEnd: e[1] ?? [], subTotals, scores: flatted };
  });
}
