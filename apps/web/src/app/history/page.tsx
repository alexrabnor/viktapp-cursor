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

function formatKg(kg: number) {
  return `${Math.round(kg * 10) / 10} kg`;
}

const SV_MONTHS = [
  "Januari","Februari","Mars","April","Maj","Juni",
  "Juli","Augusti","September","Oktober","November","December",
];

function localDateString(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function HistoryPage() {
  const { state, addWeight, logInjection } = useAppData();
  const [tab, setTab] = useState<"weights" | "injections">("weights");

  // Månadsnavigation
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-11

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
    if (isCurrentMonth) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  const weights = useMemo(() => sortByMeasuredAt(state.weightEntries).slice(-40).reverse(), [state.weightEntries]);
  const injections = useMemo(
    () => sortByInjectedAt(state.injectionLogs).slice(-40).reverse(),
    [state.injectionLogs],
  );

  // Månadskalender
  const monthGrid = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const startDow = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

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

    const days: Array<{ date: Date | null; hasWeight: boolean; hasInjection: boolean }> = [];
    for (let i = 0; i < startDow; i++)
      days.push({ date: null, hasWeight: false, hasInjection: false });
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(viewYear, viewMonth, day);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      days.push({ date: d, hasWeight: weightDays.has(key), hasInjection: injectionDays.has(key) });
    }
    return days;
  }, [viewYear, viewMonth, state.weightEntries, state.injectionLogs]);

  // ── Formulär: lägg till historisk vikt ──────────────────────────────────────
  const [addWeightOpen, setAddWeightOpen] = useState(false);
  const [addWeightInput, setAddWeightInput] = useState("");
  const [addWeightDate, setAddWeightDate] = useState(() => localDateString(today));
  const [addWeightSuccess, setAddWeightSuccess] = useState(false);

  function handleAddWeight() {
    const w = parseFloat(addWeightInput.replace(",", "."));
    if (!Number.isFinite(w) || w <= 0) return;
    const d = new Date(`${addWeightDate}T12:00:00`);
    if (!Number.isFinite(d.getTime())) return;
    addWeight(w, d, "manuell");
    setAddWeightInput("");
    setAddWeightSuccess(true);
    setTimeout(() => setAddWeightSuccess(false), 2000);
  }

  // ── Formulär: lägg till historisk injektion ──────────────────────────────────
  const [addInjOpen, setAddInjOpen] = useState(false);
  const [addInjDate, setAddInjDate] = useState(() => localDateString(today));
  const [addInjDose, setAddInjDose] = useState("");
  const [addInjNausea, setAddInjNausea] = useState<0 | 1 | 2 | 3 | undefined>(undefined);
  const [addInjFatigue, setAddInjFatigue] = useState<0 | 1 | 2 | 3 | undefined>(undefined);
  const [addInjAppetite, setAddInjAppetite] = useState<0 | 1 | 2 | 3 | undefined>(undefined);
  const [addInjSuccess, setAddInjSuccess] = useState(false);

  function handleAddInjection() {
    const dose = parseFloat(addInjDose.replace(",", "."));
    if (!Number.isFinite(dose) || dose <= 0) return;
    const d = new Date(`${addInjDate}T12:00:00`);
    if (!Number.isFinite(d.getTime())) return;
    logInjection({
      doseAmountMg: dose,
      injectedAt: d,
      nausea: addInjNausea,
      fatigue: addInjFatigue,
      appetite: addInjAppetite,
    });
    setAddInjDose("");
    setAddInjNausea(undefined);
    setAddInjFatigue(undefined);
    setAddInjAppetite(undefined);
    setAddInjSuccess(true);
    setTimeout(() => setAddInjSuccess(false), 2000);
  }

  return (
    <div className="pb-6">
      <div className="pt-4">
        <h1 className="text-2xl font-bold text-zinc-900">Historik</h1>
        <p className="mt-1 text-sm text-zinc-600">Vikter och injektioner över tid.</p>
      </div>

      {/* ── Lägg till historisk vikt ── */}
      <div className="mt-4 space-y-2">
        <button
          type="button"
          className="vikttappBtn vikttappBtnPrimary w-full px-4 py-3 text-sm font-semibold text-white"
          onClick={() => { setAddWeightOpen((v) => !v); setAddInjOpen(false); }}
        >
          {addWeightOpen ? "Stäng" : "+ Lägg till vikt (med datum)"}
        </button>

        {addWeightOpen && (
          <Card className="p-4">
            <div className="text-sm font-semibold text-zinc-900 mb-3">Registrera historisk vikt</div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-semibold text-zinc-600">Datum</span>
                <input
                  type="date"
                  className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/20"
                  value={addWeightDate}
                  max={localDateString(today)}
                  onChange={(e) => setAddWeightDate(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-zinc-600">Vikt (kg)</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="t.ex. 92.5"
                  className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/20"
                  value={addWeightInput}
                  onChange={(e) => setAddWeightInput(e.target.value)}
                />
              </label>
            </div>
            <button
              type="button"
              className={[
                "vikttappBtn mt-3 w-full px-4 py-3 text-sm font-semibold",
                addWeightSuccess ? "bg-green-500 text-white" : "vikttappBtnPrimary text-white",
              ].join(" ")}
              onClick={handleAddWeight}
            >
              {addWeightSuccess ? "✓ Sparad!" : "Spara vikt"}
            </button>
          </Card>
        )}

        {/* ── Lägg till historisk injektion ── */}
        <button
          type="button"
          className="vikttappBtn vikttappBtnSoft w-full px-4 py-3 text-sm font-semibold text-indigo-900"
          onClick={() => { setAddInjOpen((v) => !v); setAddWeightOpen(false); }}
        >
          {addInjOpen ? "Stäng" : "+ Lägg till injektion (med datum)"}
        </button>

        {addInjOpen && (
          <Card className="p-4">
            <div className="text-sm font-semibold text-zinc-900 mb-3">Registrera historisk injektion</div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-semibold text-zinc-600">Datum</span>
                <input
                  type="date"
                  className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/20"
                  value={addInjDate}
                  max={localDateString(today)}
                  onChange={(e) => setAddInjDate(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-zinc-600">Dos (mg)</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="t.ex. 0.25"
                  className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/20"
                  value={addInjDose}
                  onChange={(e) => setAddInjDose(e.target.value)}
                />
              </label>
            </div>

            {/* Biverkningar – valfritt */}
            <div className="mt-3">
              <div className="text-xs font-semibold text-zinc-600 mb-2">Biverkningar (valfritt, 0–3)</div>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { key: "nausea", label: "Illamående", val: addInjNausea, set: setAddInjNausea },
                    { key: "fatigue", label: "Trötthet", val: addInjFatigue, set: setAddInjFatigue },
                    { key: "appetite", label: "Aptit", val: addInjAppetite, set: setAddInjAppetite },
                  ] as const
                ).map(({ key, label, val, set }) => (
                  <div key={key}>
                    <div className="text-[11px] text-zinc-500 mb-1">{label}</div>
                    <div className="flex gap-1">
                      {([0, 1, 2, 3] as const).map((n) => (
                        <button
                          key={n}
                          type="button"
                          className={[
                            "h-7 w-7 rounded-lg text-xs font-bold ring-1",
                            val === n
                              ? "bg-indigo-600 text-white ring-indigo-600"
                              : "bg-white text-zinc-700 ring-black/10",
                          ].join(" ")}
                          onClick={() => set(val === n ? undefined : n)}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              className={[
                "vikttappBtn mt-3 w-full px-4 py-3 text-sm font-semibold",
                addInjSuccess ? "bg-green-500 text-white" : "vikttappBtnPrimary text-white",
              ].join(" ")}
              onClick={handleAddInjection}
            >
              {addInjSuccess ? "✓ Sparad!" : "Spara injektion"}
            </button>
          </Card>
        )}
      </div>

      {/* ── Flikar ── */}
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
        {/* ── Månadskalender ── */}
        <Card className="p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <button
              type="button"
              className="vikttappBtn vikttappBtnSoft rounded-xl px-3 py-1.5 text-sm font-semibold"
              onClick={prevMonth}
            >
              ‹
            </button>
            <div className="text-sm font-semibold text-zinc-900">
              {SV_MONTHS[viewMonth]} {viewYear}
            </div>
            <button
              type="button"
              className={[
                "vikttappBtn vikttappBtnSoft rounded-xl px-3 py-1.5 text-sm font-semibold",
                isCurrentMonth ? "opacity-30 cursor-not-allowed" : "",
              ].join(" ")}
              onClick={nextMonth}
              disabled={isCurrentMonth}
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-zinc-500">
            {["M", "T", "O", "T", "F", "L", "S"].map((d, idx) => (
              <div key={`${d}-${idx}`} className="py-1">{d}</div>
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
                      <div className="absolute top-1 left-2 right-2 h-1.5 rounded-full bg-indigo-400" />
                    ) : null}
                  </>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-2 flex items-center gap-4 text-[10px] text-zinc-500">
            <span className="flex items-center gap-1">
              <span className="inline-block h-1.5 w-4 rounded-full bg-zinc-900/80" />
              Vikt
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-1.5 w-4 rounded-full bg-indigo-400" />
              Injektion
            </span>
          </div>
        </Card>

        {/* ── Viktlista ── */}
        {tab === "weights" ? (
          <Card className="p-4">
            <div className="text-sm font-semibold text-zinc-900">
              Senaste viktloggar
              <span className="ml-2 text-xs font-medium text-zinc-400">(max 40)</span>
            </div>
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
                    {w.source && w.source !== "manuell" && (
                      <span className="text-[10px] text-zinc-400">{w.source}</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-sm text-zinc-600">Inga viktloggar än.</div>
              )}
            </div>
          </Card>
        ) : (
          <Card className="p-4">
            <div className="text-sm font-semibold text-zinc-900">
              Senaste injektioner
              <span className="ml-2 text-xs font-medium text-zinc-400">(max 40)</span>
            </div>
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
                      <div className="text-[11px] font-semibold text-zinc-600 text-right">
                        {[
                          l.nausea != null ? `Ill. ${l.nausea}` : null,
                          l.fatigue != null ? `Trött. ${l.fatigue}` : null,
                          l.appetite != null ? `Aptit ${l.appetite}` : null,
                        ].filter(Boolean).join(" · ")}
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
