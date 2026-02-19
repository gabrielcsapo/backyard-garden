import { Link } from "react-router";
import { db } from "../db/index.ts";
import { pestDisease, plantings, plants } from "../db/schema.ts";
import { sql, eq } from "drizzle-orm";
import { PestList } from "./pests.client.tsx";

const Component = async () => {
  const allPests = await db
    .select()
    .from(pestDisease)
    .orderBy(sql`${pestDisease.type} ASC, ${pestDisease.name} ASC`);

  // Get active plant names for symptom checker
  const activePlantNames = await db
    .select({ name: plants.name })
    .from(plantings)
    .innerJoin(plants, eq(plantings.plantId, plants.id))
    .where(sql`${plantings.status} != 'done'`);
  const uniquePlantNames = [...new Set(activePlantNames.map((p) => p.name))].sort();

  // Seasonal alerts: pests active this month that affect plants we're growing
  const currentMonth = new Date().getMonth() + 1;
  const seasonalAlerts = allPests.filter((p) => {
    const months = p.activeMonths as number[] | null;
    if (!months || !months.includes(currentMonth)) return false;
    const affected = p.affectedPlants as string[] | null;
    if (!affected) return false;
    return affected.some((ap) => uniquePlantNames.includes(ap));
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link to="/" className="hover:text-garden-700 dark:hover:text-garden-400 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-gray-100">Pests & Diseases</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Pests & Diseases</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Reference guide with organic treatments and prevention tips.
        </p>
      </div>

      {/* Seasonal Alerts */}
      {seasonalAlerts.length > 0 && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-4">
          <h2 className="text-sm font-semibold text-red-900 dark:text-red-200 mb-2">
            Active This Month ({seasonalAlerts.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {seasonalAlerts.map((p) => (
              <span key={p.id} className="text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-2 py-1 rounded-full">
                {p.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <PestList pests={allPests} plantNames={uniquePlantNames} />
    </main>
  );
};

export default Component;
