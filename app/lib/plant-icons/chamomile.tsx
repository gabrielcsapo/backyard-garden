import type { IconRenderer } from "./types";

export const ChamomileIcon: IconRenderer = () => (
  <>
      <circle cx="12" cy="10" r="2" fill="currentColor" />
      <path d="M12 8l0-3M12 12l0 3M10 10l-3 0M14 10l3 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10.5 8.5l-2-2M13.5 8.5l2-2M10.5 11.5l-2 2M13.5 11.5l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="15" x2="12" y2="22" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </>
);
