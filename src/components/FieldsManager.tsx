"use client";
import { useEffect, useState } from "react";

type Field = {
  id: string;
  fieldKey: string;
  label: string;
  type: string;
  isCore: boolean;
  visible: boolean;
};

const TYPES: Record<string, string> = {
  text: "טקסט",
  phone: "טלפון",
  number: "מספר",
  date: "תאריך",
  select: "בחירה",
};

export function FieldsManager() {
  const [fields, setFields] = useState<Field[]>([]);
  const [label, setLabel] = useState("");
  const [type, setType] = useState("text");
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/fields");
    setFields(await res.json());
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function add() {
    if (!label.trim()) return;
    const res = await fetch("/api/fields", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, type }),
    });
    if (res.ok) {
      setLabel("");
      load();
    }
  }

  async function toggle(f: Field) {
    await fetch(`/api/fields/${f.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: !f.visible }),
    });
    load();
  }

  async function remove(f: Field) {
    if (!confirm(`למחוק את השדה "${f.label}"?`)) return;
    const res = await fetch(`/api/fields/${f.id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json();
      alert(d.error || "שגיאה");
    }
    load();
  }

  if (loading) return <div className="card text-sm text-slate-400">טוען...</div>;

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-end gap-2">
        <div className="flex-1">
          <label className="label">שם שדה חדש</label>
          <input className="input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="למשל: שם האם" />
        </div>
        <select className="input w-32" value={type} onChange={(e) => setType(e.target.value)}>
          {Object.entries(TYPES).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <button className="btn-primary" onClick={add}>הוסף שדה</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-right text-slate-500">
              <th className="py-2">תווית</th>
              <th>סוג</th>
              <th>סוג שדה</th>
              <th>מוצג</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((f) => (
              <tr key={f.id} className="border-b border-slate-100">
                <td className="py-3 font-medium">{f.label}</td>
                <td>{TYPES[f.type] || f.type}</td>
                <td>
                  {f.isCore ? (
                    <span className="badge bg-slate-100 text-slate-500">ליבה</span>
                  ) : (
                    <span className="badge bg-brand-100 text-brand-700">מותאם</span>
                  )}
                </td>
                <td>{f.visible ? "כן" : "לא"}</td>
                <td>
                  <div className="flex gap-2 py-1">
                    <button className="btn-secondary !px-3 !py-1" onClick={() => toggle(f)}>
                      {f.visible ? "הסתר" : "הצג"}
                    </button>
                    {!f.isCore && (
                      <button className="btn-danger !px-3 !py-1" onClick={() => remove(f)}>
                        מחק
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
