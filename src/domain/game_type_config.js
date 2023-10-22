import { MISS } from "@/domain/scores";

export const baseConfig = [
  {
    name: "national",
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [4, 2]
  },
  {
    name: "warwick",
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [2, 2]
  },
  {
    name: "western",
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [4, 4]
  },
  {
    name: "windsor",
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [3, 3, 3]
  },
  {
    name: "frostbite",
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [3]
  },
  {
    name: "portsmouth",
    isOutdoor: false,
    isImperial: false,
    distancesRoundSizes: [5]
  },
  {
    name: "bray1",
    isOutdoor: false,
    isImperial: false,
    distancesRoundSizes: [3]
  },
  {
    name: "worcester",
    isOutdoor: false,
    isImperial: false,
    endSize: 5,
    scores: [5, 4, 3, 2, 1, MISS],
    distancesRoundSizes: [6]
  }
];