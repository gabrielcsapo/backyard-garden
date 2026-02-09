export function getSuccessionWindows(
  plant: {
    successionIntervalWeeks: number | null
    directSowWeeksBeforeFrost: number | null
  },
  lastFrostDate: string,
  firstFrostDate: string,
): Date[] {
  if (!plant.successionIntervalWeeks || plant.directSowWeeksBeforeFrost == null)
    return []

  const frost = new Date(lastFrostDate)
  const sowStart = new Date(frost)
  sowStart.setDate(
    sowStart.getDate() - plant.directSowWeeksBeforeFrost * 7,
  )

  const seasonEnd = new Date(firstFrostDate)
  seasonEnd.setDate(seasonEnd.getDate() - 14)

  const windows: Date[] = []
  const current = new Date(sowStart)
  while (current < seasonEnd) {
    windows.push(new Date(current))
    current.setDate(current.getDate() + plant.successionIntervalWeeks * 7)
  }
  return windows
}

export function shouldSowAgain(
  successionIntervalWeeks: number | null,
  lastPlantedDate: string | null,
): boolean {
  if (!successionIntervalWeeks || !lastPlantedDate) return false
  const lastPlanted = new Date(lastPlantedDate)
  const now = new Date()
  const daysSinceLast =
    (now.getTime() - lastPlanted.getTime()) / (1000 * 60 * 60 * 24)
  return daysSinceLast >= successionIntervalWeeks * 7
}
