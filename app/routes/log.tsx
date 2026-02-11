import { Link } from 'react-router'
import { eq, desc } from 'drizzle-orm'
import { db } from '../db/index.ts'
import {
  logEntries,
  plantings,
  plants,
  yardElements,
} from '../db/schema.ts'
import { createLogEntry, deleteLogEntry } from './log.actions.ts'
import { LogTimeline, QuickLogForm } from './log.client.tsx'

const Component = async () => {
  const entries = await db
    .select({
      id: logEntries.id,
      date: logEntries.date,
      type: logEntries.type,
      content: logEntries.content,
      stage: logEntries.stage,
      yieldAmount: logEntries.yieldAmount,
      yieldUnit: logEntries.yieldUnit,
      plantingId: logEntries.plantingId,
      yardElementId: logEntries.yardElementId,
      plantName: plants.name,
      plantVariety: plants.variety,
      bedLabel: yardElements.label,
      bedShapeType: yardElements.shapeType,
    })
    .from(logEntries)
    .leftJoin(plantings, eq(logEntries.plantingId, plantings.id))
    .leftJoin(plants, eq(plantings.plantId, plants.id))
    .leftJoin(yardElements, eq(logEntries.yardElementId, yardElements.id))
    .orderBy(desc(logEntries.date), desc(logEntries.id))

  const allPlantings = await db
    .select({
      id: plantings.id,
      plantName: plants.name,
      plantVariety: plants.variety,
      yardElementId: plantings.yardElementId,
      bedLabel: yardElements.label,
    })
    .from(plantings)
    .innerJoin(plants, eq(plantings.plantId, plants.id))
    .innerJoin(yardElements, eq(plantings.yardElementId, yardElements.id))

  // Compute harvest totals for current year
  const currentYear = new Date().getFullYear()
  const harvestEntries = entries.filter(
    (e) =>
      e.type === 'harvest' &&
      e.yieldAmount != null &&
      e.date.startsWith(String(currentYear)),
  )
  const harvestTotals: Record<string, { amount: number; unit: string }> = {}
  for (const e of harvestEntries) {
    const key = e.plantName ?? 'Unknown'
    const unit = e.yieldUnit ?? 'units'
    const tk = `${key}|${unit}`
    if (!harvestTotals[tk]) {
      harvestTotals[tk] = { amount: 0, unit }
    }
    harvestTotals[tk].amount += e.yieldAmount!
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-garden-700 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-900">Garden Log</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Garden Log</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track activities, observations, and harvests in your garden.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LogTimeline
            entries={entries}
            deleteAction={deleteLogEntry}
          />
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-earth-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Quick Log
            </h2>
            <QuickLogForm
              plantings={allPlantings}
              createAction={createLogEntry}
            />
          </div>

          {Object.keys(harvestTotals).length > 0 && (
            <div className="bg-white rounded-xl border border-earth-200 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">
                {currentYear} Harvest Totals
              </h2>
              <div className="space-y-2">
                {Object.entries(harvestTotals).map(([key, val]) => {
                  const plantName = key.split('|')[0]
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-700">{plantName}</span>
                      <span className="font-medium text-garden-700">
                        {val.amount.toFixed(1)} {val.unit}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default Component
