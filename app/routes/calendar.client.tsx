"use client";

import React from "react";
import { useToast } from "../components/toast.client";
import { PlantIcon } from "../lib/plant-icons";

type MoonPhaseData = {
  name: string;
  emoji: string;
  illumination: number;
  gardeningTip: string;
};

export function MoonPhaseCard({ moonPhase }: { moonPhase: MoonPhaseData }) {
  return (
    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-earth-200 dark:border-gray-700 text-sm">
      <span className="text-lg">{moonPhase.emoji}</span>
      <div>
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{moonPhase.name}</p>
        <p className="text-[10px] text-gray-400 max-w-[140px] truncate">{moonPhase.gardeningTip}</p>
      </div>
    </div>
  );
}

export function ExportButton({
  exportAction,
  label,
}: {
  exportAction: () => Promise<{ csv: string; filename: string }>;
  label: string;
}) {
  const [exporting, setExporting] = React.useState(false);
  const { addToast } = useToast();

  async function handleExport() {
    setExporting(true);
    try {
      const { csv, filename } = await exportAction();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      addToast("Export downloaded!", "success");
    } catch {
      addToast("Export failed.", "error");
    } finally {
      setExporting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={exporting}
      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-earth-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-earth-50 dark:hover:bg-gray-700 transition disabled:opacity-50 cursor-pointer"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {exporting ? "..." : label}
    </button>
  );
}

type CalendarPlanting = {
  id: number;
  plantId: number;
  status: string | null;
  plantedDate: string | null;
  yardElementId: number;
  quantity: number | null;
  plantName: string;
  plantVariety: string | null;
  category: string | null;
  indoorStartWeeks: number | null;
  directSowWeeks: number | null;
  transplantWeeks: number | null;
  daysToHarvest: number | null;
  bedLabel: string | null;
  bedShapeType: string | null;
};

type MarkDoneAction = (formData: FormData) => Promise<{ success: boolean; error?: string }>;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const CATEGORY_LABELS: Record<string, string> = {
  leafy_green: "Leafy Green",
  allium: "Allium",
  brassica: "Brassica",
  vegetable: "Vegetable",
  fruit: "Fruit",
  herb: "Herb",
  legume: "Legume",
  root: "Root",
};

const STATUS_LABELS: Record<string, string> = {
  planned: "Planned",
  seeded: "Seeded",
  sprouted: "Sprouted",
  transplanted: "Transplanted",
  growing: "Growing",
  harvesting: "Harvesting",
  done: "Done",
  removed: "Removed",
};

const STATUS_COLORS: Record<string, string> = {
  planned: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
  seeded: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  sprouted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  transplanted: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  growing: "bg-garden-100 text-garden-700 dark:bg-garden-900/30 dark:text-garden-400",
  harvesting: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

function dateToYearPercent(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diffMs = date.getTime() - startOfYear.getTime();
  const dayOfYear = diffMs / (1000 * 60 * 60 * 24);
  return (dayOfYear / 365) * 100;
}

function weeksFromFrost(frostDate: Date, weeks: number): Date {
  const d = new Date(frostDate);
  d.setDate(d.getDate() + weeks * 7);
  return d;
}

type WindowSegment = {
  label: string;
  color: string;
  left: number;
  width: number;
};

function getSegments(p: CalendarPlanting, frostDate: Date): WindowSegment[] {
  const segments: WindowSegment[] = [];

  if (p.indoorStartWeeks != null) {
    const start = dateToYearPercent(weeksFromFrost(frostDate, -p.indoorStartWeeks));
    const endWeeks = p.transplantWeeks ?? 0;
    const end = dateToYearPercent(weeksFromFrost(frostDate, endWeeks));
    const left = Math.max(0, Math.min(100, start));
    const right = Math.max(0, Math.min(100, end));
    if (right > left) {
      segments.push({ label: "Indoor", color: "bg-blue-400", left, width: right - left });
    }
  }

  if (p.directSowWeeks != null) {
    const start = dateToYearPercent(weeksFromFrost(frostDate, -p.directSowWeeks));
    const end = dateToYearPercent(weeksFromFrost(frostDate, -p.directSowWeeks + 4));
    const left = Math.max(0, Math.min(100, start));
    const right = Math.max(0, Math.min(100, end));
    if (right > left) {
      segments.push({ label: "Direct Sow", color: "bg-emerald-500", left, width: right - left });
    }
  }

  if (p.transplantWeeks != null) {
    const start = dateToYearPercent(weeksFromFrost(frostDate, p.transplantWeeks));
    const end = dateToYearPercent(weeksFromFrost(frostDate, p.transplantWeeks + 3));
    const left = Math.max(0, Math.min(100, start));
    const right = Math.max(0, Math.min(100, end));
    if (right > left) {
      segments.push({ label: "Transplant", color: "bg-orange-400", left, width: right - left });
    }
  }

  if (p.daysToHarvest != null) {
    let base: number | null = null;
    if (p.transplantWeeks != null) base = p.transplantWeeks;
    else if (p.directSowWeeks != null) base = -p.directSowWeeks;
    if (base != null) {
      const harvestWeeks = base + p.daysToHarvest / 7;
      const start = dateToYearPercent(weeksFromFrost(frostDate, harvestWeeks));
      const end = dateToYearPercent(weeksFromFrost(frostDate, harvestWeeks + 4));
      const left = Math.max(0, Math.min(100, start));
      const right = Math.max(0, Math.min(100, end));
      if (right > left) {
        segments.push({ label: "Harvest", color: "bg-amber-500", left, width: right - left });
      }
    }
  }

  return segments;
}

type ThisWeekTask = {
  plantingId: number;
  yardElementId: number;
  plantName: string;
  taskType: string;
  taskLabel: string;
  newStatus: string | null;
};

function getThisWeekTasks(plantings: CalendarPlanting[], frostDate: Date): ThisWeekTask[] {
  const now = new Date();
  const tasks: ThisWeekTask[] = [];

  for (const p of plantings) {
    if (p.indoorStartWeeks != null && p.status === "planned") {
      const start = weeksFromFrost(frostDate, -p.indoorStartWeeks);
      const end = weeksFromFrost(frostDate, -p.indoorStartWeeks + 2);
      if (now >= start && now <= end) {
        tasks.push({
          plantingId: p.id, yardElementId: p.yardElementId, plantName: p.plantName,
          taskType: "indoor_sow", taskLabel: `Start ${p.plantName} seeds indoors`, newStatus: "seeded",
        });
      }
    }

    if (p.directSowWeeks != null && p.status === "planned") {
      const start = weeksFromFrost(frostDate, -p.directSowWeeks);
      const end = weeksFromFrost(frostDate, -p.directSowWeeks + 2);
      if (now >= start && now <= end) {
        tasks.push({
          plantingId: p.id, yardElementId: p.yardElementId, plantName: p.plantName,
          taskType: "direct_sow", taskLabel: `Direct sow ${p.plantName}`, newStatus: "seeded",
        });
      }
    }

    if (p.transplantWeeks != null && (p.status === "seeded" || p.status === "sprouted")) {
      const start = weeksFromFrost(frostDate, p.transplantWeeks);
      const end = weeksFromFrost(frostDate, p.transplantWeeks + 2);
      if (now >= start && now <= end) {
        tasks.push({
          plantingId: p.id, yardElementId: p.yardElementId, plantName: p.plantName,
          taskType: "transplant", taskLabel: `Transplant ${p.plantName} outdoors`, newStatus: "transplanted",
        });
      }
    }

    if (p.daysToHarvest != null && p.plantedDate && (p.status === "growing" || p.status === "transplanted")) {
      const planted = new Date(p.plantedDate);
      const harvestDate = new Date(planted);
      harvestDate.setDate(harvestDate.getDate() + p.daysToHarvest);
      const harvestEnd = new Date(harvestDate);
      harvestEnd.setDate(harvestEnd.getDate() + 14);
      if (now >= harvestDate && now <= harvestEnd) {
        tasks.push({
          plantingId: p.id, yardElementId: p.yardElementId, plantName: p.plantName,
          taskType: "harvest", taskLabel: `Harvest ${p.plantName}`, newStatus: "harvesting",
        });
      }
    }
  }

  return tasks;
}

export function GanttCalendar({
  plantings,
  lastFrostDate,
  firstFrostDate,
  markDoneAction,
}: {
  plantings: CalendarPlanting[];
  lastFrostDate: string;
  firstFrostDate: string | null;
  markDoneAction: MarkDoneAction;
}) {
  const [categoryFilter, setCategoryFilter] = React.useState("");
  const [expandedId, setExpandedId] = React.useState<number | null>(null);
  const { addToast } = useToast();

  const frostDate = new Date(lastFrostDate);
  const todayPct = dateToYearPercent(new Date());
  const frostPct = dateToYearPercent(frostDate);
  const firstFrostPct = firstFrostDate ? dateToYearPercent(new Date(firstFrostDate)) : null;

  const categories = React.useMemo(() => {
    const cats = new Set<string>();
    for (const p of plantings) {
      if (p.category) cats.add(p.category);
    }
    return Array.from(cats).sort();
  }, [plantings]);

  const filtered = React.useMemo(() => {
    return plantings.filter((p) => {
      if (categoryFilter && p.category !== categoryFilter) return false;
      return true;
    });
  }, [plantings, categoryFilter]);

  const thisWeekTasks = React.useMemo(
    () => getThisWeekTasks(plantings, frostDate),
    [plantings, frostDate],
  );

  async function handleMarkDone(task: ThisWeekTask) {
    const fd = new FormData();
    fd.set("plantingId", String(task.plantingId));
    fd.set("yardElementId", String(task.yardElementId));
    fd.set("type", task.taskType);
    if (task.newStatus) fd.set("newStatus", task.newStatus);
    const result = await markDoneAction(fd);
    if (result.success) {
      addToast(`Done: ${task.taskLabel}`, "success");
    }
  }

  async function handleStatusChange(plantingId: number, yardElementId: number, newStatus: string) {
    const fd = new FormData();
    fd.set("plantingId", String(plantingId));
    fd.set("yardElementId", String(yardElementId));
    fd.set("type", "status_change");
    fd.set("newStatus", newStatus);
    const result = await markDoneAction(fd);
    if (result.success) {
      addToast(`Status updated to ${STATUS_LABELS[newStatus] ?? newStatus}`, "success");
    }
  }

  return (
    <div className="space-y-6">
      {/* This Week Tasks */}
      {thisWeekTasks.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-garden-200 dark:border-garden-800 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-garden-800 dark:text-garden-400 mb-3">This Week</h2>
          <div className="space-y-2">
            {thisWeekTasks.map((task, i) => (
              <div
                key={`${task.plantingId}-${task.taskType}-${i}`}
                className="flex items-center gap-3"
              >
                <button
                  className="w-5 h-5 rounded border-2 border-garden-300 hover:border-garden-500 hover:bg-garden-50 dark:hover:bg-garden-900/30 transition-colors shrink-0 cursor-pointer"
                  onClick={() => handleMarkDone(task)}
                  title="Mark as done"
                />
                <PlantIcon name={task.plantName} size={18} className="text-garden-600 dark:text-garden-400 shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{task.taskLabel}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-earth-200 dark:border-gray-700 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-center">
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
          <span className="text-xs text-gray-400">
            {filtered.length} planting{filtered.length !== 1 ? "s" : ""} &middot; Click a row for details
          </span>
        </div>
      </div>

      {/* Gantt Chart */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-earth-200 dark:border-gray-700 shadow-sm p-10 text-center">
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            No active plantings. Add plants to your beds in the Yard planner to see them here.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-earth-200 dark:border-gray-700 shadow-sm overflow-hidden">
          {/* Month headers */}
          <div className="flex border-b border-earth-100 dark:border-gray-700">
            <div className="w-48 shrink-0 px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-r border-earth-100 dark:border-gray-700">
              Plant
            </div>
            <div className="flex-1 relative">
              <div className="flex">
                {MONTHS.map((m) => (
                  <div
                    key={m}
                    className="flex-1 text-center text-[10px] text-gray-400 py-2 border-r border-earth-50 dark:border-gray-700"
                  >
                    {m}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rows */}
          {filtered.map((p) => {
            const segments = getSegments(p, frostDate);
            const statusStyle = STATUS_COLORS[p.status ?? ""] ?? "bg-gray-100 text-gray-600";
            const isExpanded = expandedId === p.id;
            return (
              <div key={p.id}>
                <div
                  className={`flex border-b border-earth-50 dark:border-gray-700 cursor-pointer transition-colors ${
                    isExpanded
                      ? "bg-garden-50/50 dark:bg-garden-900/10"
                      : "hover:bg-earth-50/50 dark:hover:bg-gray-700/50"
                  }`}
                  onClick={() => setExpandedId(isExpanded ? null : p.id)}
                >
                  <div className="w-48 shrink-0 px-4 py-2.5 border-r border-earth-100 dark:border-gray-700">
                    <div className="flex items-center gap-1.5">
                      <PlantIcon name={p.plantName} size={18} className="text-garden-600 dark:text-garden-400 shrink-0" />
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{p.plantName}</p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {p.bedLabel && (
                        <span className="text-[10px] text-gray-400 truncate">{p.bedLabel}</span>
                      )}
                      <span
                        className={`inline-flex items-center rounded px-1 py-0 text-[9px] font-medium ${statusStyle}`}
                      >
                        {p.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 relative py-1.5">
                    {/* Month grid lines */}
                    {MONTHS.map((_, i) => (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 border-r border-earth-50 dark:border-gray-700"
                        style={{ left: `${(i / 12) * 100}%` }}
                      />
                    ))}

                    {/* Frost zone shading */}
                    <div
                      className="absolute top-0 bottom-0 bg-blue-50/40 dark:bg-blue-900/10"
                      style={{ left: "0%", width: `${frostPct}%` }}
                      title="Before last frost"
                    />
                    {firstFrostPct && (
                      <div
                        className="absolute top-0 bottom-0 bg-blue-50/40 dark:bg-blue-900/10"
                        style={{ left: `${firstFrostPct}%`, width: `${100 - firstFrostPct}%` }}
                        title="After first frost"
                      />
                    )}

                    {/* Frost lines */}
                    <div
                      className="absolute top-0 bottom-0 border-l border-dashed border-blue-300"
                      style={{ left: `${frostPct}%` }}
                      title={`Last frost: ${lastFrostDate}`}
                    />
                    {firstFrostPct && (
                      <div
                        className="absolute top-0 bottom-0 border-l border-dashed border-blue-300"
                        style={{ left: `${firstFrostPct}%` }}
                        title={`First frost: ${firstFrostDate}`}
                      />
                    )}

                    {/* Today line */}
                    <div
                      className="absolute top-0 bottom-0 border-l-2 border-red-400 z-10"
                      style={{ left: `${todayPct}%` }}
                    />

                    {/* Segments */}
                    {segments.map((seg) => (
                      <div
                        key={seg.label}
                        className={`absolute top-1/2 -translate-y-1/2 h-4 ${seg.color} opacity-80 rounded-sm`}
                        style={{
                          left: `${seg.left}%`,
                          width: `${Math.max(seg.width, 0.5)}%`,
                        }}
                        title={seg.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Expanded detail row */}
                {isExpanded && (
                  <PlantingDetailRow
                    planting={p}
                    onStatusChange={(newStatus) => handleStatusChange(p.id, p.yardElementId, newStatus)}
                  />
                )}
              </div>
            );
          })}

          {/* Legend */}
          <div className="px-4 py-3 bg-earth-50/50 dark:bg-gray-700/50 border-t border-earth-100 dark:border-gray-700">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                <span className="inline-block w-2 h-2 rounded-sm bg-blue-400" />
                Indoor Start
              </span>
              <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                <span className="inline-block w-2 h-2 rounded-sm bg-emerald-500" />
                Direct Sow
              </span>
              <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                <span className="inline-block w-2 h-2 rounded-sm bg-orange-400" />
                Transplant
              </span>
              <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                <span className="inline-block w-2 h-2 rounded-sm bg-amber-500" />
                Harvest
              </span>
              <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                <span className="inline-block w-0.5 h-3 border-l-2 border-red-400" />
                Today
              </span>
              <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                <span className="inline-block w-0.5 h-3 border-l border-dashed border-blue-300" />
                Frost dates
              </span>
              <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                <span className="inline-block w-3 h-2 bg-blue-50/60 border border-blue-200/50 rounded-sm" />
                Frost risk zone
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Planting Detail Row ---

function PlantingDetailRow({
  planting,
  onStatusChange,
}: {
  planting: CalendarPlanting;
  onStatusChange: (newStatus: string) => Promise<void>;
}) {
  const [changing, setChanging] = React.useState(false);
  const statusOrder = ["planned", "seeded", "sprouted", "transplanted", "growing", "harvesting", "done"];

  async function handleChange(newStatus: string) {
    setChanging(true);
    await onStatusChange(newStatus);
    setChanging(false);
  }

  return (
    <div className="border-b border-earth-100 dark:border-gray-700 bg-earth-50/30 dark:bg-gray-800/50 px-4 py-3 animate-[slideUp_0.1s_ease-out]">
      <div className="flex flex-wrap items-start gap-4">
        {/* Info */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <PlantIcon name={planting.plantName} size={20} className="text-garden-600 dark:text-garden-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{planting.plantName}</span>
            {planting.plantVariety && (
              <span className="text-xs text-gray-400">({planting.plantVariety})</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            {planting.bedLabel && <span>Bed: {planting.bedLabel}</span>}
            {planting.quantity && <span>Qty: {planting.quantity}</span>}
            {planting.plantedDate && <span>Planted: {planting.plantedDate}</span>}
            {planting.daysToHarvest && <span>{planting.daysToHarvest}d to harvest</span>}
          </div>
        </div>

        {/* Status quick actions */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-400 mr-1">Status:</span>
          <div className="flex flex-wrap gap-1">
            {statusOrder.map((s) => {
              const isCurrent = planting.status === s;
              const style = STATUS_COLORS[s] ?? "bg-gray-100 text-gray-600";
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => !isCurrent && handleChange(s)}
                  disabled={isCurrent || changing}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all cursor-pointer ${
                    isCurrent
                      ? `${style} ring-2 ring-current/30`
                      : `${style} opacity-40 hover:opacity-100`
                  } ${changing ? "opacity-30" : ""}`}
                >
                  {STATUS_LABELS[s] ?? s}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
