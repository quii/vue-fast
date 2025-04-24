import { classificationList } from "@/domain/scoring/classificationList";
import { calculateRoundScores } from "@/domain/scoring/classification";
import { GameTypeConfig, gameTypeConfig, gameTypes } from "@/domain/scoring/game_types";

export async function calculateAppropriateRounds(
  classification: string,
  age: string,
  sex: string,
  bowtype: string,
  maxYards: number
): Promise<string[]> {
  const classificationNumber: number = classificationList.indexOf(classification);
  const improvementModifier = classificationNumber > 4 ? 5 : classificationNumber + 1;

  const improvementRounds: GameTypeConfig[] = [gameTypeConfig["frostbite"]];

  const distanceAppropriateRounds: GameTypeConfig[] = gameTypes
    .map(name => gameTypeConfig[name])
    .filter(config => config.maxDistanceYards <= maxYards); //todo dont need this anymore

  for (const round of distanceAppropriateRounds) {
    //todo: should have some kind of classification pointer where we have multiple rounds for the same logical classification
    let lookup = round.name
    if (round.name === 'worcester (5 spot)') {
      lookup = 'worcester'
    }

    const scores = await calculateRoundScores(sex, bowtype, age, lookup)
    const hasAHigherClassificationAttainable = scores.length > improvementModifier;

    if (hasAHigherClassificationAttainable) {
      improvementRounds.push(round);
    }
  }

  return improvementRounds.sort(sortByNumberOfEndsAndDistance).map(r => r.name);
}

function sortByNumberOfEndsAndDistance(a: GameTypeConfig, b: GameTypeConfig): number {
  return a.numberOfEnds - b.numberOfEnds || a.maxDistanceMetres - b.maxDistanceMetres;
}
