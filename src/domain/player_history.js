import { userDataFixer } from "@/domain/user_data_fixer";
import { addTopScoreIndicator } from "@/domain/topscores";

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
    },
    remove: (id) => {
      storage.value = storage.value.filter((item) => item.id !== id);
    },
    importHistory: (history) => {
      storage.value = userDataFixer(history);
    },
    sortedHistory() {
      return addTopScoreIndicator(storage.value).sort(sortByDate);
    }
  };
}

const sortByDate = (a, b) => new Date(b.date) - new Date(a.date);
