"use client";

import { useMemo, useState } from "react";
import Card from "@/components/Card";
import { useAppData } from "@/app/providers/AppDataProvider";
import {
  sortByInjectedAt,
  sortByMeasuredAt,
  type InjectionLog,
  type WeightEntry,
} from "@/lib/appData";

function formatDate(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("sv-SE", { dateStyle: "medium" }).format(d);
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("sv-SE", { timeStyle: "short" }).format(d);
}

export default function HistoryPage() {
  const { state } = useAppData();
  const [tab, setTab] = useState<"weights" | "injections">("weights");

  const weights = useMemo(() => sortByMeasuredAt(state.weightEntries).slice(-40).reverse(), [state.weightEntries]);
  const injections = useMemo(
    () => sortByInjectedAt(state.injectionLogs).slice(-40).reverse(),
    [state.injectionLogs],
  );

  const monthGrid = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-11
    const first = new Date(year, month, 1);
    const startDow = first.getDay(); // 0 = sunday

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: Array<{ date: Date | null; hasWeight: boolean; hasInjection: boolean }> = [];

    const weightDays = new Set(
      state.weightEntries.map((w) => {
        const d = new Date(w.measuredAt);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      }),
    );
    const injectionDays = new Set(
      state.injectionLogs.map((l) => {
        const d = new Date(l.injectedAt);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      }),
    );

    for (let i = 0; i < startDow; i++) days.push({ date: null, hasWeight: false, hasInjection: false });
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      days.push({
        date: d,
        hasWeight: weightDays.has(key),
        hasInjection: injectionDays.has(key),
      });
    }
    return days;
  }, [state.weightEntries, state.injectionLogs]);

  return (
    <div className="pb-6">
      <div className="pt-4">
        <h1 className="text-2xl font-bold text-zinc-900">Historik</h1>
        <p className="mt-1 text-sm text-zinc-600">Vikter och injektioner över tid.</p>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          data-active={tab === "weights"}
          className="vikttappBtn vikttappBtnSoft flex-1 rounded-2xl px-3 py-2 text-sm font-semibold text-indigo-900"
          onClick={() => setTab("weights")}
        >
          Vikter
        </button>
        <button
          type="button"
          data-active={tab === "injections"}
          className="vikttappBtn vikttappBtnSoft flex-1 rounded-2xl px-3 py-2 text-sm font-semibold text-indigo-900"
          onClick={() => setTab("injections")}
        >
          Injektioner
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3">
        <Card className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-zinc-900">
              Snabbkalender
              <span className="ml-2 text-xs font-medium text-zinc-500">
                (den här månaden)
              </span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] text-zinc-500">
            {["M", "T", "O", "T", "F", "L", "S"].map((d, idx) => (
              <div key={`${d}-${idx}`} className="py-1">
                {d}
              </div>
            ))}

            {monthGrid.map((cell, idx) => (
              <div
                key={idx}
                className={[
                  "relative h-10 rounded-xl bg-white/70 ring-1 ring-black/5",
                  cell.date ? "" : "bg-transparent ring-0",
                ].join(" ")}
              >
                {cell.date ? (
                  <>
                    <div className="p-1 text-[11px] font-semibold text-zinc-700">
                      {cell.date.getDate()}
                    </div>
                    {cell.hasWeight ? (
                      <div className="absolute bottom-1 left-2 right-2 h-1.5 rounded-full bg-zinc-900/90" />
                    ) : null}
                    {cell.hasInjection ? (
                      <div className="absolute top-1 left-2 right-2 h-1.5 rounded-full bg-zinc-300" />
                    ) : null}
                  </>
                ) : null}
              </div>
            ))}
          </div>
        </Card>

        {tab === "weights" ? (
          <Card className="p-4">
            <div className="text-sm font-semibold text-zinc-900">Senaste viktloggar</div>
            <div className="mt-3 space-y-2">
              {weights.length ? (
                weights.map((w: WeightEntry) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-zinc-50 p-3 ring-1 ring-black/5"
                  >
                    <div>
                      <div className="text-sm font-semibold text-zinc-900">{formatKg(w.weightKg)}</div>
                      <div className="mt-0.5 text-xs text-zinc-500">
                        {formatDate(w.measuredAt)} · {formatTime(w.measuredAt)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-zinc-600">Inga viktloggar än.</div>
              )}
            </div>
          </Card>
        ) : (
          <Card className="p-4">
            <div className="text-sm font-semibold text-zinc-900">Senaste injektioner</div>
            <div className="mt-3 space-y-2">
              {injections.length ? (
                injections.map((l: InjectionLog) => (
                  <div
                    key={l.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-zinc-50 p-3 ring-1 ring-black/5"
                  >
                    <div>
                      <div className="text-sm font-semibold text-zinc-900">
                        {l.doseAmountMg.toFixed(2)} {l.doseUnit ?? "mg"}
                      </div>
                      <div className="mt-0.5 text-xs text-zinc-500">
                        {formatDate(l.injectedAt)} · {formatTime(l.injectedAt)}
                      </div>
                    </div>
                    {l.nausea != null || l.fatigue != null || l.appetite != null ? (
                      <div className="text-[11px] font-semibold text-zinc-600">
                        {[
                          l.nausea != null ? `Illamående:${l.nausea}` : null,
                          l.fatigue != null ? `Trötthet:${l.fatigue}` : null,
                          l.appetite != null ? `Apetit:${l.appetite}` : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="text-sm text-zinc-600">Inga injektioner än.</div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function formatKg(kg: number) {
  return `${Math.round(kg * 10) / 10} kg`;
}

