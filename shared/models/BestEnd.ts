import { Shoot, ShootParticipant, groupParticipantsByRound } from './Shoot.js';
import { splitIntoChunks } from '../utils/splitter.js';
import { calculateTotal } from '../utils/subtotals.js';
import { convertToValues } from '../utils/scores.js';

/**
 * Represents the best end for a specific round
 */
export interface BestEnd {
  /** The round name */
  roundName: string;
  
  /** The archer who shot the best end */
  archerName: string;
  
  /** The arrow scores for the best end */
  endScores: (number | string)[];
  
  /** The total score for this end */
  totalScore: number;
  
  /** The end size (number of arrows per end) */
  endSize: number;
}

/**
 * Gets the end size for best end calculation
 * Most rounds use 6 arrows per end, Worcester uses 5
 */
function getEndSizeForBestEnd(roundName: string): number {
  const lowerRoundName = roundName.toLowerCase();
  
  // Worcester rounds use 5 arrows per end
  if (lowerRoundName.includes('worcester')) {
    return 5;
  }
  
  // All other rounds use 6 arrows per end for best end calculation
  return 6;
}

/**
 * Finds the best end for a single participant using existing domain functions
 */
function findBestEndForParticipant(participant: ShootParticipant): { endScores: (number | string)[], totalScore: number } | null {
  if (!participant.scores || participant.scores.length === 0) {
    return null;
  }
  
  const endSize = getEndSizeForBestEnd(participant.roundName);
  const ends = splitIntoChunks(participant.scores, endSize);
  
  // Only consider complete ends
  const completeEnds = ends.filter((end: (number | string)[]) => end.length === endSize);
  
  if (completeEnds.length === 0) {
    return null;
  }
  
  let bestEnd = completeEnds[0];
  let bestScore = calculateTotal(convertToValues(bestEnd, participant.roundName));
  
  for (const end of completeEnds) {
    const endScore = calculateTotal(convertToValues(end, participant.roundName));
    if (endScore > bestScore) {
      bestEnd = end;
      bestScore = endScore;
    }
  }
  
  return {
    endScores: bestEnd,
    totalScore: bestScore
  };
}

/**
 * Finds the best ends for each round in a shoot
 * Only includes rounds where at least one participant has completed at least one full end
 * 
 * @param shoot - The shoot to analyze
 * @returns Array of best ends, one per round
 */
export function findBestEnds(shoot: Shoot): BestEnd[] {
  const groupedParticipants = groupParticipantsByRound(shoot.participants);
  const bestEnds: BestEnd[] = [];
  
  for (const [roundName, participants] of Object.entries(groupedParticipants)) {
    let bestEndData: { endScores: (number | string)[], totalScore: number } | null = null;
    let bestArcherName: string | null = null;
    const roundEndSize: number = getEndSizeForBestEnd(roundName);
    
    // Find the best end across all participants in this round
    for (const participant of participants as ShootParticipant[]) {
      const participantBestEnd = findBestEndForParticipant(participant);
      
      if (participantBestEnd && 
          (!bestEndData || participantBestEnd.totalScore > bestEndData.totalScore)) {
        bestEndData = participantBestEnd;
        bestArcherName = participant.archerName;
      }
    }
    
    // Only add if we found at least one complete end
    if (bestEndData && bestArcherName) {
      bestEnds.push({
        roundName,
        archerName: bestArcherName,
        endScores: bestEndData.endScores,
        totalScore: bestEndData.totalScore,
        endSize: roundEndSize
      });
    }
  }
  
  return bestEnds;
}
