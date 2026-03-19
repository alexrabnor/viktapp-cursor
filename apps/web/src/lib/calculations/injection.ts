import type { InjectionLog } from "./types";

function daysUntil(date: Date, now: Date) {
  return Math.ceil((date.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
}

function getLastInjectionAt(logs: InjectionLog[]): Date | null {
  if (!logs.length) return null;
  const sorted = [...logs].sort(
    (a, b) => new Date(a.injectedAt).getTime() - new Date(b.injectedAt).getTime(),
  );
  return new Date(sorted[sorted.length - 1].injectedAt);
}

export function calcNextInjection({
  intervalDays,
  startDate,
  nextManualAt,
  injectionLogs,
  doseAmountMg,
  now = new Date(),
}: {
  intervalDays: number;
  startDate: Date;
  nextManualAt?: Date | null;
  injectionLogs: InjectionLog[];
  doseAmountMg?: number;
  now?: Date;
}): { nextAt: Date; daysLeft: number; doseAmountMg?: number } | null {
  if (!intervalDays || intervalDays <= 0) return null;

  if (nextManualAt && nextManualAt.getTime() > now.getTime()) {
    return {
      nextAt: nextManualAt,
      daysLeft: daysUntil(nextManualAt, now),
      doseAmountMg,
    };
  }

  const lastInjectedAt = getLastInjectionAt(injectionLogs);
  const base = lastInjectedAt ?? startDate;
  const nextAt = new Date(base.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  return {
    nextAt,
    daysLeft: daysUntil(nextAt, now),
    doseAmountMg,
  };
}

