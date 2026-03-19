import type { WeightEntry } from "./types";

function toDays(from: Date, to: Date) {
  return (to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000);
}

function sortByMeasuredAt(entries: WeightEntry[]) {
  return [...entries].sort(
    (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime(),
  );
}

export function predictWeightLinearTrend({
  points,
  targetDate,
}: {
  points: WeightEntry[];
  targetDate: Date;
}): { predictedWeightKg: number; slopeKgPerDay: number } | null {
  const sorted = sortByMeasuredAt(points).filter((p) => Number.isFinite(p.weightKg));
  if (sorted.length < 2) return null;

  const first = new Date(sorted[0].measuredAt);
  const xs = sorted.map((p) => toDays(first, new Date(p.measuredAt)));
  const ys = sorted.map((p) => p.weightKg);

  const n = xs.length;
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = ys.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - xMean;
    num += dx * (ys[i] - yMean);
    den += dx * dx;
  }

  const slope = den === 0 ? 0 : num / den;
  const intercept = yMean - slope * xMean;

  const xTarget = toDays(first, targetDate);
  const predicted = intercept + slope * xTarget;

  return {
    predictedWeightKg: Math.round(predicted * 10) / 10,
    slopeKgPerDay: Math.round(slope * 1000) / 1000,
  };
}

