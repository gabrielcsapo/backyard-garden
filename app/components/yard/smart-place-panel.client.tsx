"use client";

import React from "react";
import { PlantIcon } from "../../lib/plant-icons";
import type { PlantInfo } from "../../lib/yard-types.ts";
import type { BedScore } from "../../lib/companion-scoring.ts";

export function SmartPlacePanel({
  allPlants,
  bedScores,
  smartPlacePlant,
  onSelectPlant,
  onSelectBed,
  onClose,
}: {
  allPlants: PlantInfo[];
  bedScores: BedScore[];
  smartPlacePlant: PlantInfo | null;
  onSelectPlant: (plant: PlantInfo) => void;
  onSelectBed: (bedId: number) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = React.useState(smartPlacePlant?.name ?? "");

  return (
    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl border border-earth-200 dark:border-gray-700 shadow-lg w-72 p-4 space-y-3 max-h-[calc(100vh-240px)] overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          Smart Place
        </h3>
        <button
          type="button"
          className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
          onClick={onClose}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search for a plant..."
        className="w-full px-2.5 py-1.5 text-xs border border-earth-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-garden-500"
        autoFocus
      />
      {search && !smartPlacePlant && (
        <div className="max-h-32 overflow-y-auto space-y-0.5">
          {allPlants
            .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
            .slice(0, 10)
            .map((p) => (
              <button
                key={p.id}
                type="button"
                className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-garden-50 dark:hover:bg-garden-900/30 text-xs font-medium text-gray-900 dark:text-gray-100 cursor-pointer flex items-center gap-1.5"
                onClick={() => {
                  onSelectPlant(p);
                  setSearch(p.name);
                }}
              >
                <PlantIcon name={p.name} size={16} className="text-garden-600 dark:text-garden-400 shrink-0" />
                <span>
                  {p.name}
                  {p.variety ? ` (${p.variety})` : ""}
                </span>
              </button>
            ))}
        </div>
      )}
      {smartPlacePlant && bedScores.length > 0 && (
        <div className="space-y-1.5">
          <p className="inline-flex items-center gap-1 text-[10px] text-gray-400">
            <PlantIcon name={smartPlacePlant.name} size={14} className="text-garden-600 dark:text-garden-400" />
            Best beds for {smartPlacePlant.name}:
          </p>
          {bedScores
            .filter((s) => s.capacityRemaining > 0)
            .slice(0, 5)
            .map((score) => (
              <div
                key={score.bedId}
                className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-earth-50 dark:bg-gray-700/50 text-xs cursor-pointer hover:bg-earth-100 dark:hover:bg-gray-700"
                onClick={() => onSelectBed(score.bedId)}
              >
                <div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {score.bedLabel || `Bed #${score.bedId}`}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    {score.companionCount > 0 && (
                      <span className="text-[10px] text-green-600">{score.companionCount} companions</span>
                    )}
                    {score.conflictCount > 0 && (
                      <span className="text-[10px] text-red-600">{score.conflictCount} conflicts</span>
                    )}
                    {score.sunMatch && <span className="text-[10px] text-gray-400">sun ok</span>}
                  </div>
                </div>
                <span className={`text-xs font-semibold ${score.score >= 3 ? "text-green-600" : score.score >= 0 ? "text-amber-600" : "text-red-600"}`}>
                  {score.score >= 0 ? "+" : ""}{score.score}
                </span>
              </div>
            ))}
          {bedScores.filter((s) => s.capacityRemaining > 0).length === 0 && (
            <p className="text-[10px] text-gray-400 text-center py-2">All beds are full</p>
          )}
        </div>
      )}
    </div>
  );
}

export function SmartPlaceButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="flex items-center gap-2 rounded-lg border border-garden-200 dark:border-garden-800 bg-garden-50/90 dark:bg-garden-900/50 backdrop-blur-sm shadow-sm px-3 py-2 text-sm font-medium text-garden-700 dark:text-garden-400 hover:bg-garden-100 dark:hover:bg-garden-900/70 transition cursor-pointer"
      onClick={onClick}
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4" />
        <circle cx="12" cy="12" r="10" />
      </svg>
      Smart Place
    </button>
  );
}
