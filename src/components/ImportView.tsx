"use client";
import { useState } from "react";
import Papa from "papaparse";

const TARGETS: { key: string; label: string; hints: string[] }[] = [
  { key: "callerNumber", label: "מספר לקוח", hints: ["מספר", "קוד"] },
  { key: "title", label: "תואר", hints: ["תואר"] },
  { key: "firstName", label: "שם פרטי", hints: ["פרטי", "שם פרטי"] },
  { key: "lastName", label: "שם משפחה", hints: ["משפחה"] },
  { key: "suffix", label: "סיומת", hints: ["סיומת"] },
  { key: "address", label: "כתובת", hints: ["כתובת", "רחוב"] },
  { key: "city", label: "עיר", hints: ["עיר", "יישוב"] },
  { key: "shtiebel", label: "שטיבל", hints: ["שטיבל"] },
  { key: "mobileHusband", label: "נייד בעל", hints: ["בעל", "נייד בעל"] },
  { key: "mobileWife", label: "נייד אישה", hints: ["אישה", "אשה", "נייד אישה"] },
  { key: "homePhone", label: "טלפון בית", hints: ["בית", "טלפון בית"] },
  { key: "otherPhone", label: "טלפון נוסף", hints: ["נוסף", "טלפון"] },
];

export function ImportView() {
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState("");

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const cols = res.meta.fields || [];
        setColumns(cols);
        setRows(res.data as Record<string, any>[]);
        // מיפוי אוטומטי לפי שמות עמודות
        const auto: Record<string, string> = {};
        for (const t of TARGETS) {
          const found = cols.find((c) => t.hints.some((h) => c.includes(h)));
          if (found) auto[t.key] = found;
        }
        setMapping(auto);
      },
    });
  }

  async function doImport() {
    setImporting(true);
    const res = await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows, mapping }),
    });
    setResult(await res.json());
    setImporting(false);
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <label className="label">בחר קובץ CSV</label>
        <input type="file" accept=".csv,text/csv" onChange={onFile} className="text-sm" />
        {fileName && (
          <p className="mt-2 text-sm text-slate-500">
            נטען: {fileName} · {rows.length} שורות · {columns.length} עמודות
          </p>
        )}
      </div>

      {columns.length > 0 && (
        <div className="card">
          <h2 className="mb-3 font-bold">מיפוי עמודות</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {TARGETS.map((t) => (
              <div key={t.key}>
                <label className="label">{t.label}</label>
                <select
                  className="input"
                  value={mapping[t.key] || ""}
                  onChange={(e) => setMapping((m) => ({ ...m, [t.key]: e.target.value }))}
                >
                  <option value="">— ללא —</option>
                  {columns.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <button className="btn-primary mt-4" onClick={doImport} disabled={importing}>
            {importing ? "מייבא..." : `ייבא ${rows.length} רשומות`}
          </button>
        </div>
      )}

      {result && (
        <div className="card bg-green-50 ring-green-200">
          <h2 className="mb-2 font-bold">תוצאות ייבוא</h2>
          <p className="text-sm">✓ נוצרו: {result.created}</p>
          <p className="text-sm">↷ דולגו (כפילות): {result.skipped}</p>
          {result.totalErrors > 0 && (
            <div className="mt-2 text-sm text-red-600">
              <p>שגיאות ({result.totalErrors}):</p>
              <ul className="list-inside list-disc">
                {result.errors.map((e: string, i: number) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
