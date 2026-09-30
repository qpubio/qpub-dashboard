import { HISTORY_WINDOW_MS } from "@/lib/metrics/history";

export type ChartToken =
  | "--chart-1"
  | "--chart-2"
  | "--chart-3"
  | "--chart-4"
  | "--chart-5"
  | "--chart-6";

/** Lit LED square size in CSS pixels. */
export const LED_CELL = 2;
/** Dark gutter between diodes. */
export const LED_GAP = 1;
export const LED_PITCH = LED_CELL + LED_GAP;

export type SeriesPoint = [number, number];

export type MatrixSeriesInput = {
  key: string;
  color: string;
  data: SeriesPoint[];
};

export type GridGeom = {
  cols: number;
  rows: number;
  cell: number;
  gap: number;
  pitch: number;
  width: number;
  height: number;
};

export type RasterizedSeries = {
  key: string;
  color: string;
  /** Column -> row index of the line (bottom = 0). -1 if empty. */
  colRow: Int16Array;
  /** Packed cell indices (col + row * cols) for dim fill under the line. */
  fill: Uint32Array;
  /** Packed cell indices for the bright stair-step line. */
  line: Uint32Array;
};

export type MatrixRaster = {
  geom: GridGeom;
  t0: number;
  t1: number;
  yMax: number;
  series: RasterizedSeries[];
};

export function gridForSize(
  cssWidth: number,
  cssHeight: number,
  cell = LED_CELL,
  gap = LED_GAP,
): GridGeom {
  const pitch = cell + gap;
  const cols = Math.max(1, Math.floor((cssWidth + gap) / pitch));
  const rows = Math.max(1, Math.floor((cssHeight + gap) / pitch));
  return {
    cols,
    rows,
    cell,
    gap,
    pitch,
    width: cols * pitch - gap,
    height: rows * pitch - gap,
  };
}

/** Bresenham on integer grid; inclusive endpoints. */
export function bresenham(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  visit: (x: number, y: number) => void,
): void {
  let x = x0 | 0;
  let y = y0 | 0;
  const xEnd = x1 | 0;
  const yEnd = y1 | 0;
  const dx = Math.abs(xEnd - x);
  const dy = Math.abs(yEnd - y);
  const sx = x < xEnd ? 1 : -1;
  const sy = y < yEnd ? 1 : -1;
  let err = dx - dy;

  for (;;) {
    visit(x, y);
    if (x === xEnd && y === yEnd) break;
    const e2 = err << 1;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function valueToRow(value: number, yMax: number, rows: number): number {
  if (rows <= 1 || yMax <= 0) return 0;
  return clamp(Math.round((value / yMax) * (rows - 1)), 0, rows - 1);
}

function timeToCol(t: number, t0: number, t1: number, cols: number): number {
  if (cols <= 1 || t1 <= t0) return 0;
  return clamp(Math.round(((t - t0) / (t1 - t0)) * (cols - 1)), 0, cols - 1);
}

/** Map pointer X in display CSS pixels to a column index. */
export function pointerXToCol(
  xCss: number,
  displayWidthCss: number,
  cols: number,
): number {
  if (cols <= 1 || displayWidthCss <= 0) return 0;
  return clamp(Math.floor((xCss / displayWidthCss) * cols), 0, cols - 1);
}

/**
 * Rasterize series onto an LED grid for the rolling window.
 * Shared y-scale (min 0). Fill = columns under the path; line = Bresenham stair-step.
 */
export function rasterizeMatrix(
  series: MatrixSeriesInput[],
  geom: GridGeom,
  nowMs = Date.now(),
): MatrixRaster {
  const { cols, rows } = geom;
  let t1 = nowMs;
  let latest = 0;
  let yMax = 0;

  for (const s of series) {
    for (const [t, v] of s.data) {
      if (t > latest) latest = t;
      if (v > yMax) yMax = v;
    }
  }
  if (latest > 0) t1 = Math.max(t1, latest);
  const t0 = t1 - HISTORY_WINDOW_MS;
  if (yMax <= 0) yMax = 1;

  const out: RasterizedSeries[] = series.map((s) => {
    const colRow = new Int16Array(cols).fill(-1);
    const lineSet = new Set<number>();
    const fillSet = new Set<number>();

    const pts = s.data
      .filter(([t]) => t >= t0 && t <= t1)
      .sort((a, b) => a[0] - b[0]);

    if (pts.length === 0) {
      return {
        key: s.key,
        color: s.color,
        colRow,
        fill: new Uint32Array(0),
        line: new Uint32Array(0),
      };
    }

    const gridPts: { c: number; r: number }[] = [];
    for (const [t, v] of pts) {
      gridPts.push({
        c: timeToCol(t, t0, t1, cols),
        r: valueToRow(v, yMax, rows),
      });
    }

    // Collapse duplicate columns: keep last sample in that column.
    const byCol = new Map<number, number>();
    for (const p of gridPts) byCol.set(p.c, p.r);
    const unique = [...byCol.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([c, r]) => ({ c, r }));

    for (let i = 0; i < unique.length; i++) {
      const cur = unique[i]!;
      const prev = i === 0 ? cur : unique[i - 1]!;
      bresenham(prev.c, prev.r, cur.c, cur.r, (c, r) => {
        lineSet.add(c + r * cols);
        if (colRow[c] < 0 || r > colRow[c]) colRow[c] = r;
      });
    }

    for (let c = 0; c < cols; c++) {
      const top = colRow[c];
      if (top < 0) continue;
      for (let r = 0; r <= top; r++) {
        fillSet.add(c + r * cols);
      }
    }

    return {
      key: s.key,
      color: s.color,
      colRow,
      fill: Uint32Array.from(fillSet),
      line: Uint32Array.from(lineSet),
    };
  });

  return { geom, t0, t1, yMax, series: out };
}

/** CSS oklch token → usable paint color. */
export function cssTokenColor(
  token: ChartToken,
  el: HTMLElement = document.documentElement,
): string {
  const raw = getComputedStyle(el).getPropertyValue(token).trim();
  return raw ? `oklch(${raw})` : "#888";
}

export function readThemeColors(el: HTMLElement = document.documentElement) {
  const style = getComputedStyle(el);
  const read = (name: string, fallback: string) => {
    const raw = style.getPropertyValue(name).trim();
    return raw ? `oklch(${raw})` : fallback;
  };
  return {
    isDark:
      el.classList.contains("dark") || el.getAttribute("data-theme") === "dark",
    background: read("--background", "#000"),
    border: read("--border", "#222"),
    muted: read("--muted", "#888"),
    foreground: read("--foreground", "#fff"),
  };
}
