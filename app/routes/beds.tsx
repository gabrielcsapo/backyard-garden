import { Link } from 'react-router'
import { db } from '../db/index.ts'
import { yardElements, plantings } from '../db/schema.ts'
import { eq, sql } from 'drizzle-orm'
import { SHAPE_CONFIG } from '../lib/shapes.ts'
import { BedCard } from './beds.client.tsx'

const SUN_LABELS: Record<string, string> = {
  full_sun: 'Full Sun',
  partial_shade: 'Partial Shade',
  full_shade: 'Full Shade',
}

const Component = async () => {
  const beds = await db
    .select({
      id: yardElements.id,
      yardId: yardElements.yardId,
      shapeType: yardElements.shapeType,
      label: yardElements.label,
      sunExposure: yardElements.sunExposure,
      width: yardElements.width,
      height: yardElements.height,
      x: yardElements.x,
      y: yardElements.y,
      plantingCount: sql<number>`(SELECT COUNT(*) FROM plantings WHERE plantings.yard_element_id = yard_elements.id)`,
    })
    .from(yardElements)
    .where(
      sql`${yardElements.shapeType} NOT IN ('path', 'structure', 'water')`,
    )

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-garden-700 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-900">Beds</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Garden Beds</h1>
          <p className="text-sm text-gray-500 mt-1">
            {beds.length} plantable {beds.length === 1 ? 'bed' : 'beds'} in
            your yard
          </p>
        </div>
        <Link
          to="/yard"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-garden-700 bg-garden-50 hover:bg-garden-100 rounded-lg transition-colors no-underline"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Beds in Yard Planner
        </Link>
      </div>

      {beds.length === 0 ? (
        <div className="bg-white rounded-xl border border-earth-200 shadow-sm p-12 text-center">
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
              <path d="M2 22h20" />
              <path d="M6.36 17.4 4 17l-2-4 5-3 3 2 4-4 4 2 5 3-2 4-2.36.4" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            No Beds Yet
          </h2>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            Use the Yard Planner to add garden beds, then come back here to
            manage your plantings.
          </p>
          <Link
            to="/yard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-garden-600 text-white rounded-lg hover:bg-garden-700 transition-colors text-sm font-medium no-underline"
          >
            Open Yard Planner
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {beds.map((bed) => {
            const config = SHAPE_CONFIG[bed.shapeType as keyof typeof SHAPE_CONFIG]
            return (
              <BedCard
                key={bed.id}
                bed={{
                  id: bed.id,
                  label: bed.label,
                  shapeType: bed.shapeType,
                  sunExposure: bed.sunExposure,
                  width: bed.width,
                  height: bed.height,
                  plantingCount: bed.plantingCount,
                  shapeLabel: config?.label ?? bed.shapeType,
                  shapeColor: config?.color ?? '#e5e7eb',
                  shapeBorderColor: config?.borderColor ?? '#6b7280',
                  sunLabel: SUN_LABELS[bed.sunExposure ?? 'full_sun'] ?? 'Full Sun',
                }}
              />
            )
          })}
        </div>
      )}
    </main>
  )
}

export default Component
