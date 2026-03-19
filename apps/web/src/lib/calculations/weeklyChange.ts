import type { WeightEntry } from "./types";

function sortByMeasuredAt(entries: WeightEntry[]) {
  return [...entries].sort(
    (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime(),
  );
}

function getLatestWeight(entries: WeightEntry[]) {
  const sorted = sortByMeasuredAt(entries);
  return sorted.length ? sorted[sorted.length - 1] : null;
}

function getClosestAtOrBefore(entries: WeightEntry[], targetDate: Date) {
  const sorted = sortByMeasuredAt(entries);
  const t = targetDate.getTime();
  let best: WeightEntry | null = null;
  for (const entry of sorted) {
    const ts = new Date(entry.measuredAt).getTime();
    if (ts <= t) best = entry;
    else break;
  }
  return best;
}

// Semantik: skillnad mellan senaste logg och närmast logg "<= (senaste datum - days)".
export function calcWeeklyWeightChangeKg(
  entries: WeightEntry[],
  days: number,
): number | null {
  const latest = getLatestWeight(entries);
  if (!latest) return null;

  const latestDate = new Date(latest.measuredAt);
  const target = new Date(latestDate);
  target.setDate(target.getDate() - days);

  const at = getClosestAtOrBefore(entries, target);
  if (!at) return null;
  return latest.weightKg - at.weightKg;
}

