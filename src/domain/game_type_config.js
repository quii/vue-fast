import { MISS } from "@/domain/scores";

const standardDistances = [
  "10", "20", "30", "40", "50", "60", "70", "80", "90", "100"
];

export const imperialPractices = standardDistances.filter(x => x !== "70").map(distance => ({
  name: `practice ${distance}yd`,
  isOutdoor: true,
  isImperial: true,
  distancesRoundSizes: [100]
}));

export const metricPractices = standardDistances.map(distance => ({
  name: `practice ${distance}m`,
  isOutdoor: true,
  isImperial: false,
  distancesRoundSizes: [100, 100]
}));

export const baseConfig = [
  {
    name: 'york',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [ 6, 4, 2 ]
  },
  {
    name: 'hereford / bristol i',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [ 6, 4, 2 ]
  },
  {
    name: 'bristol ii',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [ 6, 4, 2 ]
  },
  {
    name: 'bristol iii',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [ 6, 4, 2 ]
  },
  {
    name: 'bristol iv',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [ 6, 4, 2 ]
  },
  {
    name: 'bristol v',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [ 6, 4, 2 ]
  },
  {
    name: 'st. george',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [ 3, 3, 3 ]
  },
  {
    name: 'albion / long windsor',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [ 3, 3, 3 ]
  },
  {
    name: 'windsor',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [ 3, 3, 3 ]
  },
  {
    name: 'windsor 50',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [ 3, 3, 3 ]
  },
  {
    name: 'windsor 40',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [ 3, 3, 3 ]
  },
  {
    name: 'windsor 30',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [ 3, 3, 3 ]
  },
  {
    name: 'new western',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [ 4, 4 ]
  },
  {
    name: 'long western',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [ 4, 4 ]
  },
  {
    name: 'western',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [ 4, 4 ]
  },
  {
    name: 'western 50',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [ 4, 4 ]
  },
  {
    name: 'western 40',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [ 4, 4 ]
  },
  {
    name: 'western 30',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [ 4, 4 ]
  },
  {
    name: 'american',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [ 2.5, 2.5, 2.5 ]
  },
  {
    name: 'st. nicholas',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [ 4, 3 ]
  },
  {
    name: 'new national',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [ 4, 2 ]
  },
  {
    name: 'long national',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [ 4, 2 ]
  },
  {
    name: 'national',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [ 4, 2 ]
  },
  {
    name: 'national 50',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [ 4, 2 ]
  },
  {
    name: 'national 40',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [ 4, 2 ]
  },
  {
    name: 'national 30',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [ 4, 2 ]
  },
  {
    name: 'new warwick',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [ 2, 2 ]
  },
  {
    name: 'long warwick',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [ 2, 2 ]
  },
  {
    name: 'warwick',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [ 2, 2 ]
  },
  {
    name: 'warwick 50',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [ 2, 2 ]
  },
  {
    name: 'warwick 40',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [ 2, 2 ]
  },
  {
    name: 'warwick 30',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [ 2, 2 ]
  },
  {
    name: 'wa 1440 (90m)',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [ 3, 3, 3, 3 ]
  },
  {
    name: 'wa 1440 (70m) / metric i',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [ 3,3,3,3 ]
  },
  {
    name: 'wa 1440 (60m) / metric ii',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [ 3,3,3,3 ]
  },
  {
    name: 'metric iii',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [ 3,3,3,3 ]
  },
  {
    name: 'metric iv',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [ 3,3,3,3 ]
  },
  {
    name: 'metric v',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [ 3,3,3,3 ]
  },
  {
    name: 'long metric (men)',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [ 3, 3 ]
  },
  {
    name: 'long metric (women) / long metric i',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [ 3, 3 ]
  },
  {
    name: 'long metric ii',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [ 3, 3 ]
  },
  {
    name: 'long metric iii',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [ 3, 3 ]
  },
  {
    name: 'long metric iv',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [ 3, 3 ]
  },
  {
    name: 'long metric v',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [ 3, 3 ]
  },
  {
    name: 'short metric / short metric i',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [ 3, 3 ]
  },
  {
    name: 'short metric ii',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [ 3, 3 ]
  },
  {
    name: 'short metric iii',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [ 3, 3 ]
  },
  {
    name: 'short metric iv',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [ 3, 3 ]
  },
  {
    name: 'wa standard bow',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [ 3, 3 ]
  },
  {
    name: 'wa 900',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [ 2.5, 2.5, 2.5 ]
  },
  {
    name: 'wa 70m',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [ 6 ]
  },
  {
    name: 'wa 60m',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [ 6 ]
  },
  {
    name: 'wa 50m (barebow) / metric 122-50',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [ 6 ]
  },
  {
    name: 'metric 122-40',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [ 6 ]
  },
  {
    name: 'metric 122-30',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [ 6 ]
  },
  {
    name: 'wa 50m (compound)',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [ 6 ]
  },
  {
    name: 'metric 80-40',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [ 6 ]
  },
  {
    name: 'metric 80-30',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [ 6 ]
  },
  {
    name: 'short metric v',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [ 3, 3 ]
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
