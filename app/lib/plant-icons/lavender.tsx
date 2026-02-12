import type { IconRenderer } from "./types";

export const LavenderIcon: IconRenderer = () => (
  <>
      <line x1="12" y1="22" x2="12" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="12" cy="9" rx="2" ry="1.2" fill="currentColor" />
      <ellipse cx="12" cy="7" rx="2.2" ry="1.3" fill="currentColor" />
      <ellipse cx="12" cy="5" rx="2" ry="1.2" fill="currentColor" />
      <ellipse cx="12" cy="3.5" rx="1.5" ry="1" fill="currentColor" />
      <path d="M12 16c-2-.5-4-1-5 0" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M12 16c2-.5 4-1 5 0" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" />
  </>
);
