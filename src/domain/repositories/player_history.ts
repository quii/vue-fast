import { gameTypeConfig } from '@/domain/scoring/game_types.js'
import { backfillUserProfiles, userDataFixer } from '@/domain/user_data_fixer'
import { addTopScoreIndicator } from '@/domain/scoring/topscores'
import { addClassificationsToHistory } from '@/domain/scoring/classification'
import { filterByClassification, filterByDateRange, filterByPB, filterByRound } from '@/domain/history_filters'
import { addHandicapToHistory } from '@/domain/scoring/handicap'
import { DEFAULT_SHOOT_STATUS, ShootStatus } from '@/domain/shoot/shoot_status'

// Extend Date prototype with addDays method
declare global {
  interface Date {
    addDays(days: number): Date;
  }
}

Date.prototype.addDays = function(days: number): Date {
  const date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

// Define interfaces for type safety
export interface UserProfile {
  gender?: string;
  ageGroup?: string;
  bowType?: string;
  classification?: string;
}

export interface HistoryItem {
  id: number | string;
  date: string;
  score: number;
  gameType: string;
  scores: any[]; // Keep as any[] to maintain backward compatibility
  unit?: string;
  userProfile?: UserProfile;
  topScore?: boolean;
  classification?: {
    name: string;
    scheme: string;
  };
  handicap?: number;
  averagePerEnd?: number | null;
  shootStatus?: ShootStatus;
}

export interface HistoryFilters {
  pbOnly?: boolean;
  round?: string | null;
  dateRange?: {
    startDate?: Date | null;
    endDate?: Date | null;
  };
  classification?: string | null;
  shootStatus?: ShootStatus | null;
}

export interface StorageInterface {
  value: HistoryItem[];
}

// Define the interface for the repository
export interface PlayerHistoryRepository {
  add(date: string, score: number, gameType: string, scores: any[], unit?: string, userProfile?: UserProfile, shootStatus?: ShootStatus): number | string;
  remove(id: number | string): void;
  getById(id: number): HistoryItem | undefined;
  importHistory(history: HistoryItem[], currentUserProfile?: UserProfile | null): void;
  sortedHistory(): Promise<HistoryItem[]>;
  personalBest(round: string): number | undefined;
  totalArrows(): number;
  getRecentGameTypes(): string[];
  getAvailableRounds(): string[];
  addAverageEndScores(history: HistoryItem[]): HistoryItem[];
  getFilteredHistory(filters: HistoryFilters, userProfile?: UserProfile): Promise<HistoryItem[]>;
  getShootStatusesUsed(): ShootStatus[];
  getBowTypesUsed(currentBowType?: string | null): string[];
  updateShoot(id: number | string, updates: Partial<HistoryItem>): boolean;

  backfillClassifications(): Promise<void>;
}

// Factory function to create a player history repository
export function createPlayerHistory(storage: StorageInterface = { value: [] }, currentUserProfile: UserProfile | null = null): PlayerHistoryRepository {
  // Initialize the data
  storage.value = prepareHistoryData(storage.value, currentUserProfile);

  // Return an object with all the repository methods
  return {
    add(date, score, gameType, scores, unit, userProfile, shootStatus = DEFAULT_SHOOT_STATUS) {
      const nextId = generateNextId(storage.value);
      storage.value.push({
        id: nextId,
        date,
        score,
        gameType,
        scores,
        unit,
        userProfile,
        shootStatus
      });
      return nextId;
    },

    getById(id) {
      return storage.value.find(item => item.id === id);
    },

    remove(id) {
      storage.value = storage.value.filter(item => item.id !== id);
    },

    importHistory(history, currentUserProfile = null) {
      storage.value = prepareHistoryData(history, currentUserProfile);
    },

    async sortedHistory() {
      const scoresWithIndicator = addTopScoreIndicator(storage.value);
      const scoresWithClassification = await addClassificationsToHistory(scoresWithIndicator);
      const scoresWithHandicaps = await addHandicapToHistory(scoresWithClassification);
      const scoresWithAverages = this.addAverageEndScores(scoresWithHandicaps);
      return scoresWithAverages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },

    personalBest(round) {
      const roundScores = getScoresForRound(storage.value, round);
      return getHighestScore(roundScores);
    },

    totalArrows() {
      return storage.value.reduce((acc, item) => acc + item.scores.length, 0);
    },

    getRecentGameTypes() {
      const recentGames = storage.value.filter(game => isWithinLastSixWeeks(game.date));
      return getUniqueGameTypes(recentGames);
    },

    getAvailableRounds() {
      const uniqueRounds = [...new Set(storage.value.map(h => h.gameType))];
      return uniqueRounds.sort((a, b) => {
        return a.toLowerCase().localeCompare(b.toLowerCase());
      });
    },

    addAverageEndScores(history) {
      return history.map(item => {
        // Get the game type configuration
        const gameType = item.gameType?.toLowerCase();
        if (!gameType || !gameTypeConfig[gameType]) {
          return { ...item, averagePerEnd: null };
        }

        // Get the end size
        const endSize = gameTypeConfig[gameType].endSize;
        if (!endSize || endSize <= 0 || item.scores.length === 0) {
          return { ...item, averagePerEnd: null };
        }

        // Calculate average per arrow, then multiply by end size
        const averagePerArrow = item.score / item.scores.length;
        const averagePerEnd = Math.round((averagePerArrow * endSize) * 10) / 10; // Round to 1 decimal place
        return { ...item, averagePerEnd };
      });
    },

    async getFilteredHistory(filters, userProfile) {
      const baseHistory = await this.sortedHistory();
      const filteredByPB = filterByPB(baseHistory, filters.pbOnly);
      const filteredByRound = filterByRound(filteredByPB, filters.round);
      const filteredByDateRange = filterByDateRange(filteredByRound, filters.dateRange);
      const filteredByClassification = filterByClassification(filteredByDateRange, filters.classification);
      const filteredByShootStatus = filterByShootStatus(filteredByClassification, filters.shootStatus);

      return filteredByShootStatus;
    },

    getShootStatusesUsed() {
      const statusesSet = new Set<ShootStatus>();

      storage.value.forEach(item => {
        if (item.shootStatus) {
          statusesSet.add(item.shootStatus);
        }
      });

      return Array.from(statusesSet);
    },

    getBowTypesUsed(currentBowType = null) {
      const bowTypesSet = new Set<string>();

      storage.value.forEach(item => {
        if (item.userProfile?.bowType) {
          bowTypesSet.add(item.userProfile.bowType);
        }
      });

      // Add current bow type if provided and not already in the set
      if (currentBowType) {
        bowTypesSet.add(currentBowType);
      }

      return Array.from(bowTypesSet);
    },

    updateShoot(id, updates) {
      const shootIndex = storage.value.findIndex(item => item.id === id);

      if (shootIndex === -1) {
        return false; // Shoot not found
      }

      // Update the shoot with the provided updates
      storage.value[shootIndex] = {
        ...storage.value[shootIndex],
        ...updates
      };

      return true;
    },

    async backfillClassifications() {
      storage.value = await addClassificationsToHistory(storage.value)
    }
  };
}

function generateNextId(history: HistoryItem[]): number {
  const maxId = history
    .map(x => Number(x.id))
    .sort((a, b) => a - b)
    .slice(-1)[0] || 0;
  return maxId + 1;
}

export function filterByShootStatus(history: HistoryItem[], shootStatus: ShootStatus | null): HistoryItem[] {
  if (!shootStatus) return history;

  return history.filter(item => {
    if (shootStatus === "Practice") {
      return item.shootStatus === "Practice" || item.shootStatus === undefined;
    }

    return item.shootStatus === shootStatus;
  });
}

function isWithinLastSixWeeks(date: string): boolean {
  const sixWeeksAgo = new Date().addDays(-42);
  return new Date(date) > sixWeeksAgo;
}

function getUniqueGameTypes(history: HistoryItem[]): string[] {
  return [...new Set(history.map(game => game.gameType))];
}

function getScoresForRound(history: HistoryItem[], round: string): number[] {
  return history
    .filter(x => x.gameType === round)
    .map(x => x.score);
}

function getHighestScore(scores: number[]): number | undefined {
  if (scores.length === 0) return undefined;
  const sortedScores = scores.sort((a, b) => b - a);
  return sortedScores[0];
}

function prepareHistoryData(historyData: HistoryItem[], currentUserProfile: UserProfile | null = null): HistoryItem[] {
  let fixedData = userDataFixer(historyData);

  if (currentUserProfile) {
    fixedData = backfillUserProfiles(fixedData, currentUserProfile);
  }

  return fixedData;
}

