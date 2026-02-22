"use client";

import React from "react";
import { SHAPE_CONFIG } from "../lib/shapes.ts";
import type { ShapeType } from "../lib/shapes.ts";
import { useToast } from "../components/toast.client";
import { useTheme } from "../components/theme-provider.client";

type PreviewElement = {
  id: number;
  shapeType: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string | null;
  rotation: number | null;
};

const CELL_SIZE = 28;

export function YardPreview({
  widthFt,
  heightFt,
  elements,
}: {
  widthFt: number;
  heightFt: number;
  elements: PreviewElement[];
}) {
  const { isDark } = useTheme();

  const gridWidth = widthFt * CELL_SIZE;
  const gridHeight = heightFt * CELL_SIZE;

  const bgColor = isDark ? "#1f2937" : "#f9fafb";
  const gridColor = isDark ? "#374151" : "#e5e7eb";
  const labelColor = isDark ? "#d1d5db" : "#374151";

  return (
    <div className="flex justify-center items-center h-40">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${gridWidth} ${gridHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <rect width={gridWidth} height={gridHeight} fill={bgColor} />

        {/* Light grid */}
        {Array.from({ length: Math.floor(widthFt / 5) + 1 }, (_, i) => (
          <line
            key={`v-${i}`}
            x1={i * 5 * CELL_SIZE}
            y1={0}
            x2={i * 5 * CELL_SIZE}
            y2={gridHeight}
            stroke={gridColor}
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
            stroke={gridColor}
            strokeWidth={0.5}
          />
        ))}

        {/* Elements */}
        {elements.map((el) => {
          const config = SHAPE_CONFIG[el.shapeType as ShapeType] ?? SHAPE_CONFIG.rectangle;
          const x = el.x * CELL_SIZE;
          const y = el.y * CELL_SIZE;
          const w = el.width * CELL_SIZE;
          const h = el.height * CELL_SIZE;
          const isCircular = ["circle", "keyhole", "spiral", "mandala"].includes(el.shapeType);
          const rotation = el.rotation ?? 0;
          const cx = x + w / 2;
          const cy = y + h / 2;

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
              ) : el.shapeType === "hugelkultur" ? (
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
                  rx={el.shapeType === "container" ? 6 : 2}
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
                  fill={labelColor}
                  fontWeight="500"
                  pointerEvents="none"
                >
                  {el.label}
                </text>
              )}
              <title>{el.label ?? el.shapeType}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

const ACTION_TYPE_MAP: Record<string, string> = {
  indoor_start: "stage_change",
  direct_sow: "stage_change",
  transplant: "stage_change",
  harvest: "harvest",
};

export function TaskCheckbox({
  plantingId,
  actionType,
  logAction,
}: {
  plantingId: number;
  actionType: string;
  logAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}) {
  const [done, setDone] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const { addToast } = useToast();

  const handleToggle = async () => {
    if (done || loading) return;
    setLoading(true);
    const formData = new FormData();
    formData.set("plantingId", String(plantingId));
    formData.set("type", ACTION_TYPE_MAP[actionType] ?? "observation");
    formData.set("date", new Date().toISOString().split("T")[0]);
    formData.set("content", `Completed: ${actionType.replace("_", " ")}`);
    const result = await logAction(formData);
    setLoading(false);
    if (result.success) {
      setDone(true);
      addToast("Task logged!", "success");
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={done || loading}
      className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
        done
          ? "bg-garden-500 border-garden-500 text-white"
          : loading
            ? "border-garden-300 bg-garden-50 dark:bg-garden-900/30 dark:border-garden-600"
            : "border-gray-300 dark:border-gray-600 hover:border-garden-400"
      }`}
    >
      {done && (
        <svg
          className="w-3 h-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      )}
    </button>
  );
}
