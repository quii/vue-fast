import { calculateDistanceTotals, calculateAverageScorePerEnd, calculateAverageArrowScorePerDistance } from './distance_totals';
import { gameTypeConfig } from './game_types';

export interface IndividualShootComparison {
  shoot: {
    id: number;
    date: string;
    score: number;
  };
  totalScoreDifference: number;
  distances: Array<{
    distance: number | null;
    unit: string;
    averageEndTotalDifference: number;
    averageArrowValueDifference: number;
    distanceTotalDifference: number;
  }>;
}

export interface ShootComparison {
  currentShoot: {
    totalScore: number;
    distances: Array<{
      distance: number | null;
      unit: string;
      averageEndTotal: number;
      averageArrowValue: number;
      distanceTotal: number;
    }>;
  };
  historicalComparisons: IndividualShootComparison[];
}

export function compareShootWithHistory(
  currentShoot: any,
  historicalShoots: any[]
): ShootComparison | null {
  // Don't show comparison if no historical data
  if (!historicalShoots || historicalShoots.length === 0) {
    return null;
  }

  const gameType = currentShoot.gameType;
  const config = gameTypeConfig[gameType];
  const endSize = config?.endSize || 6;

  // Calculate current shoot stats
  const currentDistanceTotals = calculateDistanceTotals(currentShoot.scores, gameType, endSize);
  const currentAverageArrowScores = calculateAverageArrowScorePerDistance(currentShoot.scores, gameType, endSize);
  
  // Build current shoot data structure
  const currentShootData = {
    totalScore: currentShoot.score,
    distances: currentDistanceTotals.map((currentDistance, index) => {
      const currentAverageEnd = calculateAverageScorePerEnd(
        extractDistanceScores(currentDistance), 
        endSize, 
        gameType
      );
      const currentAverageArrow = currentAverageArrowScores[index]?.averageArrowScore || 0;

      return {
        distance: currentDistance.distance,
        unit: currentDistance.unit || '',
        averageEndTotal: currentAverageEnd,
        averageArrowValue: currentAverageArrow,
        distanceTotal: currentDistance.subTotals.totalScore
      };
    })
  };

  // Compare against each historical shoot individually
  const historicalComparisons = historicalShoots.map(historicalShoot => {
    return compareAgainstIndividualShoot(currentShootData, historicalShoot, gameType, endSize);
  });

  return {
    currentShoot: currentShootData,
    historicalComparisons
  };
}

function compareAgainstIndividualShoot(
  currentShoot: any, 
  historicalShoot: any, 
  gameType: string, 
  endSize: number
): IndividualShootComparison {
  // Calculate historical shoot stats
  const historicalDistanceTotals = calculateDistanceTotals(historicalShoot.scores, gameType, endSize);
  const historicalAverageArrowScores = calculateAverageArrowScorePerDistance(historicalShoot.scores, gameType, endSize);
  
  // Calculate total score difference
  const totalScoreDifference = currentShoot.totalScore - historicalShoot.score;
  
  // Calculate differences for each distance
  const distances = currentShoot.distances.map((currentDistance: any, index: number) => {
    const historicalDistance = historicalDistanceTotals[index];
    const historicalAverageEnd = historicalDistance 
      ? calculateAverageScorePerEnd(extractDistanceScores(historicalDistance), endSize, gameType)
      : 0;
    const historicalAverageArrow = historicalAverageArrowScores[index]?.averageArrowScore || 0;

    const historicalDistanceTotal = historicalDistance ? historicalDistance.subTotals.totalScore : 0;

    return {
      distance: currentDistance.distance,
      unit: currentDistance.unit,
      averageEndTotalDifference: currentDistance.averageEndTotal - historicalAverageEnd,
      averageArrowValueDifference: currentDistance.averageArrowValue - historicalAverageArrow,
      distanceTotalDifference: currentDistance.distanceTotal - historicalDistanceTotal
    };
  });

  return {
    shoot: {
      id: historicalShoot.id,
      date: historicalShoot.date,
      score: historicalShoot.score
    },
    totalScoreDifference,
    distances
  };
}

function extractDistanceScores(distanceData: any): any[] {
  const scores: any[] = [];
  distanceData.roundBreakdown.forEach((endPair: any) => {
    scores.push(...endPair.firstEnd, ...endPair.secondEnd);
  });
  return scores;
}