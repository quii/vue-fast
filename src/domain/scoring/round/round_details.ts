import { gameTypeConfig, roundConfigManager } from '@/domain/scoring/game_types'

interface RoundDetails {
  name: any;
  roundType: string;
  venueType: string;
  colorScheme: string;
  distanceInfo: {
    distance: string;
    dozens: number;
  }[];
  totalDozens: number;
  totalArrows: number;
  maxDistance: number | undefined;
  unit: string | undefined;
}

export function getRoundDetails(roundName: string): RoundDetails | null {
  const config = roundConfigManager.getConfig(roundName)
  if (!config) {
    return null
  }

  // Calculate distances to shoot
  const distances = []

  // For indoor rounds, use the original unit regardless of isImperial flag
  if (!config.isOutdoor) {
    // Indoor rounds - use the original unit that was specified
    if (config.maxDistanceYards) {
      distances.push(`${config.maxDistanceYards}yd`)
    } else if (config.maxDistanceMetres) {
      distances.push(`${config.maxDistanceMetres}m`)
    }
  } else {
    // Outdoor rounds - use the unit based on isImperial flag
    if (config.isImperial) {
      distances.push(`${config.maxDistanceYards}yd`)
    } else {
      distances.push(`${config.maxDistanceMetres}m`)
    }
  }

  // Add other distances with the same logic
  if (!config.isOutdoor) {
    // Indoor rounds - use the original unit
    if (config.otherDistancesYards) {
      config.otherDistancesYards.forEach(distance => {
        distances.push(`${distance}yd`)
      })
    } else if (config.otherDistancesMetres) {
      config.otherDistancesMetres.forEach(distance => {
        distances.push(`${distance}m`)
      })
    }
  } else {
    // Outdoor rounds - use the unit based on isImperial flag
    if (config.isImperial && config.otherDistancesYards) {
      config.otherDistancesYards.forEach(distance => {
        distances.push(`${distance}yd`)
      })
    } else if (!config.isImperial && config.otherDistancesMetres) {
      config.otherDistancesMetres.forEach(distance => {
        distances.push(`${distance}m`)
      })
    }
  }

  // Calculate dozens per distance
  const dozensPerDistance = config.distancesRoundSizes ? [...config.distancesRoundSizes] : []

  // Format the distance information for display
  const distanceInfo = distances.map((distance, index) => {
    const dozens = dozensPerDistance[index] || 0
    return {
      distance,
      dozens
    }
  })

  // Calculate total dozens
  const totalDozens = dozensPerDistance.reduce((sum, dozens) => sum + dozens, 0)

  // Calculate total arrows
  const totalArrows = totalDozens * 12

  // Determine the max distance and unit
  let maxDistance
  let unit

  // For indoor rounds, use the original unit
  if (!config.isOutdoor) {
    if (config.maxDistanceYards) {
      maxDistance = config.maxDistanceYards
      unit = 'yd'
    } else if (config.maxDistanceMetres) {
      maxDistance = config.maxDistanceMetres
      unit = 'm'
    }
  } else {
    // For outdoor rounds, use the unit based on isImperial flag
    if (config.isImperial) {
      maxDistance = config.maxDistanceYards
      unit = 'yd'
    } else {
      maxDistance = config.maxDistanceMetres
      unit = 'm'
    }
  }

  return {
    name: roundName,
    roundType: config.isImperial ? 'Imperial' : 'Metric',
    venueType: config.isOutdoor ? 'Outdoor' : 'Indoor',
    colorScheme: config.isImperial ? 'imperial' : 'metric',
    distanceInfo,
    totalDozens,
    totalArrows,
    maxDistance,
    unit
  }
}