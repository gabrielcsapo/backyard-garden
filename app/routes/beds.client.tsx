'use client'

import { Link } from 'react-router'

type BedCardProps = {
  bed: {
    id: number
    label: string | null
    shapeType: string
    sunExposure: string | null
    width: number
    height: number
    plantingCount: number
    shapeLabel: string
    shapeColor: string
    shapeBorderColor: string
    sunLabel: string
  }
}

const SUN_ICONS: Record<string, string> = {
  full_sun: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364-.707-.707M6.343 6.343l-.707-.707m12.728 0-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z',
  partial_shade: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z',
  full_shade: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
}

export function BedCard({ bed }: BedCardProps) {
  const area = bed.width * bed.height

  return (
    <Link
      to={`/beds/${bed.id}`}
      className="group block bg-white rounded-xl border border-earth-200 shadow-sm hover:shadow-md hover:border-garden-300 transition-all no-underline"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: bed.shapeColor,
                border: `2px solid ${bed.shapeBorderColor}`,
              }}
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke={bed.shapeBorderColor}
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
                ) : bed.shapeType === 'spiral' ? (
                  <path d="M12 12m-2 0a2 2 0 1 0 4 0a4 4 0 1 0-8 0a6 6 0 1 0 12 0a8 8 0 1 0-16 0" />
                ) : bed.shapeType === 'container' ? (
                  <>
                    <path d="M5 8h14l-1 10H6L5 8z" />
                    <path d="M4 6h16" />
                  </>
                ) : bed.shapeType === 'mandala' ? (
                  <>
                    <circle cx="12" cy="12" r="9" />
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 3v18M3 12h18" />
                  </>
                ) : bed.shapeType === 'hugelkultur' ? (
                  <path d="M2 20 C6 8, 10 4, 12 4 C14 4, 18 8, 22 20Z" />
                ) : (
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                )}
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-garden-700 transition-colors">
                {bed.label || bed.shapeLabel}
              </h3>
              <p className="text-xs text-gray-500">{bed.shapeLabel}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={SUN_ICONS[bed.sunExposure ?? 'full_sun'] ?? SUN_ICONS.full_sun} />
            </svg>
            {bed.sunLabel}
          </span>
          <span>{bed.width}' x {bed.height}' ({area} sq ft)</span>
        </div>

        <div className="mt-3 pt-3 border-t border-earth-100 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {bed.plantingCount === 0 ? (
              <span className="text-gray-400">No plantings yet</span>
            ) : (
              <>
                <span className="font-medium text-garden-700">
                  {bed.plantingCount}
                </span>{' '}
                {bed.plantingCount === 1 ? 'planting' : 'plantings'}
              </>
            )}
          </span>
          <svg
            className="w-4 h-4 text-gray-400 group-hover:text-garden-600 transition-colors"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
      </div>
    </Link>
  )
}
