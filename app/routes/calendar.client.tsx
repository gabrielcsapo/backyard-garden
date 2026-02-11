"use client";

import React from "react";
import { useToast } from "../components/toast.client";

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
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const tasks: ThisWeekTask[] = [];

  for (const p of plantings) {
    // Indoor sow task
    if (p.indoorStartWeeks != null && p.status === "planned") {
      const start = weeksFromFrost(frostDate, -p.indoorStartWeeks);
      const end = weeksFromFrost(frostDate, -p.indoorStartWeeks + 2);
      if (now >= start && now <= end) {
        tasks.push({
          plantingId: p.id,
          yardElementId: p.yardElementId,
          plantName: p.plantName,
          taskType: "indoor_sow",
          taskLabel: `Start ${p.plantName} seeds indoors`,
          newStatus: "seeded",
        });
      }
    }

    // Direct sow task
    if (p.directSowWeeks != null && p.status === "planned") {
      const start = weeksFromFrost(frostDate, -p.directSowWeeks);
      const end = weeksFromFrost(frostDate, -p.directSowWeeks + 2);
      if (now >= start && now <= end) {
        tasks.push({
          plantingId: p.id,
          yardElementId: p.yardElementId,
          plantName: p.plantName,
          taskType: "direct_sow",
          taskLabel: `Direct sow ${p.plantName}`,
          newStatus: "seeded",
        });
      }
    }

    // Transplant task
    if (p.transplantWeeks != null && (p.status === "seeded" || p.status === "sprouted")) {
      const start = weeksFromFrost(frostDate, p.transplantWeeks);
      const end = weeksFromFrost(frostDate, p.transplantWeeks + 2);
      if (now >= start && now <= end) {
        tasks.push({
          plantingId: p.id,
          yardElementId: p.yardElementId,
          plantName: p.plantName,
          taskType: "transplant",
          taskLabel: `Transplant ${p.plantName} outdoors`,
          newStatus: "transplanted",
        });
      }
    }

    // Harvest task
    if (
      p.daysToHarvest != null &&
      p.plantedDate &&
      (p.status === "growing" || p.status === "transplanted")
    ) {
      const planted = new Date(p.plantedDate);
      const harvestDate = new Date(planted);
      harvestDate.setDate(harvestDate.getDate() + p.daysToHarvest);
      const harvestEnd = new Date(harvestDate);
      harvestEnd.setDate(harvestEnd.getDate() + 14);
      if (now >= harvestDate && now <= harvestEnd) {
        tasks.push({
          plantingId: p.id,
          yardElementId: p.yardElementId,
          plantName: p.plantName,
          taskType: "harvest",
          taskLabel: `Harvest ${p.plantName}`,
          newStatus: "harvesting",
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

  const STATUS_COLORS: Record<string, string> = {
    planned: "bg-gray-100 text-gray-600",
    seeded: "bg-blue-100 text-blue-700",
    sprouted: "bg-emerald-100 text-emerald-700",
    transplanted: "bg-orange-100 text-orange-700",
    growing: "bg-garden-100 text-garden-700",
    harvesting: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="space-y-6">
      {/* This Week Tasks */}
      {thisWeekTasks.length > 0 && (
        <div className="bg-white rounded-xl border border-garden-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-garden-800 mb-3">This Week</h2>
          <div className="space-y-2">
            {thisWeekTasks.map((task, i) => (
              <div
                key={`${task.plantingId}-${task.taskType}-${i}`}
                className="flex items-center gap-3"
              >
                <button
                  className="w-5 h-5 rounded border-2 border-garden-300 hover:border-garden-500 hover:bg-garden-50 transition-colors shrink-0 cursor-pointer"
                  onClick={() => handleMarkDone(task)}
                  title="Mark as done"
                />
                <span className="text-sm text-gray-700">{task.taskLabel}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-earth-200 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <select
            className="rounded-lg border border-earth-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition"
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
            {filtered.length} planting{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Gantt Chart */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-earth-200 shadow-sm p-10 text-center">
          <p className="text-gray-400 text-sm">
            No active plantings. Add plants to your beds in the Yard planner to see them here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-earth-200 shadow-sm overflow-hidden">
          {/* Month headers */}
          <div className="flex border-b border-earth-100">
            <div className="w-48 shrink-0 px-4 py-2 text-xs font-medium text-gray-500 border-r border-earth-100">
              Plant
            </div>
            <div className="flex-1 relative">
              <div className="flex">
                {MONTHS.map((m) => (
                  <div
                    key={m}
                    className="flex-1 text-center text-[10px] text-gray-400 py-2 border-r border-earth-50"
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
            return (
              <div
                key={p.id}
                className="flex border-b border-earth-50 hover:bg-earth-50/50 transition-colors"
              >
                <div className="w-48 shrink-0 px-4 py-2.5 border-r border-earth-100">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.plantName}</p>
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
                      className="absolute top-0 bottom-0 border-r border-earth-50"
                      style={{ left: `${(i / 12) * 100}%` }}
                    />
                  ))}

                  {/* Frost line */}
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
            );
          })}

          {/* Legend */}
          <div className="px-4 py-3 bg-earth-50/50 border-t border-earth-100">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <span className="flex items-center gap-1 text-[10px] text-gray-500">
                <span className="inline-block w-2 h-2 rounded-sm bg-blue-400" />
                Indoor Start
              </span>
              <span className="flex items-center gap-1 text-[10px] text-gray-500">
                <span className="inline-block w-2 h-2 rounded-sm bg-emerald-500" />
                Direct Sow
              </span>
              <span className="flex items-center gap-1 text-[10px] text-gray-500">
                <span className="inline-block w-2 h-2 rounded-sm bg-orange-400" />
                Transplant
              </span>
              <span className="flex items-center gap-1 text-[10px] text-gray-500">
                <span className="inline-block w-2 h-2 rounded-sm bg-amber-500" />
                Harvest
              </span>
              <span className="flex items-center gap-1 text-[10px] text-gray-500">
                <span className="inline-block w-0.5 h-3 border-l-2 border-red-400" />
                Today
              </span>
              <span className="flex items-center gap-1 text-[10px] text-gray-500">
                <span className="inline-block w-0.5 h-3 border-l border-dashed border-blue-300" />
                Frost dates
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
