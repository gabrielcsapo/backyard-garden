import type { IconRenderer } from "./types";

export const SpinachIcon: IconRenderer = () => (
  <>
      <path d="M12 22V10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M12 10c-3 0-6-2-6-4 0-2.5 3-4 6-4s6 1.5 6 4c0 2-3 4-6 4z" fill="currentColor" />
      <line x1="12" y1="2" x2="12" y2="10" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
  </>
);
