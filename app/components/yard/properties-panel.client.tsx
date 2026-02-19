"use client";

import { SHAPE_CONFIG } from "../../lib/shapes.ts";
import type { ShapeType } from "../../lib/shapes.ts";
import type { YardElement } from "../../lib/yard-types.ts";

const inputClass =
  "w-full rounded-lg border border-earth-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-2.5 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition";

export function PropertiesPanel({
  element,
  onUpdate,
  onDelete,
  onClose,
}: {
  element: YardElement;
  onUpdate: (updates: Record<string, string>) => void;
  onDelete: () => void;
  onClose?: () => void;
}) {
  const config =
    SHAPE_CONFIG[element.shapeType as ShapeType] ?? SHAPE_CONFIG.rectangle;

  return (
    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl border border-earth-200 dark:border-gray-700 shadow-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-sm"
            style={{
              backgroundColor: config.color,
              border: `1px solid ${config.borderColor}`,
            }}
          />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {config.label}
          </h3>
        </div>
        {onClose && (
          <button
            type="button"
            className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
            onClick={onClose}
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
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          Label
        </label>
        <input
          className={inputClass}
          type="text"
          defaultValue={element.label ?? ""}
          onBlur={(e) => onUpdate({ label: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          Sun Exposure
        </label>
        <select
          className={inputClass}
          defaultValue={element.sunExposure ?? "full_sun"}
          onChange={(e) => onUpdate({ sunExposure: e.target.value })}
        >
          <option value="full_sun">Full Sun</option>
          <option value="partial_shade">Partial Shade</option>
          <option value="full_shade">Full Shade</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          Rotation
        </label>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex-1 px-2 py-1.5 text-xs font-medium rounded-lg border border-earth-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition cursor-pointer"
            onClick={() =>
              onUpdate({
                rotation: String(((element.rotation ?? 0) - 45 + 360) % 360),
              })
            }
            title="Rotate 45° left"
          >
            <svg
              className="w-3.5 h-3.5 mx-auto text-gray-600 dark:text-gray-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2.5 2v6h6" />
              <path d="M2.51 8A10 10 0 0 1 21 12" />
            </svg>
          </button>
          <span className="flex-1 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
            {element.rotation ?? 0}°
          </span>
          <button
            type="button"
            className="flex-1 px-2 py-1.5 text-xs font-medium rounded-lg border border-earth-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition cursor-pointer"
            onClick={() =>
              onUpdate({
                rotation: String(((element.rotation ?? 0) + 45) % 360),
              })
            }
            title="Rotate 45° right"
          >
            <svg
              className="w-3.5 h-3.5 mx-auto text-gray-600 dark:text-gray-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.5 2v6h-6" />
              <path d="M21.49 8A10 10 0 0 0 3 12" />
            </svg>
          </button>
        </div>
        <div className="flex gap-1 mt-1.5">
          {[0, 90, 180, 270].map((deg) => (
            <button
              key={deg}
              type="button"
              className={`flex-1 px-1 py-1 text-xs rounded-md border transition cursor-pointer ${
                (element.rotation ?? 0) === deg
                  ? "border-garden-500 bg-garden-50 text-garden-700 font-medium dark:bg-garden-900/30 dark:text-garden-400"
                  : "border-earth-200 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
              }`}
              onClick={() => onUpdate({ rotation: String(deg) })}
            >
              {deg}°
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Width (ft)
          </label>
          <input
            className={inputClass}
            type="number"
            min="1"
            defaultValue={element.width}
            onBlur={(e) => onUpdate({ width: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Height (ft)
          </label>
          <input
            className={inputClass}
            type="number"
            min="1"
            defaultValue={element.height}
            onBlur={(e) => onUpdate({ height: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            X (ft)
          </label>
          <input
            className={inputClass}
            type="number"
            min="0"
            defaultValue={element.x}
            onBlur={(e) => onUpdate({ x: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Y (ft)
          </label>
          <input
            className={inputClass}
            type="number"
            min="0"
            defaultValue={element.y}
            onBlur={(e) => onUpdate({ y: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          Season Extension
        </label>
        <select
          className={inputClass}
          defaultValue={(element as any).seasonExtension ?? "none"}
          onChange={(e) => onUpdate({ seasonExtension: e.target.value })}
        >
          <option value="none">None</option>
          <option value="cold_frame">Cold Frame</option>
          <option value="row_cover">Row Cover</option>
          <option value="hoop_house">Hoop House</option>
          <option value="greenhouse">Greenhouse</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          Irrigation
        </label>
        <select
          className={inputClass}
          defaultValue={(element as any).irrigationType ?? "none"}
          onChange={(e) => onUpdate({ irrigationType: e.target.value })}
        >
          <option value="none">None</option>
          <option value="drip">Drip</option>
          <option value="sprinkler">Sprinkler</option>
          <option value="soaker_hose">Soaker Hose</option>
          <option value="hand">Hand Watering</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="mulched-checkbox"
          className="rounded border-earth-200 dark:border-gray-600 text-garden-600 focus:ring-garden-500 cursor-pointer"
          defaultChecked={(element as any).mulched === 1}
          onChange={(e) => onUpdate({ mulched: e.target.checked ? "1" : "0" })}
        />
        <label htmlFor="mulched-checkbox" className="text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer">
          Mulched
        </label>
      </div>

      <div className="text-xs text-gray-400 space-y-1">
        <p>
          Position: ({element.x}, {element.y})
        </p>
        <p>
          Size: {element.width} x {element.height} ft
        </p>
        <p>Area: ~{Math.round(element.width * element.height)} sq ft</p>
      </div>

      <button
        className="w-full rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition cursor-pointer"
        onClick={onDelete}
      >
        Delete Element
      </button>
    </div>
  );
}
