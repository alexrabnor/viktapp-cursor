"use client";

import type { BmiCategory } from "@/lib/appData";

export default function BmiGauge({
  bmi,
  category,
}: {
  bmi: number;
  category: BmiCategory | null;
}) {
  // Visual gauge based on BMI thresholds:
  // - underweight: < 18.5
  // - normal: 18.5..24.9
  // - overweight: >= 25
  const minRange = 14;
  const maxRange = 35;

  const clampedBmi = Math.max(minRange, Math.min(maxRange, bmi));

  const normalMin = 18.5;
  const normalMax = 24.9;
  const normalLeft = ((normalMin - minRange) / (maxRange - minRange)) * 100;
  const normalWidth =
    ((normalMax - normalMin) / (maxRange - minRange)) * 100;

  const markerLeft = ((clampedBmi - minRange) / (maxRange - minRange)) * 100;

  const categoryLabel =
    category === "underweight"
      ? "Undervikt"
      : category === "normal"
        ? "Normal"
        : "Övervikt";

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-zinc-700">BMI</div>
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-800">
          {categoryLabel}
        </span>
      </div>

      <div className="mt-4 rounded-3xl bg-zinc-50 p-4 ring-1 ring-black/5">
        <div className="relative h-28">
          {/* Normal range */}
          <div
            className="absolute left-0 right-0 top-2 h-4 rounded-full bg-black/5"
            aria-hidden="true"
          >
            <div
              className="h-full rounded-full bg-zinc-900/90"
              style={{ width: `${normalWidth}%`, marginLeft: `${normalLeft}%` }}
            />
          </div>

          {/* Marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-zinc-900/90"
            style={{ left: `${markerLeft}%` }}
            aria-hidden="true"
          />

          {/* Centered BMI value */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-3xl bg-white px-5 py-3 shadow-sm ring-1 ring-black/5">
              <div className="text-3xl font-semibold text-zinc-900">
                {bmi.toFixed(1)}
              </div>
              <div className="mt-0.5 text-center text-[11px] font-medium text-zinc-500">
                normal {18.5}–{24.9}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

