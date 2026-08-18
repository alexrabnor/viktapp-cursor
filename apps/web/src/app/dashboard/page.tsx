"use client";

import { useMemo, useState, type ReactNode } from "react";
import Card from "@/components/Card";
import WeightChart from "@/components/WeightChart";
import DashboardHeroArt from "@/components/DashboardHeroArt";
import { useAppData } from "@/app/providers/AppDataProvider";
import {
  bmiCategory,
  calcBMI,
  calcNormalRangeKg,
  calcProgressPercent,
  calcWeeklyWeightChangeKg,
  getStartWeightKg,
  type BmiCategory,
} from "@/lib/appData";

function formatDateSv(dateIso: string) {
  const d = new Date(dateIso);
  return new Intl.DateTimeFormat("sv-SE", { dateStyle: "medium" }).format(d);
}

function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/35 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-4 shadow-lg ring-1 ring-black/10">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
          <button
            type="button"
            className="vikttappBtn vikttappBtnSoft rounded-xl px-2 py-1 text-sm font-semibold text-zinc-700"
            onClick={onClose}
          >
            Stäng
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function StepCard({
  title,
  value,
  sub,
}: {
  title: string;
  value: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-zinc-600">{title}</div>
          <div className="mt-2 text-2xl font-semibold text-zinc-900">{value}</div>
          {sub ? <div className="mt-1 text-xs text-zinc-500">{sub}</div> : null}
        </div>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { state, latestWeight, nextInjection, addWeight, logInjection, streakDays } =
    useAppData();

  const currentWeightKg = latestWeight?.weightKg ?? null;
  const startWeightKg = getStartWeightKg(state);
  const goalWeightKg = state.settings.goalWeightKg;

  const bmi = useMemo(() => {
    if (!currentWeightKg) return null;
    return calcBMI(currentWeightKg, state.settings.heightCm);
  }, [currentWeightKg, state.settings.heightCm]);

  const bmiCat: BmiCategory | null = useMemo(() => {
    if (bmi == null) return null;
    return bmiCategory(bmi);
  }, [bmi]);

  const normalRange = useMemo(() => {
    return calcNormalRangeKg(state.settings.heightCm);
  }, [state.settings.heightCm]);

  const weeklyChange7 = useMemo(() => {
    if (!latestWeight) return null;
    return calcWeeklyWeightChangeKg(state, 7);
  }, [latestWeight, state]);

  const weeklyChangeLabel = useMemo(() => {
    if (weeklyChange7 == null) return "—";
    const sign = weeklyChange7 > 0 ? "+" : "";
    return `${sign}${Math.round(weeklyChange7 * 10) / 10} kg`;
  }, [weeklyChange7]);

  const progressPercent = useMemo(() => {
    if (!startWeightKg || !currentWeightKg) return 0;
    return calcProgressPercent({
      startWeightKg,
      goalWeightKg,
      currentWeightKg,
    });
  }, [startWeightKg, goalWeightKg, currentWeightKg]);

  const kgLeft = useMemo(() => {
    if (!currentWeightKg) return null;
    const down = goalWeightKg < (startWeightKg ?? currentWeightKg);
    return down ? Math.max(0, currentWeightKg - goalWeightKg) : Math.max(0, goalWeightKg - currentWeightKg);
  }, [currentWeightKg, goalWeightKg, startWeightKg]);

  const [openAddWeight, setOpenAddWeight] = useState(false);
  const [openLogInjection, setOpenLogInjection] = useState(false);

  // Add weight form state
  const [weightInput, setWeightInput] = useState<string>("");

  // Injection form state
  const [doseInput, setDoseInput] = useState<string>("");
  const [nausea, setNausea] = useState<0 | 1 | 2 | 3 | undefined>(undefined);
  const [fatigue, setFatigue] = useState<0 | 1 | 2 | 3 | undefined>(undefined);
  const [appetite, setAppetite] = useState<0 | 1 | 2 | 3 | undefined>(undefined);

  const bmiPill = useMemo(() => {
    if (!bmi || !bmiCat) return "BMI —";
    const label =
      bmiCat === "underweight" ? "Undervikt" : bmiCat === "normal" ? "Normal" : "Övervikt";
    return `${label}`;
  }, [bmi, bmiCat]);

  return (
    <div className="pb-6">
      <div className="pt-4">
        <DashboardHeroArt />
        <h1 className="relative text-2xl font-bold text-zinc-900 vikttappFadeInUp">
          Dashboard
        </h1>
        <p className="relative mt-1 text-sm text-zinc-600 vikttappFadeInUp">
          Snabb överblick över din resa.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="vikttappFadeInUp" style={{ animationDelay: "40ms" }}>
          <StepCard
          title="Aktuell vikt"
          value={currentWeightKg ? `${Math.round(currentWeightKg * 10) / 10} kg` : "—"}
          sub={
            latestWeight ? `Senast: ${formatDateSv(latestWeight.measuredAt)}` : undefined
          }
          />
        </div>

        <div className="vikttappFadeInUp" style={{ animationDelay: "90ms" }}>
          <StepCard
            title="Veckoförändring (7 dagar)"
            value={weeklyChangeLabel}
            sub="Skillnad mellan närmast 7 dagar och nu"
          />
        </div>

        <div className="vikttappFadeInUp" style={{ animationDelay: "140ms" }}>
          <StepCard
            title="Streak"
            value={`${streakDays} dagar`}
            sub="minst en viktlogg per dag"
          />
        </div>

        <Card className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-zinc-600">BMI</div>
              <div className="mt-2 flex items-baseline gap-2">
                <div className="text-2xl font-semibold text-zinc-900">
                  {bmi == null ? "—" : bmi.toFixed(1)}
                </div>
                {bmiCat ? (
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-800">
                    {bmiPill}
                  </span>
                ) : null}
              </div>
              <div className="mt-3 text-xs text-zinc-500">
                Normalintervall: {Math.round(normalRange.minKg * 10) / 10}–{Math.round(normalRange.maxKg * 10) / 10} kg
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="h-2 w-full rounded-full bg-zinc-100 ring-1 ring-black/5 overflow-hidden">
              <div
                className="h-full bg-zinc-900/90"
                style={{
                  transition: "width 500ms ease",
                  width:
                    currentWeightKg != null
                      ? `${Math.max(
                          0,
                          Math.min(
                            100,
                            ((currentWeightKg - normalRange.minKg) /
                              (normalRange.maxKg - normalRange.minKg)) *
                              100,
                          ),
                        )}%`
                      : "0%",
                }}
              />
            </div>
          </div>
        </Card>

        <div className="vikttappFadeInUp" style={{ animationDelay: "190ms" }}>
          <StepCard
            title="Nästa injektion"
            value={
              nextInjection?.nextAt ? (
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
              )
            }
            sub={
              nextInjection?.nextAt
                ? new Intl.DateTimeFormat("sv-SE", { dateStyle: "medium" }).format(nextInjection.nextAt)
                : undefined
            }
          />
        </div>

        <Card className="p-4 sm:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-zinc-600">Progress till mål</div>
              <div className="mt-2 flex items-baseline gap-2">
                <div className="text-2xl font-semibold text-zinc-900">{progressPercent}%</div>
                {kgLeft != null ? (
                  <div className="text-sm font-medium text-zinc-700">
                    {goalWeightKg < (startWeightKg ?? goalWeightKg) ? `${kgLeft.toFixed(1)} kg kvar` : `${kgLeft.toFixed(1)} kg till`}
                  </div>
                ) : null}
              </div>
              <div className="mt-2 text-xs text-zinc-500">
                Start: {startWeightKg?.toFixed(1) ?? "—"} kg · Mål: {goalWeightKg.toFixed(1)} kg
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="h-3 w-full rounded-full bg-zinc-100 ring-1 ring-black/5 overflow-hidden">
              <div
                className="h-full bg-zinc-900/90"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <WeightChart entries={state.weightEntries} />
      </div>

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          className="vikttappBtn vikttappBtnPrimary flex flex-1 items-center justify-center px-4 py-3 text-sm font-semibold"
          onClick={() => {
            setWeightInput("");
            setOpenAddWeight(true);
          }}
        >
          Lägg till vikt
        </button>
        <button
          type="button"
          className="vikttappBtn vikttappBtnSoft flex flex-1 items-center justify-center px-4 py-3 text-sm font-semibold"
          onClick={() => {
            setDoseInput(state.settings.doseAmountMg ? String(state.settings.doseAmountMg) : "");
            setOpenLogInjection(true);
          }}
        >
          Logga injektion
        </button>
      </div>

      <Modal
        open={openAddWeight}
        title="Ny viktmätning"
        onClose={() => setOpenAddWeight(false)}
      >
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const w = parseFloat(weightInput.replace(",", "."));
            if (!Number.isFinite(w) || w <= 0) return;
            addWeight(w, new Date(), "manuell");
            setWeightInput("");
            setOpenAddWeight(false);
          }}
        >
          <label className="block">
            <span className="text-sm font-medium text-zinc-700">Vikt (kg)</span>
            <input
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/20"
              type="text"
              inputMode="decimal"
              placeholder={currentWeightKg ? `Senast: ${Math.round(currentWeightKg * 10) / 10} kg` : "t.ex. 75.0"}
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              autoFocus
            />
          </label>

          <button
            type="submit"
            className="vikttappBtn vikttappBtnPrimary w-full px-4 py-3 text-sm font-semibold text-white"
          >
            Spara
          </button>
        </form>
      </Modal>

      <Modal
        open={openLogInjection}
        title="Logga injektion"
        onClose={() => setOpenLogInjection(false)}
      >
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const dose = parseFloat(doseInput.replace(",", "."));
            if (!Number.isFinite(dose) || dose <= 0) return;
            logInjection({
              doseAmountMg: dose,
              injectedAt: new Date(),
              nausea,
              fatigue,
              appetite,
              doseUnit: "mg",
              notes: undefined,
            });
            setDoseInput("");
            setOpenLogInjection(false);
          }}
        >
          <label className="block">
            <span className="text-sm font-medium text-zinc-700">Dos (mg)</span>
            <input
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/20"
              type="text"
              inputMode="decimal"
              placeholder={state.settings.doseAmountMg ? String(state.settings.doseAmountMg) : "1.0"}
              value={doseInput}
              onChange={(e) => setDoseInput(e.target.value)}
              autoFocus
            />
          </label>

          <div className="grid grid-cols-3 gap-2">
            <ScoreSelect label="Illamående" value={nausea} onChange={setNausea} />
            <ScoreSelect label="Trötthet" value={fatigue} onChange={setFatigue} />
            <ScoreSelect label="Apetit" value={appetite} onChange={setAppetite} />
          </div>

          <button
            type="submit"
            className="vikttappBtn vikttappBtnPrimary w-full px-4 py-3 text-sm font-semibold text-white"
          >
            Spara injektion
          </button>
        </form>
      </Modal>
    </div>
  );
}

function ScoreSelect<T extends 0 | 1 | 2 | 3 | undefined>({
  label,
  value,
  onChange,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <label className="flex flex-col gap-1 rounded-2xl border border-black/10 bg-white p-2">
      <span className="text-[11px] font-semibold text-zinc-700">{label}</span>
      <select
        className="rounded-xl border border-black/10 bg-zinc-50 px-2 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/15"
        value={value ?? ""}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "") onChange(undefined as T);
          else onChange(Number(v) as T);
        }}
      >
        <option value="">—</option>
        <option value="0">0</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
      </select>
    </label>
  );
}

