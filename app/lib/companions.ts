type PlantInfo = {
  name: string;
  companions: string[] | unknown;
  incompatible: string[] | unknown;
};

function toStringArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.filter((v) => typeof v === "string");
  return [];
}

export function checkCompanionConflicts(
  newPlant: PlantInfo,
  existingPlants: PlantInfo[],
): { conflicts: string[]; goodCompanions: string[] } {
  const conflicts: string[] = [];
  const goodCompanions: string[] = [];
  const newIncompat = toStringArray(newPlant.incompatible);
  const newCompanions = toStringArray(newPlant.companions);

  for (const existing of existingPlants) {
    const existingIncompat = toStringArray(existing.incompatible);

    if (
      newIncompat.some((n) => n.toLowerCase() === existing.name.toLowerCase()) ||
      existingIncompat.some((n) => n.toLowerCase() === newPlant.name.toLowerCase())
    ) {
      conflicts.push(existing.name);
    }

    if (newCompanions.some((n) => n.toLowerCase() === existing.name.toLowerCase())) {
      goodCompanions.push(existing.name);
    }
  }

  return { conflicts, goodCompanions };
}

export function getCompanionSuggestions(
  existingPlants: PlantInfo[],
  allPlants: PlantInfo[],
): { name: string; score: number; reasons: string[] }[] {
  const existingNames = new Set(existingPlants.map((p) => p.name.toLowerCase()));

  const suggestions: { name: string; score: number; reasons: string[] }[] = [];

  for (const candidate of allPlants) {
    if (existingNames.has(candidate.name.toLowerCase())) continue;

    const { conflicts, goodCompanions } = checkCompanionConflicts(candidate, existingPlants);

    if (conflicts.length > 0) continue;

    const score = goodCompanions.length;
    if (score > 0) {
      suggestions.push({
        name: candidate.name,
        score,
        reasons: goodCompanions.map((c) => `companion of ${c}`),
      });
    }
  }

  return suggestions.sort((a, b) => b.score - a.score);
}
