"use client";

import { useEffect, useRef, useState } from "react";
import {
  cssTokenColor,
  gridForSize,
  rasterizeMatrix,
  readThemeColors,
  type ChartToken,
  type MatrixRaster,
  type SeriesPoint,
} from "@/components/charts/ledMatrix";

export type LedMatrixSeries = {
  key: string;
  name: string;
  token: ChartToken;
  data: SeriesPoint[];
};

/** Dim fill ≈ 30% by painting with alpha over the board. */
const FILL_ALPHA = 0.32;
const GLOW_BLUR = 2;

function paintLit(
  ctx: CanvasRenderingContext2D,
  raster: MatrixRaster,
  dpr: number,
  isDark: boolean,
): void {
  const { geom, series } = raster;
  const { cols, cell, pitch, rows } = geom;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const drawCells = (
    indices: Uint32Array,
    color: string,
    alpha: number,
    glow: boolean,
  ) => {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    if (glow && isDark) {
      ctx.shadowColor = color;
      ctx.shadowBlur = GLOW_BLUR;
    } else {
      ctx.shadowBlur = 0;
    }
    for (let i = 0; i < indices.length; i++) {
      const idx = indices[i]!;
      const c = idx % cols;
      const r = (idx / cols) | 0;
      const x = c * pitch;
      const y = (rows - 1 - r) * pitch;
      ctx.fillRect(x, y, cell, cell);
    }
  };

  // Fill first (dim), then bright line on top.
  for (const s of series) {
    drawCells(s.fill, s.color, FILL_ALPHA, false);
  }
  for (const s of series) {
    drawCells(s.line, s.color, 1, true);
  }

  ctx.restore();
}

function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatVal(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 1000)
    return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function LedMatrixCanvas({
  series,
  height = 160,
}: {
  series: LedMatrixSeries[];
  height?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rasterRef = useRef<MatrixRaster | null>(null);
  const rafRef = useRef(0);
  const seriesRef = useRef(series);
  seriesRef.current = series;

  const [tips, setTips] = useState<{
    x: number;
    y: number;
    time: string;
    rows: { name: string; color: string; value: string }[];
  } | null>(null);
  const [axis, setAxis] = useState({ start: "", end: "" });

  const redraw = () => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const cssW = Math.max(1, wrap.clientWidth);
    const cssH = Math.max(1, height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const geom = gridForSize(cssW, cssH);
    const theme = readThemeColors();

    canvas.width = Math.max(1, Math.floor(geom.width * dpr));
    canvas.height = Math.max(1, Math.floor(geom.height * dpr));
    canvas.style.width = `${geom.width}px`;
    canvas.style.height = `${geom.height}px`;

    const inputs = seriesRef.current.map((s) => ({
      key: s.key,
      color: cssTokenColor(s.token),
      data: s.data,
    }));
    const raster = rasterizeMatrix(inputs, geom);
    rasterRef.current = raster;
    setAxis({ start: formatTime(raster.t0), end: formatTime(raster.t1) });

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Transparent board — only lit LEDs are painted.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    paintLit(ctx, raster, dpr, theme.isDark);
  };

  const schedule = () => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(redraw);
  };

  useEffect(() => {
    schedule();
  }, [series, height]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const ro = new ResizeObserver(() => schedule());
    ro.observe(wrap);

    const mo = new MutationObserver(() => schedule());
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => {
      ro.disconnect();
      mo.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [height]);

  function onMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const raster = rasterRef.current;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!raster || !canvas || !wrap) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const { cols, pitch } = raster.geom;
    const col = Math.max(0, Math.min(cols - 1, Math.floor(x / pitch)));
    const t =
      raster.t0 + (raster.t1 - raster.t0) * (cols <= 1 ? 0 : col / (cols - 1));

    const rows = seriesRef.current.map((s, i) => {
      const rs = raster.series[i];
      const row = rs?.colRow[col] ?? -1;
      const value =
        row < 0 || raster.geom.rows <= 1
          ? 0
          : (row / (raster.geom.rows - 1)) * raster.yMax;
      return {
        name: s.name,
        color: cssTokenColor(s.token),
        value: formatVal(value),
      };
    });

    setTips({
      x: Math.min(
        e.clientX - wrap.getBoundingClientRect().left + 12,
        wrap.clientWidth - 140,
      ),
      y: 8,
      time: formatTime(t),
      rows,
    });
  }

  return (
    <div ref={wrapRef} className="relative px-3 pb-1">
      <canvas
        ref={canvasRef}
        className="block max-w-full"
        onMouseMove={onMove}
        onMouseLeave={() => setTips(null)}
      />
      <div className="mt-1 flex justify-between font-mono text-[10px] tabular-nums text-muted">
        <span>{axis.start}</span>
        <span>{axis.end}</span>
      </div>
      {tips ? (
        <div
          className="pointer-events-none absolute z-10 border border-border bg-background px-2 py-1 font-mono text-[10px] text-foreground"
          style={{ left: tips.x, top: tips.y }}
        >
          <div className="text-muted">{tips.time}</div>
          {tips.rows.map((r) => (
            <div key={r.name} style={{ color: r.color }}>
              {r.name} {r.value}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
