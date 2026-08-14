"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Card from "@/components/Card";
import { useAppData } from "@/app/providers/AppDataProvider";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-zinc-800">{label}</span>
        {hint ? <span className="text-xs text-zinc-500">{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}

export default function SettingsPage() {
  const {
    state,
    isHydrated,
    updateSettings,
    addWeeklyNote,
    addBodyMeasurement,
    addProgressPhoto,
  } = useAppData();

  const [heightCm, setHeightCm] = useState(state.settings.heightCm);
  const [goalWeightKg, setGoalWeightKg] = useState(state.settings.goalWeightKg);
  const [injectionIntervalDays, setInjectionIntervalDays] = useState(
    state.settings.injectionIntervalDays,
  );
  const [doseAmountMg, setDoseAmountMg] = useState(state.settings.doseAmountMg);

  // Synka formulär när Directus-data laddats
  useEffect(() => {
    if (isHydrated) {
      setHeightCm(state.settings.heightCm);
      setGoalWeightKg(state.settings.goalWeightKg);
      setInjectionIntervalDays(state.settings.injectionIntervalDays);
      setDoseAmountMg(state.settings.doseAmountMg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]);

  const weekStartISO = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diffToMonday = (day + 6) % 7;
    d.setDate(d.getDate() - diffToMonday);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  };

  const currentWeekStartIso = weekStartISO(new Date());

  const [noteText, setNoteText] = useState(() => {
    const existing = state.weeklyNotes.find((n) => n.weekStartDate === currentWeekStartIso);
    return existing?.note ?? "";
  });
  const [mood, setMood] = useState<string>(() => {
    const existing = state.weeklyNotes.find((n) => n.weekStartDate === currentWeekStartIso);
    return existing?.mood ?? "stabil";
  });

  const [measuredAt, setMeasuredAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [waistCm, setWaistCm] = useState<number | "">("");
  const [chestCm, setChestCm] = useState<number | "">("");
  const [hipsCm, setHipsCm] = useState<number | "">("");

  const [photoLabel, setPhotoLabel] = useState("front");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoTakenAt, setPhotoTakenAt] = useState(() => new Date().toISOString().slice(0, 10));
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isHydrated) {
    return (
      <div className="pb-6 pt-4">
        <h1 className="text-2xl font-bold text-zinc-900">Inställningar</h1>
        <div className="mt-6 flex items-center gap-3 text-sm text-zinc-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700" />
          Laddar inställningar…
        </div>
      </div>
    );
  }

  return (
    <div className="pb-6">
      <div className="pt-4">
        <h1 className="text-2xl font-bold text-zinc-900">Inställningar</h1>
        <p className="mt-1 text-sm text-zinc-600">Grunddata för beräkningar och påminnelser.</p>
      </div>

      <div className="mt-4 space-y-3">
        {/* ── Mål & mått ── */}
        <Card className="p-4">
          <div className="text-sm font-semibold text-zinc-900">Mål och mått</div>
          <div className="mt-3 space-y-3">
            <Field label="Längd" hint="cm">
              <input
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/20"
                type="number"
                step="1"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
              />
            </Field>
            <Field label="Målvikt" hint="kg">
              <input
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/20"
                type="number"
                step="0.1"
                value={goalWeightKg}
                onChange={(e) => setGoalWeightKg(Number(e.target.value))}
              />
            </Field>
          </div>
          <button
            type="button"
            className="vikttappBtn vikttappBtnPrimary mt-4 w-full px-4 py-3 text-sm font-semibold text-white"
            onClick={() => {
              if (!Number.isFinite(heightCm) || heightCm <= 0) return;
              if (!Number.isFinite(goalWeightKg) || goalWeightKg <= 0) return;
              updateSettings({ heightCm, goalWeightKg });
            }}
          >
            Spara
          </button>
        </Card>

        {/* ── Injektioner ── */}
        <Card className="p-4">
          <div className="text-sm font-semibold text-zinc-900">Injektioner</div>
          <div className="mt-3 space-y-3">
            <Field label="Intervall" hint="dagar">
              <input
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/20"
                type="number"
                step="1"
                value={injectionIntervalDays}
                onChange={(e) => setInjectionIntervalDays(Number(e.target.value))}
              />
            </Field>
            <Field label="Dos" hint="mg">
              <input
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/20"
                type="number"
                step="0.01"
                value={doseAmountMg}
                onChange={(e) => setDoseAmountMg(Number(e.target.value))}
              />
            </Field>
          </div>
          <button
            type="button"
            className="vikttappBtn vikttappBtnPrimary mt-4 w-full px-4 py-3 text-sm font-semibold text-white"
            onClick={() => {
              if (!Number.isFinite(injectionIntervalDays) || injectionIntervalDays <= 0) return;
              if (!Number.isFinite(doseAmountMg) || doseAmountMg <= 0) return;
              updateSettings({ injectionIntervalDays, doseAmountMg });
            }}
          >
            Spara injektionsinställningar
          </button>
        </Card>

        {/* ── Veckonoter ── */}
        <Card className="p-4">
          <div className="text-sm font-semibold text-zinc-900">Veckonoter</div>
          <div className="mt-2 text-xs text-zinc-500">
            Vecka start:{" "}
            {new Intl.DateTimeFormat("sv-SE", { dateStyle: "medium" }).format(
              new Date(currentWeekStartIso),
            )}
          </div>
          <div className="mt-3 space-y-3">
            <Field label="Stämningsläge (valfritt)" hint="mood">
              <input
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/20"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                placeholder="t.ex. stabil, bra, trött…"
              />
            </Field>
            <Field label="Notis">
              <textarea
                className="mt-1 min-h-28 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/20"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Skriv några rader om hur veckan gick…"
              />
            </Field>
            <button
              type="button"
              className="vikttappBtn vikttappBtnPrimary w-full px-4 py-3 text-sm font-semibold text-white"
              onClick={() => {
                const trimmed = noteText.trim();
                if (!trimmed) return;
                addWeeklyNote({
                  weekStartDate: new Date(currentWeekStartIso),
                  note: trimmed,
                  mood: mood.trim() || undefined,
                });
                setNoteText("");
              }}
            >
              Spara veckonot
            </button>
          </div>

          {state.weeklyNotes.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-semibold text-zinc-900">Senaste noterna</div>
              <div className="mt-2 space-y-2">
                {[...state.weeklyNotes]
                  .sort((a, b) => new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime())
                  .slice(0, 3)
                  .map((n) => (
                    <div key={n.id} className="rounded-2xl bg-zinc-50 p-3 ring-1 ring-black/5">
                      <div className="text-xs font-semibold text-zinc-500">
                        {new Intl.DateTimeFormat("sv-SE", { dateStyle: "medium" }).format(
                          new Date(n.weekStartDate),
                        )}
                        {n.mood ? ` · ${n.mood}` : ""}
                      </div>
                      <div className="mt-1 text-sm font-medium text-zinc-800">{n.note}</div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </Card>

        {/* ── Kroppsmått ── */}
        <Card className="p-4">
          <div className="text-sm font-semibold text-zinc-900">Kroppsmått</div>
          <div className="mt-3 space-y-3">
            <Field label="Datum">
              <input
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/20"
                type="date"
                value={measuredAt}
                onChange={(e) => setMeasuredAt(e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-3 gap-2">
              <Field label="Midja (cm)">
                <input
                  className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/20"
                  type="number" step="0.1" value={waistCm}
                  onChange={(e) => setWaistCm(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </Field>
              <Field label="Bröst (cm)">
                <input
                  className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/20"
                  type="number" step="0.1" value={chestCm}
                  onChange={(e) => setChestCm(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </Field>
              <Field label="Höfter (cm)">
                <input
                  className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/20"
                  type="number" step="0.1" value={hipsCm}
                  onChange={(e) => setHipsCm(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </Field>
            </div>
            <button
              type="button"
              className="vikttappBtn vikttappBtnPrimary w-full px-4 py-3 text-sm font-semibold text-white"
              onClick={() => {
                const parsed = new Date(`${measuredAt}T12:00:00`);
                if (!Number.isFinite(parsed.getTime())) return;
                addBodyMeasurement({
                  measuredAt: parsed,
                  waistCm: waistCm === "" ? undefined : waistCm,
                  chestCm: chestCm === "" ? undefined : chestCm,
                  hipsCm: hipsCm === "" ? undefined : hipsCm,
                });
                setWaistCm(""); setChestCm(""); setHipsCm("");
              }}
            >
              Spara mått
            </button>
          </div>

          {state.bodyMeasurements.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-semibold text-zinc-900">Senaste måtten</div>
              <div className="mt-2 space-y-2">
                {[...state.bodyMeasurements]
                  .sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime())
                  .slice(0, 3)
                  .map((m) => (
                    <div key={m.id} className="rounded-2xl bg-zinc-50 p-3 ring-1 ring-black/5">
                      <div className="text-xs font-semibold text-zinc-500">
                        {new Intl.DateTimeFormat("sv-SE", { dateStyle: "medium" }).format(
                          new Date(m.measuredAt),
                        )}
                      </div>
                      <div className="mt-1 text-sm font-medium text-zinc-800">
                        {[
                          m.waistCm != null ? `Midja ${m.waistCm} cm` : null,
                          m.chestCm != null ? `Bröst ${m.chestCm} cm` : null,
                          m.hipsCm != null ? `Höfter ${m.hipsCm} cm` : null,
                        ].filter(Boolean).join(" · ")}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </Card>

        {/* ── Progressfoton ── */}
        <Card className="p-4">
          <div className="text-sm font-semibold text-zinc-900">Progressfoton</div>
          <div className="mt-3 space-y-3">
            <Field label="Label">
              <input
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/20"
                value={photoLabel}
                onChange={(e) => setPhotoLabel(e.target.value)}
              />
            </Field>
            <Field label="Datum">
              <input
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/20"
                type="date"
                value={photoTakenAt}
                onChange={(e) => setPhotoTakenAt(e.target.value)}
              />
            </Field>
            <div>
              <div className="text-sm font-semibold text-zinc-800">Välj bild</div>
              {/* Dold native file-input – triggas via knappen nedan */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const result = reader.result;
                    if (typeof result === "string") setPhotoDataUrl(result);
                  };
                  reader.readAsDataURL(file);
                }}
              />
              <button
                type="button"
                className="vikttappBtn vikttappBtnSoft mt-1 w-full px-4 py-3 text-sm font-semibold text-zinc-900"
                onClick={() => fileInputRef.current?.click()}
              >
                {photoDataUrl ? "Byt bild" : "Välj bild från galleri"}
              </button>
            </div>
            {photoDataUrl ? (
              <div className="rounded-3xl bg-zinc-50 p-3 ring-1 ring-black/5">
                <img src={photoDataUrl} alt="Förhandsvisning"
                  className="h-48 w-full rounded-2xl object-cover" />
              </div>
            ) : null}
            <button
              type="button"
              className="vikttappBtn vikttappBtnPrimary w-full px-4 py-3 text-sm font-semibold text-white"
              onClick={() => {
                if (!photoDataUrl) return;
                const taken = new Date(`${photoTakenAt}T12:00:00`);
                addProgressPhoto({ takenAt: taken, label: photoLabel.trim() || undefined, imageDataUrl: photoDataUrl });
                setPhotoDataUrl(null);
              }}
            >
              Spara foto
            </button>
          </div>
          {state.progressPhotos.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-semibold text-zinc-900">Senaste foton</div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[...state.progressPhotos]
                  .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime())
                  .slice(0, 6)
                  .map((p) => (
                    <img key={p.id} src={p.imageDataUrl} alt={p.label ?? "progressfoto"}
                      className="h-20 w-full rounded-2xl object-cover ring-1 ring-black/5" />
                  ))}
              </div>
            </div>
          )}
        </Card>

        {/* ── Export ── */}
        <Card className="p-4">
          <div className="text-sm font-semibold text-zinc-900">Export</div>
          <div className="mt-2 text-sm text-zinc-600">Ladda ner din data som CSV eller PDF.</div>
          <Link
            href="/export"
            className="vikttappBtn vikttappBtnPrimary mt-3 inline-flex w-full items-center justify-center px-4 py-3 text-sm font-semibold text-white"
          >
            Öppna export
          </Link>
        </Card>
      </div>
    </div>
  );
}
