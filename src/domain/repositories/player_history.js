import { backfillUserProfiles, userDataFixer } from "@/domain/user_data_fixer";
import { addTopScoreIndicator } from "@/domain/scoring/topscores";
import { addClassificationsToHistory } from "@/domain/scoring/classification";
import { filterByClassification, filterByDateRange, filterByPB, filterByRound } from "@/domain/history_filters";
import { addHandicapToHistory } from "@/domain/scoring/handicap";

Date.prototype.addDays = function (days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

export class PlayerHistory {
  constructor(storage, currentUserProfile = null) {
    this.storage = storage;
    this.storage.value = prepareHistoryData(this.storage.value, currentUserProfile);
  }

  add(date, score, gameType, scores, unit, userProfile) {
    const nextId = generateNextId(this.storage.value);
    this.storage.value.push({
      id: nextId,
      date,
      score,
      gameType,
      scores,
      unit,
      userProfile
    });
    return nextId;
  }

  remove(id) {
    this.storage.value = this.storage.value.filter(item => item.id !== id);
  }

  importHistory(history, currentUserProfile = null) {
    // Use the same function here as in the constructor
    this.storage.value = prepareHistoryData(history, currentUserProfile);
  }

  async sortedHistory() {
    const scoresWithIndicator = addTopScoreIndicator(this.storage.value);
    const scoresWithClassification = await addClassificationsToHistory(scoresWithIndicator);
    const scoresWithHandicaps = await addHandicapToHistory(scoresWithClassification)
    return scoresWithHandicaps.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  personalBest(round) {
    const roundScores = getScoresForRound(this.storage.value, round);
    return getHighestScore(roundScores);
  }

  totalArrows() {
    return this.storage.value.reduce((acc, item) => acc + item.scores.length, 0);
  }

  getRecentGameTypes() {
    const recentGames = this.storage.value.filter(game => isWithinLastSixWeeks(game.date));
    return getUniqueGameTypes(recentGames);
  }

  getAvailableRounds() {
    return [...new Set(this.storage.value.map(h => h.gameType))];
  }

  async getFilteredHistory(filters) {
    const baseHistory = await this.sortedHistory();
    const filteredByPB = filterByPB(baseHistory, filters.pbOnly);
    const filteredByRound = filterByRound(filteredByPB, filters.round);
    const filteredByDateRange = filterByDateRange(filteredByRound, filters.dateRange);
    const filteredByClassification = filterByClassification(filteredByDateRange, filters.classification);

    return filteredByClassification;
  }
}

function generateNextId(history) {
  const maxId = history
    .map(x => x.id)
    .sort((a, b) => a.score - b.score)
    .slice(-1)[0] || 0;
  return parseInt(maxId, 10) + 1;
}

function isWithinLastSixWeeks(date) {
  const sixWeeksAgo = new Date().addDays(-42);
  return new Date(date) > sixWeeksAgo;
}

function getUniqueGameTypes(history) {
  return [...new Set(history.map(game => game.gameType))];
}

function getScoresForRound(history, round) {
  return history
    .filter(x => x.gameType === round)
    .map(x => x.score);
}

function getHighestScore(scores) {
  const sortedScores = scores.sort((a, b) => b - a);
  return sortedScores[0];
}

function prepareHistoryData(historyData, currentUserProfile = null) {
  let fixedData = userDataFixer(historyData);

  if (currentUserProfile) {
    fixedData = backfillUserProfiles(fixedData, currentUserProfile);
  }

  return fixedData;
}