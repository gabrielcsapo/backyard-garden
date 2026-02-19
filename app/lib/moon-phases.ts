/**
 * Moon phase calculation using the synodic period.
 * Algorithmic — no API needed.
 */

const SYNODIC_PERIOD = 29.53058770576; // days
const KNOWN_NEW_MOON = new Date("2000-01-06T18:14:00Z"); // known new moon reference

export type MoonPhase = {
  name: string;
  emoji: string;
  illumination: number;
  daysIntoPhase: number;
  gardeningTip: string;
};

const PHASE_NAMES = [
  { name: "New Moon", emoji: "🌑", tip: "Best for pruning and weeding. Ideal for starting root crops." },
  { name: "Waxing Crescent", emoji: "🌒", tip: "Good time to plant leafy greens and cereals." },
  { name: "First Quarter", emoji: "🌓", tip: "Plant above-ground crops with internal seeds (beans, tomatoes)." },
  { name: "Waxing Gibbous", emoji: "🌔", tip: "Continue planting above-ground crops. Good transplanting window." },
  { name: "Full Moon", emoji: "🌕", tip: "Plant root crops and bulbs. Best time for harvesting." },
  { name: "Waning Gibbous", emoji: "🌖", tip: "Good for planting root crops, bulbs, and perennials." },
  { name: "Last Quarter", emoji: "🌗", tip: "Prune, mow, and harvest. Poor planting time." },
  { name: "Waning Crescent", emoji: "🌘", tip: "Rest period. Prepare beds, compost, and plan." },
];

/**
 * Get the moon phase for a given date.
 */
export function getMoonPhase(date: Date = new Date()): MoonPhase {
  const diff = date.getTime() - KNOWN_NEW_MOON.getTime();
  const daysSinceNewMoon = diff / (1000 * 60 * 60 * 24);
  const currentAge = ((daysSinceNewMoon % SYNODIC_PERIOD) + SYNODIC_PERIOD) % SYNODIC_PERIOD;

  // Divide the synodic period into 8 phases
  const phaseLength = SYNODIC_PERIOD / 8;
  const phaseIndex = Math.floor(currentAge / phaseLength) % 8;
  const daysIntoPhase = currentAge - phaseIndex * phaseLength;

  // Approximate illumination (0-100)
  const illumination = Math.round(
    50 * (1 - Math.cos((2 * Math.PI * currentAge) / SYNODIC_PERIOD)),
  );

  const phase = PHASE_NAMES[phaseIndex];

  return {
    name: phase.name,
    emoji: phase.emoji,
    illumination,
    daysIntoPhase: Math.round(daysIntoPhase * 10) / 10,
    gardeningTip: phase.tip,
  };
}

/**
 * Get moon phases for a range of dates (for calendar display).
 */
export function getMoonPhasesForMonth(
  year: number,
  month: number,
): { date: string; phase: MoonPhase }[] {
  const results: { date: string; phase: MoonPhase }[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day, 12, 0, 0);
    results.push({
      date: date.toISOString().split("T")[0],
      phase: getMoonPhase(date),
    });
  }

  return results;
}
