"use client";

import React from "react";
import { SHAPE_CONFIG, SHAPE_TYPES } from "../lib/shapes.ts";
import type { ShapeType } from "../lib/shapes.ts";
import {
  addYardElement,
  updateYardElement,
  deleteYardElement,
  duplicateYardElement,
} from "./yard.actions.ts";
import { addPlanting, updatePlanting, deletePlanting } from "./beds.$id.actions.ts";
import { getShapeArea } from "../lib/shapes.ts";
import { rankBedsForPlant, getGlowColor } from "../lib/companion-scoring.ts";
import type { BedScore } from "../lib/companion-scoring.ts";
import { useToast } from "../components/toast.client";
import { useConfirm } from "../components/confirm-dialog.client";
import { checkCompanionConflicts } from "../lib/companions.ts";

type Yard = { id: number; name: string; widthFt: number; heightFt: number };
type Element = {
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
type PlantInfo = {
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
type Planting = {
  id: number;
  plantId: number;
  yardElementId: number;
  status: string | null;
  quantity: number | null;
  notes: string | null;
  plantedDate: string | null;
};

const CELL_SIZE = 28;
const GRID_COLOR = "#e5e7eb";
const GRID_COLOR_MAJOR = "#d1d5db";

type SizeMode = "dimensions" | "sqft" | "acres";

function sqftToDimensions(sqft: number): { w: number; h: number } {
  const side = Math.round(Math.sqrt(sqft));
  return { w: side, h: side };
}

function acresToDimensions(acres: number): { w: number; h: number } {
  const sqft = acres * 43560;
  const side = Math.round(Math.sqrt(sqft));
  return { w: side, h: side };
}

export function CreateYardForm({ action }: { action: (formData: FormData) => Promise<void> }) {
  const [sizeMode, setSizeMode] = React.useState<SizeMode>("dimensions");
  const [widthFt, setWidthFt] = React.useState(50);
  const [heightFt, setHeightFt] = React.useState(40);
  const [sqft, setSqft] = React.useState(2000);
  const [acres, setAcres] = React.useState(0.25);

  const effectiveWidth =
    sizeMode === "sqft"
      ? sqftToDimensions(sqft).w
      : sizeMode === "acres"
        ? acresToDimensions(acres).w
        : widthFt;
  const effectiveHeight =
    sizeMode === "sqft"
      ? sqftToDimensions(sqft).h
      : sizeMode === "acres"
        ? acresToDimensions(acres).h
        : heightFt;

  const totalSqft = effectiveWidth * effectiveHeight;
  const totalAcres = (totalSqft / 43560).toFixed(3);

  return (
    <form action={action} className="space-y-4 text-left">
      <input type="hidden" name="widthFt" value={effectiveWidth} />
      <input type="hidden" name="heightFt" value={effectiveHeight} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Yard Name</label>
        <input
          className="w-full rounded-lg border border-earth-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition"
          type="text"
          name="name"
          placeholder="My Backyard"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Size Input</label>
        <div className="flex rounded-lg border border-earth-200 overflow-hidden">
          {(["dimensions", "sqft", "acres"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              className={`flex-1 px-3 py-1.5 text-sm font-medium transition cursor-pointer ${
                sizeMode === mode
                  ? "bg-garden-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => setSizeMode(mode)}
            >
              {mode === "dimensions" ? "W x H" : mode === "sqft" ? "Sq Feet" : "Acres"}
            </button>
          ))}
        </div>
      </div>

      {sizeMode === "dimensions" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Width (ft)</label>
            <input
              className="w-full rounded-lg border border-earth-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition"
              type="number"
              min="10"
              max="1000"
              value={widthFt}
              onChange={(e) => setWidthFt(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Height (ft)</label>
            <input
              className="w-full rounded-lg border border-earth-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition"
              type="number"
              min="10"
              max="1000"
              value={heightFt}
              onChange={(e) => setHeightFt(Number(e.target.value))}
            />
          </div>
        </div>
      )}

      {sizeMode === "sqft" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Total Square Feet
          </label>
          <input
            className="w-full rounded-lg border border-earth-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition"
            type="number"
            min="100"
            max="500000"
            value={sqft}
            onChange={(e) => setSqft(Number(e.target.value))}
          />
        </div>
      )}

      {sizeMode === "acres" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Acres</label>
          <input
            className="w-full rounded-lg border border-earth-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition"
            type="number"
            min="0.01"
            max="10"
            step="0.01"
            value={acres}
            onChange={(e) => setAcres(Number(e.target.value))}
          />
        </div>
      )}

      <div className="rounded-lg bg-earth-50 border border-earth-200 px-3 py-2 text-xs text-gray-500 space-y-0.5">
        <p>
          Grid: {effectiveWidth} x {effectiveHeight} ft
        </p>
        <p>
          {totalSqft.toLocaleString()} sq ft ({totalAcres} acres)
        </p>
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-garden-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-garden-700 transition-colors cursor-pointer"
      >
        Create Yard
      </button>
    </form>
  );
}

export function YardEditor({
  yard,
  elements: initialElements,
  plants: allPlants,
  plantings: initialPlantings,
}: {
  yard: Yard;
  elements: Element[];
  plants: PlantInfo[];
  plantings: Planting[];
}) {
  const [elements, setElements] = React.useState(initialElements);
  const [bedPlantings, setBedPlantings] = React.useState(initialPlantings);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [activeTool, setActiveTool] = React.useState<ShapeType | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const [autoFitted, setAutoFitted] = React.useState(false);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dragRef = React.useRef<{
    elementId: number;
    startMouseX: number;
    startMouseY: number;
    startElX: number;
    startElY: number;
    moved: boolean;
  } | null>(null);
  const [dragPos, setDragPos] = React.useState<{ id: number; x: number; y: number } | null>(null);

  // Undo/redo
  const historyRef = React.useRef<Element[][]>([initialElements]);
  const historyIndexRef = React.useRef(0);

  function pushHistory(newElements: Element[]) {
    const idx = historyIndexRef.current;
    historyRef.current = [...historyRef.current.slice(0, idx + 1), newElements];
    historyIndexRef.current = idx + 1;
  }

  function undo() {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    const prev = historyRef.current[historyIndexRef.current];
    setElements(prev);
  }

  function redo() {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    const next = historyRef.current[historyIndexRef.current];
    setElements(next);
  }

  // Wrap setElements to push history
  function setElementsWithHistory(updater: (prev: Element[]) => Element[]) {
    setElements((prev) => {
      const next = updater(prev);
      pushHistory(next);
      return next;
    });
  }

  // Smart placement state
  const [smartPlaceMode, setSmartPlaceMode] = React.useState(false);
  const [smartPlacePlant, setSmartPlacePlant] = React.useState<PlantInfo | null>(null);
  const [bedScores, setBedScores] = React.useState<BedScore[]>([]);
  const [smartSearch, setSmartSearch] = React.useState("");

  const { addToast } = useToast();
  const confirm = useConfirm();

  const selected = elements.find((e) => e.id === selectedId) ?? null;

  // Compute companion glow when smart placing
  React.useEffect(() => {
    if (smartPlacePlant) {
      const scores = rankBedsForPlant(
        smartPlacePlant,
        elements.map((el) => ({ ...el, label: el.label })),
        bedPlantings,
        allPlants,
      );
      setBedScores(scores);
    } else {
      setBedScores([]);
    }
  }, [smartPlacePlant, elements, bedPlantings, allPlants]);

  // Keyboard shortcuts
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't interfere with input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      )
        return;

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedId) {
          e.preventDefault();
          handleDelete(selectedId);
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "d") {
        e.preventDefault();
        if (selectedId) handleDuplicate(selectedId);
      }
      if (selectedId && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const dx = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        const dy = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
        handleUpdateElement(selectedId, {
          x: String(Math.max(0, (elements.find((el) => el.id === selectedId)?.x ?? 0) + dx)),
          y: String(Math.max(0, (elements.find((el) => el.id === selectedId)?.y ?? 0) + dy)),
        });
      }
      if (e.key === "Escape") {
        setSelectedId(null);
        setActiveTool(null);
        setSmartPlaceMode(false);
        setSmartPlacePlant(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, elements]);

  async function handleDuplicate(id: number) {
    const el = elements.find((e) => e.id === id);
    if (!el) return;
    const formData = new FormData();
    formData.set("id", String(id));
    formData.set("yardId", String(yard.id));
    await duplicateYardElement(formData);
    const tempId = Date.now();
    const newEl = {
      ...el,
      id: tempId,
      x: Math.min(el.x + 1, yard.widthFt - el.width),
      y: Math.min(el.y + 1, yard.heightFt - el.height),
    };
    setElementsWithHistory((prev) => [...prev, newEl]);
    setSelectedId(tempId);
    addToast("Element duplicated", "success");
  }

  const gridWidth = yard.widthFt * CELL_SIZE;
  const gridHeight = yard.heightFt * CELL_SIZE;

  // Auto-fit zoom to container on mount
  React.useEffect(() => {
    if (autoFitted || !containerRef.current) return;
    const container = containerRef.current;
    const availableWidth = container.clientWidth - 32;
    const availableHeight = container.clientHeight - 32;
    const scaleX = availableWidth / gridWidth;
    const scaleY = availableHeight / gridHeight;
    const fitZoom = Math.min(scaleX, scaleY, 2);
    if (fitZoom > 0 && isFinite(fitZoom)) {
      setZoom(Math.round(fitZoom * 100) / 100);
    }
    setAutoFitted(true);
  }, [gridWidth, gridHeight, autoFitted]);

  function getSvgCoords(e: React.MouseEvent | MouseEvent) {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom,
    };
  }

  function handleElementMouseDown(e: React.MouseEvent, elementId: number) {
    if (activeTool) return; // don't drag while placing
    e.stopPropagation();
    e.preventDefault();
    const el = elements.find((el) => el.id === elementId);
    if (!el) return;
    const coords = getSvgCoords(e);
    dragRef.current = {
      elementId,
      startMouseX: coords.x,
      startMouseY: coords.y,
      startElX: el.x,
      startElY: el.y,
      moved: false,
    };
  }

  React.useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      const drag = dragRef.current;
      if (!drag || !svgRef.current) return;
      const coords = getSvgCoords(e);
      const dx = coords.x - drag.startMouseX;
      const dy = coords.y - drag.startMouseY;

      // Only start visual drag after moving at least 4px (prevents accidental drags)
      if (!drag.moved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
      drag.moved = true;

      const el = elements.find((el) => el.id === drag.elementId);
      if (!el) return;

      const newX = Math.max(
        0,
        Math.min(yard.widthFt - el.width, Math.round(drag.startElX + dx / CELL_SIZE)),
      );
      const newY = Math.max(
        0,
        Math.min(yard.heightFt - el.height, Math.round(drag.startElY + dy / CELL_SIZE)),
      );

      setDragPos({ id: drag.elementId, x: newX, y: newY });
    }

    function handleMouseUp() {
      const drag = dragRef.current;
      if (!drag) return;
      dragRef.current = null;

      if (drag.moved) {
        // Commit the drag position
        setDragPos((pos) => {
          if (pos && pos.id === drag.elementId) {
            // Update element in state and persist
            setElements((prev) =>
              prev.map((el) => (el.id === drag.elementId ? { ...el, x: pos.x, y: pos.y } : el)),
            );
            // Persist to server
            const formData = new FormData();
            formData.set("id", String(drag.elementId));
            formData.set("x", String(pos.x));
            formData.set("y", String(pos.y));
            updateYardElement(formData);
          }
          return null;
        });
      } else {
        // It was a click, not a drag — toggle selection
        setSelectedId((prev) => (prev === drag.elementId ? null : drag.elementId));
        setActiveTool(null);
      }
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [elements, yard.widthFt, yard.heightFt, zoom]);

  async function handleGridClick(e: React.MouseEvent<SVGSVGElement>) {
    if (!activeTool || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (CELL_SIZE * zoom));
    const y = Math.floor((e.clientY - rect.top) / (CELL_SIZE * zoom));

    const config = SHAPE_CONFIG[activeTool];
    const formData = new FormData();
    formData.set("yardId", String(yard.id));
    formData.set("shapeType", activeTool);
    formData.set("x", String(Math.min(x, yard.widthFt - config.defaultWidth)));
    formData.set("y", String(Math.min(y, yard.heightFt - config.defaultHeight)));
    formData.set("width", String(config.defaultWidth));
    formData.set("height", String(config.defaultHeight));
    formData.set("label", config.label);
    formData.set("sunExposure", "full_sun");

    await addYardElement(formData);
    setActiveTool(null);

    // Refetch is handled by RSC revalidation, but for now just add optimistically
    const tempId = Date.now();
    setElements((prev) => [
      ...prev,
      {
        id: tempId,
        yardId: yard.id,
        shapeType: activeTool,
        x: Math.min(x, yard.widthFt - config.defaultWidth),
        y: Math.min(y, yard.heightFt - config.defaultHeight),
        width: config.defaultWidth,
        height: config.defaultHeight,
        label: config.label,
        sunExposure: "full_sun",
        rotation: 0,
        metadata: null,
      },
    ]);
  }

  async function handleDelete(id: number) {
    const el = elements.find((e) => e.id === id);
    const elPlantings = bedPlantings.filter((p) => p.yardElementId === id);
    const label = el?.label || SHAPE_CONFIG[el?.shapeType as ShapeType]?.label || "element";
    const msg =
      elPlantings.length > 0
        ? `"${label}" has ${elPlantings.length} planting${elPlantings.length > 1 ? "s" : ""}. All plantings will be removed.`
        : `Remove "${label}" from your yard?`;
    const ok = await confirm({ title: "Delete bed?", message: msg, destructive: true });
    if (!ok) return;
    const formData = new FormData();
    formData.set("id", String(id));
    await deleteYardElement(formData);
    setElementsWithHistory((prev) => prev.filter((e) => e.id !== id));
    setSelectedId(null);
    addToast("Element deleted", "info");
  }

  async function handleUpdateElement(id: number, updates: Record<string, string>) {
    const formData = new FormData();
    formData.set("id", String(id));
    for (const [k, v] of Object.entries(updates)) {
      formData.set(k, v);
    }
    await updateYardElement(formData);
    setElements((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const updated = { ...e };
        if (updates.label !== undefined) updated.label = updates.label;
        if (updates.sunExposure !== undefined) updated.sunExposure = updates.sunExposure;
        if (updates.x !== undefined) updated.x = Number(updates.x);
        if (updates.y !== undefined) updated.y = Number(updates.y);
        if (updates.width !== undefined) updated.width = Number(updates.width);
        if (updates.height !== undefined) updated.height = Number(updates.height);
        if (updates.rotation !== undefined) updated.rotation = Number(updates.rotation);
        return updated;
      }),
    );
  }

  const [paletteOpen, setPaletteOpen] = React.useState(false);

  function fitToView() {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const availableWidth = container.clientWidth - 32;
    const availableHeight = container.clientHeight - 32;
    const scaleX = availableWidth / gridWidth;
    const scaleY = availableHeight / gridHeight;
    const fitZoom = Math.min(scaleX, scaleY, 2);
    if (fitZoom > 0 && isFinite(fitZoom)) {
      setZoom(Math.round(fitZoom * 100) / 100);
    }
  }

  return (
    <div className="relative" style={{ height: "calc(100vh - 120px)" }}>
      {/* Full-width grid area */}
      <div
        ref={containerRef}
        className="absolute inset-0 overflow-auto bg-white rounded-xl border border-earth-200 shadow-sm"
      >
        <div className="overflow-auto p-4 h-full flex items-center justify-center min-w-fit min-h-fit">
          <svg
            ref={svgRef}
            width={gridWidth * zoom}
            height={gridHeight * zoom}
            viewBox={`0 0 ${gridWidth} ${gridHeight}`}
            className={activeTool ? "cursor-crosshair" : "cursor-default"}
            onClick={handleGridClick}
            onMouseDown={(e) => {
              if (!activeTool && e.target === svgRef.current?.querySelector("rect:first-child")) {
                setSelectedId(null);
              }
            }}
          >
            <defs>
              <filter id="glow-green" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <rect width={gridWidth} height={gridHeight} fill="#f9fafb" />

            {Array.from({ length: yard.widthFt + 1 }, (_, i) => (
              <line
                key={`v-${i}`}
                x1={i * CELL_SIZE}
                y1={0}
                x2={i * CELL_SIZE}
                y2={gridHeight}
                stroke={i % 5 === 0 ? GRID_COLOR_MAJOR : GRID_COLOR}
                strokeWidth={i % 5 === 0 ? 1 : 0.5}
              />
            ))}
            {Array.from({ length: yard.heightFt + 1 }, (_, i) => (
              <line
                key={`h-${i}`}
                x1={0}
                y1={i * CELL_SIZE}
                x2={gridWidth}
                y2={i * CELL_SIZE}
                stroke={i % 5 === 0 ? GRID_COLOR_MAJOR : GRID_COLOR}
                strokeWidth={i % 5 === 0 ? 1 : 0.5}
              />
            ))}

            {Array.from({ length: Math.floor(yard.widthFt / 5) + 1 }, (_, i) => (
              <text key={`lx-${i}`} x={i * 5 * CELL_SIZE + 2} y={10} fontSize="8" fill="#9ca3af">
                {i * 5}ft
              </text>
            ))}
            {Array.from({ length: Math.floor(yard.heightFt / 5) + 1 }, (_, i) => (
              <text key={`ly-${i}`} x={2} y={i * 5 * CELL_SIZE + 10} fontSize="8" fill="#9ca3af">
                {i * 5}
              </text>
            ))}

            {elements.map((el) => {
              const pos = dragPos?.id === el.id ? dragPos : null;
              const displayEl = pos ? { ...el, x: pos.x, y: pos.y } : el;
              const bedScore = bedScores.find((s) => s.bedId === el.id);
              const glowColor = bedScore ? getGlowColor(bedScore) : null;
              return (
                <ShapeElement
                  key={el.id}
                  element={displayEl}
                  isSelected={el.id === selectedId}
                  isDragging={pos !== null}
                  onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                  glowColor={glowColor}
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Top bar overlay — yard name + zoom controls */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-earth-200 shadow-sm px-3 py-1.5 pointer-events-auto">
          <h1 className="text-sm font-semibold text-gray-900">{yard.name}</h1>
          <p className="text-[10px] text-gray-400">
            {yard.widthFt} x {yard.heightFt} ft
          </p>
        </div>
        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg border border-earth-200 shadow-sm px-1.5 py-1 pointer-events-auto">
          <button
            className="w-7 h-7 rounded-md hover:bg-gray-100 text-sm font-medium transition cursor-pointer flex items-center justify-center"
            onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
            title="Zoom out"
          >
            -
          </button>
          <span className="text-xs text-gray-500 w-10 text-center tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <button
            className="w-7 h-7 rounded-md hover:bg-gray-100 text-sm font-medium transition cursor-pointer flex items-center justify-center"
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
            title="Zoom in"
          >
            +
          </button>
          <div className="w-px h-4 bg-earth-200 mx-0.5" />
          <button
            className="w-7 h-7 rounded-md hover:bg-gray-100 transition cursor-pointer flex items-center justify-center"
            onClick={fitToView}
            title="Fit to view"
          >
            <svg
              className="w-3.5 h-3.5 text-gray-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Palette toggle + floating panel — bottom left */}
      <div className="absolute bottom-3 left-3 z-10">
        {paletteOpen ? (
          <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-earth-200 shadow-lg w-52 p-3 space-y-1.5 max-h-[calc(100vh-240px)] overflow-y-auto">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Place Element
              </p>
              <button
                type="button"
                className="p-0.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                onClick={() => setPaletteOpen(false)}
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            {SHAPE_TYPES.map((type) => {
              const config = SHAPE_CONFIG[type];
              const isActive = activeTool === type;
              return (
                <button
                  key={type}
                  className={`w-full text-left rounded-lg border px-2.5 py-1.5 text-sm transition cursor-pointer ${
                    isActive
                      ? "border-garden-500 bg-garden-50 text-garden-700 shadow-sm"
                      : "border-earth-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    setActiveTool(isActive ? null : type);
                    if (!isActive) setPaletteOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-sm shrink-0"
                      style={{
                        backgroundColor: config.color,
                        border: `1px solid ${config.borderColor}`,
                      }}
                    />
                    <span className="font-medium">{config.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <button
            type="button"
            className={`flex items-center gap-2 rounded-lg border shadow-sm px-3 py-2 text-sm font-medium transition cursor-pointer ${
              activeTool
                ? "border-garden-500 bg-garden-50 text-garden-700"
                : "border-earth-200 bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white"
            }`}
            onClick={() => setPaletteOpen(true)}
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            {activeTool ? SHAPE_CONFIG[activeTool].label : "Add Element"}
          </button>
        )}
      </div>

      {/* Smart Placement panel — bottom right */}
      <div className="absolute bottom-3 right-3 z-10">
        {smartPlaceMode ? (
          <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-earth-200 shadow-lg w-72 p-4 space-y-3 max-h-[calc(100vh-240px)] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Smart Place
              </h3>
              <button
                type="button"
                className="p-0.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                onClick={() => {
                  setSmartPlaceMode(false);
                  setSmartPlacePlant(null);
                  setSmartSearch("");
                }}
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <input
              type="text"
              value={smartSearch}
              onChange={(e) => setSmartSearch(e.target.value)}
              placeholder="Search for a plant..."
              className="w-full px-2.5 py-1.5 text-xs border border-earth-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-garden-500"
              autoFocus
            />
            {smartSearch && !smartPlacePlant && (
              <div className="max-h-32 overflow-y-auto space-y-0.5">
                {allPlants
                  .filter((p) => p.name.toLowerCase().includes(smartSearch.toLowerCase()))
                  .slice(0, 10)
                  .map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-garden-50 text-xs font-medium text-gray-900 cursor-pointer"
                      onClick={() => {
                        setSmartPlacePlant(p);
                        setSmartSearch(p.name);
                      }}
                    >
                      {p.name}
                      {p.variety ? ` (${p.variety})` : ""}
                    </button>
                  ))}
              </div>
            )}
            {smartPlacePlant && bedScores.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] text-gray-400">Best beds for {smartPlacePlant.name}:</p>
                {bedScores
                  .filter((s) => s.capacityRemaining > 0)
                  .slice(0, 5)
                  .map((score) => (
                    <div
                      key={score.bedId}
                      className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-earth-50 text-xs cursor-pointer hover:bg-earth-100"
                      onClick={() => {
                        setSelectedId(score.bedId);
                        setSmartPlaceMode(false);
                        setSmartPlacePlant(null);
                        setSmartSearch("");
                      }}
                    >
                      <div>
                        <span className="font-medium text-gray-900">
                          {score.bedLabel || `Bed #${score.bedId}`}
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          {score.companionCount > 0 && (
                            <span className="text-[10px] text-green-600">
                              {score.companionCount} companions
                            </span>
                          )}
                          {score.conflictCount > 0 && (
                            <span className="text-[10px] text-red-600">
                              {score.conflictCount} conflicts
                            </span>
                          )}
                          {score.sunMatch && (
                            <span className="text-[10px] text-gray-400">sun ok</span>
                          )}
                        </div>
                      </div>
                      <span
                        className={`text-xs font-semibold ${score.score >= 3 ? "text-green-600" : score.score >= 0 ? "text-amber-600" : "text-red-600"}`}
                      >
                        {score.score >= 0 ? "+" : ""}
                        {score.score}
                      </span>
                    </div>
                  ))}
                {bedScores.filter((s) => s.capacityRemaining > 0).length === 0 && (
                  <p className="text-[10px] text-gray-400 text-center py-2">All beds are full</p>
                )}
              </div>
            )}
          </div>
        ) : (
          !selected && (
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-garden-200 bg-garden-50/90 backdrop-blur-sm shadow-sm px-3 py-2 text-sm font-medium text-garden-700 hover:bg-garden-100 transition cursor-pointer"
              onClick={() => setSmartPlaceMode(true)}
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 12l2 2 4-4" />
                <circle cx="12" cy="12" r="10" />
              </svg>
              Smart Place
            </button>
          )
        )}
      </div>

      {/* Properties overlay — right side */}
      {selected && (
        <div className="absolute top-3 right-3 bottom-3 z-10 w-72 pointer-events-none">
          <div className="pointer-events-auto space-y-3 max-h-full overflow-y-auto">
            <PropertiesPanel
              element={selected}
              onUpdate={(updates) => handleUpdateElement(selected.id, updates)}
              onDelete={() => handleDelete(selected.id)}
              onClose={() => setSelectedId(null)}
            />
            {(SHAPE_CONFIG[selected.shapeType as ShapeType]?.plantable ?? false) && (
              <BedPlantingsPanel
                element={selected}
                plants={allPlants}
                plantings={bedPlantings.filter((p) => p.yardElementId === selected.id)}
                onAddPlanting={async (plantId, quantity) => {
                  const formData = new FormData();
                  formData.set("plantId", String(plantId));
                  formData.set("yardElementId", String(selected.id));
                  formData.set("quantity", String(quantity));
                  formData.set("status", "planned");
                  await addPlanting(formData);
                  const tempId = Date.now();
                  setBedPlantings((prev) => [
                    ...prev,
                    {
                      id: tempId,
                      plantId,
                      yardElementId: selected.id,
                      status: "planned",
                      quantity,
                      notes: null,
                      plantedDate: null,
                    },
                  ]);
                }}
                onUpdatePlanting={async (
                  plantingId,
                  updates: { status?: string; quantity?: number; notes?: string },
                ) => {
                  const formData = new FormData();
                  formData.set("id", String(plantingId));
                  if (updates.status != null) formData.set("status", updates.status);
                  if (updates.quantity != null) formData.set("quantity", String(updates.quantity));
                  if (updates.notes != null) formData.set("notes", updates.notes ?? "");
                  await updatePlanting(formData);
                  setBedPlantings((prev) =>
                    prev.map((p) => (p.id === plantingId ? { ...p, ...updates } : p)),
                  );
                }}
                onDeletePlanting={async (plantingId) => {
                  const ok = await confirm({
                    title: "Remove planting?",
                    message: "This cannot be undone.",
                    destructive: true,
                  });
                  if (!ok) return;
                  const formData = new FormData();
                  formData.set("id", String(plantingId));
                  await deletePlanting(formData);
                  setBedPlantings((prev) => prev.filter((p) => p.id !== plantingId));
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ShapeElement({
  element,
  isSelected,
  isDragging,
  onMouseDown,
  glowColor,
}: {
  element: Element;
  isSelected: boolean;
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  glowColor?: string | null;
}) {
  const config = SHAPE_CONFIG[element.shapeType as ShapeType] ?? SHAPE_CONFIG.rectangle;
  const x = element.x * CELL_SIZE;
  const y = element.y * CELL_SIZE;
  const w = element.width * CELL_SIZE;
  const h = element.height * CELL_SIZE;

  const isCircular = ["circle", "keyhole", "spiral", "mandala"].includes(element.shapeType);

  const rotation = element.rotation ?? 0;
  const cx = x + w / 2;
  const cy = y + h / 2;

  return (
    <g
      onMouseDown={onMouseDown}
      className={isDragging ? "cursor-grabbing" : "cursor-grab"}
      style={{ opacity: isDragging ? 0.7 : 1 }}
      transform={rotation !== 0 ? `rotate(${rotation}, ${cx}, ${cy})` : undefined}
    >
      {isCircular ? (
        <ellipse
          cx={x + w / 2}
          cy={y + h / 2}
          rx={w / 2}
          ry={h / 2}
          fill={config.color}
          stroke={isSelected ? "#2563eb" : config.borderColor}
          strokeWidth={isSelected ? 2 : 1}
          opacity={0.85}
        />
      ) : element.shapeType === "hugelkultur" ? (
        <path
          d={`M ${x} ${y + h} Q ${x + w * 0.25} ${y + h * 0.2}, ${x + w / 2} ${y} Q ${x + w * 0.75} ${y + h * 0.2}, ${x + w} ${y + h} Z`}
          fill={config.color}
          stroke={isSelected ? "#2563eb" : config.borderColor}
          strokeWidth={isSelected ? 2 : 1}
          opacity={0.85}
        />
      ) : (
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          rx={element.shapeType === "container" ? 6 : 2}
          fill={config.color}
          stroke={isSelected ? "#2563eb" : config.borderColor}
          strokeWidth={isSelected ? 2 : 1}
          opacity={0.85}
        />
      )}

      {/* Keyhole notch */}
      {element.shapeType === "keyhole" && (
        <>
          <rect
            x={x + w / 2 - CELL_SIZE * 0.5}
            y={y + h / 2}
            width={CELL_SIZE}
            height={h / 2}
            fill="#f9fafb"
            stroke={config.borderColor}
            strokeWidth={0.5}
          />
          <circle cx={x + w / 2} cy={y + h / 2} r={CELL_SIZE * 0.7} fill="#92400e" opacity={0.3} />
        </>
      )}

      {/* Water source indicator */}
      {element.shapeType === "water" && (
        <circle cx={x + w / 2} cy={y + h / 2} r={CELL_SIZE * 0.3} fill="#3b82f6" opacity={0.6} />
      )}

      {/* Label */}
      {element.label && (
        <text
          x={x + w / 2}
          y={y + h / 2 + (isCircular ? 0 : 4)}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={Math.min(11, w / (element.label.length * 0.7))}
          fill="#374151"
          fontWeight="500"
          pointerEvents="none"
        >
          {element.label}
        </text>
      )}

      {/* Companion glow */}
      {glowColor && (
        <rect
          x={x - 3}
          y={y - 3}
          width={w + 6}
          height={h + 6}
          fill="none"
          stroke={glowColor}
          strokeWidth={3}
          opacity={0.6}
          rx={6}
          filter="url(#glow-green)"
        />
      )}

      {/* Selection indicator */}
      {isSelected && (
        <rect
          x={x - 2}
          y={y - 2}
          width={w + 4}
          height={h + 4}
          fill="none"
          stroke="#2563eb"
          strokeWidth={1}
          strokeDasharray="4 2"
          rx={4}
        />
      )}
    </g>
  );
}

function PropertiesPanel({
  element,
  onUpdate,
  onDelete,
  onClose,
}: {
  element: Element;
  onUpdate: (updates: Record<string, string>) => void;
  onDelete: () => void;
  onClose?: () => void;
}) {
  const config = SHAPE_CONFIG[element.shapeType as ShapeType] ?? SHAPE_CONFIG.rectangle;

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-earth-200 shadow-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: config.color, border: `1px solid ${config.borderColor}` }}
          />
          <h3 className="text-sm font-semibold text-gray-900">{config.label}</h3>
        </div>
        {onClose && (
          <button
            type="button"
            className="p-0.5 text-gray-400 hover:text-gray-600 cursor-pointer"
            onClick={onClose}
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Label</label>
        <input
          className="w-full rounded-lg border border-earth-200 bg-white px-2.5 py-1.5 text-sm focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition"
          type="text"
          defaultValue={element.label ?? ""}
          onBlur={(e) => onUpdate({ label: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Sun Exposure</label>
        <select
          className="w-full rounded-lg border border-earth-200 bg-white px-2.5 py-1.5 text-sm focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition"
          defaultValue={element.sunExposure ?? "full_sun"}
          onChange={(e) => onUpdate({ sunExposure: e.target.value })}
        >
          <option value="full_sun">Full Sun</option>
          <option value="partial_shade">Partial Shade</option>
          <option value="full_shade">Full Shade</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Rotation</label>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex-1 px-2 py-1.5 text-xs font-medium rounded-lg border border-earth-200 bg-white hover:bg-gray-50 transition cursor-pointer"
            onClick={() =>
              onUpdate({ rotation: String(((element.rotation ?? 0) - 45 + 360) % 360) })
            }
            title="Rotate 45° left"
          >
            <svg
              className="w-3.5 h-3.5 mx-auto"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2.5 2v6h6" />
              <path d="M2.51 8A10 10 0 0 1 21 12" />
            </svg>
          </button>
          <span className="flex-1 text-center text-sm font-medium text-gray-700">
            {element.rotation ?? 0}°
          </span>
          <button
            type="button"
            className="flex-1 px-2 py-1.5 text-xs font-medium rounded-lg border border-earth-200 bg-white hover:bg-gray-50 transition cursor-pointer"
            onClick={() => onUpdate({ rotation: String(((element.rotation ?? 0) + 45) % 360) })}
            title="Rotate 45° right"
          >
            <svg
              className="w-3.5 h-3.5 mx-auto"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.5 2v6h-6" />
              <path d="M21.49 8A10 10 0 0 0 3 12" />
            </svg>
          </button>
        </div>
        <div className="flex gap-1 mt-1.5">
          {[0, 90, 180, 270].map((deg) => (
            <button
              key={deg}
              type="button"
              className={`flex-1 px-1 py-1 text-xs rounded-md border transition cursor-pointer ${
                (element.rotation ?? 0) === deg
                  ? "border-garden-500 bg-garden-50 text-garden-700 font-medium"
                  : "border-earth-200 bg-white text-gray-500 hover:bg-gray-50"
              }`}
              onClick={() => onUpdate({ rotation: String(deg) })}
            >
              {deg}°
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Width (ft)</label>
          <input
            className="w-full rounded-lg border border-earth-200 bg-white px-2.5 py-1.5 text-sm focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition"
            type="number"
            min="1"
            defaultValue={element.width}
            onBlur={(e) => onUpdate({ width: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Height (ft)</label>
          <input
            className="w-full rounded-lg border border-earth-200 bg-white px-2.5 py-1.5 text-sm focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition"
            type="number"
            min="1"
            defaultValue={element.height}
            onBlur={(e) => onUpdate({ height: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">X (ft)</label>
          <input
            className="w-full rounded-lg border border-earth-200 bg-white px-2.5 py-1.5 text-sm focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition"
            type="number"
            min="0"
            defaultValue={element.x}
            onBlur={(e) => onUpdate({ x: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Y (ft)</label>
          <input
            className="w-full rounded-lg border border-earth-200 bg-white px-2.5 py-1.5 text-sm focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition"
            type="number"
            min="0"
            defaultValue={element.y}
            onBlur={(e) => onUpdate({ y: e.target.value })}
          />
        </div>
      </div>

      <div className="text-xs text-gray-400 space-y-1">
        <p>
          Position: ({element.x}, {element.y})
        </p>
        <p>
          Size: {element.width} x {element.height} ft
        </p>
        <p>Area: ~{Math.round(element.width * element.height)} sq ft</p>
      </div>

      <button
        className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 transition cursor-pointer"
        onClick={onDelete}
      >
        Delete Element
      </button>
    </div>
  );
}

const STATUS_ORDER = [
  "planned",
  "seeded",
  "sprouted",
  "transplanted",
  "growing",
  "harvesting",
  "done",
];

const STATUS_LABELS: Record<string, string> = {
  planned: "Planned",
  seeded: "Seeded",
  sprouted: "Sprouted",
  transplanted: "Transplanted",
  growing: "Growing",
  harvesting: "Harvesting",
  done: "Done",
};

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  planned: { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-400" },
  seeded: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  sprouted: { bg: "bg-lime-50", text: "text-lime-700", dot: "bg-lime-400" },
  transplanted: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
  growing: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  harvesting: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400" },
  done: { bg: "bg-earth-100", text: "text-earth-600", dot: "bg-earth-400" },
};

function BedPlantingsPanel({
  element,
  plants,
  plantings,
  onAddPlanting,
  onUpdatePlanting,
  onDeletePlanting,
}: {
  element: Element;
  plants: PlantInfo[];
  plantings: Planting[];
  onAddPlanting: (plantId: number, quantity: number) => Promise<void>;
  onUpdatePlanting: (
    plantingId: number,
    updates: { status?: string; quantity?: number; notes?: string },
  ) => Promise<void>;
  onDeletePlanting: (plantingId: number) => Promise<void>;
}) {
  const [search, setSearch] = React.useState("");
  const [adding, setAdding] = React.useState(false);
  const [editingPlanting, setEditingPlanting] = React.useState<Planting | null>(null);
  const { addToast } = useToast();

  const bedArea = getShapeArea(element.shapeType, element.width, element.height);
  const bedAreaSqIn = bedArea * 144;

  // Calculate capacity
  const usedSqIn = plantings.reduce((sum, p) => {
    const plant = plants.find((pl) => pl.id === p.plantId);
    const spacing = plant?.spacingInches ?? 12;
    return sum + (p.quantity ?? 1) * spacing * spacing;
  }, 0);
  const capacityPercent =
    bedAreaSqIn > 0 ? Math.min(100, Math.round((usedSqIn / bedAreaSqIn) * 100)) : 0;

  function maxFit(spacingInches: number) {
    const remainingSqIn = bedAreaSqIn - usedSqIn;
    if (remainingSqIn <= 0) return 0;
    return Math.max(0, Math.floor(remainingSqIn / (spacingInches * spacingInches)));
  }

  const filtered =
    search.length > 0
      ? plants.filter(
          (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.variety?.toLowerCase().includes(search.toLowerCase()) ?? false),
        )
      : [];

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-earth-200 shadow-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Plantings</h3>
        <span className="text-xs text-gray-500">~{Math.round(bedArea)} sq ft</span>
      </div>

      {/* Capacity bar */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-500">Capacity</span>
          <span
            className="font-medium"
            style={{
              color:
                capacityPercent > 90 ? "#ef4444" : capacityPercent > 70 ? "#f59e0b" : "#22c55e",
            }}
          >
            {capacityPercent}%
          </span>
        </div>
        <div className="h-1.5 bg-earth-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${capacityPercent}%`,
              backgroundColor:
                capacityPercent > 90 ? "#ef4444" : capacityPercent > 70 ? "#f59e0b" : "#22c55e",
            }}
          />
        </div>
      </div>

      {/* Current plantings */}
      {plantings.length > 0 && (
        <div className="space-y-1.5">
          {plantings.map((p) => {
            const plant = plants.find((pl) => pl.id === p.plantId);
            const status = p.status ?? "planned";
            const colors = STATUS_COLORS[status] ?? STATUS_COLORS.planned;

            return (
              <button
                key={p.id}
                type="button"
                className="w-full flex items-center gap-2 px-2 py-1.5 bg-earth-50 rounded-lg hover:bg-earth-100 transition-colors cursor-pointer text-left"
                onClick={() => setEditingPlanting(p)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-gray-900 truncate">
                      {plant?.name ?? "Unknown"}
                    </span>
                    <span className="text-xs text-gray-400">x{p.quantity ?? 1}</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${colors.bg} ${colors.text}`}
                  >
                    <span className={`w-1 h-1 rounded-full ${colors.dot}`} />
                    {STATUS_LABELS[status]}
                  </span>
                </div>
                <svg
                  className="w-3.5 h-3.5 text-gray-400 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            );
          })}
        </div>
      )}

      {/* Add plant */}
      {!adding ? (
        <button
          type="button"
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-garden-700 bg-garden-50 hover:bg-garden-100 rounded-lg transition cursor-pointer"
          onClick={() => setAdding(true)}
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
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Plant
        </button>
      ) : (
        <div>
          <div className="flex items-center gap-1 mb-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plants..."
              autoFocus
              className="flex-1 px-2.5 py-1.5 text-xs border border-earth-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
            />
            <button
              type="button"
              className="p-1.5 text-gray-400 hover:text-gray-600"
              onClick={() => {
                setAdding(false);
                setSearch("");
              }}
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
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {search.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-0.5">
              {filtered.slice(0, 15).map((plant) => {
                const fits = maxFit(plant.spacingInches ?? 12);
                const suggested = Math.max(1, Math.min(fits, 10));

                return (
                  <button
                    key={plant.id}
                    type="button"
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-garden-50 transition-colors flex items-center justify-between gap-1"
                    onClick={async () => {
                      // Check for companion conflicts
                      const existingPlantNames = plantings
                        .map((p) => plants.find((pl) => pl.id === p.plantId)?.name)
                        .filter(Boolean) as string[];
                      const conflicts = checkCompanionConflicts(
                        {
                          name: plant.name,
                          companions: plant.companions as string[] | null,
                          incompatible: plant.incompatible as string[] | null,
                        },
                        existingPlantNames.map((n) => {
                          const pl = plants.find((p) => p.name === n);
                          return {
                            name: n,
                            companions: (pl?.companions ?? null) as string[] | null,
                            incompatible: (pl?.incompatible ?? null) as string[] | null,
                          };
                        }),
                      );
                      if (conflicts.conflicts.length > 0) {
                        addToast(
                          `Warning: ${plant.name} conflicts with ${conflicts.conflicts.join(", ")}`,
                          "warning",
                        );
                      }
                      await onAddPlanting(plant.id, suggested);
                      setSearch("");
                      setAdding(false);
                    }}
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-gray-900 truncate block">
                        {plant.name}
                        {plant.variety && (
                          <span className="font-normal text-gray-400"> ({plant.variety})</span>
                        )}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {plant.spacingInches}" spacing &middot; {plant.daysToHarvest}d harvest
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-medium text-garden-700">Fits {fits}</span>
                    </div>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <p className="text-[10px] text-gray-400 text-center py-3">No plants found</p>
              )}
            </div>
          )}
        </div>
      )}

      {plantings.length === 0 && !adding && (
        <p className="text-[10px] text-gray-400 text-center">No plants in this bed yet</p>
      )}

      {/* Edit planting modal */}
      {editingPlanting && (
        <EditPlantingModal
          planting={editingPlanting}
          plant={plants.find((pl) => pl.id === editingPlanting.plantId) ?? null}
          onSave={async (updates) => {
            await onUpdatePlanting(editingPlanting.id, updates);
            setEditingPlanting(null);
          }}
          onDelete={async () => {
            await onDeletePlanting(editingPlanting.id);
            setEditingPlanting(null);
          }}
          onClose={() => setEditingPlanting(null)}
        />
      )}
    </div>
  );
}

function EditPlantingModal({
  planting,
  plant,
  onSave,
  onDelete,
  onClose,
}: {
  planting: Planting;
  plant: PlantInfo | null;
  onSave: (updates: { status?: string; quantity?: number; notes?: string }) => Promise<void>;
  onDelete: () => Promise<void>;
  onClose: () => void;
}) {
  const [status, setStatus] = React.useState(planting.status ?? "planned");
  const [quantity, setQuantity] = React.useState(planting.quantity ?? 1);
  const [notes, setNotes] = React.useState(planting.notes ?? "");
  const [saving, setSaving] = React.useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl border border-earth-200 w-80 max-w-[90vw] p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {plant?.name ?? "Unknown Plant"}
            </h3>
            {plant?.variety && <p className="text-xs text-gray-400">{plant.variety}</p>}
          </div>
          <button
            type="button"
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition cursor-pointer"
            onClick={onClose}
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
          <div className="flex flex-wrap gap-1">
            {STATUS_ORDER.map((s) => {
              const colors = STATUS_COLORS[s] ?? STATUS_COLORS.planned;
              const isActive = status === s;
              return (
                <button
                  key={s}
                  type="button"
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium transition cursor-pointer ${
                    isActive
                      ? `${colors.bg} ${colors.text} ring-1 ring-current`
                      : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                  }`}
                  onClick={() => setStatus(s)}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isActive ? colors.dot : "bg-gray-300"}`}
                  />
                  {STATUS_LABELS[s]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Quantity</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="w-8 h-8 rounded-lg border border-earth-200 bg-white hover:bg-gray-50 text-sm font-medium transition cursor-pointer flex items-center justify-center"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-16 text-center rounded-lg border border-earth-200 px-2 py-1.5 text-sm focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition"
            />
            <button
              type="button"
              className="w-8 h-8 rounded-lg border border-earth-200 bg-white hover:bg-gray-50 text-sm font-medium transition cursor-pointer flex items-center justify-center"
              onClick={() => setQuantity((q) => q + 1)}
            >
              +
            </button>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes..."
            rows={2}
            className="w-full rounded-lg border border-earth-200 px-2.5 py-1.5 text-sm focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20 focus:outline-none transition resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            className="flex-1 rounded-lg bg-garden-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-garden-700 transition cursor-pointer disabled:opacity-50"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              await onSave({ status, quantity, notes: notes || undefined });
              setSaving(false);
            }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            className="rounded-lg border border-earth-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100 transition cursor-pointer"
            title="Delete planting"
            onClick={async () => {
              setSaving(true);
              await onDelete();
            }}
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </button>
        </div>

        {/* Info */}
        {plant && (
          <div className="text-[10px] text-gray-400 border-t border-earth-100 pt-2 space-y-0.5">
            {plant.spacingInches && <p>Spacing: {plant.spacingInches}" apart</p>}
            {plant.daysToHarvest && <p>Days to harvest: {plant.daysToHarvest}</p>}
            {planting.plantedDate && <p>Planted: {planting.plantedDate}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
