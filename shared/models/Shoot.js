/**
 * Groups participants by their round name
 * @param participants - Array of ShootParticipant objects
 * @returns Object with roundName as keys and arrays of participants as values
 */
export function groupParticipantsByRound(participants) {
    return participants.reduce((groups, participant) => {
        const roundName = participant.roundName;
        if (!groups[roundName]) {
            groups[roundName] = [];
        }
        groups[roundName].push(participant);
        return groups;
    }, {});
}
/**
 * Gets all unique round names from a list of participants
 * @param participants - Array of ShootParticipant objects
 * @returns Array of unique round names, sorted alphabetically
 */
export function getUniqueRoundNames(participants) {
    const uniqueRounds = new Set(participants.map(p => p.roundName));
    return Array.from(uniqueRounds).sort();
}
