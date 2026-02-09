export const USDA_ZONES = [
  '1a', '1b', '2a', '2b', '3a', '3b', '4a', '4b',
  '5a', '5b', '6a', '6b', '7a', '7b', '8a', '8b',
  '9a', '9b', '10a', '10b', '11a', '11b', '12a', '12b',
  '13a', '13b',
] as const

export type USDAZone = (typeof USDA_ZONES)[number]

export function zoneToNumber(zone: string): number {
  const num = parseInt(zone, 10)
  const suffix = zone.slice(-1)
  return num * 2 + (suffix === 'b' ? 1 : 0)
}

export function isZoneCompatible(
  plantZoneMin: string | null,
  plantZoneMax: string | null,
  gardenZone: string,
): boolean {
  if (!plantZoneMin || !plantZoneMax) return true
  const garden = zoneToNumber(gardenZone)
  const min = zoneToNumber(plantZoneMin)
  const max = zoneToNumber(plantZoneMax)
  return garden >= min && garden <= max
}
