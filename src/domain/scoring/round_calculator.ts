import { classificationList } from "@/domain/scoring/classificationList";
import { calculateRoundScores } from "@/domain/scoring/classification";
import { GameTypeConfig, gameTypeConfig, gameTypes } from "@/domain/scoring/game_types";
import { Distance, toMeters, yards } from "@/domain/distance/distance";

export async function calculateAppropriateRounds(
  classification: string,
  age: string,
  sex: string,
  bowtype: string,
  maxYards: number
): Promise<string[]> {
  const classificationNumber: number = classificationList.indexOf(classification);

  const improvementRounds: GameTypeConfig[] = [gameTypeConfig["frostbite"]];

  for (const round of gameTypes) {
    const scores = await calculateRoundScores(sex, bowtype, age, round);
    const config: GameTypeConfig = gameTypeConfig[round];

    const hasAHigherClassificationAttainable = scores.length > (classificationNumber + 1);
    const underMaxDistance = config.maxDistanceYards <= maxYards;

    if (hasAHigherClassificationAttainable && underMaxDistance) {
      improvementRounds.push(config);
    }
  }

  return improvementRounds.sort(sortByNumberOfEndsAndDistance).map(r => r.name);
}

function sortByNumberOfEndsAndDistance(a: GameTypeConfig, b: GameTypeConfig): number {
  return a.numberOfEnds - b.numberOfEnds || a.maxDistanceMetres - b.maxDistanceMetres;
}
