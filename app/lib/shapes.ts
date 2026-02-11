export const SHAPE_TYPES = [
  "rectangle",
  "circle",
  "keyhole",
  "spiral",
  "hugelkultur",
  "mandala",
  "container",
  "path",
  "structure",
  "water",
] as const;

export type ShapeType = (typeof SHAPE_TYPES)[number];

export const SHAPE_CONFIG: Record<
  ShapeType,
  {
    label: string;
    description: string;
    color: string;
    borderColor: string;
    defaultWidth: number;
    defaultHeight: number;
    plantable: boolean;
  }
> = {
  rectangle: {
    label: "Raised Bed",
    description: "Rectangular raised bed or row garden",
    color: "#86efac",
    borderColor: "#15803d",
    defaultWidth: 4,
    defaultHeight: 8,
    plantable: true,
  },
  circle: {
    label: "Round Bed",
    description: "Circular garden bed",
    color: "#bbf7d0",
    borderColor: "#166534",
    defaultWidth: 6,
    defaultHeight: 6,
    plantable: true,
  },
  keyhole: {
    label: "Keyhole Garden",
    description: "Circular bed with access notch and compost center",
    color: "#fde68a",
    borderColor: "#92400e",
    defaultWidth: 6,
    defaultHeight: 6,
    plantable: true,
  },
  spiral: {
    label: "Herb Spiral",
    description: "Spiral bed with height variation for microclimates",
    color: "#c4b5fd",
    borderColor: "#5b21b6",
    defaultWidth: 5,
    defaultHeight: 5,
    plantable: true,
  },
  hugelkultur: {
    label: "Hugelkultur",
    description: "Mounded bed built on decomposing wood",
    color: "#d4c5ae",
    borderColor: "#6d5b40",
    defaultWidth: 4,
    defaultHeight: 10,
    plantable: true,
  },
  mandala: {
    label: "Mandala Garden",
    description: "Circular design with keyhole paths",
    color: "#fbcfe8",
    borderColor: "#9d174d",
    defaultWidth: 10,
    defaultHeight: 10,
    plantable: true,
  },
  container: {
    label: "Container",
    description: "Pot, grow bag, or window box",
    color: "#fed7aa",
    borderColor: "#c2410c",
    defaultWidth: 2,
    defaultHeight: 2,
    plantable: true,
  },
  path: {
    label: "Path",
    description: "Walkway or pathway",
    color: "#e5e7eb",
    borderColor: "#6b7280",
    defaultWidth: 2,
    defaultHeight: 6,
    plantable: false,
  },
  structure: {
    label: "Structure",
    description: "House, shed, fence, or deck",
    color: "#d1d5db",
    borderColor: "#374151",
    defaultWidth: 4,
    defaultHeight: 4,
    plantable: false,
  },
  water: {
    label: "Water Source",
    description: "Spigot, hose bib, or irrigation point",
    color: "#93c5fd",
    borderColor: "#1d4ed8",
    defaultWidth: 1,
    defaultHeight: 1,
    plantable: false,
  },
};

export function getShapeArea(shapeType: string, width: number, height: number): number {
  switch (shapeType) {
    case "circle":
    case "keyhole":
    case "spiral":
    case "mandala":
      return Math.PI * (width / 2) * (height / 2);
    case "hugelkultur":
      return width * height * 0.8;
    case "container":
      return width * height;
    default:
      return width * height;
  }
}
