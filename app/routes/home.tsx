import { Link } from 'react-router'
import { db } from '../db/index.ts'
import { plants, plantings, settings, yards, yardElements, logEntries } from '../db/schema.ts'
import { eq, inArray, gte } from 'drizzle-orm'
import { YardPreview } from './home.client.tsx'

const Component = async () => {
  const userSettings = (await db.select().from(settings).limit(1))[0]
  const plantCount = (await db.select().from(plants)).length

  const allYards = await db.select().from(yards)
  const firstYard = allYards[0]

  let yardElementList: {
    id: number
    shapeType: string
    x: number
    y: number
    width: number
    height: number
    label: string | null
    rotation: number | null
  }[] = []

  let plantingCount = 0

  if (firstYard) {
    yardElementList = await db
      .select({
        id: yardElements.id,
        shapeType: yardElements.shapeType,
        x: yardElements.x,
        y: yardElements.y,
        width: yardElements.width,
        height: yardElements.height,
        label: yardElements.label,
        rotation: yardElements.rotation,
      })
      .from(yardElements)
      .where(eq(yardElements.yardId, firstYard.id))

    const elementIds = yardElementList.map((e) => e.id)
    if (elementIds.length > 0) {
      const allPlantings = await db
        .select({ id: plantings.id })
        .from(plantings)
        .where(inArray(plantings.yardElementId, elementIds))
      plantingCount = allPlantings.length
    }
  }

  // Check for recent log entries (within last 7 days)
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const weekAgoStr = oneWeekAgo.toISOString().split('T')[0]
  const recentLogs = await db
    .select({ id: logEntries.id })
    .from(logEntries)
    .where(gte(logEntries.date, weekAgoStr))
  const hasRecentLogs = recentLogs.length > 0

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Your garden at a glance.
        </p>
      </div>

      {!userSettings?.zone ? (
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
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Welcome to Backyard Garden
          </h2>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            Get started by setting up your growing zone and frost dates. This
            will unlock personalized planting recommendations.
          </p>
          <Link
            to="/settings"
            className="inline-flex items-center gap-2 rounded-lg bg-garden-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-garden-700 transition-colors no-underline"
          >
            Configure Settings
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="bg-white rounded-xl border border-earth-200 shadow-sm p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Zone
            </p>
            <p className="text-2xl font-semibold text-garden-700 mt-1">
              {userSettings.zone}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-earth-200 shadow-sm p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Plants in Library
            </p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {plantCount}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-earth-200 shadow-sm p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Last Frost
            </p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {userSettings.lastFrostDate
                ? new Date(userSettings.lastFrostDate).toLocaleDateString(
                    'en-US',
                    { month: 'short', day: 'numeric' },
                  )
                : 'Not set'}
            </p>
          </div>
        </div>
      )}

      {/* Yard preview */}
      {firstYard ? (
        <div className="mt-6">
          <Link
            to="/yard"
            className="block bg-white rounded-xl border border-earth-200 shadow-sm hover:shadow-md transition-shadow no-underline overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-earth-100">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {firstYard.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {firstYard.widthFt} x {firstYard.heightFt} ft &middot; {yardElementList.length} beds &middot; {plantingCount} plantings
                </p>
              </div>
              <span className="text-xs font-medium text-garden-700 bg-garden-50 px-2.5 py-1 rounded-lg">
                Open Planner
              </span>
            </div>
            <div className="p-4">
              <YardPreview
                widthFt={firstYard.widthFt}
                heightFt={firstYard.heightFt}
                elements={yardElementList}
              />
            </div>
          </Link>
        </div>
      ) : (
        <div className="mt-6">
          <Link
            to="/yard"
            className="group bg-white rounded-xl border border-earth-200 shadow-sm p-6 hover:shadow-md transition-shadow no-underline block text-center"
          >
            <div className="mx-auto w-12 h-12 rounded-full bg-garden-50 flex items-center justify-center mb-3">
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
            <h3 className="text-base font-semibold text-gray-900 group-hover:text-garden-700 transition-colors">
              Create Your Yard
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Set up your yard dimensions and start planning your garden layout.
            </p>
          </Link>
        </div>
      )}

      {/* Weekly log nudge */}
      {userSettings?.zone && !hasRecentLogs && plantingCount > 0 && (
        <div className="mt-6">
          <Link
            to="/log"
            className="group flex items-center gap-4 bg-amber-50 rounded-xl border border-amber-200 p-5 hover:bg-amber-100 transition-colors no-underline"
          >
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-amber-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-900 group-hover:text-amber-800">
                Time to log!
              </h3>
              <p className="text-xs text-amber-700 mt-0.5">
                You haven't logged anything this week. Quick observations help you track your garden's progress.
              </p>
            </div>
            <span className="text-xs font-medium text-amber-700 bg-amber-100 group-hover:bg-amber-200 px-2.5 py-1 rounded-lg transition-colors shrink-0">
              Open Log
            </span>
          </Link>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/calendar"
          className="group bg-white rounded-xl border border-earth-200 shadow-sm p-5 hover:shadow-md transition-shadow no-underline"
        >
          <div className="w-8 h-8 rounded-lg bg-garden-50 flex items-center justify-center mb-2">
            <svg className="w-4 h-4 text-garden-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-garden-700 transition-colors">
            Calendar
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Planting schedule &amp; tasks
          </p>
        </Link>
        <Link
          to="/plants"
          className="group bg-white rounded-xl border border-earth-200 shadow-sm p-5 hover:shadow-md transition-shadow no-underline"
        >
          <div className="w-8 h-8 rounded-lg bg-garden-50 flex items-center justify-center mb-2">
            <svg className="w-4 h-4 text-garden-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-garden-700 transition-colors">
            Plant Library
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Browse {plantCount} plants
          </p>
        </Link>
        <Link
          to="/log"
          className="group bg-white rounded-xl border border-earth-200 shadow-sm p-5 hover:shadow-md transition-shadow no-underline"
        >
          <div className="w-8 h-8 rounded-lg bg-garden-50 flex items-center justify-center mb-2">
            <svg className="w-4 h-4 text-garden-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-garden-700 transition-colors">
            Garden Log
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {hasRecentLogs ? `${recentLogs.length} this week` : 'Track activity'}
          </p>
        </Link>
        <Link
          to="/settings"
          className="group bg-white rounded-xl border border-earth-200 shadow-sm p-5 hover:shadow-md transition-shadow no-underline"
        >
          <div className="w-8 h-8 rounded-lg bg-earth-100 flex items-center justify-center mb-2">
            <svg className="w-4 h-4 text-earth-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-garden-700 transition-colors">
            Settings
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Zone &amp; frost dates
          </p>
        </Link>
      </div>
    </main>
  )
}

export default Component
