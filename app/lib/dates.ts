export function weeksFromDate(dateStr: string, weeks: number): Date {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + weeks * 7);
  return date;
}

export function getPlantingWindows(
  plant: {
    indoorStartWeeksBeforeFrost: number | null;
    directSowWeeksBeforeFrost: number | null;
    transplantWeeksAfterFrost: number | null;
    daysToHarvest: number | null;
  },
  lastFrostDate: string,
) {
  const windows: {
    indoorStart?: Date;
    directSow?: Date;
    transplant?: Date;
    harvestBy?: Date;
  } = {};

  if (plant.indoorStartWeeksBeforeFrost != null) {
    windows.indoorStart = weeksFromDate(lastFrostDate, -plant.indoorStartWeeksBeforeFrost);
  }

  if (plant.directSowWeeksBeforeFrost != null) {
    windows.directSow = weeksFromDate(lastFrostDate, -plant.directSowWeeksBeforeFrost);
  }

  if (plant.transplantWeeksAfterFrost != null) {
    windows.transplant = weeksFromDate(lastFrostDate, plant.transplantWeeksAfterFrost);
  }

  if (plant.daysToHarvest != null) {
    const plantDate = windows.transplant ?? windows.directSow ?? windows.indoorStart;
    if (plantDate) {
      const harvest = new Date(plantDate);
      harvest.setDate(harvest.getDate() + plant.daysToHarvest);
      windows.harvestBy = harvest;
    }
  }

  return windows;
}

export function weeksUntilFrost(lastFrostDate: string): number {
  const frost = new Date(lastFrostDate);
  const now = new Date();
  const diff = frost.getTime() - now.getTime();
  return Math.round(diff / (7 * 24 * 60 * 60 * 1000));
}

export function getCurrentSeason(
  lastFrostDate: string,
  firstFrostDate: string,
): "early_spring" | "late_spring" | "summer" | "fall" | "winter" {
  const now = new Date();
  const lastFrost = new Date(lastFrostDate);
  const firstFrost = new Date(firstFrostDate);

  const weeksBeforeLastFrost = Math.round(
    (lastFrost.getTime() - now.getTime()) / (7 * 24 * 60 * 60 * 1000),
  );
  const weeksAfterLastFrost = -weeksBeforeLastFrost;

  if (weeksBeforeLastFrost > 0 && weeksBeforeLastFrost <= 12) return "early_spring";
  if (weeksAfterLastFrost >= 0 && weeksAfterLastFrost <= 8) return "late_spring";
  if (now < firstFrost) return "summer";
  if (weeksBeforeLastFrost > 12) return "winter";
  return "fall";
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
