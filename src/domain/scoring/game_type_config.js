const standardDistances = [
  "10", "20", "30", "40", "50", "60", "70", "80", "90", "100"
];

export const imperialPractices = standardDistances.filter(x => x !== "70").map(distance => ({
  name: `practice ${distance}yd`,
  isOutdoor: true,
  isImperial: true,
  maxDistanceYards: distance
}));

export const metricPractices = standardDistances.map(distance => ({
  name: `practice ${distance}m`,
  isOutdoor: true,
  isImperial: false,
  maxDistanceMetres: distance
}));

export const MISS = "M";
export const X = "X";
export const baseConfig = [
  {
    name: 'york',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [6, 4, 2],
    maxDistanceYards: 100,
    otherDistancesYards: [80, 60]
  },
  {
    name: 'hereford / bristol i',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [6, 4, 2],
    maxDistanceYards: 80,
    otherDistancesYards: [60, 50]
  },
  {
    name: 'bristol ii',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [6, 4, 2],
    maxDistanceYards: 60,
    otherDistancesYards: [50, 40]
  },
  {
    name: 'bristol iii',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [6, 4, 2],
    maxDistanceYards: 50,
    otherDistancesYards: [40, 30]
  },
  {
    name: 'bristol iv',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [6, 4, 2],
    maxDistanceYards: 40,
    otherDistancesYards: [30, 20]
  },
  {
    name: 'bristol v',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [6, 4, 2],
    maxDistanceYards: 30,
    otherDistancesYards: [20, 10]
  },
  {
    name: 'st. george',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [3, 3, 3],
    maxDistanceYards: 100,
    otherDistancesYards: [80, 60]
  },
  {
    name: 'albion / long windsor',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [3, 3, 3],
    maxDistanceYards: 80,
    otherDistancesYards: [60, 50]
  },
  {
    name: 'windsor',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [3, 3, 3],
    maxDistanceYards: 60,
    otherDistancesYards: [50, 40]
  },
  {
    name: 'windsor 50',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [3, 3, 3],
    maxDistanceYards: 50,
    otherDistancesYards: [40, 30]
  },
  {
    name: 'windsor 40',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [3, 3, 3],
    maxDistanceYards: 40,
    otherDistancesYards: [30, 20]
  },
  {
    name: 'windsor 30',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [3, 3, 3],
    maxDistanceYards: 30,
    otherDistancesYards: [20, 10]
  },
  {
    name: 'new western',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [4, 4],
    maxDistanceYards: 100,
    otherDistancesYards: [80]
  },
  {
    name: 'long western',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [4, 4],
    maxDistanceYards: 80,
    otherDistancesYards: [60]
  },
  {
    name: 'western',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [4, 4],
    maxDistanceYards: 60,
    otherDistancesYards: [50]
  },
  {
    name: 'western 50',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [4, 4],
    maxDistanceYards: 50,
    otherDistancesYards: [40]
  },
  {
    name: 'western 40',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [4, 4],
    maxDistanceYards: 40,
    otherDistancesYards: [30]
  },
  {
    name: 'western 30',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [4, 4],
    maxDistanceYards: 30,
    otherDistancesYards: [20]
  },
  {
    name: 'american',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [2.5, 2.5, 2.5],
    maxDistanceYards: 60,
    otherDistancesYards: [50, 40]
  },
  {
    name: 'st. nicholas',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [4, 3],
    maxDistanceYards: 40,
    otherDistancesYards: [30]
  },
  {
    name: 'new national',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [4, 2],
    maxDistanceYards: 100,
    otherDistancesYards: [80]
  },
  {
    name: 'long national',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [4, 2],
    maxDistanceYards: 80,
    otherDistancesYards: [60]
  },
  {
    name: 'national',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [4, 2],
    maxDistanceYards: 60,
    otherDistancesYards: [50]
  },
  {
    name: 'national 50',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [4, 2],
    maxDistanceYards: 50,
    otherDistancesYards: [40]
  },
  {
    name: 'national 40',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [4, 2],
    maxDistanceYards: 40,
    otherDistancesYards: [30]
  },
  {
    name: 'national 30',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [4, 2],
    maxDistanceYards: 30,
    otherDistancesYards: [20]
  },
  {
    name: 'new warwick',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [2, 2],
    maxDistanceYards: 100,
    otherDistancesYards: [80]
  },
  {
    name: 'long warwick',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [2, 2],
    maxDistanceYards: 80,
    otherDistancesYards: [60]
  },
  {
    name: 'warwick',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [2, 2],
    maxDistanceYards: 60,
    otherDistancesYards: [50]
  },
  {
    name: 'warwick 50',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [2, 2],
    maxDistanceYards: 50,
    otherDistancesYards: [40]
  },
  {
    name: 'warwick 40',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [2, 2],
    maxDistanceYards: 40,
    otherDistancesYards: [30]
  },
  {
    name: 'warwick 30',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [2, 2],
    maxDistanceYards: 30,
    otherDistancesYards: [20]
  },
  {
    name: 'wa 1440 (90m)',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [3, 3, 3, 3],
    maxDistanceMetres: 90,
    otherDistancesMetres: [70]
  },
  {
    name: 'wa 1440 (70m) / metric i',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [3, 3, 3, 3],
    maxDistanceMetres: 70,
    otherDistancesMetres: [60, 50, 30]
  },
  {
    name: 'wa 1440 (60m) / metric ii',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [3, 3, 3, 3],
    maxDistanceMetres: 60,
    otherDistancesMetres: [50, 40, 30]
  },
  {
    name: 'metric iii',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [3, 3, 3, 3],
    maxDistanceMetres: 50,
    otherDistancesMetres: [40, 30, 20]
  },
  {
    name: 'metric iv',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [3, 3, 3, 3],
    maxDistanceMetres: 40,
    otherDistancesMetres: [30, 20, 10]
  },
  {
    name: 'metric v',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [3, 3, 3, 3],
    maxDistanceMetres: 30,
    otherDistancesMetres: [20, 15, 10]
  },
  {
    name: 'long metric (men)',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [3, 3],
    maxDistanceMetres: 90,
    otherDistancesMetres: [70]
  },
  {
    name: 'long metric (women) / long metric i',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [3, 3],
    maxDistanceMetres: 70,
    otherDistancesMetres: [60]
  },
  {
    name: 'long metric ii',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [3, 3],
    maxDistanceMetres: 60,
    otherDistancesMetres: [50]
  },
  {
    name: 'long metric iii',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [3, 3],
    maxDistanceMetres: 50,
    otherDistancesMetres: [40]
  },
  {
    name: 'long metric iv',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [3, 3],
    maxDistanceMetres: 40,
    otherDistancesMetres: [30]
  },
  {
    name: 'long metric v',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [3, 3],
    maxDistanceMetres: 30,
    otherDistancesMetres: [20]
  },
  {
    name: 'short metric / short metric i',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [3, 3],
    maxDistanceMetres: 50,
    otherDistancesMetres: [40]
  },
  {
    name: 'short metric ii',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [3, 3],
    maxDistanceMetres: 40,
    otherDistancesMetres: [30]
  },
  {
    name: 'short metric iii',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [3, 3],
    maxDistanceMetres: 30,
    otherDistancesMetres: [20]
  },
  {
    name: 'short metric iv',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [3, 3],
    maxDistanceMetres: 20,
    otherDistancesMetres: [10]
  },
  {
    name: 'wa standard bow',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [3, 3],
    maxDistanceMetres: 50
  },
  {
    name: 'wa 900',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [2.5, 2.5, 2.5],
    maxDistanceMetres: 60,
    otherDistancesMetres: [50, 40]
  },
  {
    name: 'wa 70m',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [6],
    maxDistanceMetres: 70
  },
  {
    name: 'wa 60m',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [6],
    maxDistanceMetres: 60
  },
  {
    name: 'wa 50m (barebow) / metric 122-50',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [6],
    maxDistanceMetres: 50
  },
  {
    name: 'metric 122-40',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [6],
    maxDistanceMetres: 40
  },
  {
    name: 'metric 122-30',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [6],
    maxDistanceMetres: 30
  },
  {
    name: 'wa 50m (compound)',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [6],
    maxDistanceMetres: 50
  },
  {
    name: 'metric 80-40',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [6],
    maxDistanceMetres: 40
  },
  {
    name: 'metric 80-30',
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [6],
    maxDistanceMetres: 30
  },
  {
    name: 'short metric v',
    isOutdoor: true,
    isImperial: true,
    distancesRoundSizes: [3, 3],
    maxDistanceMetres: 15,
    otherDistancesMetres: [10]
  },
  {
    name: "frostbite",
    isOutdoor: true,
    isImperial: false,
    distancesRoundSizes: [3],
    maxDistanceMetres: 30
  },
  {
    name: "portsmouth",
    isOutdoor: false,
    isImperial: false,
    distancesRoundSizes: [5],
    maxDistanceYards: 20
  },
  {
    name: "bray i",
    isOutdoor: false,
    isImperial: false,
    distancesRoundSizes: [2.5],
    maxDistanceYards: 20
  },
  {
    name: "bray ii",
    isOutdoor: false,
    isImperial: false,
    distancesRoundSizes: [2.5],
    maxDistanceYards: 25
  },
  {
    name: "stafford",
    isOutdoor: false,
    isImperial: false,
    distancesRoundSizes: [6],
    maxDistanceMetres: 30
  },
  {
    name: "worcester",
    isOutdoor: false,
    isImperial: false,
    endSize: 5,
    scores: ["X", 5, 4, 3, 2, 1, MISS],
    distancesRoundSizes: [6],
    maxDistanceYards: 20
  },
  {
    name: "vegas 300",
    isOutdoor: false,
    isImperial: false,
    distancesRoundSizes: [2.5],
    scores: ["X", 10, 9, 8, 7, 6, MISS],
    maxDistanceYards: 20
  },
  {
    name: "wa 18m",
    isOutdoor: false,
    isImperial: false,
    distancesRoundSizes: [5],
    maxDistanceMetres: 18
  },
  {
    name: "wa 25m",
    isOutdoor: false,
    isImperial: false,
    distancesRoundSizes: [5],
    maxDistanceMetres: 25
  }
];
