import type { IconRenderer } from "./types";

export const BeetIcon: IconRenderer = () => (
  <>
      <circle cx="12" cy="14" r="5.5" fill="currentColor" />
      <path d="M12 8.5c0-2-.5-4-2-5" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path d="M12 8.5c0-2 .5-4 2-5" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path d="M12 19.5c0 1-.2 2-.5 2.5" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" />
  </>
);
