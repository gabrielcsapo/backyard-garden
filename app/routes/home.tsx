import { Link } from "react-router";
import { PlantIcon } from "../lib/plant-icons";
import { db } from "../db/index.ts";
import { plants, plantings, settings, yards, yardElements, logEntries } from "../db/schema.ts";
import { eq, inArray, gte, desc, sql } from "drizzle-orm";
import { getPlantingWindows, formatDate } from "../lib/dates.ts";
import { createLogEntry } from "./log.actions.ts";
import { YardPreview, TaskCheckbox } from "./home.client.tsx";

type ThisWeekTask = {
  id: string;
  plantingId: number;
  plantName: string;
  action: string;
  actionType: "indoor_start" | "direct_sow" | "transplant" | "harvest";
  bedLabel: string | null;
  date: string;
};

const ACTION_LABELS: Record<string, string> = {
  indoor_start: "Start indoors",
  direct_sow: "Direct sow",
  transplant: "Transplant",
  harvest: "Harvest",
};

const Component = async () => {
  const userSettings = (await db.select().from(settings).limit(1))[0];
  const allYards = await db.select().from(yards);

  // Gather per-yard summaries
  type YardSummary = {
    id: number;
    name: string;
    widthFt: number;
    heightFt: number;
    elements: { id: number; shapeType: string; x: number; y: number; width: number; height: number; label: string | null; rotation: number | null }[];
    plantingCount: number;
    activePlantingCount: number;
  };

  const yardSummaries: YardSummary[] = await Promise.all(
    allYards.map(async (yard) => {
      const elems = await db
        .select({
          id: yardElements.id,
          shapeType: yardElements.shapeType,
          x: yardElements.x,
          y: yardElements.y,
          width: yardElements.width,
          height: yardElements.height,
          label: yardElements.label,
          rotation: yardElements.rotation,
        })
        .from(yardElements)
        .where(eq(yardElements.yardId, yard.id));

      let pc = 0;
      let apc = 0;
      const elementIds = elems.map((e) => e.id);
      if (elementIds.length > 0) {
        const allP = await db
          .select({ id: plantings.id, status: plantings.status })
          .from(plantings)
          .where(inArray(plantings.yardElementId, elementIds));
        pc = allP.length;
        apc = allP.filter((p) => p.status !== "done").length;
      }
      return { ...yard, elements: elems, plantingCount: pc, activePlantingCount: apc };
    }),
  );

  const plantingCount = yardSummaries.reduce((sum, y) => sum + y.plantingCount, 0);
  const activePlantingCount = yardSummaries.reduce((sum, y) => sum + y.activePlantingCount, 0);

  // Check for recent log entries (within last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weekAgoStr = oneWeekAgo.toISOString().split("T")[0];
  const recentLogs = await db
    .select({ id: logEntries.id })
    .from(logEntries)
    .where(gte(logEntries.date, weekAgoStr));
  const hasRecentLogs = recentLogs.length > 0;

  // Last 5 log entries for recent activity
  const recentEntries = await db
    .select({
      id: logEntries.id,
      date: logEntries.date,
      type: logEntries.type,
      content: logEntries.content,
      plantName: plants.name,
      bedLabel: yardElements.label,
    })
    .from(logEntries)
    .leftJoin(plantings, eq(logEntries.plantingId, plantings.id))
    .leftJoin(plants, eq(plantings.plantId, plants.id))
    .leftJoin(yardElements, eq(logEntries.yardElementId, yardElements.id))
    .orderBy(desc(logEntries.date), desc(logEntries.id))
    .limit(5);

  // This week's tasks — compute from active plantings + frost dates
  let thisWeekTasks: ThisWeekTask[] = [];
  if (userSettings?.lastFrostDate) {
    const now = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    const activePlantings = await db
      .select({
        id: plantings.id,
        plantId: plantings.plantId,
        status: plantings.status,
        yardElementId: plantings.yardElementId,
        plantName: plants.name,
        indoorStartWeeks: plants.indoorStartWeeksBeforeFrost,
        directSowWeeks: plants.directSowWeeksBeforeFrost,
        transplantWeeks: plants.transplantWeeksAfterFrost,
        daysToHarvest: plants.daysToHarvest,
        bedLabel: yardElements.label,
      })
      .from(plantings)
      .innerJoin(plants, eq(plantings.plantId, plants.id))
      .innerJoin(yardElements, eq(plantings.yardElementId, yardElements.id))
      .where(sql`${plantings.status} != 'done'`);

    for (const p of activePlantings) {
      const windows = getPlantingWindows(
        {
          indoorStartWeeksBeforeFrost: p.indoorStartWeeks,
          directSowWeeksBeforeFrost: p.directSowWeeks,
          transplantWeeksAfterFrost: p.transplantWeeks,
          daysToHarvest: p.daysToHarvest,
        },
        userSettings.lastFrostDate,
      );

      const checks: { type: ThisWeekTask["actionType"]; date: Date | undefined }[] = [
        { type: "indoor_start", date: windows.indoorStart },
        { type: "direct_sow", date: windows.directSow },
        { type: "transplant", date: windows.transplant },
        { type: "harvest", date: windows.harvestBy },
      ];

      for (const check of checks) {
        if (check.date && check.date >= now && check.date <= weekFromNow) {
          thisWeekTasks.push({
            id: `${p.id}-${check.type}`,
            plantingId: p.id,
            plantName: p.plantName,
            action: `${ACTION_LABELS[check.type]} ${p.plantName}`,
            actionType: check.type,
            bedLabel: p.bedLabel,
            date: formatDate(check.date),
          });
        }
      }
    }
  }

  const EVENT_ICONS: Record<string, string> = {
    observation: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z",
    watering: "M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z",
    fertilizing: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    pest: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
    harvest: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    pruning:
      "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
    stage_change: "M9 12l2 2 4-4",
    default: "M12 8v4m0 4h.01",
  };

  const EVENT_COLORS: Record<string, string> = {
    observation: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    watering: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    fertilizing: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    pest: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    harvest: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    pruning: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    stage_change: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    default: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your garden at a glance.</p>
      </div>

      {!userSettings?.zone ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-earth-200 dark:border-gray-700 shadow-sm p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-garden-50 dark:bg-garden-900/30 flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-garden-600 dark:text-garden-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Welcome to Backyard Garden</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Get started by setting up your growing zone and frost dates. This will unlock
            personalized planting recommendations.
          </p>
          <Link
            to="/settings"
            className="inline-flex items-center gap-2 rounded-lg bg-garden-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-garden-700 transition-colors no-underline"
          >
            Configure Settings
          </Link>
        </div>
      ) : (
        <>
          {/* Quick Stats Bar */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="inline-flex items-center gap-1.5 bg-garden-50 dark:bg-garden-900/30 text-garden-700 dark:text-garden-400 rounded-full px-3 py-1.5 text-sm font-medium">
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              Zone {userSettings.zone}
            </div>
            <div className="inline-flex items-center gap-1.5 bg-earth-100 dark:bg-gray-700 text-earth-700 dark:text-gray-300 rounded-full px-3 py-1.5 text-sm font-medium">
              {activePlantingCount} active planting{activePlantingCount !== 1 ? "s" : ""}
            </div>
            {thisWeekTasks.length > 0 && (
              <div className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full px-3 py-1.5 text-sm font-medium">
                {thisWeekTasks.length} task{thisWeekTasks.length !== 1 ? "s" : ""} this week
              </div>
            )}
            {userSettings.lastFrostDate && (
              <div className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
                Last frost:{" "}
                {new Date(userSettings.lastFrostDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column — Tasks + Activity */}
            <div className="lg:col-span-2 space-y-6">
              {/* This Week's Tasks */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-earth-200 dark:border-gray-700 shadow-sm p-5">
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">This Week</h2>
                {thisWeekTasks.length > 0 ? (
                  <div className="space-y-2">
                    {thisWeekTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-3 bg-earth-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <TaskCheckbox
                          plantingId={task.plantingId}
                          actionType={task.actionType}
                          logAction={createLogEntry}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <PlantIcon name={task.plantName} size={16} className="text-garden-600 dark:text-garden-400 shrink-0" />
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{task.action}</p>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {task.date}
                            {task.bedLabel && ` \u00b7 ${task.bedLabel}`}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            task.actionType === "indoor_start"
                              ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                              : task.actionType === "direct_sow"
                                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : task.actionType === "transplant"
                                  ? "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                                  : "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                          }`}
                        >
                          {ACTION_LABELS[task.actionType]}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-400">
                      {plantingCount > 0
                        ? "Nothing to do this week. Check the calendar for upcoming tasks."
                        : "Add plantings in the yard editor to see tasks here."}
                    </p>
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-earth-200 dark:border-gray-700 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h2>
                  <Link
                    to="/log"
                    className="text-xs font-medium text-garden-600 dark:text-garden-400 hover:text-garden-700 dark:hover:text-garden-300 no-underline"
                  >
                    View all
                  </Link>
                </div>
                {recentEntries.length > 0 ? (
                  <div className="space-y-3">
                    {recentEntries.map((entry) => {
                      const colors = EVENT_COLORS[entry.type] ?? EVENT_COLORS.default;
                      const iconPath = EVENT_ICONS[entry.type] ?? EVENT_ICONS.default;
                      return (
                        <div key={entry.id} className="flex items-start gap-3">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${colors}`}
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
                              <path d={iconPath} />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 text-sm text-gray-900 dark:text-gray-100">
                              <span className="font-medium capitalize">
                                {entry.type.replace("_", " ")}
                              </span>
                              {entry.plantName && (
                                <>
                                  <span className="text-gray-400">&mdash;</span>
                                  <PlantIcon name={entry.plantName} size={14} className="text-garden-600 dark:text-garden-400 shrink-0" />
                                  <span className="text-gray-500 dark:text-gray-400">{entry.plantName}</span>
                                </>
                              )}
                            </div>
                            {entry.content && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                                {entry.content}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-gray-400 shrink-0">
                            {new Date(entry.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-400">
                      No log entries yet. Start tracking your garden activity.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right column — Yard Preview + Nudges */}
            <div className="space-y-6">
              {/* Yard previews */}
              {yardSummaries.length > 0 ? (
                <div className="space-y-4">
                  {yardSummaries.map((yard) => (
                    <Link
                      key={yard.id}
                      to={`/yard/${yard.id}`}
                      className="block bg-white dark:bg-gray-800 rounded-xl border border-earth-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow no-underline overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-5 py-3 border-b border-earth-100 dark:border-gray-700">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{yard.name}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {yard.widthFt}x{yard.heightFt}ft &middot; {yard.elements.length}{" "}
                            beds &middot; {yard.plantingCount} plantings
                          </p>
                        </div>
                        <span className="text-xs font-medium text-garden-700 dark:text-garden-400 bg-garden-50 dark:bg-garden-900/30 px-2 py-1 rounded-lg">
                          Open
                        </span>
                      </div>
                      <div className="p-4">
                        <YardPreview
                          widthFt={yard.widthFt}
                          heightFt={yard.heightFt}
                          elements={yard.elements}
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  to="/yard"
                  className="group bg-white dark:bg-gray-800 rounded-xl border border-earth-200 dark:border-gray-700 shadow-sm p-6 hover:shadow-md transition-shadow no-underline block text-center"
                >
                  <div className="mx-auto w-10 h-10 rounded-full bg-garden-50 dark:bg-garden-900/30 flex items-center justify-center mb-3">
                    <svg
                      className="w-5 h-5 text-garden-600 dark:text-garden-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M3 9h18" />
                      <path d="M9 3v18" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-garden-700 dark:group-hover:text-garden-400 transition-colors">
                    Create Your Yard
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Set up your yard and start planning.</p>
                </Link>
              )}

              {/* Weekly log nudge */}
              {!hasRecentLogs && plantingCount > 0 && (
                <Link
                  to="/log"
                  className="group flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-4 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors no-underline"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                    <svg
                      className="w-4 h-4 text-amber-600 dark:text-amber-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-200">Time to log!</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">No entries this week.</p>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </main>
  );
};

export default Component;
