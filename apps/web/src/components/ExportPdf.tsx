"use client";

import { PDFDownloadLink, Document, Page, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 11, fontFamily: "Helvetica" },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontWeight: 700, marginTop: 14, marginBottom: 8 },
  row: { marginBottom: 4 },
  muted: { color: "rgb(90,90,90)" },
});

function ExportPdfDocument({
  nowLabel,
  rows,
}: {
  nowLabel: string;
  rows: {
    settings: string[];
    latestWeight: string | null;
    nextInjection: string | null;
    weights: string[];
    injections: string[];
    measurements: string[];
    notes: string[];
  };
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Vikttapp – export</Text>
        <Text style={styles.muted}>Genererad: {nowLabel}</Text>

        <Text style={styles.sectionTitle}>Översikt</Text>
        {rows.settings.map((s, i) => (
          <Text key={i} style={styles.row}>
            {s}
          </Text>
        ))}
        {rows.latestWeight ? (
          <Text style={styles.row}>Senaste vikt: {rows.latestWeight}</Text>
        ) : null}
        {rows.nextInjection ? (
          <Text style={styles.row}>Nästa injektion: {rows.nextInjection}</Text>
        ) : null}

        <Text style={styles.sectionTitle}>Viktloggar</Text>
        {rows.weights.length ? (
          rows.weights.map((w, i) => (
            <Text key={i} style={styles.row}>
              {w}
            </Text>
          ))
        ) : (
          <Text style={styles.muted}>Inga viktloggar.</Text>
        )}

        <Text style={styles.sectionTitle}>Injektioner</Text>
        {rows.injections.length ? (
          rows.injections.map((w, i) => (
            <Text key={i} style={styles.row}>
              {w}
            </Text>
          ))
        ) : (
          <Text style={styles.muted}>Inga injektioner.</Text>
        )}

        <Text style={styles.sectionTitle}>Kroppsmått</Text>
        {rows.measurements.length ? (
          rows.measurements.map((w, i) => (
            <Text key={i} style={styles.row}>
              {w}
            </Text>
          ))
        ) : (
          <Text style={styles.muted}>Inga mått.</Text>
        )}

        <Text style={styles.sectionTitle}>Veckonoter</Text>
        {rows.notes.length ? (
          rows.notes.map((w, i) => (
            <Text key={i} style={styles.row}>
              {w}
            </Text>
          ))
        ) : (
          <Text style={styles.muted}>Inga veckonoter.</Text>
        )}
      </Page>
    </Document>
  );
}

export default function ExportPdf({
  fileName,
  nowLabel,
  rows,
}: {
  fileName: string;
  nowLabel: string;
  rows: {
    settings: string[];
    latestWeight: string | null;
    nextInjection: string | null;
    weights: string[];
    injections: string[];
    measurements: string[];
    notes: string[];
  };
}) {
  return (
    <PDFDownloadLink
      document={<ExportPdfDocument nowLabel={nowLabel} rows={rows} />}
      fileName={fileName}
    >
      {({ loading }) => (
        <span
          className={[
            "vikttappBtn vikttappBtnPrimary",
            "inline-flex w-full items-center justify-center",
            "rounded-2xl px-4 py-3 text-sm font-semibold text-white",
          ].join(" ")}
          role="button"
          aria-label="Exportera PDF"
        >
          {loading ? "Genererar PDF..." : "Exportera PDF"}
        </span>
      )}
    </PDFDownloadLink>
  );
}

