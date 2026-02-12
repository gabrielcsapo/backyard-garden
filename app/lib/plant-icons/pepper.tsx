import type { IconRenderer } from "./types";

export const PepperIcon: IconRenderer = () => (
  <>
      <path
        d="M10 5c0-1 1-2 2-2s2 1 2 2"
        stroke="currentColor"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M8 7c0-1 1.5-2 4-2s4 1 4 2l-1 6c-.3 2.5-1 5-3 5s-2.7-2.5-3-5z"
        fill="currentColor"
      />
      <line
        x1="12"
        y1="7"
        x2="12"
        y2="5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
  </>
);
