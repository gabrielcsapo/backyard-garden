import type { IconRenderer } from "./types";

export const PumpkinIcon: IconRenderer = () => (
  <>
      <path
        d="M6 13c0-4 2.5-7 6-7s6 3 6 7-2.5 7-6 7-6-3-6-7z"
        fill="currentColor"
      />
      <path
        d="M12 6c-1-1.5-1-3 0-4"
        stroke="currentColor"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />
      <line
        x1="12"
        y1="6"
        x2="12"
        y2="20"
        stroke="currentColor"
        strokeWidth="0.6"
        opacity="0.25"
      />
      <path
        d="M8 8c1 0 2 1 4 1s3-1 4-1"
        stroke="currentColor"
        strokeWidth="0.6"
        opacity="0.25"
        fill="none"
      />
  </>
);
