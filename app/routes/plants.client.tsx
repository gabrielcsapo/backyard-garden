"use client";

import React from "react";
import { PlantIcon } from "../lib/plant-icons";

type Plant = {
  id: number;
  name: string;
  variety: string | null;
  description: string | null;
  category: string | null;
  zoneMin: string | null;
  zoneMax: string | null;
  sunRequirement: string | null;
  daysToHarvest: number | null;
  spacingInches: number | null;
  indoorStartWeeksBeforeFrost: number | null;
  directSowWeeksBeforeFrost: number | null;
  transplantWeeksAfterFrost: number | null;
  companions: string[] | null;
  incompatible: string[] | null;
};

const CATEGORY_STYLES: Record<string, string> = {
  vegetable: "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/30 dark:text-green-400 dark:ring-green-500/30",
  fruit: "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-900/30 dark:text-rose-400 dark:ring-rose-500/30",
  herb: "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-900/30 dark:text-violet-400 dark:ring-violet-500/30",
  legume: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-500/30",
  root: "bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-900/30 dark:text-orange-400 dark:ring-orange-500/30",
  leafy_green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-500/30",
  allium: "bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-900/30 dark:text-purple-400 dark:ring-purple-500/30",
  brassica: "bg-teal-50 text-teal-700 ring-teal-600/20 dark:bg-teal-900/30 dark:text-teal-400 dark:ring-teal-500/30",
  flower: "bg-pink-50 text-pink-700 ring-pink-600/20 dark:bg-pink-900/30 dark:text-pink-400 dark:ring-pink-500/30",
};

const CATEGORY_LABELS: Record<string, string> = {
  leafy_green: "Leafy Green",
  allium: "Allium",
  brassica: "Brassica",
  vegetable: "Vegetable",
  fruit: "Fruit",
  herb: "Herb",
  legume: "Legume",
  root: "Root",
  flower: "Flower",
};

const SUN_CONFIG: Record<string, { icon: string; label: string }> = {
  full_sun: { icon: "\u2600\uFE0F", label: "Full Sun" },
  partial_shade: { icon: "\u26C5", label: "Partial Shade" },
  full_shade: { icon: "\uD83C\uDF25\uFE0F", label: "Full Shade" },
};

