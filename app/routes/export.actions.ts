"use server";

import { exportLogEntries, exportSeedInventory, exportPlantings } from "../lib/export.ts";

export async function exportLogs(): Promise<{ csv: string; filename: string }> {
  const csv = await exportLogEntries();
  return { csv, filename: `garden-log-${new Date().toISOString().split("T")[0]}.csv` };
}

export async function exportSeeds(): Promise<{ csv: string; filename: string }> {
  const csv = await exportSeedInventory();
  return { csv, filename: `seed-inventory-${new Date().toISOString().split("T")[0]}.csv` };
}

export async function exportAllPlantings(): Promise<{ csv: string; filename: string }> {
  const csv = await exportPlantings();
  return { csv, filename: `plantings-${new Date().toISOString().split("T")[0]}.csv` };
}
