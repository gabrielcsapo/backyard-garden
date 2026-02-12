"use client";

import React from "react";
import { getShapeArea } from "../../lib/shapes.ts";
import { checkCompanionConflicts } from "../../lib/companions.ts";
import { useToast } from "../toast.client";
import { PlantIcon } from "../../lib/plant-icons/index.tsx";
import type { YardElement, PlantInfo, Planting } from "../../lib/yard-types.ts";

const STATUS_ORDER = [
  "planned",
  "seeded",
  "sprouted",
  "transplanted",
  "growing",
  "harvesting",
  "done",
];

const STATUS_LABELS: Record<string, string> = {
  planned: "Planned",
  seeded: "Seeded",
  sprouted: "Sprouted",
  transplanted: "Transplanted",
  growing: "Growing",
  harvesting: "Harvesting",
  done: "Done",
};

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> =
  {
    planned: { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-400" },
    seeded: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
    sprouted: { bg: "bg-lime-50", text: "text-lime-700", dot: "bg-lime-400" },
    transplanted: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-400",
    },
    growing: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
    harvesting: {
      bg: "bg-orange-50",
      text: "text-orange-700",
      dot: "bg-orange-400",
    },
    done: { bg: "bg-earth-100", text: "text-earth-600", dot: "bg-earth-400" },
  };

