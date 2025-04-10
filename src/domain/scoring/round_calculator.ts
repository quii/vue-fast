import { classificationList } from "@/domain/scoring/classificationList";
import { calculateRoundScores } from "@/domain/scoring/classification";
import { GameTypeConfig, gameTypeConfig, gameTypes } from "@/domain/scoring/game_types";
import { Distance, toMeters, yards } from "@/domain/distance/distance";

interface RoundInfo {
  round: string;
  numberOfEnds: number;
  distance: string;
  distanceValue: number;
}

export async function calculateAppropriateRounds(
  classification: string,
  age: string,
  sex: string,
  bowtype: string,
  maxYards: number
): Promise<RoundInfo[]> {
  const classificationNumber: number = classificationList.indexOf(classification);

  const improvementRounds: RoundInfo[] = [];
  for (const round of gameTypes) {
    const scores = await calculateRoundScores(sex, bowtype, age, round);
    const config: GameTypeConfig = gameTypeConfig[round];
    const distance: string = calculateDistanceLabel(config);

    const distanceValue: number = config.maxDistanceMetres ||
      (config.maxDistanceYards ? toMeters(yards(config.maxDistanceYards)) : 0);

    if (scores.length > (classificationNumber + 1) && (config.maxDistanceYards || 0) <= maxYards) {
      const numberOfEnds: number = config.distancesRoundSizes?.reduce((a, b) => a + b) ?? Infinity;
      improvementRounds.push({ round, numberOfEnds, distance, distanceValue });
    }

    if (round === "frostbite") {
      const numberOfEnds: number = config.distancesRoundSizes?.reduce((a, b) => a + b) ?? Infinity;
      improvementRounds.push({ round, numberOfEnds, distance, distanceValue });
    }
  }

  return improvementRounds.sort(sortByNumberOfEndsAndDistance);
}

function calculateDistanceLabel(config: GameTypeConfig): string {
  if (config.isImperial) {
    return `${config.maxDistanceYards}yd`;
  }
  return `${config.maxDistanceMetres}m`;
}

function sortByNumberOfEndsAndDistance(a: RoundInfo, b: RoundInfo): number {
  return a.numberOfEnds - b.numberOfEnds || a.distanceValue - b.distanceValue;
}
