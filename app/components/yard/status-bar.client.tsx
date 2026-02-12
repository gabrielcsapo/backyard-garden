"use client";

import React from "react";
import { SHAPE_CONFIG } from "../../lib/shapes.ts";
import type { ShapeType } from "../../lib/shapes.ts";
import type { Yard, YardElement } from "../../lib/yard-types.ts";
import { CELL_SIZE } from "../../lib/yard-types.ts";

export function StatusBar({
  cursorRef,
  selectedElement,
  zoom,
  yard,
  onSettings,
}: {
  cursorRef: React.RefObject<HTMLSpanElement | null>;
  selectedElement: YardElement | null;
  zoom: number;
  yard: Yard;
  onSettings?: () => void;
}) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-t border-earth-200 dark:border-gray-700 flex items-center px-3 text-[11px] text-gray-500 dark:text-gray-400 font-mono z-20 select-none gap-4">
      <span ref={cursorRef} className="min-w-[100px]">
        --, -- ft
      </span>
      <span className="h-3 w-px bg-earth-200 dark:bg-gray-600" />
      {selectedElement && (
        <>
          <span className="truncate">
            {SHAPE_CONFIG[selectedElement.shapeType as ShapeType]?.label ?? selectedElement.shapeType}
            {selectedElement.label ? ` "${selectedElement.label}"` : ""}
            {" "}({selectedElement.width}x{selectedElement.height} ft)
          </span>
          <span className="h-3 w-px bg-earth-200 dark:bg-gray-600" />
        </>
      )}
      <span>{Math.round(zoom * 100)}%</span>
      <span className="h-3 w-px bg-earth-200 dark:bg-gray-600" />
      <button
        type="button"
        className="inline-flex items-center gap-1.5 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
        title="Yard settings"
        onClick={onSettings}
      >
        <span>{yard.name}</span>
        <span className="text-gray-400 dark:text-gray-500">·</span>
        <span>{yard.widthFt} x {yard.heightFt} ft</span>
        <svg className="w-3 h-3 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
    </div>
  );
}

export function updateCursorDisplay(
  ref: React.RefObject<HTMLSpanElement | null>,
  x: number,
  y: number,
) {
  if (ref.current) {
    ref.current.textContent = `${(x / CELL_SIZE).toFixed(1)}, ${(y / CELL_SIZE).toFixed(1)} ft`;
  }
}
