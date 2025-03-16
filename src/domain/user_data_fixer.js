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

// Add this function to the existing user_data_fixer.js file
export function backfillUserProfiles(history, currentUserProfile) {
  if (!currentUserProfile || !history || !Array.isArray(history)) {
    return history;
  }

  return history.map(item => {
    // Only add user profile if it doesn't already exist
    if (!item.userProfile && currentUserProfile) {
      return {
        ...item,
        userProfile: { ...currentUserProfile }
      };
    }
    return item;
  });
}

// Add this function to handle Mally's special case
export function mallyMalhamBowTypeFix(history) {
  console.log("Applying special bow type fix for Mally Malham");

  // The date when Mally changed from recurve to barebow
  const bowTypeChangeDate = new Date("2025-02-15");

  return history.map(item => {
    // Skip items that don't have a date or userProfile
    if (!item.date || !item.userProfile) {
      return item;
    }

    const shootDate = new Date(item.date);

    // For shoots before the change date, set bow type to recurve
    if (shootDate < bowTypeChangeDate) {
      return {
        ...item,
        userProfile: {
          ...item.userProfile,
          bowType: "recurve"
        }
      };
    }

    // For shoots on or after the change date, leave as is
    return item;
  });
}
