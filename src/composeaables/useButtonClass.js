export default function useButtonClass() {
  return function buttonClass(score, gameType) {
    if (gameType === "worcester") {
      return getWorcesterClass(score);
    }
    return { [`score${score}`]: true };
  };
}

function getWorcesterClass(score) {
  if (score === 5 || score === "X") {
    return { "worcester5": true };
  }
  return { "worcesterRest": true };
}

