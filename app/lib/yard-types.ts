import type { ShapeType } from "./shapes.ts";

export type Yard = {
  id: number;
  name: string;
  widthFt: number;
  heightFt: number;
};

export type YardElement = {
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
};

export type PlantInfo = {
  id: number;
  name: string;
  variety: string | null;
  category: string | null;
  spacingInches: number | null;
  daysToHarvest: number | null;
  sunRequirement: string | null;
  companions: unknown;
  incompatible: unknown;
};

export type Planting = {
  id: number;
  plantId: number;
  yardElementId: number;
  status: string | null;
  quantity: number | null;
  notes: string | null;
  plantedDate: string | null;
};

export type ToolType = "select" | "hand" | ShapeType;

export const CELL_SIZE = 50;
