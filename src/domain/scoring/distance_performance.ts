import { calculateDistanceTotals, calculateAverageScorePerEnd } from './distance_totals';
import { gameTypeConfig } from './game_types';

export interface DistancePerformanceStats {
  distance: number | null;
  unit: string;
  bestEndTotal: number;
  roundsShot: number;
  arrowsShot: number;
  averageEndTotalsOverTime: Array<{
    shootId: number;
    date: string;
    averageEndTotal: number;
  }>;
}

export interface DistancePerformanceData {
  distances: DistancePerformanceStats[];
}

export function analyzeDistancePerformance(shootHistory: any[]): DistancePerformanceData {
  if (!shootHistory || shootHistory.length === 0) {
    return { distances: [] };
  }

  // Group shoots by distance
  const distanceMap = new Map<string, any[]>();

  shootHistory.forEach(shoot => {
    const gameType = shoot.gameType;
    const config = gameTypeConfig[gameType];
    const endSize = config?.endSize || 6;

    try {
      const distanceTotals = calculateDistanceTotals(shoot.scores, gameType, endSize);
      
      distanceTotals.forEach(distanceData => {
        const key = `${distanceData.distance}-${distanceData.unit || ''}`;
        
        if (!distanceMap.has(key)) {
          distanceMap.set(key, []);
        }
        
        const averageEndTotal = calculateAverageScorePerEnd(
          extractDistanceScores(distanceData), 
          endSize, 
          gameType
        );

        distanceMap.get(key)!.push({
          shootId: shoot.id,
          date: shoot.date,
          averageEndTotal,
          distanceData,
          arrowCount: extractDistanceScores(distanceData).length
        });
      });
    } catch (error) {
      // Skip shoots that can't be processed
      console.warn(`Skipping shoot ${shoot.id} due to processing error:`, error);
    }
  });

  // Convert to performance stats
  const distances: DistancePerformanceStats[] = [];

  distanceMap.forEach((shoots, key) => {
    const [distance, unit] = key.split('-');
    
    // Sort by date (most recent first)
    shoots.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Take most recent 10 shoots for the line graph
    const recentShoots = shoots.slice(0, 10);
    
    const stats: DistancePerformanceStats = {
      distance: distance === 'null' ? null : Number(distance),
      unit: unit || '',
      bestEndTotal: calculateBestEndTotal(shoots),
      roundsShot: shoots.length,
      arrowsShot: shoots.reduce((total, s) => total + s.arrowCount, 0),
      averageEndTotalsOverTime: recentShoots.reverse().map(s => ({
        shootId: s.shootId,
        date: s.date,
        averageEndTotal: s.averageEndTotal
      }))
    };
    
    distances.push(stats);
  });

  // Filter out null distances and sort by distance value
  const validDistances = distances.filter(d => d.distance !== null);
  validDistances.sort((a, b) => a.distance! - b.distance!);

  return { distances: validDistances };
}

function extractDistanceScores(distanceData: any): any[] {
  const scores: any[] = [];
  distanceData.roundBreakdown.forEach((endPair: any) => {
    scores.push(...endPair.firstEnd, ...endPair.secondEnd);
  });
  return scores;
}

function calculateBestEndTotal(shoots: any[]): number {
  let bestEndTotal = 0;
  
  shoots.forEach(shoot => {
    const distanceData = shoot.distanceData;
    if (!distanceData || !distanceData.roundBreakdown) {
      return;
    }
    
    // Check each individual end (both firstEnd and secondEnd in each endPair)
    distanceData.roundBreakdown.forEach((endPair: any) => {
      // Calculate firstEnd total
      if (endPair.firstEnd && endPair.firstEnd.length > 0) {
        const firstEndTotal = calculateEndTotal(endPair.firstEnd);
        bestEndTotal = Math.max(bestEndTotal, firstEndTotal);
      }
      
      // Calculate secondEnd total
      if (endPair.secondEnd && endPair.secondEnd.length > 0) {
        const secondEndTotal = calculateEndTotal(endPair.secondEnd);
        bestEndTotal = Math.max(bestEndTotal, secondEndTotal);
      }
    });
  });
  
  return bestEndTotal;
}

function calculateEndTotal(endScores: any[]): number {
  return endScores.reduce((total, score) => {
    if (score === 'X') return total + 10;
    if (score === 'M' || score === null || score === undefined) return total;
    return total + Number(score);
  }, 0);
}