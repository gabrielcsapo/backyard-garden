import { Link } from 'react-router'
import { db } from '../db/index.ts'
import { yardElements, plantings, plants, settings, logEntries } from '../db/schema.ts'
import { eq, and, desc } from 'drizzle-orm'
import { SHAPE_CONFIG } from '../lib/shapes.ts'
import { getShapeArea } from '../lib/shapes.ts'
import { checkCompanionConflicts, getCompanionSuggestions } from '../lib/companions.ts'
import { getPlantFamily, PLANT_FAMILIES, checkRotationConflict } from '../lib/plant-families.ts'
import { shouldSowAgain } from '../lib/succession.ts'
import {
  addPlanting,
  updatePlantingStatus,
  deletePlanting,
} from './beds.$id.actions.ts'
import { createLogEntry } from './log.actions.ts'
import {
  PlantingsList,
  AddPlantingForm,
  CompanionSuggestions,
  QuickLogModal,
  RotationHistory,
} from './beds.$id.client.tsx'

const SUN_LABELS: Record<string, string> = {
  full_sun: 'Full Sun',
  partial_shade: 'Partial Shade',
  full_shade: 'Full Shade',
}

const STATUS_LABELS: Record<string, string> = {
  planned: 'Planned',
  seeded: 'Seeded',
  sprouted: 'Sprouted',
  transplanted: 'Transplanted',
  growing: 'Growing',
  harvesting: 'Harvesting',
  done: 'Done',
}

