import { GameTypeConfig } from "@/domain/scoring/game_types";
import { formatRoundName } from "@/domain/formatting";

export class Round {
  readonly name: string;
  readonly distancesRoundSizes?: number[];
  readonly scores: (number | string)[];
  readonly unit: string;
  readonly endSize: number;
  readonly isOutdoor: boolean;
  readonly maxArrows: number;
  readonly canSaveAnytime: boolean;
  readonly isPracticeRound: boolean;
  readonly numberOfEnds: number;
  readonly isImperial: boolean;
  readonly maxDistanceMetres: number;
  readonly maxDistanceYards: number;
  readonly otherDistancesYards?: number[];
  readonly otherDistancesMetres?: number[];

  constructor(config: GameTypeConfig) {
    this.name = config.name;
    this.distancesRoundSizes = config.distancesRoundSizes;
    this.scores = [...config.scores]; // Create a copy to prevent mutation
    this.unit = config.unit;
    this.endSize = config.endSize;
    this.isOutdoor = config.isOutdoor;
    this.maxArrows = config.maxArrows;
    this.canSaveAnytime = config.canSaveAnytime;
    this.isPracticeRound = config.isPracticeRound;
    this.numberOfEnds = config.numberOfEnds;
    this.isImperial = config.isImperial;
    this.maxDistanceMetres = config.maxDistanceMetres;
    this.maxDistanceYards = config.maxDistanceYards;
    this.otherDistancesYards = config.otherDistancesYards;
    this.otherDistancesMetres = config.otherDistancesMetres;
  }

  // Methods to get specific information about this round
  getMaxDistance(unit: string = "m"): number {
    return unit === "m" ? this.maxDistanceMetres : this.maxDistanceYards;
  }

  prettyRoundName(): string {
    return formatRoundName(this.name);
  }

  // Convert to plain object for backward compatibility
  toConfig(): GameTypeConfig {
    return {
      name: this.name,
      distancesRoundSizes: this.distancesRoundSizes,
      scores: [...this.scores],
      unit: this.unit,
      endSize: this.endSize,
      isOutdoor: this.isOutdoor,
      maxArrows: this.maxArrows,
      canSaveAnytime: this.canSaveAnytime,
      isPracticeRound: this.isPracticeRound,
      numberOfEnds: this.numberOfEnds,
      isImperial: this.isImperial,
      maxDistanceMetres: this.maxDistanceMetres,
      maxDistanceYards: this.maxDistanceYards,
      otherDistancesYards: this.otherDistancesYards,
      otherDistancesMetres: this.otherDistancesMetres
    };
  }
}