export function PlantSearch({
  plants,
  lastFrostDate,
}: {
  plants: Plant[];
  lastFrostDate: string | null;
}) {
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("");
  const [sunFilter, setSunFilter] = React.useState("");
  const [page, setPage] = React.useState(1);
  const perPage = 12;

  const categories = React.useMemo(() => {
    const cats = new Set<string>();
    for (const p of plants) {
      if (p.category) cats.add(p.category);
    }
    return Array.from(cats).sort();
  }, [plants]);

  const sunOptions = React.useMemo(() => {
    const opts = new Set<string>();
    for (const p of plants) {
      if (p.sunRequirement) opts.add(p.sunRequirement);
    }
    return Array.from(opts).sort();
  }, [plants]);

  const filtered = React.useMemo(() => {
    return plants.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.variety && p.variety.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = !categoryFilter || p.category === categoryFilter;
      const matchesSun = !sunFilter || p.sunRequirement === sunFilter;
      return matchesSearch && matchesCategory && matchesSun;
    });
  }, [plants, search, categoryFilter, sunFilter]);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, sunFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-earth-200 dark:border-gray-700 shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <input
              className="w-full rounded-lg border border-earth-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition placeholder:text-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-400"
              type="text"
              placeholder="Search plants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="rounded-lg border border-earth-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat] ?? cat}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-earth-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            value={sunFilter}
            onChange={(e) => setSunFilter(e.target.value)}
          >
            <option value="">All sun levels</option>
            {sunOptions.map((opt) => (
              <option key={opt} value={opt}>
                {SUN_CONFIG[opt]?.label ?? opt}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Showing {(page - 1) * perPage + 1}&ndash;{Math.min(page * perPage, filtered.length)} of{" "}
          {filtered.length} plants
          {filtered.length < plants.length && ` (filtered from ${plants.length})`}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {paginated.map((plant) => (
          <PlantCard key={plant.id} plant={plant} lastFrostDate={lastFrostDate} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400 dark:text-gray-500 text-sm">No plants match your filters.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-8">
          <button
            className="px-3 py-1.5 text-sm rounded-lg border border-earth-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-earth-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`px-3 py-1.5 text-sm rounded-lg border transition ${
                p === page
                  ? "border-garden-600 bg-garden-50 text-garden-700 font-medium dark:bg-garden-900/30 dark:text-garden-400 dark:border-garden-500"
                  : "border-earth-200 text-gray-600 hover:bg-earth-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            className="px-3 py-1.5 text-sm rounded-lg border border-earth-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-earth-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function PlantCard({ plant, lastFrostDate }: { plant: Plant; lastFrostDate: string | null }) {
  const sun = plant.sunRequirement ? SUN_CONFIG[plant.sunRequirement] : null;
  const catStyle = plant.category
    ? (CATEGORY_STYLES[plant.category] ?? "bg-gray-50 text-gray-700 ring-gray-600/20")
    : null;
  const catLabel = plant.category ? (CATEGORY_LABELS[plant.category] ?? plant.category) : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-earth-200 dark:border-gray-700 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <PlantIcon name={plant.name} size={28} className="text-garden-600 dark:text-garden-400 shrink-0" />
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{plant.name}</h3>
            {plant.variety && <p className="text-xs text-gray-500 dark:text-gray-400">{plant.variety}</p>}
          </div>
        </div>
        {catLabel && (
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap ${catStyle}`}
          >
            {catLabel}
          </span>
        )}
      </div>

      {plant.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">{plant.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
        {sun && (
          <span>
            {sun.icon} {sun.label}
          </span>
        )}
        {plant.daysToHarvest != null && <span>{plant.daysToHarvest}d to harvest</span>}
        {plant.spacingInches != null && <span>{plant.spacingInches}" spacing</span>}
      </div>

      {plant.zoneMin && plant.zoneMax && (
        <p className="text-xs text-gray-400">
          Zones {plant.zoneMin} &ndash; {plant.zoneMax}
        </p>
      )}

      <PlantingCalendarBar plant={plant} lastFrostDate={lastFrostDate} />

      {plant.companions && plant.companions.length > 0 && (
        <div>
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">
            Companions
          </p>
          <div className="flex flex-wrap gap-1">
            {plant.companions.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1 text-[11px] bg-green-50 text-green-700 rounded-md px-1.5 py-0.5 dark:bg-green-900/30 dark:text-green-400"
              >
                <PlantIcon name={c} size={12} className="text-green-600 dark:text-green-400" />
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {plant.incompatible && plant.incompatible.length > 0 && (
        <div>
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">
            Avoid near
          </p>
          <div className="flex flex-wrap gap-1">
            {plant.incompatible.map((c) => (
              <span key={c} className="inline-flex items-center gap-1 text-[11px] bg-red-50 text-red-600 rounded-md px-1.5 py-0.5 dark:bg-red-900/30 dark:text-red-400">
                <PlantIcon name={c} size={12} className="text-red-500 dark:text-red-400" />
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function weeksToYearPercent(frostDate: Date, weeks: number): number {
  const target = new Date(frostDate);
  target.setDate(target.getDate() + weeks * 7);
  const startOfYear = new Date(target.getFullYear(), 0, 1);
  const diffMs = target.getTime() - startOfYear.getTime();
  const dayOfYear = diffMs / (1000 * 60 * 60 * 24);
  return (dayOfYear / 365) * 100;
}

function PlantingCalendarBar({
  plant,
  lastFrostDate,
}: {
  plant: Plant;
  lastFrostDate: string | null;
}) {
  if (!lastFrostDate) {
    return (
      <p className="text-xs text-gray-400 italic">
        Set frost dates in settings to see planting calendar.
      </p>
    );
  }

  const frost = new Date(lastFrostDate);
  const segments: {
    label: string;
    color: string;
    left: number;
    width: number;
  }[] = [];

  if (plant.indoorStartWeeksBeforeFrost != null) {
    const startPct = weeksToYearPercent(frost, -plant.indoorStartWeeksBeforeFrost);
    const endWeeks = plant.transplantWeeksAfterFrost ?? 0;
    const endPct = weeksToYearPercent(frost, endWeeks);
    const left = Math.max(0, Math.min(100, startPct));
    const right = Math.max(0, Math.min(100, endPct));
    if (right > left) {
      segments.push({ label: "Indoor", color: "bg-blue-400", left, width: right - left });
    }
  }

  if (plant.directSowWeeksBeforeFrost != null) {
    const startPct = weeksToYearPercent(frost, -plant.directSowWeeksBeforeFrost);
    const endPct = weeksToYearPercent(frost, -plant.directSowWeeksBeforeFrost + 4);
    const left = Math.max(0, Math.min(100, startPct));
    const right = Math.max(0, Math.min(100, endPct));
    if (right > left) {
      segments.push({ label: "Direct Sow", color: "bg-emerald-500", left, width: right - left });
    }
  }

  if (plant.transplantWeeksAfterFrost != null) {
    const startPct = weeksToYearPercent(frost, plant.transplantWeeksAfterFrost);
    const endPct = weeksToYearPercent(frost, plant.transplantWeeksAfterFrost + 3);
    const left = Math.max(0, Math.min(100, startPct));
    const right = Math.max(0, Math.min(100, endPct));
    if (right > left) {
      segments.push({ label: "Transplant", color: "bg-orange-400", left, width: right - left });
    }
  }

  if (plant.daysToHarvest != null) {
    let base: number | null = null;
    if (plant.transplantWeeksAfterFrost != null) base = plant.transplantWeeksAfterFrost;
    else if (plant.directSowWeeksBeforeFrost != null) base = -plant.directSowWeeksBeforeFrost;
    if (base != null) {
      const harvestWeeks = base + plant.daysToHarvest / 7;
      const startPct = weeksToYearPercent(frost, harvestWeeks);
      const endPct = weeksToYearPercent(frost, harvestWeeks + 4);
      const left = Math.max(0, Math.min(100, startPct));
      const right = Math.max(0, Math.min(100, endPct));
      if (right > left) {
        segments.push({ label: "Harvest", color: "bg-amber-500", left, width: right - left });
      }
    }
  }

  return (
    <div>
      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">
        Planting Calendar
      </p>
      <div className="relative h-5 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={`absolute top-0 h-full ${seg.color} opacity-80 rounded-sm`}
            style={{ left: `${seg.left}%`, width: `${seg.width}%` }}
            title={seg.label}
          />
        ))}
        {MONTHS.map((_, i) => (
          <div
            key={i}
            className="absolute top-0 h-full border-l border-gray-200 dark:border-gray-600"
            style={{ left: `${(i / 12) * 100}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-0.5">
        {MONTHS.map((m) => (
          <span key={m} className="text-[9px] text-gray-400">
            {m}
          </span>
        ))}
      </div>
      {segments.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
          {segments.map((seg) => (
            <span key={seg.label} className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
              <span className={`inline-block w-2 h-2 rounded-sm ${seg.color}`} />
              {seg.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
