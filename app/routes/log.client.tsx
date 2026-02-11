"use client";

import React from "react";
import { useToast } from "../components/toast.client";

type LogEntry = {
  id: number;
  date: string;
  type: string;
  content: string | null;
  stage: string | null;
  yieldAmount: number | null;
  yieldUnit: string | null;
  plantingId: number | null;
  yardElementId: number | null;
  plantName: string | null;
  plantVariety: string | null;
  bedLabel: string | null;
  bedShapeType: string | null;
};

type PlantingOption = {
  id: number;
  plantName: string;
  plantVariety: string | null;
  yardElementId: number;
  bedLabel: string | null;
};

const LOG_TYPES: Record<string, { label: string; color: string; icon: string }> = {
  observation: {
    label: "Observation",
    color: "bg-blue-50 text-blue-700 ring-blue-600/20",
    icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z",
  },
  watering: {
    label: "Watering",
    color: "bg-cyan-50 text-cyan-700 ring-cyan-600/20",
    icon: "M12 2L4 14h16L12 2z",
  },
  fertilizing: {
    label: "Fertilizing",
    color: "bg-amber-50 text-amber-700 ring-amber-600/20",
    icon: "M12 3v18m-6-6l6 6 6-6",
  },
  pest: {
    label: "Pest",
    color: "bg-red-50 text-red-700 ring-red-600/20",
    icon: "M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z",
  },
  disease: {
    label: "Disease",
    color: "bg-rose-50 text-rose-700 ring-rose-600/20",
    icon: "M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z",
  },
  harvest: {
    label: "Harvest",
    color: "bg-orange-50 text-orange-700 ring-orange-600/20",
    icon: "M4 7h16M4 12h16M4 17h8",
  },
  pruning: {
    label: "Pruning",
    color: "bg-green-50 text-green-700 ring-green-600/20",
    icon: "M6 3v18M18 3v18M6 12h12",
  },
  stage_change: {
    label: "Stage Change",
    color: "bg-garden-50 text-garden-700 ring-garden-600/20",
    icon: "M13 7l5 5-5 5M6 7l5 5-5 5",
  },
  weather: {
    label: "Weather",
    color: "bg-gray-50 text-gray-700 ring-gray-600/20",
    icon: "M3 15a4 4 0 004 4h9a5 5 0 10-2-9.8A7 7 0 103 15z",
  },
};

