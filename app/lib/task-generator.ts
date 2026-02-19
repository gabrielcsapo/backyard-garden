import { db } from "../db/index.ts";
import { tasks, plantings, plants, yardElements, settings } from "../db/schema.ts";
import { eq, sql, isNull } from "drizzle-orm";
import { getPlantingWindows } from "./dates.ts";

export type GeneratedTask = {
  title: string;
  description: string;
  dueDate: string;
  taskType: string;
  plantingId?: number;
  yardElementId?: number;
};

export async function generateTasksForPlantings(): Promise<number> {
  const userSettings = db.select().from(settings).limit(1).get();
  if (!userSettings?.lastFrostDate) return 0;

  const activePlantings = await db
    .select({
      id: plantings.id,
      status: plantings.status,
      yardElementId: plantings.yardElementId,
      plantName: plants.name,
      indoorStartWeeks: plants.indoorStartWeeksBeforeFrost,
      directSowWeeks: plants.directSowWeeksBeforeFrost,
      transplantWeeks: plants.transplantWeeksAfterFrost,
      daysToHarvest: plants.daysToHarvest,
    })
    .from(plantings)
    .innerJoin(plants, eq(plantings.plantId, plants.id))
    .where(sql`${plantings.status} != 'done'`);

  let created = 0;

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

    const taskDefs: { title: string; dueDate: Date | undefined; taskType: string }[] = [
      {
        title: `Start ${p.plantName} indoors`,
        dueDate: windows.indoorStart,
        taskType: "indoor_start",
      },
      {
        title: `Direct sow ${p.plantName}`,
        dueDate: windows.directSow,
        taskType: "direct_sow",
      },
      {
        title: `Transplant ${p.plantName}`,
        dueDate: windows.transplant,
        taskType: "transplant",
      },
      {
        title: `Harvest ${p.plantName}`,
        dueDate: windows.harvestBy,
        taskType: "harvest",
      },
    ];

    for (const def of taskDefs) {
      if (!def.dueDate) continue;

      const dueDateStr = def.dueDate.toISOString().split("T")[0];

      // Check if task already exists
      const existing = db
        .select({ id: tasks.id })
        .from(tasks)
        .where(
          sql`${tasks.plantingId} = ${p.id} AND ${tasks.taskType} = ${def.taskType}`,
        )
        .get();

      if (!existing) {
        db.insert(tasks)
          .values({
            title: def.title,
            dueDate: dueDateStr,
            taskType: def.taskType,
            plantingId: p.id,
            yardElementId: p.yardElementId,
          })
          .run();
        created++;
      }
    }
  }

  return created;
}

export async function getUpcomingTasks(limit: number = 20) {
  const today = new Date().toISOString().split("T")[0];

  return db
    .select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      dueDate: tasks.dueDate,
      recurrence: tasks.recurrence,
      completedAt: tasks.completedAt,
      taskType: tasks.taskType,
      plantingId: tasks.plantingId,
      yardElementId: tasks.yardElementId,
      bedLabel: yardElements.label,
    })
    .from(tasks)
    .leftJoin(yardElements, eq(tasks.yardElementId, yardElements.id))
    .where(isNull(tasks.completedAt))
    .orderBy(sql`${tasks.dueDate} ASC`)
    .limit(limit);
}

export async function completeTask(taskId: number) {
  db.update(tasks)
    .set({ completedAt: new Date().toISOString() })
    .where(eq(tasks.id, taskId))
    .run();
}
