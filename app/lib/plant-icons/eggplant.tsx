import type { IconRenderer } from "./types";

export const EggplantIcon: IconRenderer = () => (
  <>
      <path
        d="M10 4c.5-1 1.5-1.5 2-1.5.5 0 1.5.5 2 1.5"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M9 8a5 8 0 0 1 3-4 5 8 0 0 1 3 4c.5 3 .2 6-1 9-.5 1.2-1.2 2-2 2s-1.5-.8-2-2c-1.2-3-1.5-6-1-9z"
        fill="currentColor"
      />
      <ellipse cx="12" cy="6" rx="2.5" ry="1" fill="currentColor" />
  </>
);
