"use client";

import { useMemo, useState } from "react";
import Card from "@/components/Card";
import BmiGauge from "@/components/BmiGauge";
import { useAppData } from "@/app/providers/AppDataProvider";
import {
  bmiCategory,
  calcBMI,
  calcNormalRangeKg,
  calcProgressPercent,
  calcWeeklyWeightChangeKg,
  getStartWeightKg,
} from "@/lib/appData";

function formatKg(kg: number) {
  return `${Math.round(kg * 10) / 10} kg`;
}

function formatDeltaKg(kg: number | null) {
  if (kg == null) return "—";
  const sign = kg > 0 ? "+" : "";
  return `${sign}${Math.round(kg * 10) / 10} kg`;
}

export default function StatisticsPage() {
  const { state, latestWeight, nextInjection } = useAppData();

  const currentWeightKg = latestWeight?.weightKg ?? null;
  const startWeightKg = getStartWeightKg(state);
  const goalWeightKg = state.settings.goalWeightKg;

  const bmi = useMemo(() => {
    if (currentWeightKg == null) return null;
    return calcBMI(currentWeightKg, state.settings.heightCm);
  }, [currentWeightKg, state.settings.heightCm]);

  const bmiCat = useMemo(() => {
    if (bmi == null) return null;
    return bmiCategory(bmi);
  }, [bmi]);

  const [windowDays, setWindowDays] = useState<7 | 30>(7);

  const changeKg = useMemo(() => {
    return calcWeeklyWeightChangeKg(state, windowDays);
  }, [state, windowDays]);

  const change7 = useMemo(() => calcWeeklyWeightChangeKg(state, 7), [state]);
  const change30 = useMemo(() => calcWeeklyWeightChangeKg(state, 30), [state]);

  const normalRangeKg = useMemo(() => calcNormalRangeKg(state.settings.heightCm), [state.settings.heightCm]);

  const diffToGoal = useMemo(() => {
    if (currentWeightKg == null) return null;
    return goalWeightKg - currentWeightKg;
  }, [currentWeightKg, goalWeightKg]);

  const diffToNormal = useMemo(() => {
    if (currentWeightKg == null) return null;
    const belowNormal = currentWeightKg < normalRangeKg.minKg;
    const aboveNormal = currentWeightKg > normalRangeKg.maxKg;
    if (belowNormal) return normalRangeKg.minKg - currentWeightKg;
    if (aboveNormal) return currentWeightKg - normalRangeKg.maxKg;
    return 0;
  }, [currentWeightKg, normalRangeKg.minKg, normalRangeKg.maxKg]);

  const progressPercent = useMemo(() => {
    if (!startWeightKg || currentWeightKg == null) return 0;
    return calcProgressPercent({
      startWeightKg,
      goalWeightKg,
      currentWeightKg,
    });
  }, [startWeightKg, goalWeightKg, currentWeightKg]);

  const progressBarWidth = `${progressPercent}%`;

  return (
    <div className="pb-6">
      <div className="pt-4">
        <h1 className="text-2xl font-bold text-zinc-900">Statistik</h1>
        <p className="mt-1 text-sm text-zinc-600">Siffror, BMI-gauge och progress.</p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3">
        <Card className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-zinc-600">
                Viktförändring
              </div>
              <div className="mt-2 text-2xl font-semibold text-zinc-900">
                {formatDeltaKg(changeKg)}
              </div>
              <div className="mt-1 text-xs text-zinc-500">
                Senaste {windowDays} dagar
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                data-active={windowDays === 7}
                className="vikttappBtn vikttappBtnSoft rounded-2xl px-3 py-2 text-sm font-semibold text-indigo-900"
                onClick={() => setWindowDays(7)}
              >
                7d
              </button>
              <button
                type="button"
                data-active={windowDays === 30}
                className="vikttappBtn vikttappBtnSoft rounded-2xl px-3 py-2 text-sm font-semibold text-indigo-900"
                onClick={() => setWindowDays(30)}
              >
                30d
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-zinc-50 p-3 ring-1 ring-black/5">
              <div className="text-[11px] font-semibold text-zinc-600">7 dagar</div>
              <div className="mt-1 text-sm font-semibold text-zinc-900">{formatDeltaKg(change7)}</div>
            </div>
            <div className="rounded-2xl bg-zinc-50 p-3 ring-1 ring-black/5">
              <div className="text-[11px] font-semibold text-zinc-600">30 dagar</div>
              <div className="mt-1 text-sm font-semibold text-zinc-900">{formatDeltaKg(change30)}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-zinc-600">Nästa injektion</div>
              <div className="mt-2 text-2xl font-semibold text-zinc-900">
                {nextInjection?.nextAt ? (
                  <span className="inline-flex items-center gap-2">
                    <span>{nextInjection.daysLeft} dagar kvar</span>
                    {nextInjection.daysLeft <= 2 ? (
                      <span className="relative inline-flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-90" />
                        <span className="absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-60 animate-ping" />
                      </span>
                    ) : null}
                  </span>
                ) : (
                  "—"
                )}
              </div>
              <div className="mt-1 text-xs text-zinc-500">
                {nextInjection?.nextAt
                  ? new Intl.DateTimeFormat("sv-SE", { dateStyle: "medium" }).format(nextInjection.nextAt)
                  : "Logga en injektion för att se nästa datum"}
              </div>
            </div>
            {nextInjection?.doseAmountMg ? (
              <div className="rounded-2xl bg-indigo-600/10 px-3 py-2 text-center text-indigo-800 shadow-sm ring-1 ring-indigo-500/20">
                <div className="text-[11px] font-semibold text-indigo-700/90">Dos</div>
                <div className="mt-0.5 text-lg font-semibold text-indigo-900">
                  {nextInjection.doseAmountMg.toFixed(2)} mg
                </div>
              </div>
            ) : null}
          </div>
        </Card>

        {bmi != null && bmiCat != null ? (
          <Card className="p-4">
            <BmiGauge bmi={bmi} category={bmiCat} />
          </Card>
        ) : (
          <Card className="p-4">
            <div className="text-sm font-medium text-zinc-600">BMI-gauge</div>
            <div className="mt-2 text-zinc-900/70">Logga en vikt först.</div>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Card className="p-4">
            <div className="text-sm font-medium text-zinc-600">Till mål</div>
            <div className="mt-2 text-2xl font-semibold text-zinc-900">
              {diffToGoal == null ? "—" : `${diffToGoal >= 0 ? "" : "-"}${formatKg(Math.abs(diffToGoal))}`}
            </div>
            <div className="mt-1 text-xs text-zinc-500">
              {diffToGoal == null
                ? "—"
                : diffToGoal > 0
                  ? "Kvar att gå ner"
                  : "Över målvikt"}
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-sm font-medium text-zinc-600">Till normalvikt</div>
            <div className="mt-2 text-2xl font-semibold text-zinc-900">
              {diffToNormal == null ? "—" : formatKg(diffToNormal)}
            </div>
            <div className="mt-1 text-xs text-zinc-500">
              Normal: {Math.round(normalRangeKg.minKg * 10) / 10}–{Math.round(normalRangeKg.maxKg * 10) / 10} kg
            </div>
          </Card>
        </div>

        <Card className="p-4 sm:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-zinc-600">Progress</div>
              <div className="mt-2 flex items-baseline gap-2">
                <div className="text-2xl font-semibold text-zinc-900">{progressPercent}%</div>
                <div className="text-sm font-semibold text-zinc-700">
                  {startWeightKg != null && currentWeightKg != null
                    ? (() => {
                        const down = goalWeightKg < startWeightKg;
                        const left = down
                          ? Math.max(0, currentWeightKg - goalWeightKg)
                          : Math.max(0, goalWeightKg - currentWeightKg);
                        return `${left.toFixed(1)} kg kvar`;
                      })()
                    : "—"}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 h-3 w-full rounded-full bg-black/5 ring-1 ring-black/5 overflow-hidden">
            <div
              className="h-full bg-zinc-900/90"
              style={{ width: progressBarWidth, transition: "width 500ms ease" }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

