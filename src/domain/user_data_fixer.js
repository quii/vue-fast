import { gameTypeConfig } from "@/domain/scoring/game_types";

export function userDataFixer(userData) {
  let someId = 0;
  return userData.map(round => {
    if (round.id === null) {
      round.id = someId;
      someId++;
    }
    if (!round.distance) {
      return round;
    }
    const gameTypeConfigElement = gameTypeConfig[round.gameType];
    if (!gameTypeConfigElement) {
      console.log("couldnt find gametype", round.gameType);
      return round;
    }

    if (round.gameType === "frostbite" || round.gameType === "frostbite 30") {
      round.gameType = "frostbite";
    } else if (round.distance !== 60 && gameTypeConfigElement.isOutdoor) {
      round.gameType = round.gameType + " " + round.distance;
    }

    delete round.distance;

    return round;
  });
}