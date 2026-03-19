export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function calcProgressPercent({
  startWeightKg,
  goalWeightKg,
  currentWeightKg,
}: {
  startWeightKg: number;
  goalWeightKg: number;
  currentWeightKg: number;
}) {
  if (startWeightKg === goalWeightKg) return 100;

  const isDown = goalWeightKg < startWeightKg;
  const denom = isDown ? startWeightKg - goalWeightKg : goalWeightKg - startWeightKg;
  if (denom <= 0) return 0;

  const achieved = isDown
    ? startWeightKg - currentWeightKg
    : currentWeightKg - startWeightKg;

  const raw = (achieved / denom) * 100;
  return Math.round(clamp(raw, 0, 100));
}

export function calcKgLeft({
  startWeightKg,
  goalWeightKg,
  currentWeightKg,
}: {
  startWeightKg: number;
  goalWeightKg: number;
  currentWeightKg: number;
}) {
  const down = goalWeightKg < startWeightKg;
  return down
    ? Math.max(0, currentWeightKg - goalWeightKg)
    : Math.max(0, goalWeightKg - currentWeightKg);
}

