import type { IconRenderer } from "./types";

export const FennelIcon: IconRenderer = () => (
  <>
      <ellipse cx="12" cy="17" rx="4" ry="3.5" fill="currentColor" />
      <path d="M12 13.5V6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M12 8c-2-2-4-3.5-5-2" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M12 8c2-2 4-3.5 5-2" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M12 5c-1.5-1.5-3-2.5-4-1.5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M12 5c1.5-1.5 3-2.5 4-1.5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
  </>
);
