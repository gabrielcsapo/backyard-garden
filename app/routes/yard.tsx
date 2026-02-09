import { db } from '../db/index.ts'
import { yards, yardElements, plants, plantings } from '../db/schema.ts'
import { eq, inArray } from 'drizzle-orm'
import { createYard } from './yard.actions.ts'
import { YardEditor, CreateYardForm } from './yard.client.tsx'

const Component = async () => {
  const allYards = await db.select().from(yards)
  const firstYard = allYards[0]

  let elements: {
    id: number
    yardId: number
    shapeType: string
    x: number
    y: number
    width: number
    height: number
    label: string | null
    sunExposure: string | null
    rotation: number | null
    metadata: unknown
  }[] = []

  let allPlants: {
    id: number
    name: string
    variety: string | null
    category: string | null
    spacingInches: number | null
    daysToHarvest: number | null
    sunRequirement: string | null
    companions: unknown
    incompatible: unknown
  }[] = []

  let allPlantings: {
    id: number
    plantId: number
    yardElementId: number
    status: string | null
    quantity: number | null
    notes: string | null
    plantedDate: string | null
  }[] = []

  if (firstYard) {
    elements = await db
      .select()
      .from(yardElements)
      .where(eq(yardElements.yardId, firstYard.id))

    allPlants = await db
      .select({
        id: plants.id,
        name: plants.name,
        variety: plants.variety,
        category: plants.category,
        spacingInches: plants.spacingInches,
        daysToHarvest: plants.daysToHarvest,
        sunRequirement: plants.sunRequirement,
        companions: plants.companions,
        incompatible: plants.incompatible,
      })
      .from(plants)

    const elementIds = elements.map((e) => e.id)
    if (elementIds.length > 0) {
      allPlantings = await db
        .select({
          id: plantings.id,
          plantId: plantings.plantId,
          yardElementId: plantings.yardElementId,
          status: plantings.status,
          quantity: plantings.quantity,
          notes: plantings.notes,
          plantedDate: plantings.plantedDate,
        })
        .from(plantings)
        .where(inArray(plantings.yardElementId, elementIds))
    }
  }

  return (
    <main className="px-4 py-3">
      {!firstYard ? (
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-xl border border-earth-200 shadow-sm p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-garden-50 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-garden-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 3v18" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Create Your Yard
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Define your yard dimensions to start planning your garden layout.
            </p>
            <CreateYardForm action={createYard} />
          </div>
        </div>
      ) : (
        <YardEditor
          yard={firstYard}
          elements={elements}
          plants={allPlants}
          plantings={allPlantings}
        />
      )}
    </main>
  )
}

export default Component
