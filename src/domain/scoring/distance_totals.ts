import { splitIntoChunks } from "@shared/utils/splitter";
import { gameTypeConfig } from "@/domain/scoring/game_types";
import { calculateSubtotals, Subtotals } from "@/domain/scoring/subtotals";
import { calculateTotal } from "@shared/utils/subtotals";
import { convertToValues } from "@shared/utils/scores";

export interface EndPairBreakdown {
  firstEnd: any[];
  secondEnd: any[];
  subTotals: Subtotals & { runningTotal: number };
}

export interface DistanceRound {
  roundBreakdown: EndPairBreakdown[];
  subTotals: Subtotals;
  distance?: number | null;
  unit?: string;
}

export function calculateDistanceTotals(scores: any[], gameType: string = "national", endSize: number = 6): DistanceRound[] {
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

    // For practice rounds, use the appropriate distance based on imperial/metric
    if (config.isImperial) {
      roundData.distance = config.maxDistanceYards
      roundData.unit = 'yd'
    } else {
      roundData.distance = config.maxDistanceMetres
      roundData.unit = 'm'
    }

    rounds.push(roundData);
  } else {
    // For standard rounds, process each distance separately
    let remainingScores = [...scores];

    // Build the complete distances array based on imperial/metric
    const distances = []
    const unit = config.isImperial ? 'yd' : 'm'

    if (config.isImperial) {
      // For imperial rounds, use yards
      if (config.maxDistanceYards) {
        distances.push(config.maxDistanceYards)
      }
      if (config.otherDistancesYards) {
        distances.push(...config.otherDistancesYards)
      }
    } else {
      // For metric rounds, use meters
      if (config.maxDistanceMetres) {
        distances.push(config.maxDistanceMetres)
      }
      if (config.otherDistancesMetres) {
        distances.push(...config.otherDistancesMetres)
      }
    }

    // Make sure we have the right number of distances
    if (distances.length !== distancesRoundSizes.length) {
      console.warn(`Distance count mismatch for ${gameType}: expected ${distancesRoundSizes.length}, got ${distances.length}`)
    }

    for (let i = 0; i < distancesRoundSizes.length; i++) {
      const dozens = distancesRoundSizes[i]
      const arrowsPerDistance = Math.round(dozens * 12);
      const distanceScores = remainingScores.slice(0, arrowsPerDistance);
      remainingScores = remainingScores.slice(arrowsPerDistance);

      const roundData = processRoundScores(distanceScores, gameType, endSize, runningTotal);
      runningTotal += roundData.subTotals.totalScore;

      // Add distance information
      roundData.distance = distances[i] || null
      roundData.unit = unit

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

export function calculateAverageArrowScorePerDistance(scores: any[], gameType: string = "national", endSize: number = 6): Array<{ distance: number | null, unit: string, averageArrowScore: number }> {
  const distanceTotals = calculateDistanceTotals(scores, gameType, endSize);
  
  return distanceTotals.map(distanceData => {
    // Extract all arrow scores for this distance
    const distanceScores: any[] = [];
    distanceData.roundBreakdown.forEach(endPair => {
      distanceScores.push(...endPair.firstEnd, ...endPair.secondEnd);
    });
    
    // Filter out null/undefined scores and convert to numeric values
    const validScores = distanceScores.filter(score => score !== null && score !== undefined);
    if (validScores.length === 0) {
      return {
        distance: distanceData.distance,
        unit: distanceData.unit || '',
        averageArrowScore: 0
      };
    }
    
    // Convert scores to numeric values
    const numericScores = convertToValues(validScores, gameType);
    const total = calculateTotal(numericScores);
    const average = total / validScores.length;
    
    return {
      distance: distanceData.distance,
      unit: distanceData.unit || '',
      averageArrowScore: Math.round(average * 10) / 10 // Round to 1 decimal place
    };
  });
}
