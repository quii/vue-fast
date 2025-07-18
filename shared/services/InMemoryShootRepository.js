export class InMemoryShootRepository {
    constructor() {
        this.shoots = new Map();
    }
    async saveShoot(shoot) {
        const existingShoot = this.shoots.get(shoot.code);
        if (existingShoot) {
            // Create deep copies to work with
            const currentShoot = this.deepCloneWithDates(existingShoot);
            const incomingShoot = this.deepCloneWithDates(shoot);
            // Check if this is a participant removal operation
            const isRemovalOperation = incomingShoot.participants.length < currentShoot.participants.length &&
                incomingShoot.lastUpdated.getTime() > currentShoot.lastUpdated.getTime();
            if (isRemovalOperation) {
                // For removal operations, just use the incoming shoot
                this.shoots.set(shoot.code, incomingShoot);
            }
            else {
                // For other operations, merge the changes
                this.mergeShootChanges(currentShoot, incomingShoot);
                this.shoots.set(shoot.code, currentShoot);
            }
        }
        else {
            // For new shoots, just store a deep copy
            const deepCopy = this.deepCloneWithDates(shoot);
            this.shoots.set(shoot.code, deepCopy);
        }
    }
    async getShootByCode(code) {
        const shoot = this.shoots.get(code);
        if (!shoot) {
            return null;
        }
        // Check if the shoot has expired
        const now = new Date();
        const expiresAt = new Date(shoot.expiresAt);
        if (now > expiresAt) {
            this.shoots.delete(code);
            return null;
        }
        // Return a deep copy
        return this.deepCloneWithDates(shoot);
    }
    async deleteShoot(code) {
        this.shoots.delete(code);
    }
    async codeExists(code) {
        return this.shoots.has(code);
    }
    // Helper method for testing
    clear() {
        this.shoots.clear();
    }
    /**
     * Creates a deep clone of a shoot object while properly preserving Date objects
     */
    deepCloneWithDates(shoot) {
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
    /**
     * Merges changes from a source shoot into a target shoot
     */
    mergeShootChanges(target, source) {
        // Update lastUpdated timestamp to the latest of the two
        if (source.lastUpdated.getTime() > target.lastUpdated.getTime()) {
            target.lastUpdated = new Date(source.lastUpdated);
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
}
