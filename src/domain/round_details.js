import { gameTypeConfig } from "@/domain/scoring/game_types";

export function getRoundDetails(roundName) {
  const config = gameTypeConfig[roundName];
  if (!config) {
    return null;
  }

  // Calculate distances to shoot
  const distances = [];

// Add max distance
  if (config.isImperial) {
    distances.push(`${config.maxDistanceYards}yd`);
  } else {
    distances.push(`${config.maxDistanceMetres}m`);
  }

// Add other distances
  if (config.isImperial && config.otherDistancesYards) {
    config.otherDistancesYards.forEach(distance => {
      distances.push(`${distance}yd`);
    });
  } else if (!config.isImperial && config.otherDistancesMetres) {
    config.otherDistancesMetres.forEach(distance => {
      distances.push(`${distance}m`);
    });
  }


  // Calculate dozens per distance
  const dozensPerDistance = config.distancesRoundSizes ? [...config.distancesRoundSizes] : [];

  // Format the distance information for display
  const distanceInfo = distances.map((distance, index) => {
    const dozens = dozensPerDistance[index] || 0;
    return {
      distance,
      dozens
    };
  });

  // Calculate total dozens
  const totalDozens = dozensPerDistance.reduce((sum, dozens) => sum + dozens, 0);

  // Calculate total arrows
  const totalArrows = totalDozens * 12;

  // Determine the max distance and unit
  let maxDistance;
  let unit;

  if (config.maxDistanceYards) {
    maxDistance = config.maxDistanceYards;
    unit = "yd";
  } else if (config.maxDistanceMetres) {
    maxDistance = config.maxDistanceMetres;
    unit = "m";
  }

  return {
    name: roundName,
    roundType: config.isImperial ? "Imperial" : "Metric",
    venueType: config.isOutdoor ? "Outdoor" : "Indoor",
    colorScheme: config.isImperial ? "imperial" : "metric",
    distanceInfo,
    totalDozens,
    totalArrows,
    maxDistance,
    unit
  };
}

export function formatRoundName(roundName) {
  if (!roundName) return "";

  // Split the round name into words
  const words = roundName.split(" ");

  // Process each word
  return words.map(word => {
    // Check if the word is a Roman numeral (i, ii, iii, iv, v, etc.)
    const romanNumeralPattern = /^(i{1,3}|iv|v|vi{1,3}|ix|x|xi{1,3}|xiv|xv|xvi{1,3})$/i;

    if (romanNumeralPattern.test(word)) {
      // If it's a Roman numeral, convert to uppercase
      return word.toUpperCase();
    } else {
      // Otherwise, capitalize first letter only
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
  }).join(" ");
}
