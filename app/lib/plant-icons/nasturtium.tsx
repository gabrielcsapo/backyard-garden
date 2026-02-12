import type { IconRenderer } from "./types";

export const NasturtiumIcon: IconRenderer = () => (
  <>
      <circle cx="12" cy="10" r="6" fill="currentColor" opacity="0.7" />
      <path d="M12 22V16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="12" cy="10" r="1.5" fill="currentColor" />
      <path d="M12 16c0-2-3-3-6-4" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.4" />
      <path d="M12 16c0-2 3-3 6-4" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.4" />
  </>
);
