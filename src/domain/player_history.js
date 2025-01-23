import { userDataFixer } from "@/domain/user_data_fixer";
import { addTopScoreIndicator } from "@/domain/topscores";
import { addClassificationsToHistory } from "@/domain/classification";

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
      return scoresWithClassification.sort(sortByDate);
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
      const sixWeeksAgo = new Date();
      sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42);

      const recentGames = storage.value
        .filter(shoot => new Date(shoot.date) > sixWeeksAgo)
        .map(shoot => shoot.gameType);

      return [...new Set(recentGames)]; // unique values only
    }
  };
}

const byId = id => (item) => item.id !== id;
const byRound = round => x => x.gameType === round;
const byScore = (a, b) => b - a;
const sortByDate = (a, b) => new Date(b.date) - new Date(a.date);
