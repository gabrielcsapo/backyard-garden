import type { IconRenderer } from "./types";

export const TomatoIcon: IconRenderer = () => (
  <>
      <circle cx="12" cy="14" r="6.5" fill="currentColor" opacity="0.9" />
      <path
        d="M12 7.5c-1.5-1.5-3.5-1-3-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M12 7.5c1.5-1.5 3.5-1 3-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M9 8.5c1 .5 2 .8 3 .5 1 .3 2 0 3-.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
  </>
);
