"use client";

import React from "react";

type Pest = {
  id: number;
  name: string;
  type: string;
  description: string | null;
  symptoms: string | null;
  organicTreatments: unknown;
  preventionTips: unknown;
  affectedPlants: unknown;
  beneficialPredators: unknown;
  activeMonths: unknown;
};

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function PestList({
  pests,
  plantNames,
}: {
  pests: Pest[];
  plantNames: string[];
}) {
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<"all" | "pest" | "disease">("all");
  const [selectedPlant, setSelectedPlant] = React.useState<string>("");
  const [expandedId, setExpandedId] = React.useState<number | null>(null);

  const filtered = pests.filter((p) => {
    if (typeFilter !== "all" && p.type !== typeFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedPlant) {
      const affected = p.affectedPlants as string[] | null;
      if (!affected || !affected.includes(selectedPlant)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search pests..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] rounded-lg border border-earth-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition placeholder:text-gray-400"
        />
        <div className="flex items-center gap-1">
          {(["all", "pest", "disease"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer ${
                typeFilter === t
                  ? t === "pest"
                    ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : t === "disease"
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-garden-50 text-garden-700 dark:bg-garden-900/30 dark:text-garden-400"
                  : "text-gray-500 hover:bg-earth-50 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}{t === "all" ? "" : "s"}
            </button>
          ))}
        </div>
        {plantNames.length > 0 && (
          <select
            value={selectedPlant}
            onChange={(e) => setSelectedPlant(e.target.value)}
            className="rounded-lg border border-earth-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition"
          >
            <option value="">All plants</option>
            {plantNames.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        )}
      </div>

      <p className="text-xs text-gray-400">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</p>

      {/* Pest cards */}
      <div className="space-y-3">
        {filtered.map((pest) => {
          const isExpanded = expandedId === pest.id;
          const treatments = pest.organicTreatments as string[] | null;
          const prevention = pest.preventionTips as string[] | null;
          const affected = pest.affectedPlants as string[] | null;
          const predators = pest.beneficialPredators as string[] | null;
          const months = pest.activeMonths as number[] | null;

          return (
            <div
              key={pest.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-earth-200 dark:border-gray-700 shadow-sm overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : pest.id)}
                className="w-full flex items-center gap-3 p-4 text-left cursor-pointer hover:bg-earth-50 dark:hover:bg-gray-700/50 transition"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  pest.type === "pest"
                    ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                }`}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {pest.type === "pest" ? (
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    ) : (
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    )}
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{pest.name}</p>
                  {pest.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{pest.description}</p>
                  )}
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  pest.type === "pest"
                    ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                }`}>
                  {pest.type}
                </span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-earth-100 dark:border-gray-700 pt-3">
                  {pest.symptoms && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Symptoms</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{pest.symptoms}</p>
                    </div>
                  )}

                  {treatments && treatments.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-1">Organic Treatments</h4>
                      <ul className="space-y-1">
                        {treatments.map((t, i) => (
                          <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-1.5">
                            <span className="text-green-500 mt-1 shrink-0">&#8226;</span>
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {prevention && prevention.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">Prevention</h4>
                      <ul className="space-y-1">
                        {prevention.map((t, i) => (
                          <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-1.5">
                            <span className="text-blue-500 mt-1 shrink-0">&#8226;</span>
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {predators && predators.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-1">Beneficial Predators</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {predators.map((p, i) => (
                          <span key={i} className="text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {affected && affected.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Affected Plants</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {affected.map((a, i) => (
                          <span key={i} className="text-xs bg-earth-100 dark:bg-gray-700 text-earth-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {months && months.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Active Months</h4>
                      <div className="flex gap-1">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                          <span
                            key={m}
                            className={`text-[10px] w-7 text-center py-0.5 rounded ${
                              months.includes(m)
                                ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 font-medium"
                                : "bg-gray-50 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                            }`}
                          >
                            {MONTH_NAMES[m - 1]}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-gray-400">No pests or diseases match your filters.</p>
        </div>
      )}
    </div>
  );
}
