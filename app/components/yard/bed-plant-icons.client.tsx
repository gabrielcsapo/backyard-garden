"use client";

import React from "react";
import { SHAPE_CONFIG } from "../../lib/shapes.ts";
import type { ShapeType } from "../../lib/shapes.ts";
import type { YardElement, PlantInfo, Planting } from "../../lib/yard-types.ts";
import { CELL_SIZE } from "../../lib/yard-types.ts";
import { getPlantIconRenderer } from "../../lib/plant-icons/index.tsx";
import { useTheme } from "../theme-provider.client";

type PlantSlot = {
  plantName: string;
  plantId: number;
  totalQuantity: number;
  renderer: (() => React.JSX.Element) | null;
};

function aggregatePlantings(
  plantings: Planting[],
  plants: PlantInfo[],
): PlantSlot[] {
  const map = new Map<number, PlantSlot>();
  for (const p of plantings) {
    const existing = map.get(p.plantId);
    if (existing) {
      existing.totalQuantity += p.quantity ?? 1;
    } else {
      const plant = plants.find((pl) => pl.id === p.plantId);
      if (!plant) continue;
      map.set(p.plantId, {
        plantName: plant.name,
        plantId: plant.id,
        totalQuantity: p.quantity ?? 1,
        renderer: getPlantIconRenderer(plant.name),
      });
    }
  }
  return Array.from(map.values());
}

function getLayoutRegion(
  shapeType: string,
  x: number,
  y: number,
  w: number,
  h: number,
): { lx: number; ly: number; lw: number; lh: number } {
  const isCircular = ["circle", "keyhole", "spiral", "mandala"].includes(
    shapeType,
  );

  if (shapeType === "hugelkultur") {
    return {
      lx: x + w * 0.25,
      ly: y + h * 0.35,
      lw: w * 0.5,
      lh: h * 0.35,
    };
  }

  if (isCircular) {
    const inset = 0.28;
    return {
      lx: x + w * inset,
      ly: y + h * inset,
      lw: w * (1 - 2 * inset),
      lh: h * (1 - 2 * inset),
    };
  }

  // Rectangular shapes (rectangle, container)
  const pad = 6;
  return {
    lx: x + pad,
    ly: y + pad,
    lw: Math.max(0, w - pad * 2),
    lh: Math.max(0, h - pad * 2),
  };
}

function getIconSize(minDim: number): { size: number; gap: number } {
  if (minDim < 80) return { size: 14, gap: 2 };
  if (minDim < 150) return { size: 18, gap: 3 };
  if (minDim < 250) return { size: 22, gap: 4 };
  return { size: 26, gap: 5 };
}

function computeIconPositions(
  regionX: number,
  regionY: number,
  regionW: number,
  regionH: number,
  count: number,
  iconSize: number,
  gap: number,
): { x: number; y: number }[] {
  const cols = Math.max(1, Math.floor(regionW / (iconSize + gap)));
  const rows = Math.max(1, Math.floor(regionH / (iconSize + gap)));
  const maxSlots = cols * rows;
  const visibleCount = Math.min(count, maxSlots);

  const actualCols = Math.min(visibleCount, cols);
  const actualRows = Math.ceil(visibleCount / cols);
  const gridW = actualCols * (iconSize + gap) - gap;
  const gridH = actualRows * (iconSize + gap) - gap;
  const offsetX = regionX + (regionW - gridW) / 2;
  const offsetY = regionY + (regionH - gridH) / 2;

  const positions: { x: number; y: number }[] = [];
  for (let i = 0; i < visibleCount; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    positions.push({
      x: offsetX + col * (iconSize + gap),
      y: offsetY + row * (iconSize + gap),
    });
  }
  return positions;
}

