import { baseConfig, imperialPractices, metricPractices, MISS } from "@/domain/scoring/game_type_config";
import { meters, toMeters, toYards, yards } from "@/domain/distance/distance";
import { Round } from "@/domain/scoring/round";

//todo: these types feel pretty meaningless if its all nullable. We can do better modelling of some of the fields around outDoor, isImperial etc.
export interface GameTypeBase {
  name: string;
  distancesRoundSizes?: number[];
  isImperial?: boolean;
  isOutdoor?: boolean;
  endSize?: number;
  scores?: (number | string)[];
  maxDistanceYards?: number;
  maxDistanceMetres?: number;
  otherDistancesYards?: number[];
  otherDistancesMetres?: number[];
}

export interface GameTypeConfig {
  name: string;
  distancesRoundSizes?: number[];
  scores: (number | string)[];
  unit: string;
  endSize: number;
  isOutdoor: boolean;
  maxArrows: number;
  canSaveAnytime: boolean;
  isPracticeRound: boolean;
  numberOfEnds: number;
  isImperial: boolean;
  maxDistanceMetres: number;
  maxDistanceYards: number;
  //these two fields probably shouldn't be nullable, just have empty arrays
  otherDistancesYards?: number[];
  otherDistancesMetres?: number[];
}

export type GameTypeConfigs = Record<string, GameTypeConfig>;

// Module-level constants
const IMPERIAL_SCORES: readonly (number | string)[] = [9, 7, 5, 3, 1, MISS] as const;
const OUTDOOR_METRIC_SCORES: readonly (number | string)[] = ["X", 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, MISS] as const;
const INDOOR_METRIC_SCORES: readonly (number | string)[] = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, MISS] as const;

export class RoundConfigManager {
  private readonly configs: GameTypeConfigs;
  private readonly rounds: Map<string, Round>;

  constructor(baseConfigs: GameTypeBase[] = [...baseConfig, ...imperialPractices, ...metricPractices]) {
    this.configs = this.calculateConfigFromBase(baseConfigs);

    // Create Round instances for each config
    this.rounds = new Map();
    Object.entries(this.configs).forEach(([name, config]) => {
      this.rounds.set(name.toLowerCase(), new Round(config));
    });
  }

  public getAllGameTypes(): string[] {
    return Object.keys(this.configs);
  }

  public getConfig(gameType: string): GameTypeConfig | undefined {
    return this.configs[gameType.toLowerCase()];
  }

  public getAllConfigs(): GameTypeConfigs {
    return { ...this.configs };
  }

  // New method to get a Round instance
  public getRound(roundName: string): Round | undefined {
    return this.rounds.get(roundName.toLowerCase());
  }

  // For backward compatibility
  public getMaxArrows(gameType: string): number {
    const round = this.getRound(gameType);
    return round ? round.maxArrows : 0;
  }

  public getEndSize(gameType: string): number {
    const round = this.getRound(gameType);
    return round ? round.endSize : 6;
  }

  public getScores(gameType: string): (number | string)[] {
    const round = this.getRound(gameType);
    return round ? [...round.scores] : [];
  }

  public getUnit(gameType: string): string {
    const round = this.getRound(gameType);
    return round ? round.unit : "m";
  }

  public getMaxDistance(gameType: string, unit: string = "m"): number {
    const round = this.getRound(gameType);
    if (!round) return 0;

    return round.getMaxDistance(unit);
  }

  private calculateConfigFromBase(baseConfigs: GameTypeBase[]): GameTypeConfigs {
    const rounds = baseConfigs.reduce<Record<string, GameTypeConfig>>((acc, gameType) => {
      const endSize: number = this.calculateEndSize(gameType.endSize);
      const isPracticeRound: boolean = !gameType.distancesRoundSizes ||
        (gameType.distancesRoundSizes.length === 1 &&
          gameType.distancesRoundSizes[0] === 100);

      const maxArrows: number = isPracticeRound ? Infinity : this.calculateMaxArrows(gameType, endSize);
      const canSaveAnytime: boolean = isPracticeRound;

      const maxDistanceMetres: number = gameType.maxDistanceMetres ||
        (gameType.maxDistanceYards ? toMeters(yards(gameType.maxDistanceYards)) : 0);

      const maxDistanceYards: number = gameType.maxDistanceYards ||
        (gameType.maxDistanceMetres ? toYards(meters(gameType.maxDistanceMetres)) : 0);

      return ({
        ...acc, [gameType.name]: {
          name: gameType.name,
          distancesRoundSizes: gameType.distancesRoundSizes,
          scores: gameType.scores || this.calculateScoresForGame(gameType),
          unit: gameType.isImperial ? "yd" : "m",
          endSize: endSize,
          isOutdoor: !!gameType.isOutdoor,
          maxArrows,
          canSaveAnytime,
          isPracticeRound,
          numberOfEnds: maxArrows / endSize,
          isImperial: !!gameType.isImperial,
          maxDistanceMetres,
          maxDistanceYards,
          otherDistancesYards: gameType.otherDistancesYards,
          otherDistancesMetres: gameType.otherDistancesMetres
        }
      });
    }, {});

    return Object.keys(rounds).sort().reduce<GameTypeConfigs>(
      (obj, key) => {
        obj[key] = rounds[key];
        return obj;
      },
      {}
    );
  }

  private calculateMaxArrows(gameType: GameTypeBase, endSize: number): number {
    return gameType.distancesRoundSizes?.reduce((total, roundSize) => {
      return total + roundSize * endSize * 2;
    }, 0) ?? Infinity;
  }

  private calculateEndSize(endSize?: number): number {
    if (endSize) {
      return endSize;
    }
    return 6;
  }

  private calculateScoresForGame({ isImperial, isOutdoor }: {
    isImperial?: boolean,
    isOutdoor?: boolean
  }): (number | string)[] {
    if (isImperial) {
      return [...IMPERIAL_SCORES];
    }
    if (isOutdoor) {
      return [...OUTDOOR_METRIC_SCORES];
    }
    return [...INDOOR_METRIC_SCORES];
  }
}

// Create a singleton instance for use throughout the application
const gameTypeManagerInstance = new RoundConfigManager();

// For backward compatibility with existing code
// TODO: peel back usages of this, in favour of gameTypeManager
export const gameTypeConfig: GameTypeConfigs = gameTypeManagerInstance.getAllConfigs();
export const gameTypes: string[] = gameTypeManagerInstance.getAllGameTypes();

// Export the instance for new code to use
export const roundConfigManager = gameTypeManagerInstance;
