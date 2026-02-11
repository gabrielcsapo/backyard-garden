export const PLANT_FAMILIES: Record<string, { label: string; color: string; plants: string[] }> = {
  solanaceae: {
    label: "Nightshades",
    color: "bg-red-100 text-red-700",
    plants: ["Tomato", "Pepper", "Hot Pepper", "Eggplant", "Ground Cherry", "Potato", "Tomatillo"],
  },
  cucurbitaceae: {
    label: "Cucurbits",
    color: "bg-yellow-100 text-yellow-700",
    plants: [
      "Cucumber",
      "Zucchini",
      "Summer Squash",
      "Winter Squash",
      "Pumpkin",
      "Watermelon",
      "Cantaloupe",
      "Honeydew",
    ],
  },
  brassicaceae: {
    label: "Brassicas",
    color: "bg-teal-100 text-teal-700",
    plants: [
      "Broccoli",
      "Cauliflower",
      "Cabbage",
      "Brussels Sprouts",
      "Kohlrabi",
      "Kale",
      "Collard Greens",
      "Bok Choy",
      "Turnip",
      "Radish",
      "Rutabaga",
      "Daikon Radish",
      "Arugula",
      "Mustard Greens",
      "Watercress",
      "Mizuna",
    ],
  },
  fabaceae: {
    label: "Legumes",
    color: "bg-amber-100 text-amber-700",
    plants: ["Peas", "Green Beans", "Lima Beans", "Edamame", "Pole Beans"],
  },
  amaryllidaceae: {
    label: "Alliums",
    color: "bg-purple-100 text-purple-700",
    plants: ["Onion", "Garlic", "Leek", "Shallot", "Scallion", "Chives"],
  },
  apiaceae: {
    label: "Umbellifers",
    color: "bg-orange-100 text-orange-700",
    plants: ["Carrot", "Parsnip", "Celery", "Celeriac", "Dill", "Cilantro", "Parsley", "Fennel"],
  },
  asteraceae: {
    label: "Asters",
    color: "bg-pink-100 text-pink-700",
    plants: [
      "Lettuce",
      "Romaine Lettuce",
      "Endive",
      "Radicchio",
      "Artichoke",
      "Tarragon",
      "Chamomile",
      "Marigold",
      "Sunflower",
    ],
  },
  amaranthaceae: {
    label: "Chenopods",
    color: "bg-rose-100 text-rose-700",
    plants: ["Beet", "Swiss Chard", "Spinach"],
  },
  poaceae: {
    label: "Grasses",
    color: "bg-lime-100 text-lime-700",
    plants: ["Corn", "Lemongrass"],
  },
  lamiaceae: {
    label: "Mints",
    color: "bg-violet-100 text-violet-700",
    plants: ["Basil", "Oregano", "Thyme", "Rosemary", "Sage", "Mint", "Lavender"],
  },
  rosaceae: {
    label: "Rose Family",
    color: "bg-pink-100 text-pink-700",
    plants: ["Strawberry"],
  },
  tropaeolaceae: {
    label: "Nasturtiums",
    color: "bg-orange-100 text-orange-700",
    plants: ["Nasturtium"],
  },
  polygonaceae: {
    label: "Buckwheats",
    color: "bg-stone-100 text-stone-700",
    plants: ["Sorrel", "Rhubarb"],
  },
  malvaceae: {
    label: "Mallows",
    color: "bg-emerald-100 text-emerald-700",
    plants: ["Okra"],
  },
  convolvulaceae: {
    label: "Morning Glories",
    color: "bg-fuchsia-100 text-fuchsia-700",
    plants: ["Sweet Potato"],
  },
  asparagaceae: {
    label: "Asparagus Family",
    color: "bg-green-100 text-green-700",
    plants: ["Asparagus"],
  },
};

/**
 * Look up a plant's family key by name (case-insensitive).
 * Returns the family key (e.g. 'solanaceae') or null if not found.
 */
export function getPlantFamily(plantName: string): string | null {
  const normalized = plantName.toLowerCase();
  for (const [familyKey, family] of Object.entries(PLANT_FAMILIES)) {
    if (family.plants.some((p) => p.toLowerCase() === normalized)) {
      return familyKey;
    }
  }
  return null;
}

/**
 * Check whether a plant family was used in the same bed within the last 3 years.
 * `historicalPlantings` should be sorted most-recent-first, with `season` as a
 * year string (e.g. "2024") or year-season string (e.g. "2024-spring").
 *
 * Returns an object indicating whether there is a conflict, the last season the
 * family was used, and how many years ago that was.
 */
export function checkRotationConflict(
  plantFamily: string,
  historicalPlantings: { season: string; family: string | null }[],
): { hasConflict: boolean; lastUsedSeason: string | null; yearsAgo: number } {
  const currentYear = new Date().getFullYear();

  for (const planting of historicalPlantings) {
    if (planting.family !== plantFamily) continue;

    // Extract the year portion from the season string (e.g. "2024" or "2024-spring")
    const yearMatch = planting.season.match(/^(\d{4})/);
    if (!yearMatch) continue;

    const plantingYear = parseInt(yearMatch[1], 10);
    const yearsAgo = currentYear - plantingYear;

    if (yearsAgo < 3) {
      return {
        hasConflict: true,
        lastUsedSeason: planting.season,
        yearsAgo,
      };
    }
  }

  return {
    hasConflict: false,
    lastUsedSeason: null,
    yearsAgo: 0,
  };
}