export const BedPlantIcons = React.memo(function BedPlantIcons({
  element,
  plantings,
  plants,
}: {
  element: YardElement;
  plantings: Planting[];
  plants: PlantInfo[];
}) {
  const config = SHAPE_CONFIG[element.shapeType as ShapeType];
  if (!config?.plantable) return null;
  if (plantings.length === 0) return null;

  const { isDark } = useTheme();

  const x = element.x * CELL_SIZE;
  const y = element.y * CELL_SIZE;
  const w = element.width * CELL_SIZE;
  const h = element.height * CELL_SIZE;
  const minDim = Math.min(w, h);

  // Too small to show icons
  if (minDim < 40) return null;

  const rotation = element.rotation ?? 0;
  const cx = x + w / 2;
  const cy = y + h / 2;

  const slots = aggregatePlantings(plantings, plants);
  if (slots.length === 0) return null;

  const iconColor = isDark ? config.color : config.borderColor;

  // Tiny bed — show single centered icon
  if (minDim < 70) {
    const slot = slots[0];
    const icoSize = 14;
    return (
      <g
        pointerEvents="none"
        transform={
          rotation !== 0 ? `rotate(${rotation}, ${cx}, ${cy})` : undefined
        }
      >
        {slot.renderer ? (
          <svg
            x={cx - icoSize / 2}
            y={cy + 6}
            width={icoSize}
            height={icoSize}
            viewBox="0 0 24 24"
            fill="none"
            opacity={0.55}
            style={{ color: iconColor }}
          >
            {slot.renderer()}
          </svg>
        ) : (
          <circle
            cx={cx}
            cy={cy + 6 + icoSize / 2}
            r={4}
            fill={iconColor}
            opacity={0.4}
          />
        )}
        {slots.length > 1 && (
          <text
            x={cx + icoSize / 2 + 3}
            y={cy + 6 + icoSize / 2 + 2}
            fontSize={7}
            fill={iconColor}
            opacity={0.6}
            fontWeight="600"
            textAnchor="start"
          >
            +{slots.length - 1}
          </text>
        )}
      </g>
    );
  }

  const { lx, ly, lw, lh } = getLayoutRegion(element.shapeType, x, y, w, h);
  const { size: iconSize, gap } = getIconSize(minDim);

  // Reserve label area: shift icons to the lower portion if there's a label
  let layoutY = ly;
  let layoutH = lh;
  if (element.label) {
    const labelBand = 14;
    const midY = y + h / 2;
    // Place icons below label center
    const belowLabelY = midY + labelBand / 2;
    if (belowLabelY > ly && belowLabelY < ly + lh) {
      layoutH = ly + lh - belowLabelY;
      layoutY = belowLabelY;
    }
  }

  const positions = computeIconPositions(
    lx,
    layoutY,
    lw,
    layoutH,
    slots.length,
    iconSize,
    gap,
  );

  const overflow = slots.length - positions.length;

  return (
    <g
      pointerEvents="none"
      transform={
        rotation !== 0 ? `rotate(${rotation}, ${cx}, ${cy})` : undefined
      }
    >
      {positions.map((pos, i) => {
        const slot = slots[i];
        if (!slot) return null;
        return (
          <g key={slot.plantId}>
            {slot.renderer ? (
              <svg
                x={pos.x}
                y={pos.y}
                width={iconSize}
                height={iconSize}
                viewBox="0 0 24 24"
                fill="none"
                opacity={0.6}
                style={{ color: iconColor }}
              >
                {slot.renderer()}
              </svg>
            ) : (
              <circle
                cx={pos.x + iconSize / 2}
                cy={pos.y + iconSize / 2}
                r={iconSize * 0.3}
                fill={iconColor}
                opacity={0.4}
              />
            )}
            {slot.totalQuantity > 1 && (
              <g>
                <circle
                  cx={pos.x + iconSize - 1}
                  cy={pos.y + iconSize - 1}
                  r={iconSize * 0.28}
                  fill={isDark ? "#1f2937" : "white"}
                  stroke={iconColor}
                  strokeWidth={0.5}
                  opacity={0.9}
                />
                <text
                  x={pos.x + iconSize - 1}
                  y={pos.y + iconSize + 0.5}
                  textAnchor="middle"
                  fontSize={iconSize * 0.32}
                  fill={iconColor}
                  fontWeight="600"
                >
                  {slot.totalQuantity > 99 ? "99" : slot.totalQuantity}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {overflow > 0 && positions.length > 0 && (
        <text
          x={
            positions[positions.length - 1].x + iconSize + gap
          }
          y={
            positions[positions.length - 1].y + iconSize / 2 + 3
          }
          fontSize={Math.max(8, iconSize * 0.4)}
          fill={iconColor}
          opacity={0.6}
          fontWeight="600"
        >
          +{overflow}
        </text>
      )}
    </g>
  );
});