const Component = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const bedId = Number(id)

  const bed = (
    await db
      .select()
      .from(yardElements)
      .where(eq(yardElements.id, bedId))
      .limit(1)
  )[0]

  if (!bed) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="bg-white rounded-xl border border-earth-200 shadow-sm p-12 text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Bed Not Found
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            This bed doesn't exist or has been removed.
          </p>
          <Link
            to="/beds"
            className="text-garden-600 hover:text-garden-700 text-sm font-medium no-underline"
          >
            Back to Beds
          </Link>
        </div>
      </main>
    )
  }

  const config =
    SHAPE_CONFIG[bed.shapeType as keyof typeof SHAPE_CONFIG]
  const area = getShapeArea(bed.shapeType, bed.width, bed.height)

  const bedPlantings = await db
    .select({
      id: plantings.id,
      plantId: plantings.plantId,
      status: plantings.status,
      plantedDate: plantings.plantedDate,
      expectedHarvestDate: plantings.expectedHarvestDate,
      quantity: plantings.quantity,
      notes: plantings.notes,
      season: plantings.season,
      plantName: plants.name,
      plantVariety: plants.variety,
      plantCategory: plants.category,
      plantFamily: plants.family,
      spacingInches: plants.spacingInches,
      daysToHarvest: plants.daysToHarvest,
      successionIntervalWeeks: plants.successionIntervalWeeks,
      companions: plants.companions,
      incompatible: plants.incompatible,
    })
    .from(plantings)
    .innerJoin(plants, eq(plantings.plantId, plants.id))
    .where(eq(plantings.yardElementId, bedId))

  const allPlants = await db.select().from(plants)
  const userSettings = (await db.select().from(settings).limit(1))[0]

  // Build rotation history for this bed (all plantings with season info)
  const allBedPlantings = await db
    .select({
      id: plantings.id,
      season: plantings.season,
      plantName: plants.name,
      plantFamily: plants.family,
      status: plantings.status,
    })
    .from(plantings)
    .innerJoin(plants, eq(plantings.plantId, plants.id))
    .where(eq(plantings.yardElementId, bedId))

  // Group by season for rotation display
  const rotationHistory = allBedPlantings
    .filter((p) => p.season)
    .map((p) => ({
      season: p.season!,
      plantName: p.plantName,
      family: p.plantFamily,
      familyLabel: p.plantFamily ? PLANT_FAMILIES[p.plantFamily]?.label ?? p.plantFamily : null,
      familyColor: p.plantFamily ? PLANT_FAMILIES[p.plantFamily]?.color ?? '' : '',
    }))

  // Succession planting nudges
  const successionNudges = bedPlantings
    .filter(
      (p) =>
        p.successionIntervalWeeks &&
        p.status !== 'done' &&
        shouldSowAgain(p.successionIntervalWeeks, p.plantedDate),
    )
    .map((p) => ({
      plantingId: p.id,
      plantName: p.plantName,
      intervalWeeks: p.successionIntervalWeeks!,
    }))

  const existingPlantNames = bedPlantings.map((p) => ({
    name: p.plantName,
    companions: p.companions,
    incompatible: p.incompatible,
  }))

  const suggestions = getCompanionSuggestions(
    existingPlantNames,
    allPlants.map((p) => ({
      name: p.name,
      companions: p.companions,
      incompatible: p.incompatible,
    })),
  ).slice(0, 6)

  // Calculate capacity: estimate based on area vs spacing of planted items
  const usedSqInches = bedPlantings.reduce((sum, p) => {
    const spacing = p.spacingInches ?? 12
    return sum + (p.quantity ?? 1) * spacing * spacing
  }, 0)
  const totalSqInches = area * 144
  const capacityPercent = totalSqInches > 0 ? Math.min(100, Math.round((usedSqInches / totalSqInches) * 100)) : 0

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-garden-700 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link to="/beds" className="hover:text-garden-700 transition-colors">
          Beds
        </Link>
        <span>/</span>
        <span className="text-gray-900">
          {bed.label || config?.label || bed.shapeType}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Bed info + Plantings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bed header */}
          <div className="bg-white rounded-xl border border-earth-200 shadow-sm p-6">
            <div className="flex items-start gap-4 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: config?.color ?? '#e5e7eb',
                  border: `2px solid ${config?.borderColor ?? '#6b7280'}`,
                }}
              >
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={config?.borderColor ?? '#6b7280'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {bed.shapeType === 'circle' ? (
                    <circle cx="12" cy="12" r="9" />
                  ) : bed.shapeType === 'keyhole' ? (
                    <>
                      <circle cx="12" cy="12" r="9" />
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 15v6" />
                    </>
                  ) : (
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                  )}
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900">
                  {bed.label || config?.label || bed.shapeType}
                </h1>
                <p className="text-sm text-gray-500">
                  {config?.label} &middot; {bed.width}' x {bed.height}' &middot;{' '}
                  {Math.round(area)} sq ft
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-earth-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Sun</p>
                <p className="text-sm font-medium text-gray-900">
                  {SUN_LABELS[bed.sunExposure ?? 'full_sun']}
                </p>
              </div>
              <div className="bg-earth-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Plantings</p>
                <p className="text-sm font-medium text-gray-900">
                  {bedPlantings.length}
                </p>
              </div>
              <div className="bg-earth-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Capacity</p>
                <p className="text-sm font-medium text-gray-900">
                  {capacityPercent}%
                </p>
              </div>
            </div>

            {/* Capacity bar */}
            <div className="mt-4">
              <div className="h-2 bg-earth-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${capacityPercent}%`,
                    backgroundColor:
                      capacityPercent > 90
                        ? '#ef4444'
                        : capacityPercent > 70
                          ? '#f59e0b'
                          : '#22c55e',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Plantings list */}
          <div className="bg-white rounded-xl border border-earth-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Plantings
            </h2>
            <PlantingsList
              plantings={bedPlantings.map((p) => ({
                id: p.id,
                plantId: p.plantId,
                plantName: p.plantName,
                plantVariety: p.plantVariety,
                plantCategory: p.plantCategory,
                plantFamily: p.plantFamily,
                status: p.status ?? 'planned',
                plantedDate: p.plantedDate,
                expectedHarvestDate: p.expectedHarvestDate,
                quantity: p.quantity ?? 1,
                notes: p.notes,
                daysToHarvest: p.daysToHarvest,
                successionIntervalWeeks: p.successionIntervalWeeks,
              }))}
              statusLabels={STATUS_LABELS}
              updateStatusAction={updatePlantingStatus}
              deleteAction={deletePlanting}
              logAction={createLogEntry}
              bedId={bedId}
              successionNudges={successionNudges}
            />
          </div>

          {/* Rotation History */}
          {rotationHistory.length > 0 && (
            <div className="bg-white rounded-xl border border-earth-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Crop Rotation History
              </h2>
              <RotationHistory
                history={rotationHistory}
                currentPlantings={bedPlantings.map((p) => ({
                  plantName: p.plantName,
                  family: p.plantFamily,
                }))}
              />
            </div>
          )}
        </div>

        {/* Right column - Add planting + Suggestions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-earth-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Add Planting
            </h2>
            <AddPlantingForm
              bedId={bedId}
              plants={allPlants.map((p) => ({
                id: p.id,
                name: p.name,
                variety: p.variety,
                category: p.category,
                sunRequirement: p.sunRequirement,
              }))}
              existingPlants={existingPlantNames}
              addAction={addPlanting}
            />
          </div>

          {suggestions.length > 0 && (
            <div className="bg-white rounded-xl border border-earth-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Companion Suggestions
              </h2>
              <CompanionSuggestions suggestions={suggestions} />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default Component
