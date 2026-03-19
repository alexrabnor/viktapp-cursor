import { describe, expect, it } from "vitest";
import {
  bmiCategory,
  calcBMI,
  calcKgLeft,
  calcNextInjection,
  calcNormalRangeKg,
  calcProgressPercent,
  calcWeeklyWeightChangeKg,
  predictWeightLinearTrend,
} from "@/lib/calculations";
import type { InjectionLog, WeightEntry } from "@/lib/appData";

function isoAt(utcIsoDate: string) {
  // Ex: "2020-01-01T00:00:00Z"
  return new Date(utcIsoDate).toISOString();
}

describe("BMI", () => {
  it("beräknar BMI och kategori", () => {
    const bmi = calcBMI(70, 175);
    expect(bmi).toBeCloseTo(22.9, 1);
    if (bmi == null) return;
    expect(bmiCategory(bmi)).toBe("normal");
  });

  it("beräknar normalintervall (kg) korrekt ungefär", () => {
    const { minKg, maxKg } = calcNormalRangeKg(170);
    expect(minKg).toBeCloseTo(53.5, 1);
    expect(maxKg).toBeCloseTo(72.0, 1);
  });
});

describe("Progress", () => {
  it("progress% för viktnedgång", () => {
    const pct = calcProgressPercent({
      startWeightKg: 100,
      goalWeightKg: 80,
      currentWeightKg: 90,
    });
    expect(pct).toBe(50);
  });

  it("kg kvar för viktnedgång", () => {
    const kgLeft = calcKgLeft({
      startWeightKg: 100,
      goalWeightKg: 80,
      currentWeightKg: 90,
    });
    expect(kgLeft).toBe(10);
  });
});

describe("Veckoförändring", () => {
  it("räknar skillnad senaste - (senaste - N dagar)", () => {
    const entries: WeightEntry[] = [
      { id: "a", measuredAt: isoAt("2020-01-01T00:00:00Z"), weightKg: 100 },
      { id: "b", measuredAt: isoAt("2020-01-08T00:00:00Z"), weightKg: 90 },
    ];
    const change = calcWeeklyWeightChangeKg(entries, 7);
    expect(change).toBe(-10);
  });
});

describe("Nästa injektion", () => {
  it("använder next_manual_at om det finns i framtiden", () => {
    const now = new Date("2020-01-01T00:00:00Z");
    const nextManualAt = new Date("2020-01-07T00:00:00Z"); // 6 dagar kvar (ceil)

    const result = calcNextInjection({
      intervalDays: 7,
      startDate: new Date("2019-12-25T00:00:00Z"),
      nextManualAt,
      injectionLogs: [],
      doseAmountMg: 1,
      now,
    });

    expect(result?.nextAt.toISOString()).toBe(nextManualAt.toISOString());
    expect(result?.daysLeft).toBe(6);
  });

  it("faller tillbaka på senaste injektion + intervall", () => {
    const now = new Date("2020-01-01T00:00:00Z");
    const result = calcNextInjection({
      intervalDays: 7,
      startDate: new Date("2019-12-25T00:00:00Z"),
      nextManualAt: null,
      injectionLogs: [
        { id: "l1", injectedAt: isoAt("2019-12-25T00:00:00Z"), doseAmountMg: 1 } satisfies InjectionLog,
      ],
      doseAmountMg: 1,
      now,
    });

    // next = 2020-01-01
    expect(result?.nextAt.toISOString()).toBe("2020-01-01T00:00:00.000Z");
    expect(result?.daysLeft).toBe(0);
  });
});

describe("Linjär trend-prediktion", () => {
  it("predikterar linjärt med 1 kg/dag", () => {
    const points: WeightEntry[] = [
      { id: "p1", measuredAt: isoAt("2020-01-01T00:00:00Z"), weightKg: 10 },
      { id: "p2", measuredAt: isoAt("2020-01-02T00:00:00Z"), weightKg: 11 },
      { id: "p3", measuredAt: isoAt("2020-01-03T00:00:00Z"), weightKg: 12 },
    ];

    const targetDate = new Date("2020-01-04T00:00:00Z");
    const res = predictWeightLinearTrend({ points, targetDate });

    expect(res?.predictedWeightKg).toBe(13);
    expect(res?.slopeKgPerDay).toBe(1);
  });
});

