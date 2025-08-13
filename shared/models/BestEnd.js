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
 * Calculate distance information for a round
 * Adapted from EndTotalChart component logic
 */
function calculateDistanceInfo(config, totalEnds) {
    const { distancesRoundSizes } = config;
    
    // Determine if this is a practice round
    const isPracticeRound = !distancesRoundSizes ||
        (distancesRoundSizes.length === 1 && distancesRoundSizes[0] === 100);
    
    if (isPracticeRound) {
        // For practice rounds, all ends are at the same distance
        const distance = config.isImperial ? config.maxDistanceYards : config.maxDistanceMetres;
        const unit = config.isImperial ? 'yd' : 'm';
        
        return {
            endDistances: Array(totalEnds).fill(distance || null),
            unit,
            distanceChanges: Array(totalEnds).fill(false)
        };
    }
    
    // For standard rounds, calculate distance changes
    const distances = [];
    const unit = config.isImperial ? 'yd' : 'm';
    
    if (config.isImperial) {
        if (config.maxDistanceYards) distances.push(config.maxDistanceYards);
        if (config.otherDistancesYards) distances.push(...config.otherDistancesYards);
    } else {
        if (config.maxDistanceMetres) distances.push(config.maxDistanceMetres);
        if (config.otherDistancesMetres) distances.push(...config.otherDistancesMetres);
    }
    
    // Map each end to its distance
    const endDistances = [];
    const distanceChanges = [];
    let currentEndIndex = 0;
    
    for (let distanceIndex = 0; distanceIndex < distancesRoundSizes.length; distanceIndex++) {
        const dozens = distancesRoundSizes[distanceIndex];
        const arrowsForThisDistance = Math.round(dozens * 12);
        const endsForThisDistance = Math.ceil(arrowsForThisDistance / config.endSize);
        
        for (let i = 0; i < endsForThisDistance && currentEndIndex < totalEnds; i++) {
            endDistances[currentEndIndex] = distances[distanceIndex] || null;
            // Mark the first end of each new distance (except the very first end)
            distanceChanges[currentEndIndex] = distanceIndex > 0 && i === 0;
            currentEndIndex++;
        }
    }
    
    return {
        endDistances,
        unit,
        distanceChanges
    };
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

/**
 * Finds best end for a single round (helper function)
 */
function findBestEndForRound(roundName, participants) {
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
    
    // Only return if we found at least one complete end
    if (bestEndData && bestArcherName) {
        return {
            roundName,
            archerName: bestArcherName,
            endScores: bestEndData.endScores,
            totalScore: bestEndData.totalScore,
            endSize: roundEndSize
        };
    }
    
    return null;
}

/**
 * Finds best ends for each distance in a multi-distance round
 */
function findBestEndsForMultiDistanceRound(roundName, participants, roundConfig) {
    const bestEnds = [];
    
    // Get the maximum number of ends any participant has shot
    const maxEnds = Math.max(
        ...participants.map(p => {
            if (!p.scores || p.scores.length === 0) return 0;
            return Math.floor(p.scores.length / roundConfig.endSize);
        })
    );
    
    if (maxEnds === 0) return [];
    
    // Calculate distance information
    const distanceInfo = calculateDistanceInfo(roundConfig, maxEnds);
    
    // Group ends by distance
    const endsByDistance = new Map();
    
    for (let endIndex = 0; endIndex < maxEnds; endIndex++) {
        const distance = distanceInfo.endDistances[endIndex];
        if (distance !== null) {
            if (!endsByDistance.has(distance)) {
                endsByDistance.set(distance, []);
            }
            endsByDistance.get(distance).push(endIndex);
        }
    }
    
    // Find best end for each distance
    for (const [distance, endIndices] of endsByDistance) {
        let bestEndData = null;
        let bestArcherName = null;
        
        // Check all participants for their best end at this distance
        for (const participant of participants) {
            if (!participant.scores || participant.scores.length === 0) continue;
            
            const ends = splitIntoChunks(participant.scores, roundConfig.endSize);
            const completeEnds = ends.filter((end) => end.length === roundConfig.endSize);
            
            // Check ends at this distance
            for (const endIndex of endIndices) {
                if (endIndex < completeEnds.length) {
                    const end = completeEnds[endIndex];
                    const endScore = calculateTotal(convertToValues(end, roundName));
                    
                    if (!bestEndData || endScore > bestEndData.totalScore) {
                        bestEndData = {
                            endScores: end,
                            totalScore: endScore
                        };
                        bestArcherName = participant.archerName;
                    }
                }
            }
        }
        
        // Add best end for this distance if found
        if (bestEndData && bestArcherName) {
            bestEnds.push({
                roundName,
                archerName: bestArcherName,
                endScores: bestEndData.endScores,
                totalScore: bestEndData.totalScore,
                endSize: roundConfig.endSize,
                distance: distance,
                distanceUnit: distanceInfo.unit
            });
        }
    }
    
    return bestEnds;
}

/**
 * Finds the best ends for each distance in each round of a shoot
 * For multi-distance rounds, returns one best end per distance
 * For single-distance rounds, returns one best end (same as findBestEnds)
 * 
 * @param shoot - The shoot to analyze
 * @param getRoundConfig - Function to get round configuration by round name
 * @returns Array of best ends, potentially multiple per round (one per distance)
 */
export function findBestEndsByDistance(shoot, getRoundConfig) {
    const groupedParticipants = groupParticipantsByRound(shoot.participants);
    const bestEnds = [];
    
    for (const [roundName, participants] of Object.entries(groupedParticipants)) {
        const roundConfig = getRoundConfig(roundName);
        if (!roundConfig) {
            // Fallback to original behavior if no config available
            const legacyBestEnd = findBestEndForRound(roundName, participants);
            if (legacyBestEnd) {
                bestEnds.push(legacyBestEnd);
            }
            continue;
        }
        
        // Check if this is a multi-distance round
        const isMultiDistance = roundConfig.distancesRoundSizes && 
                               roundConfig.distancesRoundSizes.length > 1 &&
                               !(roundConfig.distancesRoundSizes.length === 1 && roundConfig.distancesRoundSizes[0] === 100);
        
        if (!isMultiDistance) {
            // Single distance round - use original behavior
            const legacyBestEnd = findBestEndForRound(roundName, participants);
            if (legacyBestEnd) {
                bestEnds.push(legacyBestEnd);
            }
            continue;
        }
        
        // Multi-distance round - find best end for each distance
        const distanceBestEnds = findBestEndsForMultiDistanceRound(roundName, participants, roundConfig);
        bestEnds.push(...distanceBestEnds);
    }
    
    return bestEnds;
}
