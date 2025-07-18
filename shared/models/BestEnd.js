import { groupParticipantsByRound } from './Shoot.js';
import { splitIntoChunks } from '../../src/domain/splitter.js';
import { calculateTotal } from '../../src/domain/scoring/subtotals.js';
import { convertToValues } from '../../src/domain/scoring/scores.js';
/**
 * Gets the end size for best end calculation
 * Most rounds use 6 arrows per end, Worcester uses 5
 */
function getEndSizeForBestEnd(roundName) {
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
function findBestEndForParticipant(participant) {
    if (!participant.scores || participant.scores.length === 0) {
        return null;
    }
    const endSize = getEndSizeForBestEnd(participant.roundName);
    const ends = splitIntoChunks(participant.scores, endSize);
    // Only consider complete ends
    const completeEnds = ends.filter((end) => end.length === endSize);
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
export function findBestEnds(shoot) {
    const groupedParticipants = groupParticipantsByRound(shoot.participants);
    const bestEnds = [];
    for (const [roundName, participants] of Object.entries(groupedParticipants)) {
        let bestEndData = null;
        let bestArcherName = null;
        const roundEndSize = getEndSizeForBestEnd(roundName);
        // Find the best end across all participants in this round
        for (const participant of participants) {
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
