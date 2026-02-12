import type { IconRenderer } from "./types";

export const DahliaIcon: IconRenderer = () => (
  <>
      <circle cx="12" cy="9" r="2" fill="currentColor" />
      <path d="M12 5.5l-.8-3M12 12.5l.8 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8.5 9H5M15.5 9h3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9.5 6.5l-2-2M14.5 11.5l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14.5 6.5l2-2M9.5 11.5l-2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 7l-2-1M14 11l2 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 7l2-1M10 11l-2 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="14" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </>
);
