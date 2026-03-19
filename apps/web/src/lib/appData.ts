export type WeightEntry = {
  id: string;
  measuredAt: string; // ISO
  weightKg: number;
  source?: string;
};

export type InjectionLog = {
  id: string;
  injectedAt: string; // ISO
  doseAmountMg: number;
  doseUnit?: string;
  notes?: string;
  nausea?: 0 | 1 | 2 | 3;
  fatigue?: 0 | 1 | 2 | 3;
  appetite?: 0 | 1 | 2 | 3;
};

export type WeeklyNote = {
  id: string;
  weekStartDate: string; // ISO date (start of week)
  note: string;
  mood?: string;
};

export type BodyMeasurement = {
  id: string;
  measuredAt: string; // ISO datetime
  waistCm?: number;
  chestCm?: number;
  hipsCm?: number;
};

export type ProgressPhoto = {
  id: string;
  takenAt: string; // ISO datetime
  label?: string;
  // I lokal demo lagrar vi bilden som data URL.
  imageDataUrl: string;
};

export type AppSettings = {
  heightCm: number;
  goalWeightKg: number;
  injectionIntervalDays: number;
  doseAmountMg: number;
};

export type DemoState = {
  version: 2;
  settings: AppSettings;
  weightEntries: WeightEntry[];
  injectionLogs: InjectionLog[];
  weeklyNotes: WeeklyNote[];
  bodyMeasurements: BodyMeasurement[];
  progressPhotos: ProgressPhoto[];
};

const STORAGE_KEY = "vikttapp_state_v2";

function uuid() {
  return globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : String(Date.now()) + Math.random().toString(16).slice(2);
}

export function defaultDemoState(): DemoState {
  const now = new Date();
  const daysAgo = (d: number) => {
    const dt = new Date(now);
    dt.setDate(dt.getDate() - d);
    return dt.toISOString();
  };

  const weekStartISO = (date: Date) => {
    // Monday as start (ISO-ish)
    const d = new Date(date);
    const day = d.getDay(); // 0=sun
    const diffToMonday = (day + 6) % 7; // 0 when Monday
    d.setDate(d.getDate() - diffToMonday);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  };

  return {
    version: 2,
    settings: {
      heightCm: 170,
      goalWeightKg: 72,
      injectionIntervalDays: 7,
      doseAmountMg: 1,
    },
    weightEntries: [
      { id: uuid(), measuredAt: daysAgo(30), weightKg: 82.4, source: "demo" },
      { id: uuid(), measuredAt: daysAgo(14), weightKg: 79.9, source: "demo" },
      { id: uuid(), measuredAt: daysAgo(7), weightKg: 77.6, source: "demo" },
      { id: uuid(), measuredAt: daysAgo(1), weightKg: 76.9, source: "demo" },
    ],
    injectionLogs: [
      {
        id: uuid(),
        injectedAt: daysAgo(7),
        doseAmountMg: 1,
        doseUnit: "mg",
      },
    ],
    weeklyNotes: [
      {
        id: uuid(),
        weekStartDate: weekStartISO(now),
        note: "Känns bra! Fortsätt med rutinen och drick vatten.",
        mood: "stabil",
      },
    ],
    bodyMeasurements: [
      {
        id: uuid(),
        measuredAt: daysAgo(7),
        waistCm: 82,
        chestCm: 96,
        hipsCm: 102,
      },
    ],
    progressPhotos: [],
  };
}

export function loadDemoState(): DemoState {
  if (typeof window === "undefined") return defaultDemoState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultDemoState();
    const parsed = JSON.parse(raw) as DemoState;
    if (parsed?.version !== 2) return defaultDemoState();
    return parsed;
  } catch {
    return defaultDemoState();
  }
}

export function saveDemoState(state: DemoState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function sortByMeasuredAt(entries: WeightEntry[]) {
  return [...entries].sort(
    (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime(),
  );
}

export function sortByInjectedAt(entries: InjectionLog[]) {
  return [...entries].sort(
    (a, b) => new Date(a.injectedAt).getTime() - new Date(b.injectedAt).getTime(),
  );
}

export function getLatestWeight(state: DemoState): WeightEntry | null {
  const sorted = sortByMeasuredAt(state.weightEntries);
  return sorted.length ? sorted[sorted.length - 1] : null;
}

export function getClosestWeightAtOrBefore(
  state: DemoState,
  targetDate: Date,
): WeightEntry | null {
  const sorted = sortByMeasuredAt(state.weightEntries);
  const t = targetDate.getTime();
  let best: WeightEntry | null = null;
  for (const entry of sorted) {
    const ts = new Date(entry.measuredAt).getTime();
    if (ts <= t) best = entry;
    else break;
  }
  return best;
}

export function calcBMI(weightKg: number, heightCm: number) {
  const heightM = heightCm / 100;
  if (!heightM || heightM <= 0) return null;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
}

export type BmiCategory = "underweight" | "normal" | "overweight";

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

export function calcWeeklyWeightChangeKg(state: DemoState, days: number) {
  const latest = getLatestWeight(state);
  if (!latest) return null;
  const now = new Date(latest.measuredAt);
  const target = new Date(now);
  target.setDate(target.getDate() - days);
  const at = getClosestWeightAtOrBefore(state, target);
  if (!at) return null;
  return latest.weightKg - at.weightKg;
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
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function getStartWeightKg(state: DemoState) {
  const sorted = sortByMeasuredAt(state.weightEntries);
  return sorted.length ? sorted[0].weightKg : null;
}

export function calcNextInjection(state: DemoState, now = new Date()) {
  const plan = {
    intervalDays: state.settings.injectionIntervalDays,
    doseAmountMg: state.settings.doseAmountMg,
  };

  const logs = sortByInjectedAt(state.injectionLogs);
  const intervalMs = plan.intervalDays * 24 * 60 * 60 * 1000;

  // Latest injected + interval; fall back to latest weight date + interval.
  const lastInjectedAt = logs.length ? new Date(logs[logs.length - 1].injectedAt) : null;
  const baseDate = lastInjectedAt ?? (getLatestWeight(state)?.measuredAt ? new Date(getLatestWeight(state)!.measuredAt) : null);

  if (!baseDate) return null;

  const next = new Date(baseDate.getTime() + intervalMs);
  const diffMs = next.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  return { nextAt: next, daysLeft, doseAmountMg: plan.doseAmountMg };
}

export function daysUntil(date: Date, now = new Date()) {
  return Math.ceil((date.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
}

export function calcWeightStreakDays(
  weightEntries: WeightEntry[],
  now = new Date(),
) {
  if (!weightEntries.length) return 0;

  const hasDate = new Set(
    weightEntries.map((w) => {
      const d = new Date(w.measuredAt);
      // Local date key
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      return key;
    }),
  );

  let streak = 0;
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);

  // Count backwards while we have at least one entry for each day.
  // If today has no entry, streak should be 0.
  while (true) {
    const key = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
    if (!hasDate.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

