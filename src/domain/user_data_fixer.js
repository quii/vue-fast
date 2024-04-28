import { gameTypeConfig } from "@/domain/game_types";

export function userDataFixer(userData) {
  return userData.map(round => {
    if (!round.distance) {
      return round;
    }
    const gameTypeConfigElement = gameTypeConfig[round.gameType];
    if (!gameTypeConfigElement) {
      console.log("couldnt find gametype", round.gameType);
      return round;
    }

    if (round.distance !== 60 && gameTypeConfigElement.isOutdoor) {
      round.gameType = round.gameType + " " + round.distance;
    }
    if (round.gameType === "frostbite" || round.gameType === "frostbite 30") {
      round.gameType = "frostbite";
    }
    delete round.distance;

    return round;
  });
}