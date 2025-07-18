/**
 * Merges changes from a source shoot into a target shoot
 * Used for resolving conflicts in optimistic locking
 * @param target The target shoot to update
 * @param source The source shoot with changes
 */
export function mergeShootChanges(target, source) {
    // Update lastUpdated timestamp to the latest of the two
    if (source.lastUpdated.getTime() > target.lastUpdated.getTime()) {
        target.lastUpdated = new Date(source.lastUpdated);
        // If the source has a more recent timestamp and fewer participants,
        // it likely means participants were removed
        if (source.participants.length < target.participants.length) {
            // Get the list of participant IDs in the source
            const sourceParticipantIds = source.participants.map(p => p.id);
            // Filter the target participants to only include those in the source
            target.participants = target.participants.filter(p => sourceParticipantIds.includes(p.id));
        }
    }
    // Process each participant from the source
    for (const sourceParticipant of source.participants) {
        const targetParticipant = target.participants.find(p => p.id === sourceParticipant.id);
        if (targetParticipant) {
            // Update existing participant if source has newer data
            if (sourceParticipant.lastUpdated.getTime() >= targetParticipant.lastUpdated.getTime()) {
                // Update all properties
                Object.assign(targetParticipant, sourceParticipant);
            }
        }
        else {
            // Add new participant
            target.participants.push({ ...sourceParticipant });
        }
    }
}
/**
 * Creates a deep clone of a shoot object while properly preserving Date objects
 */
export function deepCloneWithDates(shoot) {
    // First create a plain object copy
    const copy = JSON.parse(JSON.stringify(shoot));
    // Ensure all date fields are proper Date objects
    copy.createdAt = new Date(shoot.createdAt);
    copy.expiresAt = new Date(shoot.expiresAt);
    copy.lastUpdated = new Date(shoot.lastUpdated);
    // Convert participant dates
    if (copy.participants && Array.isArray(copy.participants)) {
        for (const participant of copy.participants) {
            participant.lastUpdated = new Date(participant.lastUpdated);
        }
    }
    return copy;
}
