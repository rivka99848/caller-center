"use client";
import { useEffect, useState } from "react";

type Log = {
  id: string;
  callId: string | null;
  phoneNumber: string | null;
  extension: string | null;
  eventType: string | null;
  matched: boolean;
  screenPopSent: boolean;
  screenPopAck: boolean;
  error: string | null;
  createdAt: string;
  agent?: { fullName: string } | null;
  caller?: { firstName: string | null; lastName: string | null } | null;
};

export function LogsView() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ extension: "", phone: "", matched: "", from: "", to: "" });

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
    const res = await fetch(`/api/logs?${params.toString()}`);
    setLogs(await res.json());
    setLoading(false);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set(k: string, v: string) {
    setFilters((f) => ({ ...f, [k]: v }));
  }

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-end gap-2">
        <div>
          <label className="label">שלוחה</label>
          <input className="input w-24" value={filters.extension} onChange={(e) => set("extension", e.target.value)} />
        </div>
        <div>
          <label className="label">טלפון</label>
          <input className="input w-36" dir="ltr" value={filters.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
        <div>
          <label className="label">התאמה</label>
          <select className="input w-28" value={filters.matched} onChange={(e) => set("matched", e.target.value)}>
            <option value="">הכל</option>
            <option value="true">נמצא</option>
            <option value="false">לא נמצא</option>
          </select>
        </div>
        <div>
          <label className="label">מתאריך</label>
          <input className="input" type="date" value={filters.from} onChange={(e) => set("from", e.target.value)} />
        </div>
        <div>
          <label className="label">עד תאריך</label>
          <input className="input" type="date" value={filters.to} onChange={(e) => set("to", e.target.value)} />
        </div>
        <button className="btn-primary" onClick={load}>סנן</button>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="text-sm text-slate-400">טוען...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-right text-slate-500">
                <th className="py-2">זמן</th>
                <th>שלוחה</th>
                <th>טלפון</th>
                <th>אירוע</th>
                <th>נציג</th>
                <th>מתקשר</th>
                <th>התאמה</th>
                <th>הקפצה</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-slate-100">
                  <td className="py-2 whitespace-nowrap text-xs">{new Date(l.createdAt).toLocaleString("he-IL")}</td>
                  <td>{l.extension || "—"}</td>
                  <td dir="ltr">{l.phoneNumber || "—"}</td>
                  <td>{l.eventType || "—"}</td>
                  <td>{l.agent?.fullName || "—"}</td>
                  <td>{l.caller ? [l.caller.firstName, l.caller.lastName].filter(Boolean).join(" ") : "—"}</td>
                  <td>
                    <span className={`badge ${l.matched ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500"}`}>
                      {l.matched ? "נמצא" : "לא נמצא"}
                    </span>
                  </td>
                  <td>
                    {l.screenPopAck ? (
                      <span className="badge bg-green-100 text-green-700">✓ הוקפץ</span>
                    ) : l.screenPopSent ? (
                      <span className="badge bg-amber-100 text-amber-700">נשלח</span>
                    ) : (
                      <span className="badge bg-slate-200 text-slate-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-4 text-center text-slate-400">
                    אין רשומות.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
