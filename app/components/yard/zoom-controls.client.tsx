"use client";

export function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onFitView,
  onFillView,
}: {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onFillView?: () => void;
}) {
  return (
    <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-earth-200 dark:border-gray-700 shadow-sm px-1.5 py-1">
      <button
        className="w-7 h-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium transition cursor-pointer flex items-center justify-center text-gray-700 dark:text-gray-300"
        onClick={onZoomOut}
        title="Zoom out"
      >
        -
      </button>
      <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-center tabular-nums">
        {Math.round(zoom * 100)}%
      </span>
      <button
        className="w-7 h-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium transition cursor-pointer flex items-center justify-center text-gray-700 dark:text-gray-300"
        onClick={onZoomIn}
        title="Zoom in"
      >
        +
      </button>
      <div className="w-px h-4 bg-earth-200 dark:bg-gray-600 mx-0.5" />
      <button
        className="w-7 h-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer flex items-center justify-center"
        onClick={onFitView}
        title="Fit to view"
      >
        <svg className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
        </svg>
      </button>
      {onFillView && (
        <button
          className="w-7 h-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer flex items-center justify-center"
          onClick={onFillView}
          title="Fill viewport"
        >
          <svg className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />
          </svg>
        </button>
      )}
    </div>
  );
}
