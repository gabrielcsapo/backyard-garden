import React from "react";

type PanZoomState = {
  zoom: number;
  viewX: number;
  viewY: number;
};

export function usePanZoom(
  svgRef: React.RefObject<SVGSVGElement | null>,
  containerRef: React.RefObject<HTMLDivElement | null>,
  gridWidth: number,
  gridHeight: number,
) {
  const [state, setState] = React.useState<PanZoomState>({
    zoom: 1,
    viewX: 0,
    viewY: 0,
  });

  const [containerSize, setContainerSize] = React.useState<{
    width: number;
    height: number;
  } | null>(null);

  const panRef = React.useRef<{
    clientX: number;
    clientY: number;
    startViewX: number;
    startViewY: number;
  } | null>(null);

  // Track container size
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        setContainerSize({ width, height });
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Base view dimensions at zoom=1: contains full grid, matches container aspect ratio
  const containerAspect = containerSize
    ? containerSize.width / containerSize.height
    : gridWidth / gridHeight;
  const gridAspect = gridWidth / gridHeight;

  let baseViewWidth: number;
  let baseViewHeight: number;
  if (containerAspect > gridAspect) {
    baseViewHeight = gridHeight;
    baseViewWidth = gridHeight * containerAspect;
  } else {
    baseViewWidth = gridWidth;
    baseViewHeight = gridWidth / containerAspect;
  }

  // Ref for stale-closure-safe access to base dimensions
  const baseDimsRef = React.useRef({ w: baseViewWidth, h: baseViewHeight });
  baseDimsRef.current = { w: baseViewWidth, h: baseViewHeight };

  // Fill zoom: minimum zoom where the grid fills the viewport edge-to-edge (no dead space)
  const fillZoom = Math.min(5, Math.max(baseViewWidth / gridWidth, baseViewHeight / gridHeight));
  const fillZoomRef = React.useRef(fillZoom);
  fillZoomRef.current = fillZoom;

  // Effective zoom: never below fillZoom so the grid always fills the screen
  const effectiveZoom = Math.max(state.zoom, fillZoom);
  const viewWidth = baseViewWidth / effectiveZoom;
  const viewHeight = baseViewHeight / effectiveZoom;
  const viewBox = `${state.viewX} ${state.viewY} ${viewWidth} ${viewHeight}`;

  // Clamp: constrain view to grid bounds (grid always fills viewport at fillZoom+)
  function clamp(s: PanZoomState): PanZoomState {
    const { w: bw, h: bh } = baseDimsRef.current;
    const minZ = fillZoomRef.current;
    const z = Math.max(s.zoom, minZ);
    const vw = bw / z;
    const vh = bh / z;
    return {
      zoom: z,
      viewX: vw >= gridWidth ? 0 : Math.max(0, Math.min(gridWidth - vw, s.viewX)),
      viewY: vh >= gridHeight ? 0 : Math.max(0, Math.min(gridHeight - vh, s.viewY)),
    };
  }

  // Re-clamp when container size changes (fillZoom may have changed)
  React.useEffect(() => {
    if (containerSize) {
      setState((prev) => clamp(prev));
    }
  }, [containerSize]);

  function getSvgCoords(e: MouseEvent | React.MouseEvent): { x: number; y: number } {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const svgPt = pt.matrixTransform(ctm.inverse());
    return { x: svgPt.x, y: svgPt.y };
  }

  function fitToView() {
    const minZ = fillZoomRef.current;
    const { w: bw, h: bh } = baseDimsRef.current;
    const vw = bw / minZ;
    const vh = bh / minZ;
    setState(clamp({ zoom: minZ, viewX: (gridWidth - vw) / 2, viewY: (gridHeight - vh) / 2 }));
  }

  function fillView() {
    fitToView();
  }

  // Wheel zoom at cursor
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      const svg = svgRef.current;
      if (!svg) return;

      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const svgPt = pt.matrixTransform(ctm.inverse());

      setState((prev) => {
        const { w: bw, h: bh } = baseDimsRef.current;
        const minZ = fillZoomRef.current;
        const zoomFactor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
        const newZoom = Math.max(minZ, Math.min(5, prev.zoom * zoomFactor));
        const newViewWidth = bw / newZoom;
        const newViewHeight = bh / newZoom;

        const rect = svg.getBoundingClientRect();
        const fracX = (e.clientX - rect.left) / rect.width;
        const fracY = (e.clientY - rect.top) / rect.height;
        const newViewX = svgPt.x - fracX * newViewWidth;
        const newViewY = svgPt.y - fracY * newViewHeight;

        return clamp({ zoom: newZoom, viewX: newViewX, viewY: newViewY });
      });
    }

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [gridWidth, gridHeight]);

  function startPan(e: MouseEvent | React.MouseEvent) {
    panRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startViewX: state.viewX,
      startViewY: state.viewY,
    };
  }

  function onPanMove(e: MouseEvent) {
    const start = panRef.current;
    if (!start) return;
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();

    setState((prev) => {
      const { w: bw, h: bh } = baseDimsRef.current;
      const currentViewWidth = bw / Math.max(prev.zoom, fillZoomRef.current);
      const currentViewHeight = bh / Math.max(prev.zoom, fillZoomRef.current);
      const dxSvg = ((e.clientX - start.clientX) / rect.width) * currentViewWidth;
      const dySvg = ((e.clientY - start.clientY) / rect.height) * currentViewHeight;
      return clamp({
        ...prev,
        viewX: start.startViewX - dxSvg,
        viewY: start.startViewY - dySvg,
      });
    });
  }

  function endPan() {
    panRef.current = null;
  }

  const isPanning = panRef.current !== null;

  return {
    zoom: effectiveZoom,
    viewX: state.viewX,
    viewY: state.viewY,
    viewBox,
    viewWidth,
    viewHeight,
    getSvgCoords,
    fitToView,
    fillView,
    setZoom: (zoom: number) =>
      setState((prev) => {
        const { w: bw, h: bh } = baseDimsRef.current;
        const effPrev = Math.max(prev.zoom, fillZoomRef.current);
        const newViewWidth = bw / zoom;
        const newViewHeight = bh / zoom;
        const oldViewWidth = bw / effPrev;
        const oldViewHeight = bh / effPrev;
        return clamp({
          zoom,
          viewX: prev.viewX + (oldViewWidth - newViewWidth) / 2,
          viewY: prev.viewY + (oldViewHeight - newViewHeight) / 2,
        });
      }),
    setView: (viewX: number, viewY: number) =>
      setState((prev) => clamp({ ...prev, viewX, viewY })),
    startPan,
    onPanMove,
    endPan,
    isPanning,
  };
}
