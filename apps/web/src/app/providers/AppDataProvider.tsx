"use client";

import {
  calcNextInjection,
  calcWeightStreakDays,
  getLatestWeight,
  type BodyMeasurement,
  type DemoState,
  type InjectionLog,
  type ProgressPhoto,
  type WeeklyNote,
  type WeightEntry,
} from "@/lib/appData";
import { directus } from "@/lib/directus";
import { createItem, readItems, updateItem } from "@directus/sdk";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// ── Context-typ (samma gränssnitt som förut) ──────────────────────────────────
type AppDataContextValue = {
  state: DemoState;
  isHydrated: boolean;
  latestWeight: WeightEntry | null;
  nextInjection: ReturnType<typeof calcNextInjection> | null;
  streakDays: number;
  addWeight: (weightKg: number, measuredAt?: Date, source?: string) => void;
  logInjection: (payload: {
    doseAmountMg: number;
    injectedAt?: Date;
    notes?: string;
    nausea?: InjectionLog["nausea"];
    fatigue?: InjectionLog["fatigue"];
    appetite?: InjectionLog["appetite"];
    doseUnit?: string;
  }) => void;
  updateSettings: (patch: Partial<DemoState["settings"]>) => void;
  addWeeklyNote: (payload: {
    weekStartDate: Date;
    note: string;
    mood?: WeeklyNote["mood"];
  }) => void;
  addBodyMeasurement: (payload: {
    measuredAt: Date;
    waistCm?: number;
    chestCm?: number;
    hipsCm?: number;
  }) => void;
  addProgressPhoto: (payload: {
    label?: string;
    takenAt?: Date;
    imageDataUrl: string;
  }) => void;
  resetDemo: () => void;
};

// ── Tom startstate (ingen demo-data) ─────────────────────────────────────────
const EMPTY_STATE: DemoState = {
  version: 2,
  settings: {
    heightCm: 170,
    goalWeightKg: 72,
    injectionIntervalDays: 7,
    doseAmountMg: 1,
  },
  weightEntries: [],
  injectionLogs: [],
  weeklyNotes: [],
  bodyMeasurements: [],
  progressPhotos: [],
};

// ── DB → App-mappare ─────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

function toWeightEntry(r: Row): WeightEntry {
  return {
    id: String(r.id),
    measuredAt: r.date,
    weightKg: Number(r.weight),
    source: r.source ?? undefined,
  };
}

function toInjectionLog(r: Row): InjectionLog {
  return {
    id: String(r.id),
    injectedAt: r.date,
    doseAmountMg: Number(r.dose),
    doseUnit: "mg",
    nausea: r.nausea != null ? (Number(r.nausea) as 0 | 1 | 2 | 3) : undefined,
    fatigue:
      r.fatigue != null ? (Number(r.fatigue) as 0 | 1 | 2 | 3) : undefined,
    appetite:
      r.appetite != null ? (Number(r.appetite) as 0 | 1 | 2 | 3) : undefined,
  };
}

function toWeeklyNote(r: Row): WeeklyNote {
  return {
    id: String(r.id),
    weekStartDate: r.date,
    note: String(r.note ?? ""),
    mood: r.mood ?? undefined,
  };
}

function toBodyMeasurement(r: Row): BodyMeasurement {
  return {
    id: String(r.id),
    measuredAt: r.date,
    waistCm: r.waist != null ? Number(r.waist) : undefined,
    chestCm: r.chest != null ? Number(r.chest) : undefined,
    hipsCm: r.hip != null ? Number(r.hip) : undefined,
  };
}

function getISOWeek(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7,
    )
  );
}

// ── Context ───────────────────────────────────────────────────────────────────
const AppDataContext = createContext<AppDataContextValue | null>(null);

