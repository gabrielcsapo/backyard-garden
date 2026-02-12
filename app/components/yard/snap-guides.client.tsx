"use client";

import type { Guide } from "../../lib/use-snap-guides.ts";

export function SnapGuides({ guides }: { guides: Guide[] }) {
  if (guides.length === 0) return null;
  return (
    <g className="pointer-events-none">
      {guides.map((guide, i) =>
        guide.axis === "x" ? (
          <line
            key={i}
            x1={guide.position}
            y1={guide.from}
            x2={guide.position}
            y2={guide.to}
            stroke="#2563eb"
            strokeWidth={0.5}
            strokeDasharray="4 2"
          />
        ) : (
          <line
            key={i}
            x1={guide.from}
            y1={guide.position}
            x2={guide.to}
            y2={guide.position}
            stroke="#2563eb"
            strokeWidth={0.5}
            strokeDasharray="4 2"
          />
        ),
      )}
    </g>
  );
}
