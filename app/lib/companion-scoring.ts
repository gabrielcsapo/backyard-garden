type PlantInfo = {
  id: number;
  name: string;
  sunRequirement: string | null;
  companions: string[] | null;
  incompatible: string[] | null;
  spacingInches: number | null;
};

type BedElement = {
  id: number;
  shapeType: string;
  width: number;
  height: number;
  sunExposure: string | null;
};

type PlantingInfo = {
  plantId: number;
  yardElementId: number;
  quantity: number | null;
};

export type BedScore = {
  bedId: number;
  bedLabel: string | null;
  companionCount: number;
  conflictCount: number;
  sunMatch: boolean;
  capacityRemaining: number;
  score: number;
  reasons: string[];
};

function getShapeArea(shapeType: string, width: number, height: number): number {
  const w = width;
  const h = height;
  switch (shapeType) {
    case "circle":
    case "mandala":
      return Math.PI * (w / 2) * (h / 2);
    case "hugelkultur":
      return w * h * 0.8;
    default:
      return w * h;
  }
}

export function scoreBedForPlant(
  plantToAdd: PlantInfo,
  bed: BedElement & { label: string | null },
  plantingsInBed: PlantingInfo[],
  allPlants: PlantInfo[],
): BedScore {
  const plantsInBed = plantingsInBed
    .map((p) => allPlants.find((ap) => ap.id === p.plantId))
    .filter(Boolean) as PlantInfo[];

  const plantNames = plantsInBed.map((p) => p.name);
  const companions = plantToAdd.companions ?? [];
  const incompatible = plantToAdd.incompatible ?? [];

  let companionCount = 0;
  let conflictCount = 0;
  const reasons: string[] = [];

  for (const name of plantNames) {
    if (companions.includes(name)) {
      companionCount++;
      reasons.push(`Good companion: ${name}`);
    }
    if (incompatible.includes(name)) {
      conflictCount++;
      reasons.push(`Conflict: ${name}`);
    }
  }

  const sunMatch =
    !plantToAdd.sunRequirement || !bed.sunExposure || plantToAdd.sunRequirement === bed.sunExposure;

  if (!sunMatch) {
    reasons.push(
      `Sun mismatch: plant needs ${plantToAdd.sunRequirement}, bed has ${bed.sunExposure}`,
    );
  }

  const area = getShapeArea(bed.shapeType, bed.width, bed.height);
  const spacingSqFt = plantToAdd.spacingInches ? (plantToAdd.spacingInches / 12) ** 2 : 1;
  const maxPlants = Math.floor(area / spacingSqFt);
  const currentPlants = plantingsInBed.reduce((sum, p) => sum + (p.quantity ?? 1), 0);
  const capacityRemaining = Math.max(0, maxPlants - currentPlants);

  if (capacityRemaining === 0) {
    reasons.push("Bed is at full capacity");
  }

  const score =
    companionCount * 3 -
    conflictCount * 10 +
    (sunMatch ? 2 : -3) +
    (capacityRemaining > 0 ? 1 : -5);

  return {
    bedId: bed.id,
    bedLabel: bed.label,
    companionCount,
    conflictCount,
    sunMatch,
    capacityRemaining,
    score,
    reasons,
  };
}

export function rankBedsForPlant(
  plant: PlantInfo,
  elements: (BedElement & { label: string | null })[],
  allPlantings: PlantingInfo[],
  allPlants: PlantInfo[],
): BedScore[] {
  const PLANTABLE_SHAPES = [
    "rectangle",
    "circle",
    "keyhole",
    "spiral",
    "hugelkultur",
    "mandala",
    "container",
  ];

  return elements
    .filter((el) => PLANTABLE_SHAPES.includes(el.shapeType))
    .map((bed) => {
      const plantingsInBed = allPlantings.filter((p) => p.yardElementId === bed.id);
      return scoreBedForPlant(plant, bed, plantingsInBed, allPlants);
    })
    .sort((a, b) => b.score - a.score);
}

export function getGlowColor(score: BedScore): string | null {
  if (score.conflictCount > 0 && score.companionCount === 0) return "#ef4444";
  if (score.conflictCount > 0 && score.companionCount > 0) return "#f59e0b";
  if (score.companionCount > 0) return "#22c55e";
  return null;
}
