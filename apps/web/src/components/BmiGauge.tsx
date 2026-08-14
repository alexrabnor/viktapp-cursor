"use client";

import type { BmiCategory } from "@/lib/appData";

// ── Geometri ──────────────────────────────────────────────────────────────────
const CX = 100;
const CY = 108;
const R = 80;
const SW = 15;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function polarXY(r: number, deg: number) {
  return {
    x: parseFloat((CX + r * Math.cos(toRad(deg))).toFixed(2)),
    y: parseFloat((CY + r * Math.sin(toRad(deg))).toFixed(2)),
  };
}

// BMI 15 = -180° (vänster), BMI 40 = 0° (höger), bågen via toppen (SVG sweep=1)
function bmiAngle(bmi: number) {
  return -180 + Math.max(0, Math.min(1, (bmi - 15) / 25)) * 180;
}

function arcD(r: number, a1: number, a2: number) {
  const s = polarXY(r, a1);
  const e = polarXY(r, a2);
  const large = Math.abs(a2 - a1) > 180 ? 1 : 0;
  return `M${s.x},${s.y} A${r},${r} 0 ${large} 1 ${e.x},${e.y}`;
}

// ── Färgzoner ─────────────────────────────────────────────────────────────────
const ZONES = [
  { label: "Undervikt", from: 15, to: 18.5, color: "#60a5fa" },
  { label: "Normalvikt", from: 18.5, to: 25, color: "#4ade80" },
  { label: "Övervikt", from: 25, to: 30, color: "#fbbf24" },
  { label: "Fetma", from: 30, to: 40, color: "#f97316" },
];

export default function BmiGauge({
  bmi,
  category,
}: {
  bmi: number;
  category: BmiCategory | null;
}) {
  const clamped = Math.max(15, Math.min(40, bmi));
  const needleAngle = bmiAngle(clamped);
  const tip = polarXY(R - SW / 2 - 6, needleAngle);

  const currentZone =
    ZONES.find((z) => clamped >= z.from && clamped < z.to) ??
    ZONES[ZONES.length - 1];

  const catLabel =
    category === "underweight"
      ? "Undervikt"
      : category === "normal"
        ? "Normalvikt"
        : "Övervikt / Fetma";

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-zinc-600">BMI-mätare</span>
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
          style={{ background: currentZone.color }}
        >
          {catLabel}
        </span>
      </div>

      <svg viewBox="0 0 200 122" className="mt-1 w-full select-none" aria-hidden="true">
        {/* Grå bakgrundsbåge */}
        <path
          d={arcD(R, -180, 0)}
          fill="none"
          stroke="#e4e4e7"
          strokeWidth={SW}
          strokeLinecap="round"
        />

        {/* Färgade zoner */}
        {ZONES.map((z) => (
          <path
            key={z.label}
            d={arcD(R, bmiAngle(z.from), bmiAngle(z.to))}
            fill="none"
            stroke={z.color}
            strokeWidth={SW}
            strokeLinecap="butt"
            opacity="0.88"
          />
        ))}

        {/* Vita separatorer vid zonövergångar */}
        {[18.5, 25, 30].map((b) => {
          const pt = polarXY(R, bmiAngle(b));
          return <circle key={b} cx={pt.x} cy={pt.y} r={SW / 2 - 1} fill="white" opacity="0.55" />;
        })}

        {/* Nål */}
        <line
          x1={CX} y1={CY} x2={tip.x} y2={tip.y}
          stroke="#18181b" strokeWidth="2.5" strokeLinecap="round"
        />
        <circle cx={CX} cy={CY} r="6" fill="#18181b" />
        <circle cx={CX} cy={CY} r="2.5" fill="white" />

        {/* BMI-siffra */}
        <text x={CX} y={CY - 20} textAnchor="middle" fontSize="26"
          fontWeight="700" fill="#18181b" fontFamily="system-ui,-apple-system,sans-serif">
          {bmi.toFixed(1)}
        </text>
        <text x={CX} y={CY - 7} textAnchor="middle" fontSize="8.5"
          fill="#a1a1aa" fontFamily="system-ui,-apple-system,sans-serif">
          normalt 18.5 – 24.9
        </text>

        {/* Kant-etiketter */}
        <text x="6" y={CY + 16} fontSize="8" fill="#a1a1aa"
          fontFamily="system-ui,-apple-system,sans-serif">15</text>
        <text x="194" y={CY + 16} textAnchor="end" fontSize="8" fill="#a1a1aa"
          fontFamily="system-ui,-apple-system,sans-serif">40</text>
      </svg>

      {/* Zon-legend */}
      <div className="mt-1 flex items-start justify-around gap-1">
        {ZONES.map((z) => {
          const isActive = clamped >= z.from && (z.to === 40 ? clamped <= z.to : clamped < z.to);
          return (
            <div key={z.label} className="flex flex-col items-center gap-0.5">
              <div
                className="h-2 w-8 rounded-full"
                style={{
                  background: z.color,
                  opacity: isActive ? 1 : 0.35,
                  boxShadow: isActive ? `0 0 5px ${z.color}` : "none",
                }}
              />
              <span className="text-[9.5px] font-medium"
                style={{ color: isActive ? "#3f3f46" : "#a1a1aa" }}>
                {z.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
