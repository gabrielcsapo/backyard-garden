import { db } from "../db/index.ts";
import { yards, yardElements, plants, plantings } from "../db/schema.ts";
import { eq, inArray } from "drizzle-orm";
import { YardEditor } from "./yard.client.tsx";

const Component = async ({ params }: { params: { id: string } }) => {
  const yardId = Number(params.id);
  const yard = (
    await db.select().from(yards).where(eq(yards.id, yardId))
  )[0];

  if (!yard) {
    throw new Response("Yard not found", { status: 404 });
  }

  let elements: {
    id: number;
    yardId: number;
    shapeType: string;
    x: number;
    y: number;
    width: number;
    height: number;
    label: string | null;
    sunExposure: string | null;
    rotation: number | null;
    metadata: unknown;
  }[] = [];

  const allPlants = await db
    .select({
      id: plants.id,
      name: plants.name,
      variety: plants.variety,
      category: plants.category,
      spacingInches: plants.spacingInches,
      daysToHarvest: plants.daysToHarvest,
      sunRequirement: plants.sunRequirement,
      companions: plants.companions,
      incompatible: plants.incompatible,
    })
    .from(plants);

  let allPlantings: {
    id: number;
    plantId: number;
    yardElementId: number;
    status: string | null;
    quantity: number | null;
    notes: string | null;
    plantedDate: string | null;
  }[] = [];

  elements = await db
    .select()
    .from(yardElements)
    .where(eq(yardElements.yardId, yard.id));

  const elementIds = elements.map((e) => e.id);
  if (elementIds.length > 0) {
    allPlantings = await db
      .select({
        id: plantings.id,
        plantId: plantings.plantId,
        yardElementId: plantings.yardElementId,
        status: plantings.status,
        quantity: plantings.quantity,
        notes: plantings.notes,
        plantedDate: plantings.plantedDate,
      })
      .from(plantings)
      .where(inArray(plantings.yardElementId, elementIds));
  }

  return (
    <YardEditor
      yard={yard}
      elements={elements}
      plants={allPlants}
      plantings={allPlantings}
    />
  );
};

export default Component;
