export type BmiCategory = "underweight" | "normal" | "overweight";

export function calcBMI(weightKg: number, heightCm: number) {
  const heightM = heightCm / 100;
  if (!heightM || heightM <= 0) return null;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
}

export function bmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return "underweight";
  if (bmi < 25) return "normal";
  return "overweight";
}

export function calcNormalRangeKg(heightCm: number) {
  const h = heightCm / 100;
  const minKg = 18.5 * (h * h);
  const maxKg = 24.9 * (h * h);
  return { minKg, maxKg };
}

export function calcDifferenceToNormalKg({
  weightKg,
  heightCm,
}: {
  weightKg: number;
  heightCm: number;
}) {
  const range = calcNormalRangeKg(heightCm);
  if (weightKg < range.minKg) return range.minKg - weightKg;
  if (weightKg > range.maxKg) return weightKg - range.maxKg;
  return 0;
}

