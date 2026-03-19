"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import Card from "@/components/Card";
import { useAppData } from "@/app/providers/AppDataProvider";

const ExportPdf = dynamic(() => import("@/components/ExportPdf"), { ssr: false });

function downloadTextFile(filename: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function csvEscape(value: unknown) {
  if (value == null) return "";
  const s = String(value);
  if (s.includes('"') || s.includes(",") || s.includes("\n")) {
    return `"${s.replaceAll('"', '""')}"`;
  }
  return s;
}

function toCsv(rows: string[][]) {
  return rows.map((r) => r.map(csvEscape).join(",")).join("\n");
}

export default function ExportPage() {
  const { state, latestWeight, nextInjection } = useAppData();

  const exportModel = useMemo(() => {
    const nowLabel = new Intl.DateTimeFormat("sv-SE", { dateStyle: "medium", timeStyle: "short" }).format(new Date());

    const settingsLines = [
      `Längd: ${state.settings.heightCm} cm`,
      `Målvikt: ${state.settings.goalWeightKg} kg`,
      `Injektionsintervall: ${state.settings.injectionIntervalDays} dagar`,
      `Dos: ${state.settings.doseAmountMg} mg`,
    ];

    const latestWeightLine = latestWeight ? `${latestWeight.weightKg.toFixed(1)} kg (${latestWeight.measuredAt})` : null;
    const nextInjectionLine = nextInjection?.nextAt
      ? `${new Intl.DateTimeFormat("sv-SE", { dateStyle: "medium" }).format(nextInjection.nextAt)} (${nextInjection.daysLeft} dagar kvar)`
      : null;

    const weights = [...state.weightEntries]
      .sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime())
      .slice(0, 50)
      .map((w) => `${w.measuredAt}: ${w.weightKg.toFixed(1)} kg${w.source ? ` (${w.source})` : ""}`);

    const injections = [...state.injectionLogs]
      .sort((a, b) => new Date(b.injectedAt).getTime() - new Date(a.injectedAt).getTime())
      .slice(0, 50)
      .map((l) => {
        const side =
          l.nausea != null || l.fatigue != null || l.appetite != null
            ? `, ill:${l.nausea ?? "-"} trött:${l.fatigue ?? "-"} aptit:${l.appetite ?? "-"}`
            : "";
        const notes = l.notes ? `, ${l.notes}` : "";
        return `${l.injectedAt}: ${l.doseAmountMg.toFixed(2)} ${l.doseUnit ?? "mg"}${side}${notes}`;
      });

    const measurements = [...state.bodyMeasurements]
      .sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime())
      .slice(0, 50)
      .map((m) => {
        const parts = [
          m.waistCm != null ? `midja ${m.waistCm} cm` : null,
          m.chestCm != null ? `bröst ${m.chestCm} cm` : null,
          m.hipsCm != null ? `höfter ${m.hipsCm} cm` : null,
        ].filter(Boolean);
        return `${m.measuredAt}: ${parts.join(", ") || "-"}`;
      });

    const notes = [...state.weeklyNotes]
      .sort((a, b) => new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime())
      .slice(0, 50)
      .map((n) => `${n.weekStartDate}${n.mood ? ` (${n.mood})` : ""}: ${n.note}`);

    return { nowLabel, settingsLines, latestWeightLine, nextInjectionLine, weights, injections, measurements, notes };
  }, [state, latestWeight, nextInjection]);

  const csv = useMemo(() => {
    const rows: string[][] = [];
    rows.push(["type", "date", "value1", "value2", "meta"]);

    for (const w of [...state.weightEntries].sort((a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime())) {
      rows.push(["weight", w.measuredAt, w.weightKg.toFixed(1), w.source ?? "", ""]);
    }
    for (const l of [...state.injectionLogs].sort((a, b) => new Date(a.injectedAt).getTime() - new Date(b.injectedAt).getTime())) {
      rows.push([
        "injection",
        l.injectedAt,
        l.doseAmountMg.toFixed(2),
        l.doseUnit ?? "mg",
        `nausea=${l.nausea ?? ""}; fatigue=${l.fatigue ?? ""}; appetite=${l.appetite ?? ""}${l.notes ? `; notes=${l.notes}` : ""}`,
      ]);
    }
    for (const m of [...state.bodyMeasurements].sort((a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime())) {
      rows.push([
        "measurement",
        m.measuredAt,
        `${m.waistCm ?? ""}`,
        `chest=${m.chestCm ?? ""}; hips=${m.hipsCm ?? ""}`,
        "",
      ]);
    }
    for (const n of [...state.weeklyNotes].sort((a, b) => new Date(a.weekStartDate).getTime() - new Date(b.weekStartDate).getTime())) {
      rows.push(["weekly_note", n.weekStartDate, "", "", `mood=${n.mood ?? ""}; note=${n.note}`]);
    }

    return toCsv(rows);
  }, [state]);

  return (
    <div className="pb-6">
      <div className="pt-4">
        <h1 className="text-2xl font-bold text-zinc-900">Export</h1>
        <p className="mt-1 text-sm text-zinc-600">Ladda ner CSV eller PDF av din data.</p>
      </div>

      <div className="mt-4 space-y-3">
        <Card className="p-4">
          <div className="text-sm font-semibold text-zinc-900">CSV</div>
          <div className="mt-1 text-sm text-zinc-600">Vikt, injektioner, mått och veckonoter.</div>
          <button
            type="button"
            className="vikttappBtn vikttappBtnPrimary mt-3 w-full px-4 py-3 text-sm font-semibold text-white"
            onClick={() => {
              const filename = `vikttapp-export-${new Date().toISOString().slice(0, 10)}.csv`;
              downloadTextFile(filename, csv, "text/csv");
            }}
          >
            Exportera CSV
          </button>
        </Card>

        <Card className="p-4">
          <div className="text-sm font-semibold text-zinc-900">PDF</div>
          <div className="mt-1 text-sm text-zinc-600">Översikt + senaste loggar (för demo).</div>
          <div className="mt-3">
            <ExportPdf
              fileName={`vikttapp-export-${new Date().toISOString().slice(0, 10)}.pdf`}
              nowLabel={exportModel.nowLabel}
              rows={{
                settings: exportModel.settingsLines,
                latestWeight: exportModel.latestWeightLine,
                nextInjection: exportModel.nextInjectionLine,
                weights: exportModel.weights,
                injections: exportModel.injections,
                measurements: exportModel.measurements,
                notes: exportModel.notes,
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

