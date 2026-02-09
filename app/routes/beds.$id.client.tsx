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

type PlantingItem = {
  id: number
  plantId: number
  plantName: string
  plantVariety: string | null
  plantCategory: string | null
  status: string
  plantedDate: string | null
  expectedHarvestDate: string | null
  quantity: number
  notes: string | null
  daysToHarvest: number | null
}

type PlantingsListProps = {
  plantings: PlantingItem[]
  statusLabels: Record<string, string>
  updateStatusAction: (formData: FormData) => Promise<void>
  deleteAction: (formData: FormData) => Promise<void>
}

export function PlantingsList({
  plantings,
  statusLabels,
  updateStatusAction,
  deleteAction,
}: PlantingsListProps) {
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
