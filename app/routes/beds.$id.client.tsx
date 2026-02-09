'use client'

import { useState } from 'react'
import { checkCompanionConflicts } from '../lib/companions.ts'

const STATUS_ORDER = [
  'planned',
  'seeded',
  'sprouted',
  'transplanted',
  'growing',
  'harvesting',
  'done',
]

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  planned: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' },
  seeded: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  sprouted: { bg: 'bg-lime-50', text: 'text-lime-700', dot: 'bg-lime-400' },
  transplanted: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  growing: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  harvesting: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-400' },
  done: { bg: 'bg-earth-100', text: 'text-earth-600', dot: 'bg-earth-400' },
}

const CATEGORY_COLORS: Record<string, string> = {
  vegetable: 'bg-red-50 text-red-700',
  herb: 'bg-purple-50 text-purple-700',
  fruit: 'bg-pink-50 text-pink-700',
  legume: 'bg-teal-50 text-teal-700',
  root: 'bg-orange-50 text-orange-700',
  leafy_green: 'bg-green-50 text-green-700',
  allium: 'bg-indigo-50 text-indigo-700',
  brassica: 'bg-cyan-50 text-cyan-700',
}

type SuccessionNudge = {
  plantingId: number
  plantName: string
  intervalWeeks: number
}

type PlantingItem = {
  id: number
  plantId: number
  plantName: string
  plantVariety: string | null
  plantCategory: string | null
  plantFamily: string | null
  status: string
  plantedDate: string | null
  expectedHarvestDate: string | null
  quantity: number
  notes: string | null
  daysToHarvest: number | null
  successionIntervalWeeks: number | null
}

type PlantingsListProps = {
  plantings: PlantingItem[]
  statusLabels: Record<string, string>
  updateStatusAction: (formData: FormData) => Promise<void>
  deleteAction: (formData: FormData) => Promise<void>
  logAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>
  bedId: number
  successionNudges: SuccessionNudge[]
}

