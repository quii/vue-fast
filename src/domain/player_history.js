import { userDataFixer } from "@/domain/user_data_fixer";
import { addTopScoreIndicator } from "@/domain/topscores";
import { addClassificationsToHistory } from "@/domain/classification";
import {addHandicapToHistory} from "@/domain/handicap";

Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

export function NewPlayerHistory(storage) {
  storage.value = userDataFixer(storage.value);

  return {
    add: (date, score, gameType, scores, unit) => {
      let maxId = storage.value.map(x => x.id).sort((a, b) => a.score - b.score).slice(-1)[0];
      if (!maxId) {
        maxId = 0;
      }
      const nextId = parseInt(maxId, 10) + 1;
      storage.value.push({
        id: nextId,
        date,
        score,
        gameType,
        scores,
        unit
      });
      return nextId;
    },
    remove: (id) => {
      storage.value = storage.value.filter(byId(id));
    },
    importHistory: (history) => {
      storage.value = userDataFixer(history);
    },
    async sortedHistory(gender, age, bowType) {
      const scoresWithIndicator = addTopScoreIndicator(storage.value);
      const scoresWithClassification = await addClassificationsToHistory(gender, age, bowType, scoresWithIndicator);
      const scoresWithHandicap = await addHandicapToHistory(scoresWithClassification);
      return scoresWithHandicap.sort(sortByDate);
    },
    personalBest(round) {
      const recordsForRound = storage.value.filter(byRound(round)).map(x => x.score);
      recordsForRound?.sort(byScore);
      return recordsForRound?.[0];
    },
    totalArrows() {
      return storage.value.reduce((acc, item) => acc + item.scores.length, 0);
    },
    getRecentGameTypes() {
      const sixWeeksAgo = new Date().addDays(-42);
      const gameTypes = new Set();

      for (let i = storage.value.length - 1; i >= 0; i--) {
        const game = storage.value[i];
        if (new Date(game.date) > sixWeeksAgo) {
          gameTypes.add(game.gameType);
        }
      }

      return Array.from(gameTypes);
    },
    getAvailableRounds() {
      return [...new Set(storage.value.map(h => h.gameType))];
    },
    async getFilteredHistory(filters, user) {
      let result = await this.sortedHistory(user.gender, user.ageGroup, user.bowType);

      if (filters.pbOnly) {
        result = result.filter(shoot => shoot.topScore);
      }

      if (filters.round) {
        result = result.filter(shoot => shoot.gameType === filters.round);
      }

      if (filters.dateRange.startDate || filters.dateRange.endDate) {
        result = result.filter(shoot => {
          const shootDate = new Date(shoot.date);
          if (filters.dateRange.startDate && shootDate < new Date(filters.dateRange.startDate)) {
            return false;
          }
          if (filters.dateRange.endDate && shootDate > new Date(filters.dateRange.endDate)) {
            return false;
          }
          return true;
        });
      }

      if (filters.classification) {
        result = result.filter(shoot => shoot.classification?.name === filters.classification);
      }

      return result;
    }

  };

}

const byId = id => (item) => item.id !== id;
const byRound = round => x => x.gameType === round;
const byScore = (a, b) => b - a;
const sortByDate = (a, b) => new Date(b.date) - new Date(a.date);