export function BedPlantingsPanel({
  element,
  plants,
  plantings,
  onAddPlanting,
  onUpdatePlanting,
  onDeletePlanting,
}: {
  element: YardElement;
  plants: PlantInfo[];
  plantings: Planting[];
  onAddPlanting: (plantId: number, quantity: number) => Promise<void>;
  onUpdatePlanting: (
    plantingId: number,
    updates: { status?: string; quantity?: number; notes?: string },
  ) => Promise<void>;
  onDeletePlanting: (plantingId: number) => Promise<void>;
}) {
  const [search, setSearch] = React.useState("");
  const [adding, setAdding] = React.useState(false);
  const [editingPlanting, setEditingPlanting] = React.useState<Planting | null>(
    null,
  );
  const { addToast } = useToast();

  const bedArea = getShapeArea(
    element.shapeType,
    element.width,
    element.height,
  );
  const bedAreaSqIn = bedArea * 144;

  const usedSqIn = plantings.reduce((sum, p) => {
    const plant = plants.find((pl) => pl.id === p.plantId);
    const spacing = plant?.spacingInches ?? 12;
    return sum + (p.quantity ?? 1) * spacing * spacing;
  }, 0);
  const capacityPercent =
    bedAreaSqIn > 0
      ? Math.min(100, Math.round((usedSqIn / bedAreaSqIn) * 100))
      : 0;

  function maxFit(spacingInches: number) {
    const remainingSqIn = bedAreaSqIn - usedSqIn;
    if (remainingSqIn <= 0) return 0;
    return Math.max(
      0,
      Math.floor(remainingSqIn / (spacingInches * spacingInches)),
    );
  }

  const filtered =
    search.length > 0
      ? plants.filter(
          (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.variety?.toLowerCase().includes(search.toLowerCase()) ?? false),
        )
      : [];

  return (
    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl border border-earth-200 dark:border-gray-700 shadow-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Plantings
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          ~{Math.round(bedArea)} sq ft
        </span>
      </div>

      {/* Capacity bar */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-500 dark:text-gray-400">Capacity</span>
          <span
            className="font-medium"
            style={{
              color:
                capacityPercent > 90
                  ? "#ef4444"
                  : capacityPercent > 70
                    ? "#f59e0b"
                    : "#22c55e",
            }}
          >
            {capacityPercent}%
          </span>
        </div>
        <div className="h-1.5 bg-earth-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${capacityPercent}%`,
              backgroundColor:
                capacityPercent > 90
                  ? "#ef4444"
                  : capacityPercent > 70
                    ? "#f59e0b"
                    : "#22c55e",
            }}
          />
        </div>
      </div>

      {/* Current plantings */}
      {plantings.length > 0 && (
        <div className="space-y-1.5">
          {plantings.map((p) => {
            const plant = plants.find((pl) => pl.id === p.plantId);
            const status = p.status ?? "planned";
            const colors = STATUS_COLORS[status] ?? STATUS_COLORS.planned;

            return (
              <button
                key={p.id}
                type="button"
                className="w-full flex items-center gap-2 px-2 py-1.5 bg-earth-50 dark:bg-gray-700/50 rounded-lg hover:bg-earth-100 dark:hover:bg-gray-700 transition-colors cursor-pointer text-left"
                onClick={() => setEditingPlanting(p)}
              >
                <PlantIcon name={plant?.name ?? ""} size={20} className="text-garden-600 dark:text-garden-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                      {plant?.name ?? "Unknown"}
                    </span>
                    <span className="text-xs text-gray-400">
                      x{p.quantity ?? 1}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${colors.bg} ${colors.text}`}
                  >
                    <span className={`w-1 h-1 rounded-full ${colors.dot}`} />
                    {STATUS_LABELS[status]}
                  </span>
                </div>
                <svg
                  className="w-3.5 h-3.5 text-gray-400 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            );
          })}
        </div>
      )}

      {/* Add plant */}
      {!adding ? (
        <button
          type="button"
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-garden-700 dark:text-garden-400 bg-garden-50 dark:bg-garden-900/30 hover:bg-garden-100 dark:hover:bg-garden-900/50 rounded-lg transition cursor-pointer"
          onClick={() => setAdding(true)}
        >
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Plant
        </button>
      ) : (
        <div>
          <div className="flex items-center gap-1 mb-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plants..."
              autoFocus
              className="flex-1 px-2.5 py-1.5 text-xs border border-earth-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
            />
            <button
              type="button"
              className="p-1.5 text-gray-400 hover:text-gray-600"
              onClick={() => {
                setAdding(false);
                setSearch("");
              }}
            >
              <svg
                className="w-3.5 h-3.5"
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
          </div>

          {search.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-0.5">
              {filtered.slice(0, 15).map((plant) => {
                const fits = maxFit(plant.spacingInches ?? 12);
                const suggested = Math.max(1, Math.min(fits, 10));

                return (
                  <button
                    key={plant.id}
                    type="button"
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-garden-50 dark:hover:bg-garden-900/30 transition-colors flex items-center justify-between gap-1"
                    onClick={async () => {
                      const existingPlantNames = plantings
                        .map(
                          (p) => plants.find((pl) => pl.id === p.plantId)?.name,
                        )
                        .filter(Boolean) as string[];
                      const conflicts = checkCompanionConflicts(
                        {
                          name: plant.name,
                          companions: plant.companions as string[] | null,
                          incompatible: plant.incompatible as string[] | null,
                        },
                        existingPlantNames.map((n) => {
                          const pl = plants.find((p) => p.name === n);
                          return {
                            name: n,
                            companions: (pl?.companions ?? null) as
                              | string[]
                              | null,
                            incompatible: (pl?.incompatible ?? null) as
                              | string[]
                              | null,
                          };
                        }),
                      );
                      if (conflicts.conflicts.length > 0) {
                        addToast(
                          `Warning: ${plant.name} conflicts with ${conflicts.conflicts.join(", ")}`,
                          "warning",
                        );
                      }
                      await onAddPlanting(plant.id, suggested);
                      setSearch("");
                      setAdding(false);
                    }}
                  >
                    <PlantIcon name={plant.name} size={18} className="text-garden-600 dark:text-garden-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate block">
                        {plant.name}
                        {plant.variety && (
                          <span className="font-normal text-gray-400">
                            {" "}
                            ({plant.variety})
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {plant.spacingInches}" spacing &middot;{" "}
                        {plant.daysToHarvest}d harvest
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-medium text-garden-700 dark:text-garden-400">
                        Fits {fits}
                      </span>
                    </div>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <p className="text-[10px] text-gray-400 text-center py-3">
                  No plants found
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {plantings.length === 0 && !adding && (
        <p className="text-[10px] text-gray-400 text-center">
          No plants in this bed yet
        </p>
      )}

      {/* Edit planting modal */}
      {editingPlanting && (
        <EditPlantingModal
          planting={editingPlanting}
          plant={plants.find((pl) => pl.id === editingPlanting.plantId) ?? null}
          onSave={async (updates) => {
            await onUpdatePlanting(editingPlanting.id, updates);
            setEditingPlanting(null);
          }}
          onDelete={async () => {
            await onDeletePlanting(editingPlanting.id);
            setEditingPlanting(null);
          }}
          onClose={() => setEditingPlanting(null)}
        />
      )}
    </div>
  );
}

function EditPlantingModal({
  planting,
  plant,
  onSave,
  onDelete,
  onClose,
}: {
  planting: Planting;
  plant: PlantInfo | null;
  onSave: (updates: {
    status?: string;
    quantity?: number;
    notes?: string;
  }) => Promise<void>;
  onDelete: () => Promise<void>;
  onClose: () => void;
}) {
  const [status, setStatus] = React.useState(planting.status ?? "planned");
  const [quantity, setQuantity] = React.useState(planting.quantity ?? 1);
  const [notes, setNotes] = React.useState(planting.notes ?? "");
  const [saving, setSaving] = React.useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-earth-200 dark:border-gray-700 w-80 max-w-[90vw] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlantIcon name={plant?.name ?? ""} size={24} className="text-garden-600 dark:text-garden-400 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {plant?.name ?? "Unknown Plant"}
              </h3>
              {plant?.variety && (
                <p className="text-xs text-gray-400">{plant.variety}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
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
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Status
          </label>
          <div className="flex flex-wrap gap-1">
            {STATUS_ORDER.map((s) => {
              const colors = STATUS_COLORS[s] ?? STATUS_COLORS.planned;
              const isActive = status === s;
              return (
                <button
                  key={s}
                  type="button"
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium transition cursor-pointer ${
                    isActive
                      ? `${colors.bg} ${colors.text} ring-1 ring-current`
                      : "bg-gray-50 dark:bg-gray-700 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                  onClick={() => setStatus(s)}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isActive ? colors.dot : "bg-gray-300"}`}
                  />
                  {STATUS_LABELS[s]}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Quantity
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="w-8 h-8 rounded-lg border border-earth-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 transition cursor-pointer flex items-center justify-center"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-16 text-center rounded-lg border border-earth-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1.5 text-sm focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition"
            />
            <button
              type="button"
              className="w-8 h-8 rounded-lg border border-earth-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 transition cursor-pointer flex items-center justify-center"
              onClick={() => setQuantity((q) => q + 1)}
            >
              +
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes..."
            rows={2}
            className="w-full rounded-lg border border-earth-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2.5 py-1.5 text-sm focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition resize-none"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            className="flex-1 rounded-lg bg-garden-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-garden-700 transition cursor-pointer disabled:opacity-50"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              await onSave({ status, quantity, notes: notes || undefined });
              setSaving(false);
            }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            className="rounded-lg border border-earth-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition cursor-pointer"
            title="Delete planting"
            onClick={async () => {
              setSaving(true);
              await onDelete();
            }}
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
              <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </button>
        </div>

        {plant && (
          <div className="text-[10px] text-gray-400 border-t border-earth-100 dark:border-gray-700 pt-2 space-y-0.5">
            {plant.spacingInches && (
              <p>Spacing: {plant.spacingInches}" apart</p>
            )}
            {plant.daysToHarvest && (
              <p>Days to harvest: {plant.daysToHarvest}</p>
            )}
            {planting.plantedDate && <p>Planted: {planting.plantedDate}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
