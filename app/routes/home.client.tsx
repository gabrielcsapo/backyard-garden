'use client'

import React from 'react'
import { SHAPE_CONFIG } from '../lib/shapes.ts'
import type { ShapeType } from '../lib/shapes.ts'

type PreviewElement = {
  id: number
  shapeType: string
  x: number
  y: number
  width: number
  height: number
  label: string | null
  rotation: number | null
}

const CELL_SIZE = 28

export function YardPreview({
  widthFt,
  heightFt,
  elements,
}: {
  widthFt: number
  heightFt: number
  elements: PreviewElement[]
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [scale, setScale] = React.useState(1)

  const gridWidth = widthFt * CELL_SIZE
  const gridHeight = heightFt * CELL_SIZE

  React.useEffect(() => {
    if (!containerRef.current) return
    const availableWidth = containerRef.current.clientWidth
    const maxHeight = 300
    const scaleX = availableWidth / gridWidth
    const scaleY = maxHeight / gridHeight
    setScale(Math.min(scaleX, scaleY, 1))
  }, [gridWidth, gridHeight])

  return (
    <div ref={containerRef} className="flex justify-center">
      <svg
        width={gridWidth * scale}
        height={gridHeight * scale}
        viewBox={`0 0 ${gridWidth} ${gridHeight}`}
      >
        <rect width={gridWidth} height={gridHeight} fill="#f9fafb" />

        {/* Light grid */}
        {Array.from({ length: Math.floor(widthFt / 5) + 1 }, (_, i) => (
          <line
            key={`v-${i}`}
            x1={i * 5 * CELL_SIZE}
            y1={0}
            x2={i * 5 * CELL_SIZE}
            y2={gridHeight}
            stroke="#e5e7eb"
            strokeWidth={0.5}
          />
        ))}
        {Array.from({ length: Math.floor(heightFt / 5) + 1 }, (_, i) => (
          <line
            key={`h-${i}`}
            x1={0}
            y1={i * 5 * CELL_SIZE}
            x2={gridWidth}
            y2={i * 5 * CELL_SIZE}
            stroke="#e5e7eb"
            strokeWidth={0.5}
          />
        ))}

        {/* Elements */}
        {elements.map((el) => {
          const config = SHAPE_CONFIG[el.shapeType as ShapeType] ?? SHAPE_CONFIG.rectangle
          const x = el.x * CELL_SIZE
          const y = el.y * CELL_SIZE
          const w = el.width * CELL_SIZE
          const h = el.height * CELL_SIZE
          const isCircular = ['circle', 'keyhole', 'spiral', 'mandala'].includes(el.shapeType)
          const rotation = el.rotation ?? 0
          const cx = x + w / 2
          const cy = y + h / 2

          return (
            <g
              key={el.id}
              transform={rotation !== 0 ? `rotate(${rotation}, ${cx}, ${cy})` : undefined}
            >
              {isCircular ? (
                <ellipse
                  cx={cx}
                  cy={cy}
                  rx={w / 2}
                  ry={h / 2}
                  fill={config.color}
                  stroke={config.borderColor}
                  strokeWidth={1}
                  opacity={0.85}
                />
              ) : el.shapeType === 'hugelkultur' ? (
                <path
                  d={`M ${x} ${y + h} Q ${x + w * 0.25} ${y + h * 0.2}, ${cx} ${y} Q ${x + w * 0.75} ${y + h * 0.2}, ${x + w} ${y + h} Z`}
                  fill={config.color}
                  stroke={config.borderColor}
                  strokeWidth={1}
                  opacity={0.85}
                />
              ) : (
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  rx={el.shapeType === 'container' ? 6 : 2}
                  fill={config.color}
                  stroke={config.borderColor}
                  strokeWidth={1}
                  opacity={0.85}
                />
              )}
              {el.label && (
                <text
                  x={cx}
                  y={cy + (isCircular ? 0 : 4)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={Math.min(11, w / (el.label.length * 0.7))}
                  fill="#374151"
                  fontWeight="500"
                  pointerEvents="none"
                >
                  {el.label}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
