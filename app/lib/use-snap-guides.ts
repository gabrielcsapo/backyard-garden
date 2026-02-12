import type { YardElement } from "./yard-types.ts";
import { CELL_SIZE } from "./yard-types.ts";

export type Guide = {
  axis: "x" | "y";
  position: number; // in SVG units (CELL_SIZE)
  from: number;
  to: number;
};

const SNAP_THRESHOLD = 0.5; // feet

export function computeSnapGuides(
  draggedEl: { id: number; x: number; y: number; width: number; height: number },
  otherElements: YardElement[],
): { guides: Guide[]; snappedX: number | null; snappedY: number | null } {
  const guides: Guide[] = [];
  let snappedX: number | null = null;
  let snappedY: number | null = null;
  let bestDx = SNAP_THRESHOLD;
  let bestDy = SNAP_THRESHOLD;

  const dragEdges = {
    left: draggedEl.x,
    right: draggedEl.x + draggedEl.width,
    centerX: draggedEl.x + draggedEl.width / 2,
    top: draggedEl.y,
    bottom: draggedEl.y + draggedEl.height,
    centerY: draggedEl.y + draggedEl.height / 2,
  };

  for (const other of otherElements) {
    if (other.id === draggedEl.id) continue;

    const otherEdges = {
      left: other.x,
      right: other.x + other.width,
      centerX: other.x + other.width / 2,
      top: other.y,
      bottom: other.y + other.height,
      centerY: other.y + other.height / 2,
    };

    // Check X alignments
    const xPairs: [number, number][] = [
      [dragEdges.left, otherEdges.left],
      [dragEdges.left, otherEdges.right],
      [dragEdges.right, otherEdges.left],
      [dragEdges.right, otherEdges.right],
      [dragEdges.centerX, otherEdges.centerX],
    ];

    for (const [dragVal, otherVal] of xPairs) {
      const diff = Math.abs(dragVal - otherVal);
      if (diff < bestDx) {
        bestDx = diff;
        const offset = otherVal - dragVal;
        snappedX = draggedEl.x + offset;
        guides.length = 0; // Clear x guides
        guides.push({
          axis: "x",
          position: otherVal * CELL_SIZE,
          from: Math.min(draggedEl.y, other.y) * CELL_SIZE - 10,
          to: Math.max(draggedEl.y + draggedEl.height, other.y + other.height) * CELL_SIZE + 10,
        });
      }
    }

    // Check Y alignments
    const yPairs: [number, number][] = [
      [dragEdges.top, otherEdges.top],
      [dragEdges.top, otherEdges.bottom],
      [dragEdges.bottom, otherEdges.top],
      [dragEdges.bottom, otherEdges.bottom],
      [dragEdges.centerY, otherEdges.centerY],
    ];

    for (const [dragVal, otherVal] of yPairs) {
      const diff = Math.abs(dragVal - otherVal);
      if (diff < bestDy) {
        bestDy = diff;
        const offset = otherVal - dragVal;
        snappedY = draggedEl.y + offset;
        // Add y guide (don't clear x guides)
        const existingYIndex = guides.findIndex((g) => g.axis === "y");
        const newGuide: Guide = {
          axis: "y",
          position: otherVal * CELL_SIZE,
          from: Math.min(draggedEl.x, other.x) * CELL_SIZE - 10,
          to: Math.max(draggedEl.x + draggedEl.width, other.x + other.width) * CELL_SIZE + 10,
        };
        if (existingYIndex >= 0) {
          guides[existingYIndex] = newGuide;
        } else {
          guides.push(newGuide);
        }
      }
    }
  }

  return { guides, snappedX, snappedY };
}
