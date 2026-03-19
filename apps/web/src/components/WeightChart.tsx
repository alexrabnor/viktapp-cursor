"use client";

import type { WeightEntry } from "@/lib/appData";
import { useId, useMemo, useRef, useState } from "react";

export default function WeightChart({
  entries,
  height = 180,
}: {
  entries: WeightEntry[];
  height?: number;
}) {
  const sorted = useMemo(() => {
    return [...entries].sort(
      (a, b) =>
        new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime(),
    );
  }, [entries]);

  const display = useMemo(() => {
    // För att hålla UI rent: ta senaste 14 loggar om det finns många.
    const max = 14;
    if (sorted.length <= max) return sorted;
    return sorted.slice(sorted.length - max);
  }, [sorted]);

  const areaId = useId().replace(/:/g, "_");

  const fmt = (iso: string) =>
    new Intl.DateTimeFormat("sv-SE", { day: "2-digit", month: "short" }).format(
      new Date(iso),
    );

  const { points, polyline, areaPath, minP, maxP } = useMemo(() => {
    if (display.length < 1) {
      return {
        points: [] as Array<{ x: number; y: number; entry: WeightEntry }>,
        polyline: "",
        areaPath: "",
        minP: 0,
        maxP: 1,
      };
    }

    const weights = display.map((d) => d.weightKg);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const pad = (max - min) * 0.1 || 0.8;
    const minP = min - pad;
    const maxP = max + pad;

    const points = display.map((d, i) => {
      const x = display.length === 1 ? 50 : (i / (display.length - 1)) * 100;
      const y =
        maxP === minP
          ? 50
          : 100 - ((d.weightKg - minP) / (maxP - minP)) * 100;
      return { x, y, entry: d };
    });

    const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
    const areaPath =
      points.length === 1
        ? `M ${points[0].x} ${points[0].y} L ${points[0].x} 100 L ${points[0].x} 100 Z`
        : `M ${points[0].x} ${points[0].y} ${points
            .slice(1)
            .map((p) => `L ${p.x} ${p.y}`)
            .join(" ")} L ${points[points.length - 1].x} 100 L ${points[0].x} 100 Z`;

    return { points, polyline, areaPath, minP, maxP };
  }, [display]);

  const svgWrapRef = useRef<HTMLDivElement | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(() => {
    return display.length ? display.length - 1 : null;
  });

  const latestId = display[display.length - 1]?.id;
  const selectionIndex = selectedIndex == null ? null : Math.min(selectedIndex, display.length - 1);

  const selectedPoint = useMemo(() => {
    if (selectionIndex == null) return null;
    return points[selectionIndex] ?? null;
  }, [points, selectionIndex]);

  if (display.length === 0) {
    return (
      <div className="rounded-3xl bg-zinc-50 p-4 ring-1 ring-black/5">
        <div className="text-sm font-medium text-zinc-700">Viktgraf</div>
        <div className="mt-2 text-sm text-zinc-500">
          Logga din första vikt för att se grafen.
        </div>
      </div>
    );
  }

  const latest = display[display.length - 1];
  const first = display[0];

  const handlePick = (clientX: number) => {
    const el = svgWrapRef.current;
    if (!el) return;
    if (display.length < 2) return;

    const rect = el.getBoundingClientRect();
    const relX = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(0, Math.min(100, relX));
    const idx = Math.round((clamped / 100) * (display.length - 1));
    setSelectedIndex(Math.max(0, Math.min(display.length - 1, idx)));
  };

  return (
    <div className="rounded-3xl bg-zinc-50 p-4 ring-1 ring-black/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-zinc-700">Vikt (trend)</div>
          <div className="mt-1 text-xs text-zinc-500">
            {fmt(first.measuredAt)} → {fmt(latest.measuredAt)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-zinc-900">
            {latest.weightKg.toFixed(1)} kg
          </div>
          <div className="text-xs text-zinc-500">senast</div>
        </div>
      </div>

      <div className="relative mt-3" ref={svgWrapRef}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ width: "100%", height }}
          role="img"
          aria-label="Viktgraf"
            key={latestId ?? "empty"}
          onPointerMove={(e) => handlePick(e.clientX)}
          onPointerDown={(e) => handlePick(e.clientX)}
          onPointerLeave={() => setSelectedIndex(display.length - 1)}
        >
          {/* Grid */}
          {[20, 40, 60, 80].map((y) => (
            <line
              key={y}
              x1="0"
              x2="100"
              y1={y}
              y2={y}
              stroke="rgba(0,0,0,0.06)"
              strokeWidth="0.5"
            />
          ))}

          <defs>
            <linearGradient id={areaId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(99,102,241,0.38)" />
              <stop offset="80%" stopColor="rgba(99,102,241,0.08)" />
              <stop offset="100%" stopColor="rgba(99,102,241,0.0)" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path d={areaPath} fill={`url(#${areaId})`} />

          {/* Line glow */}
          <polyline
            points={polyline}
            fill="none"
            stroke="rgba(99,102,241,0.14)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-80"
          />

          {/* Main line with draw */}
          <polyline
            points={polyline}
            fill="none"
            stroke="rgba(24,24,27,0.96)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ strokeDasharray: 260, strokeDashoffset: 260 }}
            className="vikttappChartDraw"
          />

          {/* Dots */}
          {points.map((p, idx) => {
            const isLatest = idx === points.length - 1;
            const isSelected = selectionIndex === idx;
            const r = isLatest ? 2.9 : isSelected ? 2.4 : 1.8;

            return (
              <g key={p.entry.id}>
                {isLatest ? (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={r + 2.7}
                    fill="rgba(99,102,241,0.18)"
                    className="vikttappDotPulse"
                  />
                ) : null}

                <circle
                  cx={p.x}
                  cy={p.y}
                  r={r}
                  fill={
                    isLatest
                      ? "rgba(99,102,241,0.95)"
                      : isSelected
                        ? "rgba(24,24,27,0.96)"
                        : "rgba(24,24,27,0.34)"
                  }
                  stroke="rgba(255,255,255,0.92)"
                  strokeWidth={0.8}
                />
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {selectedPoint ? (
          <div
            className="pointer-events-none absolute z-10 vikttappCardEnter rounded-3xl bg-white/90 p-3 shadow-sm ring-1 ring-black/10 backdrop-blur supports-[backdrop-filter]:bg-white/70"
            style={{
              left: `${selectedPoint.x}%`,
              top: `${(selectedPoint.y / 100) * height}px`,
              transform: "translate(-50%, -100%)",
              width: 180,
            }}
          >
            <div className="text-[11px] font-semibold text-indigo-700/90">
              {fmt(selectedPoint.entry.measuredAt)}
            </div>
            <div className="mt-1 text-lg font-bold text-zinc-900">
              {selectedPoint.entry.weightKg.toFixed(1)} kg
            </div>
            <div className="mt-1 text-[10px] text-zinc-500">
              min {minP.toFixed(1)} · max {maxP.toFixed(1)}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