export function PlantingsList({
  plantings,
  statusLabels,
  updateStatusAction,
  deleteAction,
  logAction,
  bedId,
  successionNudges,
}: PlantingsListProps) {
  const [logPlanting, setLogPlanting] = useState<PlantingItem | null>(null)

  if (plantings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-400">
          No plantings yet. Add your first planting from the panel on the right.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Succession planting nudges */}
      {successionNudges.length > 0 && (
        <div className="mb-4 space-y-2">
          {successionNudges.map((nudge) => (
            <div
              key={nudge.plantingId}
              className="flex items-center gap-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg"
            >
              <svg
                className="w-4 h-4 text-amber-600 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <p className="text-xs text-amber-800 flex-1">
                <span className="font-medium">{nudge.plantName}</span> is ready
                for succession sowing (every {nudge.intervalWeeks} weeks)
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {plantings.map((planting) => {
          const colors = STATUS_COLORS[planting.status] ?? STATUS_COLORS.planned
          const catColor = CATEGORY_COLORS[planting.plantCategory ?? ''] ?? 'bg-gray-50 text-gray-700'
          const currentIdx = STATUS_ORDER.indexOf(planting.status)
          const nextStatus = currentIdx < STATUS_ORDER.length - 1 ? STATUS_ORDER[currentIdx + 1] : null

          return (
            <div
              key={planting.id}
              className="border border-earth-200 rounded-lg p-4 hover:border-earth-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-gray-900">
                      {planting.plantName}
                      {planting.plantVariety && (
                        <span className="font-normal text-gray-500">
                          {' '}
                          ({planting.plantVariety})
                        </span>
                      )}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                      {statusLabels[planting.status] ?? planting.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${catColor}`}>
                      {planting.plantCategory?.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                    <span>Qty: {planting.quantity}</span>
                    {planting.plantedDate && (
                      <span>Planted: {planting.plantedDate}</span>
                    )}
                    {planting.daysToHarvest && (
                      <span>{planting.daysToHarvest}d to harvest</span>
                    )}
                  </div>

                  {planting.notes && (
                    <p className="mt-1.5 text-xs text-gray-500 italic">
                      {planting.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setLogPlanting(planting)}
                    className="p-1 text-gray-400 hover:text-garden-600 transition-colors"
                    title="Quick log"
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
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  {nextStatus && (
                    <form action={updateStatusAction}>
                      <input type="hidden" name="id" value={planting.id} />
                      <input type="hidden" name="status" value={nextStatus} />
                      <button
                        type="submit"
                        className="px-2.5 py-1 text-xs font-medium text-garden-700 bg-garden-50 hover:bg-garden-100 rounded-md transition-colors"
                        title={`Mark as ${statusLabels[nextStatus]}`}
                      >
                        {statusLabels[nextStatus]} &rarr;
                      </button>
                    </form>
                  )}
                  <form action={deleteAction}>
                    <input type="hidden" name="id" value={planting.id} />
                    <button
                      type="submit"
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove planting"
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
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {logPlanting && (
        <QuickLogModal
          planting={logPlanting}
          bedId={bedId}
          logAction={logAction}
          onClose={() => setLogPlanting(null)}
        />
      )}
    </>
  )
}

type PlantOption = {
  id: number
  name: string
  variety: string | null
  category: string | null
  sunRequirement: string | null
}

type ExistingPlant = {
  name: string
  companions: unknown
  incompatible: unknown
}

type AddPlantingFormProps = {
  bedId: number
  plants: PlantOption[]
  existingPlants: ExistingPlant[]
  addAction: (formData: FormData) => Promise<void>
}

export function AddPlantingForm({
  bedId,
  plants,
  existingPlants,
  addAction,
}: AddPlantingFormProps) {
  const [search, setSearch] = useState('')
  const [selectedPlant, setSelectedPlant] = useState<PlantOption | null>(null)

  const filtered = search.length > 0
    ? plants.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.variety?.toLowerCase().includes(search.toLowerCase()) ?? false),
      )
    : plants

  const companionCheck = selectedPlant
    ? checkCompanionConflicts(
        {
          name: selectedPlant.name,
          companions: [],
          incompatible: [],
        },
        existingPlants,
      )
    : null

  // Get full plant info for conflict checking
  const getFullPlantInfo = (plant: PlantOption) => {
    // We only have basic info here but companion check needs full plant data
    // The actual conflict is checked server-side; this is a simple visual hint
    return { name: plant.name, companions: [], incompatible: [] }
  }

  return (
    <div>
      {!selectedPlant ? (
        <div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plants..."
            className="w-full px-3 py-2 text-sm border border-earth-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent mb-3"
          />
          <div className="max-h-64 overflow-y-auto space-y-1">
            {filtered.slice(0, 20).map((plant) => (
              <button
                key={plant.id}
                type="button"
                onClick={() => {
                  setSelectedPlant(plant)
                  setSearch('')
                }}
                className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-garden-50 transition-colors flex items-center justify-between"
              >
                <span>
                  <span className="font-medium text-gray-900">
                    {plant.name}
                  </span>
                  {plant.variety && (
                    <span className="text-gray-500"> ({plant.variety})</span>
                  )}
                </span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded ${CATEGORY_COLORS[plant.category ?? ''] ?? 'bg-gray-50 text-gray-600'}`}
                >
                  {plant.category?.replace('_', ' ')}
                </span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">
                No plants found
              </p>
            )}
          </div>
        </div>
      ) : (
        <form action={addAction}>
          <input type="hidden" name="yardElementId" value={bedId} />
          <input type="hidden" name="plantId" value={selectedPlant.id} />

          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-gray-900">
                  {selectedPlant.name}
                </p>
                {selectedPlant.variety && (
                  <p className="text-xs text-gray-500">
                    {selectedPlant.variety}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlant(null)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Change
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                defaultValue={1}
                min={1}
                className="w-full px-3 py-2 text-sm border border-earth-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Status
              </label>
              <select
                name="status"
                defaultValue="planned"
                className="w-full px-3 py-2 text-sm border border-earth-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent bg-white"
              >
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Notes (optional)
              </label>
              <textarea
                name="notes"
                rows={2}
                className="w-full px-3 py-2 text-sm border border-earth-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent resize-none"
                placeholder="Any notes about this planting..."
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 w-full px-4 py-2 bg-garden-600 text-white rounded-lg hover:bg-garden-700 transition-colors text-sm font-medium"
          >
            Add Planting
          </button>
        </form>
      )}
    </div>
  )
}

type Suggestion = {
  name: string
  score: number
  reasons: string[]
}

export function CompanionSuggestions({
  suggestions,
}: {
  suggestions: Suggestion[]
}) {
  return (
    <div className="space-y-2">
      {suggestions.map((s) => (
        <div
          key={s.name}
          className="flex items-center justify-between px-3 py-2 bg-garden-50 rounded-lg"
        >
          <div>
            <p className="text-sm font-medium text-gray-900">{s.name}</p>
            <p className="text-xs text-gray-500">
              {s.reasons.slice(0, 3).join(', ')}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(s.score, 5) }).map((_, i) => (
              <svg
                key={i}
                className="w-3 h-3 text-garden-500"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const LOG_TYPES = [
  { value: 'observation', label: 'Observation', icon: '👁' },
  { value: 'watering', label: 'Watering', icon: '💧' },
  { value: 'fertilizing', label: 'Fertilizing', icon: '🧪' },
  { value: 'pest', label: 'Pest', icon: '🐛' },
  { value: 'harvest', label: 'Harvest', icon: '🧺' },
  { value: 'pruning', label: 'Pruning', icon: '✂️' },
  { value: 'stage_change', label: 'Stage Change', icon: '🌱' },
]

type QuickLogModalProps = {
  planting: PlantingItem
  bedId: number
  logAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>
  onClose: () => void
}

export function QuickLogModal({ planting, bedId, logAction, onClose }: QuickLogModalProps) {
  const [selectedType, setSelectedType] = useState('observation')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    const result = await logAction(formData)
    if (result.success) {
      setSubmitted(true)
      setTimeout(onClose, 800)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        {submitted ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto rounded-full bg-garden-50 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-garden-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900">Logged!</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Quick Log
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Log an entry for{' '}
              <span className="font-medium text-gray-900">{planting.plantName}</span>
            </p>

            <form action={handleSubmit}>
              <input type="hidden" name="plantingId" value={planting.id} />
              <input type="hidden" name="yardElementId" value={bedId} />
              <input type="hidden" name="date" value={new Date().toISOString().split('T')[0]} />

              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Event Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {LOG_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setSelectedType(t.value)}
                      className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-xs transition-colors border ${
                        selectedType === t.value
                          ? 'border-garden-500 bg-garden-50 text-garden-700'
                          : 'border-earth-200 text-gray-600 hover:bg-earth-50'
                      }`}
                    >
                      <span className="text-base">{t.icon}</span>
                      <span className="font-medium truncate w-full text-center">{t.label}</span>
                    </button>
                  ))}
                </div>
                <input type="hidden" name="type" value={selectedType} />
              </div>

              {selectedType === 'harvest' && (
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      name="yieldAmount"
                      step="0.1"
                      className="w-full px-3 py-2 text-sm border border-earth-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Unit
                    </label>
                    <select
                      name="yieldUnit"
                      className="w-full px-3 py-2 text-sm border border-earth-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent bg-white"
                    >
                      <option value="lbs">lbs</option>
                      <option value="oz">oz</option>
                      <option value="count">count</option>
                      <option value="bunches">bunches</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  name="content"
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-earth-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent resize-none"
                  placeholder="Any observations..."
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-garden-600 text-white rounded-lg hover:bg-garden-700 transition-colors text-sm font-medium"
              >
                Save Log Entry
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

type RotationEntry = {
  season: string
  plantName: string
  family: string | null
  familyLabel: string | null
  familyColor: string
}

type RotationHistoryProps = {
  history: RotationEntry[]
  currentPlantings: { plantName: string; family: string | null }[]
}

export function RotationHistory({ history, currentPlantings }: RotationHistoryProps) {
  // Group by season
  const bySeason = new Map<string, RotationEntry[]>()
  for (const entry of history) {
    const arr = bySeason.get(entry.season) || []
    arr.push(entry)
    bySeason.set(entry.season, arr)
  }
  const seasons = Array.from(bySeason.keys()).sort().reverse()

  // Check current plantings for rotation conflicts
  const currentYear = new Date().getFullYear().toString()
  const familiesInUse = new Set(
    currentPlantings.map((p) => p.family).filter(Boolean),
  )

  const conflictFamilies = new Set<string>()
  for (const entry of history) {
    if (!entry.family) continue
    const yearMatch = entry.season.match(/^(\d{4})/)
    if (!yearMatch) continue
    const yearsAgo = new Date().getFullYear() - parseInt(yearMatch[1], 10)
    if (yearsAgo > 0 && yearsAgo < 3 && familiesInUse.has(entry.family)) {
      conflictFamilies.add(entry.family)
    }
  }

  return (
    <div>
      {conflictFamilies.size > 0 && (
        <div className="mb-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800">
            <span className="font-medium">Rotation warning:</span> Same plant
            family used in this bed within the last 3 years.
            Consider rotating to a different family.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {seasons.map((season) => {
          const entries = bySeason.get(season)!
          return (
            <div key={season}>
              <p className="text-xs font-medium text-gray-500 mb-1.5">
                {season}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {entries.map((e, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${e.familyColor || 'bg-gray-100 text-gray-700'}`}
                  >
                    {e.plantName}
                    {e.familyLabel && (
                      <span className="opacity-70">({e.familyLabel})</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
