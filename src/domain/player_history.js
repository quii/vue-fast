import { userDataFixer } from "@/domain/user_data_fixer";
import { addTopScoreIndicator } from "@/domain/topscores";
import { addClassificationsToHistory } from "@/domain/classification";
import { filterByClassification, filterByDateRange, filterByPB, filterByRound } from "@/domain/history_filters";

Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

export class PlayerHistory {
  constructor(storage) {
    this.storage = storage;
    this.storage.value = userDataFixer(this.storage.value);
  }

  add(date, score, gameType, scores, unit) {
    const nextId = generateNextId(this.storage.value);
    this.storage.value.push({
      id: nextId,
      date,
      score,
      gameType,
      scores,
      unit
    });
    return nextId;
  }

  remove(id) {
    this.storage.value = this.storage.value.filter(item => item.id !== id);
  }

  importHistory(history) {
    this.storage.value = userDataFixer(history);
  }

  async sortedHistory(gender, age, bowType) {
    const scoresWithIndicator = addTopScoreIndicator(this.storage.value);
    const scoresWithClassification = await addClassificationsToHistory(gender, age, bowType, scoresWithIndicator);
    return scoresWithClassification.sort((a, b) => new Date(b.date) - new Date(a.date));
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

  async getFilteredHistory(filters, user) {
    const baseHistory = await this.sortedHistory(user.gender, user.ageGroup, user.bowType);
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