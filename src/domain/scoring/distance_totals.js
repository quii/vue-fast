import { splitIntoChunks } from "@/domain/splitter";
import { gameTypeConfig } from "@/domain/scoring/game_types";
import { calculateSubtotals, calculateTotal } from "@/domain/scoring/subtotals";
import { convertToValues } from "@/domain/scoring/scores";

export function calculateDistanceTotals(scores, gameType = "national", endSize = 6) {
  const config = gameTypeConfig[gameType];
  const { distancesRoundSizes } = config;
  const rounds = [];
  let runningTotal = 0;

  // Determine if this is a practice round
  const isPracticeRound = !distancesRoundSizes ||
    (distancesRoundSizes.length === 1 && distancesRoundSizes[0] === 100);

  if (isPracticeRound) {
    // For practice rounds, treat all arrows as a single distance
    const roundData = processRoundScores(scores, gameType, endSize, runningTotal);
    rounds.push(roundData);
  } else {
    // For standard rounds, process each distance separately
    let remainingScores = [...scores];

    for (const dozens of distancesRoundSizes) {
      const arrowsPerDistance = Math.round(dozens * 12);
      const distanceScores = remainingScores.slice(0, arrowsPerDistance);
      remainingScores = remainingScores.slice(arrowsPerDistance);

      const roundData = processRoundScores(distanceScores, gameType, endSize, runningTotal);
      runningTotal += roundData.subTotals.totalScore;
      rounds.push(roundData);
    }
  }

  return rounds;
}

/**
 * Process scores for a single round/distance
 * @param {Array} scores - The scores for this round
 * @param {string} gameType - The game type
 * @param {number} endSize - The number of arrows per end
 * @param {number} initialRunningTotal - The running total before this round
 * @returns {Object} The processed round data
 */
function processRoundScores(scores, gameType, endSize, initialRunningTotal) {
  const endsForDistance = splitIntoChunks(scores, endSize);
  const roundBreakdown = [];
  let runningTotal = initialRunningTotal;

  // Process ends in pairs
  for (let i = 0; i < endsForDistance.length; i += 2) {
    const firstEnd = endsForDistance[i] || [];
    const secondEnd = endsForDistance[i + 1] || [];
    const endScores = [...firstEnd, ...secondEnd];

    const subTotals = calculateSubtotals(endScores, gameType);
    subTotals.runningTotal = runningTotal + subTotals.totalScore;
    runningTotal = subTotals.runningTotal;

    roundBreakdown.push({ firstEnd, secondEnd, subTotals });
  }

  // Calculate subtotals for the entire distance
  const subTotals = calculateSubtotals(scores, gameType);

  return { roundBreakdown, subTotals };
}

export function calculateAverageScorePerEnd(scores, endSize, gameType) {
  const chunks = splitIntoChunks(scores, endSize);
  const wholeChunks = chunks.filter(c => c.length === endSize);

  if (wholeChunks.length === 0) return 0;

  const avg = calculateTotal(wholeChunks.map(end => calculateTotal(convertToValues(end, gameType)))) / wholeChunks.length;
  return Math.ceil(avg);
}
