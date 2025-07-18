/**
 * Utility functions for shoot code generation and validation
 */
export class ShootCodeUtils {
    /**
     * Generates a random 4-digit code
     */
    static generateCode() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
    /**
     * Validates that a code is in the correct format (4 digits)
     */
    static isValidCode(code) {
        return /^\d{4}$/.test(code);
    }
    /**
     * Calculates the expiration time for a shoot (end of current day)
     */
    static calculateExpirationTime() {
        const now = new Date();
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        return endOfDay;
    }
}