export default function AppDataProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [state, setState] = useState<DemoState>(EMPTY_STATE);
  const [isHydrated, setIsHydrated] = useState(false);

  // ── Initialladdning från Directus ──────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const [weights, injections, settingsRows, notes, measurements] =
          await Promise.all([
            directus.request(
              readItems("vikt_weight_entries" as never, {
                sort: ["date"],
                limit: -1,
              }),
            ),
            directus.request(
              readItems("vikt_injection_logs" as never, {
                sort: ["date"],
                limit: -1,
              }),
            ),
            directus.request(
              readItems("vikt_settings" as never, { limit: 1 }),
            ),
            directus.request(
              readItems("vikt_weekly_notes" as never, {
                sort: ["date"],
                limit: -1,
              }),
            ),
            directus.request(
              readItems("vikt_body_measurements" as never, {
                sort: ["date"],
                limit: -1,
              }),
            ),
          ]);

        const sr = (settingsRows as Row[])[0];
        const settings = sr
          ? {
              heightCm: Number(sr.height) || 170,
              goalWeightKg: Number(sr.goal_weight) || 72,
              injectionIntervalDays:
                Number(sr.injection_interval_days) || 7,
              doseAmountMg: Number(sr.dose_amount) || 1,
            }
          : EMPTY_STATE.settings;

        setState({
          version: 2,
          settings,
          weightEntries: (weights as Row[]).map(toWeightEntry),
          injectionLogs: (injections as Row[]).map(toInjectionLog),
          weeklyNotes: (notes as Row[]).map(toWeeklyNote),
          bodyMeasurements: (measurements as Row[]).map(toBodyMeasurement),
          progressPhotos: [],
        });
      } catch (err) {
        console.error("Kunde inte ladda data från Directus:", err);
      } finally {
        setIsHydrated(true);
      }
    }
    load();
  }, []);

  // ── Härledda värden ────────────────────────────────────────────────────────
  const latestWeight = useMemo(() => getLatestWeight(state), [state]);
  const nextInjection = useMemo(
    () => calcNextInjection(state, new Date()),
    [state],
  );
  const streakDays = useMemo(
    () => calcWeightStreakDays(state.weightEntries, new Date()),
    [state.weightEntries],
  );

  // ── Åtgärder ──────────────────────────────────────────────────────────────
  const addWeight = useCallback(
    (weightKg: number, measuredAt?: Date, source?: string) => {
      const date = (measuredAt ?? new Date()).toISOString();
      const tempId = "tmp_" + Date.now();
      // Optimistisk uppdatering
      setState((prev) => ({
        ...prev,
        weightEntries: [
          ...prev.weightEntries,
          { id: tempId, measuredAt: date, weightKg, source },
        ],
      }));
      directus
        .request(
          createItem("vikt_weight_entries" as never, {
            date,
            weight: weightKg,
            source: source ?? "manuell",
          }),
        )
        .then((created) => {
          setState((prev) => ({
            ...prev,
            weightEntries: prev.weightEntries.map((e) =>
              e.id === tempId
                ? { ...e, id: String((created as Row).id) }
                : e,
            ),
          }));
        })
        .catch((err) => {
          console.error("Kunde inte spara vikt:", err);
          setState((prev) => ({
            ...prev,
            weightEntries: prev.weightEntries.filter((e) => e.id !== tempId),
          }));
        });
    },
    [],
  );

  const logInjection = useCallback(
    (payload: {
      doseAmountMg: number;
      injectedAt?: Date;
      notes?: string;
      nausea?: InjectionLog["nausea"];
      fatigue?: InjectionLog["fatigue"];
      appetite?: InjectionLog["appetite"];
      doseUnit?: string;
    }) => {
      const date = (payload.injectedAt ?? new Date()).toISOString();
      const tempId = "tmp_" + Date.now();
      const optimistic: InjectionLog = {
        id: tempId,
        injectedAt: date,
        doseAmountMg: payload.doseAmountMg,
        doseUnit: payload.doseUnit ?? "mg",
        notes: payload.notes,
        nausea: payload.nausea,
        fatigue: payload.fatigue,
        appetite: payload.appetite,
      };
      setState((prev) => ({
        ...prev,
        injectionLogs: [...prev.injectionLogs, optimistic],
      }));
      directus
        .request(
          createItem("vikt_injection_logs" as never, {
            date,
            dose: payload.doseAmountMg,
            nausea: payload.nausea ?? null,
            fatigue: payload.fatigue ?? null,
            appetite: payload.appetite ?? null,
          }),
        )
        .then((created) => {
          setState((prev) => ({
            ...prev,
            injectionLogs: prev.injectionLogs.map((l) =>
              l.id === tempId
                ? { ...l, id: String((created as Row).id) }
                : l,
            ),
          }));
        })
        .catch((err) => {
          console.error("Kunde inte logga injektion:", err);
          setState((prev) => ({
            ...prev,
            injectionLogs: prev.injectionLogs.filter((l) => l.id !== tempId),
          }));
        });
    },
    [],
  );

  const updateSettings = useCallback(
    (patch: Partial<DemoState["settings"]>) => {
      setState((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...patch },
      }));
      const mapped: Row = {};
      if (patch.heightCm !== undefined) mapped.height = patch.heightCm;
      if (patch.goalWeightKg !== undefined)
        mapped.goal_weight = patch.goalWeightKg;
      if (patch.injectionIntervalDays !== undefined)
        mapped.injection_interval_days = patch.injectionIntervalDays;
      if (patch.doseAmountMg !== undefined)
        mapped.dose_amount = patch.doseAmountMg;
      directus
        .request(updateItem("vikt_settings" as never, 1, mapped))
        .catch((err) => console.error("Kunde inte spara inställningar:", err));
    },
    [],
  );

  const addWeeklyNote = useCallback(
    (payload: {
      weekStartDate: Date;
      note: string;
      mood?: WeeklyNote["mood"];
    }) => {
      const date = payload.weekStartDate.toISOString();
      const tempId = "tmp_" + Date.now();
      setState((prev) => ({
        ...prev,
        weeklyNotes: [
          ...prev.weeklyNotes,
          {
            id: tempId,
            weekStartDate: date,
            note: payload.note,
            mood: payload.mood,
          },
        ],
      }));
      directus
        .request(
          createItem("vikt_weekly_notes" as never, {
            date,
            note: payload.note,
            mood: payload.mood ?? null,
            week: getISOWeek(payload.weekStartDate),
            year: payload.weekStartDate.getFullYear(),
          }),
        )
        .then((created) => {
          setState((prev) => ({
            ...prev,
            weeklyNotes: prev.weeklyNotes.map((n) =>
              n.id === tempId
                ? { ...n, id: String((created as Row).id) }
                : n,
            ),
          }));
        })
        .catch((err) => {
          console.error("Kunde inte spara veckonotering:", err);
          setState((prev) => ({
            ...prev,
            weeklyNotes: prev.weeklyNotes.filter((n) => n.id !== tempId),
          }));
        });
    },
    [],
  );

  const addBodyMeasurement = useCallback(
    (payload: {
      measuredAt: Date;
      waistCm?: number;
      chestCm?: number;
      hipsCm?: number;
    }) => {
      const date = payload.measuredAt.toISOString();
      const tempId = "tmp_" + Date.now();
      setState((prev) => ({
        ...prev,
        bodyMeasurements: [
          ...prev.bodyMeasurements,
          {
            id: tempId,
            measuredAt: date,
            waistCm: payload.waistCm,
            chestCm: payload.chestCm,
            hipsCm: payload.hipsCm,
          },
        ],
      }));
      directus
        .request(
          createItem("vikt_body_measurements" as never, {
            date,
            waist: payload.waistCm ?? null,
            chest: payload.chestCm ?? null,
            hip: payload.hipsCm ?? null,
          }),
        )
        .then((created) => {
          setState((prev) => ({
            ...prev,
            bodyMeasurements: prev.bodyMeasurements.map((m) =>
              m.id === tempId
                ? { ...m, id: String((created as Row).id) }
                : m,
            ),
          }));
        })
        .catch((err) => {
          console.error("Kunde inte spara kroppsmått:", err);
          setState((prev) => ({
            ...prev,
            bodyMeasurements: prev.bodyMeasurements.filter(
              (m) => m.id !== tempId,
            ),
          }));
        });
    },
    [],
  );

  // Progress-foton lagras lokalt (för stora för DB-text)
  const addProgressPhoto = useCallback(
    (payload: { label?: string; takenAt?: Date; imageDataUrl: string }) => {
      const entry: ProgressPhoto = {
        id: "local_" + Date.now(),
        takenAt: (payload.takenAt ?? new Date()).toISOString(),
        label: payload.label,
        imageDataUrl: payload.imageDataUrl,
      };
      setState((prev) => ({
        ...prev,
        progressPhotos: [...prev.progressPhotos, entry],
      }));
    },
    [],
  );

  const resetDemo = useCallback(() => {
    setState(EMPTY_STATE);
  }, []);

  const value = useMemo<AppDataContextValue>(
    () => ({
      state,
      isHydrated,
      latestWeight,
      nextInjection,
      streakDays,
      addWeight,
      logInjection,
      updateSettings,
      addWeeklyNote,
      addBodyMeasurement,
      addProgressPhoto,
      resetDemo,
    }),
    [
      state,
      isHydrated,
      latestWeight,
      nextInjection,
      streakDays,
      addWeight,
      logInjection,
      updateSettings,
      addWeeklyNote,
      addBodyMeasurement,
      addProgressPhoto,
      resetDemo,
    ],
  );

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData måste användas inuti AppDataProvider");
  return ctx;
}
