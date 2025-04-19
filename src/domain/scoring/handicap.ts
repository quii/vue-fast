const handicapCache = {};

async function loadHandicapsByCategory(round) {
    const path = `/data/handicaps.json`;
    const response = await fetch(path);
    const data = await response.json();
    return data[round];
}

export async function createHandicapCalculator(roundName) {
  if (!roundName) {
    return null;
  }

  let handicaps = handicapCache[roundName];
  if (!handicaps) {
    handicaps = await loadHandicapsByCategory(roundName);
    handicapCache[roundName] = handicaps;
  }
  
  //always return null if round cannot be found
  if (!handicaps) {
    return () => {return null};
  }
  return (score) => {
    for (let i = 0; i < handicaps.length; i++) {
        if (handicaps[i] <= score && handicaps[i + 1] !== score) {
          return i;
        }
      }
  };
}

export function calculateHandicap() {
  return async (roundName, score) => {
    const calculator = await createHandicapCalculator(roundName);
    if (calculator) {
      return calculator(score);
    }
  };
}

export async function addHandicapToHistory(scoringHistory) {
  const handicapCalculator = calculateHandicap();
  const updatedHistory = [];

  for (const x of scoringHistory) {
    if (x.handicap) {
      updatedHistory.push(x)
      continue
    }
    const handicap = await handicapCalculator(x.gameType, x.score);
    updatedHistory.push({ ...x, handicap });
  }

  return updatedHistory;
}