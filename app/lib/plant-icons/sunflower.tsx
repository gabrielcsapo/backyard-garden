import type { IconRenderer } from "./types";

export const SunflowerIcon: IconRenderer = () => (
  <>
      <circle cx="12" cy="9" r="3" fill="currentColor" />
      <path d="M12 6V3M12 12v2M9 9H5.5M15 9h3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M9.9 6.9L7.5 4.5M14.1 6.9l2.4-2.4M9.9 11.1L7.5 13.5M14.1 11.1l2.4 2.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="14" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 17c-2-1-4-1-5.5 0" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
  </>
);
