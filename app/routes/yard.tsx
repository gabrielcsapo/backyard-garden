import { db } from "../db/index.ts";
import { yards, yardElements, plantings } from "../db/schema.ts";
import { eq, inArray, sql } from "drizzle-orm";
import { createYard } from "./yard.actions.ts";
import { YardListPage } from "./yard.client.tsx";

const Component = async () => {
  const allYards = await db.select().from(yards);

  const yardSummaries = await Promise.all(
    allYards.map(async (yard) => {
      const elements = await db
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

      let plantingCount = 0;
      const elementIds = elements.map((e) => e.id);
      if (elementIds.length > 0) {
        const result = await db
          .select({ count: sql<number>`count(*)` })
          .from(plantings)
          .where(inArray(plantings.yardElementId, elementIds));
        plantingCount = Number(result[0]?.count ?? 0);
      }

      return { ...yard, elements, elementCount: elements.length, plantingCount };
    }),
  );

  return (
    <YardListPage yards={yardSummaries} createYardAction={createYard} />
  );
};

export default Component;
