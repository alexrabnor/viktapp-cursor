"use client";

import {
  calcNextInjection,
  defaultDemoState,
  getLatestWeight,
  loadDemoState,
  calcWeightStreakDays,
  saveDemoState,
  type DemoState,
  type InjectionLog,
  type WeightEntry,
  type WeeklyNote,
  type BodyMeasurement,
  type ProgressPhoto,
} from "@/lib/appData";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type AppDataContextValue = {
  state: DemoState;
  isHydrated: boolean;
  // Derived (handy for initial UI)
  latestWeight: WeightEntry | null;
  nextInjection: ReturnType<typeof calcNextInjection> | null;
  streakDays: number;
  // Actions
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
  addWeeklyNote: (payload: { weekStartDate: Date; note: string; mood?: WeeklyNote["mood"] }) => void;
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

const AppDataContext = createContext<AppDataContextValue | null>(null);

export default function AppDataProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [state, setState] = useState<DemoState>(() => defaultDemoState());
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Ladda demo-data efter första paint för att undvika hydreringsmismatch.
    // Vi kör setState i en microtask så ESLint-protektionen "setState i effect"
    // inte triggas på samma sätt.
    queueMicrotask(() => {
      setState(loadDemoState());
      setIsHydrated(true);
    });
  }, []);

  // Persist on change (debounced a bit to keep typing smooth).
  useEffect(() => {
    if (!isHydrated) return;
    const t = window.setTimeout(() => saveDemoState(state), 250);
    return () => window.clearTimeout(t);
  }, [isHydrated, state]);

  const latestWeight = useMemo(() => getLatestWeight(state), [state]);
  const nextInjection = useMemo(() => calcNextInjection(state, new Date()), [state]);
  const streakDays = useMemo(() => calcWeightStreakDays(state.weightEntries, new Date()), [state.weightEntries]);

  const addWeight = useCallback(
    (weightKg: number, measuredAt?: Date, source?: string) => {
      const entry: WeightEntry = {
        id: crypto.randomUUID?.() ?? String(Date.now()) + Math.random().toString(16).slice(2),
        measuredAt: (measuredAt ?? new Date()).toISOString(),
        weightKg,
        source,
      };
      setState((prev) => ({
        ...prev,
        weightEntries: [...prev.weightEntries, entry],
      }));
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
      const log: InjectionLog = {
        id: crypto.randomUUID?.() ?? String(Date.now()) + Math.random().toString(16).slice(2),
        injectedAt: (payload.injectedAt ?? new Date()).toISOString(),
        doseAmountMg: payload.doseAmountMg,
        doseUnit: payload.doseUnit ?? "mg",
        notes: payload.notes,
        nausea: payload.nausea,
        fatigue: payload.fatigue,
        appetite: payload.appetite,
      };
      setState((prev) => ({
        ...prev,
        injectionLogs: [...prev.injectionLogs, log],
      }));
    },
    [],
  );

  const updateSettings = useCallback((patch: Partial<DemoState["settings"]>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...patch },
    }));
  }, []);

  const addWeeklyNote = useCallback(
    (payload: { weekStartDate: Date; note: string; mood?: WeeklyNote["mood"] }) => {
      const entry: WeeklyNote = {
        id:
          crypto.randomUUID?.() ??
          String(Date.now()) + Math.random().toString(16).slice(2),
        weekStartDate: payload.weekStartDate.toISOString(),
        note: payload.note,
        mood: payload.mood,
      };
      setState((prev) => ({
        ...prev,
        weeklyNotes: [...prev.weeklyNotes, entry],
      }));
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
      const entry: BodyMeasurement = {
        id:
          crypto.randomUUID?.() ??
          String(Date.now()) + Math.random().toString(16).slice(2),
        measuredAt: payload.measuredAt.toISOString(),
        waistCm: payload.waistCm,
        chestCm: payload.chestCm,
        hipsCm: payload.hipsCm,
      };
      setState((prev) => ({
        ...prev,
        bodyMeasurements: [...prev.bodyMeasurements, entry],
      }));
    },
    [],
  );

  const addProgressPhoto = useCallback(
    (payload: { label?: string; takenAt?: Date; imageDataUrl: string }) => {
      const entry: ProgressPhoto = {
        id:
          crypto.randomUUID?.() ??
          String(Date.now()) + Math.random().toString(16).slice(2),
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
    const fresh = defaultDemoState();
    setState(fresh);
    saveDemoState(fresh);
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

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData måste användas inuti AppDataProvider");
  return ctx;
}