export function LogTimeline({
  entries,
  deleteAction,
}: {
  entries: LogEntry[];
  deleteAction: (formData: FormData) => Promise<{ success: boolean }>;
}) {
  const { addToast } = useToast();

  // Group entries by date
  const grouped = React.useMemo(() => {
    const groups: Record<string, LogEntry[]> = {};
    for (const entry of entries) {
      if (!groups[entry.date]) groups[entry.date] = [];
      groups[entry.date].push(entry);
    }
    return Object.entries(groups).sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime());
  }, [entries]);

  async function handleDelete(id: number) {
    const fd = new FormData();
    fd.set("id", String(id));
    const result = await deleteAction(fd);
    if (result.success) {
      addToast("Log entry deleted.", "info");
    }
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-earth-200 shadow-sm p-10 text-center">
        <p className="text-gray-400 text-sm">
          No log entries yet. Use the Quick Log form to add your first entry.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {grouped.map(([date, dayEntries]) => (
        <div key={date}>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {formatLogDate(date)}
          </h3>
          <div className="space-y-2">
            {dayEntries.map((entry) => {
              const typeConfig = LOG_TYPES[entry.type] ?? {
                label: entry.type,
                color: "bg-gray-50 text-gray-700 ring-gray-600/20",
                icon: "",
              };
              return (
                <div
                  key={entry.id}
                  className="bg-white rounded-lg border border-earth-200 shadow-sm p-4 flex items-start gap-3"
                >
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap shrink-0 ${typeConfig.color}`}
                  >
                    {typeConfig.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      {entry.plantName && (
                        <span className="font-medium text-gray-900">
                          {entry.plantName}
                          {entry.plantVariety && (
                            <span className="text-gray-500 font-normal">
                              {" "}
                              ({entry.plantVariety})
                            </span>
                          )}
                        </span>
                      )}
                      {entry.bedLabel && (
                        <span className="text-xs text-gray-400">in {entry.bedLabel}</span>
                      )}
                    </div>
                    {entry.content && <p className="text-sm text-gray-600 mt-1">{entry.content}</p>}
                    {entry.type === "harvest" && entry.yieldAmount != null && (
                      <p className="text-sm font-medium text-orange-700 mt-1">
                        Harvested: {entry.yieldAmount} {entry.yieldUnit ?? "units"}
                      </p>
                    )}
                    {entry.type === "stage_change" && entry.stage && (
                      <p className="text-sm text-garden-700 mt-1">Stage: {entry.stage}</p>
                    )}
                  </div>
                  <button
                    className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
                    onClick={() => handleDelete(entry.id)}
                    title="Delete entry"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function QuickLogForm({
  plantings,
  createAction,
  defaultPlantingId,
  defaultYardElementId,
  onSuccess,
}: {
  plantings: PlantingOption[];
  createAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  defaultPlantingId?: number;
  defaultYardElementId?: number;
  onSuccess?: () => void;
}) {
  const [type, setType] = React.useState("observation");
  const [plantingId, setPlantingId] = React.useState(
    defaultPlantingId ? String(defaultPlantingId) : "",
  );
  const [content, setContent] = React.useState("");
  const [yieldAmount, setYieldAmount] = React.useState("");
  const [yieldUnit, setYieldUnit] = React.useState("lbs");
  const [stage, setStage] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const { addToast } = useToast();

  const selectedPlanting = plantings.find((p) => String(p.id) === plantingId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData();
    fd.set("date", new Date().toISOString().split("T")[0]);
    fd.set("type", type);
    if (plantingId) fd.set("plantingId", plantingId);
    if (selectedPlanting) fd.set("yardElementId", String(selectedPlanting.yardElementId));
    if (defaultYardElementId) fd.set("yardElementId", String(defaultYardElementId));
    if (content) fd.set("content", content);
    if (type === "harvest" && yieldAmount) {
      fd.set("yieldAmount", yieldAmount);
      fd.set("yieldUnit", yieldUnit);
    }
    if (type === "stage_change" && stage) fd.set("stage", stage);

    const result = await createAction(fd);
    setSubmitting(false);
    if (result.success) {
      addToast("Log entry added!", "success");
      setContent("");
      setYieldAmount("");
      setStage("");
      onSuccess?.();
    } else {
      addToast(result.error ?? "Failed to add log entry.", "error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Event Type</label>
        <select
          className="w-full rounded-lg border border-earth-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {Object.entries(LOG_TYPES).map(([key, config]) => (
            <option key={key} value={key}>
              {config.label}
            </option>
          ))}
        </select>
      </div>

      {!defaultPlantingId && plantings.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Plant (optional)</label>
          <select
            className="w-full rounded-lg border border-earth-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition"
            value={plantingId}
            onChange={(e) => setPlantingId(e.target.value)}
          >
            <option value="">General (no specific plant)</option>
            {plantings.map((p) => (
              <option key={p.id} value={p.id}>
                {p.plantName}
                {p.plantVariety ? ` (${p.plantVariety})` : ""}
                {p.bedLabel ? ` - ${p.bedLabel}` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {type === "harvest" && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Amount</label>
            <input
              className="w-full rounded-lg border border-earth-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition"
              type="number"
              step="0.1"
              min="0"
              placeholder="0"
              value={yieldAmount}
              onChange={(e) => setYieldAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Unit</label>
            <select
              className="w-full rounded-lg border border-earth-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition"
              value={yieldUnit}
              onChange={(e) => setYieldUnit(e.target.value)}
            >
              <option value="lbs">lbs</option>
              <option value="oz">oz</option>
              <option value="count">count</option>
              <option value="bunches">bunches</option>
              <option value="cups">cups</option>
            </select>
          </div>
        </div>
      )}

      {type === "stage_change" && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">New Stage</label>
          <select
            className="w-full rounded-lg border border-earth-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition"
            value={stage}
            onChange={(e) => setStage(e.target.value)}
          >
            <option value="">Select stage</option>
            <option value="seedling">Seedling</option>
            <option value="vegetative">Vegetative</option>
            <option value="flowering">Flowering</option>
            <option value="fruiting">Fruiting</option>
            <option value="mature">Mature</option>
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Notes (optional)</label>
        <textarea
          className="w-full rounded-lg border border-earth-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition resize-none"
          rows={2}
          placeholder="Any observations..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-garden-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-garden-700 focus:outline-none focus:ring-2 focus:ring-garden-500/20 disabled:opacity-50 transition-colors cursor-pointer"
      >
        {submitting ? "Adding..." : "Add Entry"}
      </button>
    </form>
  );
}

function formatLogDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateStr === today.toISOString().split("T")[0]) return "Today";
  if (dateStr === yesterday.toISOString().split("T")[0]) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}
