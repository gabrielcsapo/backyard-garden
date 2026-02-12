import type { IconRenderer } from "./types";

export const CollardGreensIcon: IconRenderer = () => (
  <>
      <path d="M12 22V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="12" cy="7" rx="7" ry="5" fill="currentColor" />
      <line x1="12" y1="2" x2="12" y2="10" stroke="currentColor" strokeWidth="0.8" opacity="0.25" />
      <path d="M12 14c-2.5 0-5-1-5-3" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M12 14c2.5 0 5-1 5-3" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.5" />
  </>
);
