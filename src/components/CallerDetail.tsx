"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { NedarimIframe } from "./NedarimIframe";

const PHONE_LABELS: Record<string, string> = {
  husband: "נייד בעל",
  wife: "נייד אישה",
  home: "טלפון בית",
  other: "נוסף",
};

type FieldDef = {
  id: string;
  fieldKey: string;
  label: string;
  type: string;
  isCore: boolean;
};

type Phone = { id: string; phoneRaw: string; phoneNormalized: string; label: string; isPrimary: boolean };
type NoteItem = { id: string; body: string; createdAt: string; agent?: { fullName: string } | null };
type CallItem = {
  id: string;
  phoneNumber: string | null;
  eventType: string | null;
  createdAt: string;
  matched: boolean;
  screenPopAck: boolean;
  agent?: { fullName: string } | null;
};
type Audit = { id: string; action: string; changes: any; createdAt: string; actor?: { fullName: string } | null };

type Caller = {
  id: string;
  callerNumber: string | null;
  title: string | null;
  firstName: string | null;
  lastName: string | null;
  suffix: string | null;
  address: string | null;
  city: string | null;
  shtiebel: string | null;
  customFields: Record<string, any>;
  notes: string | null;
  phones: Phone[];
  noteItems: NoteItem[];
  calls: CallItem[];
};

export function CallerDetail({
  caller,
  fieldDefs,
  audits,
  backPath = "/agent",
}: {
  caller: Caller;
  fieldDefs: FieldDef[];
  audits: Audit[];
  backPath?: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState<"details" | "notes" | "history" | "pay">("details");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  function initialValues() {
    const v: Record<string, any> = {};
    for (const f of fieldDefs) {
      v[f.fieldKey] = f.isCore
        ? (caller as any)[f.fieldKey] ?? ""
        : caller.customFields?.[f.fieldKey] ?? "";
    }
    return v;
  }
  const [values, setValues] = useState<Record<string, any>>(initialValues());
  const [quickNotes, setQuickNotes] = useState(caller.notes ?? "");

  // הוספת הערה
  const [newNote, setNewNote] = useState("");
  // הוספת טלפון
  const [newPhone, setNewPhone] = useState("");
  const [newPhoneLabel, setNewPhoneLabel] = useState("other");

  const fullName =
    [caller.title, caller.firstName, caller.lastName].filter(Boolean).join(" ") || "מתקשר";
  const primaryPhone = caller.phones.find((p) => p.isPrimary) || caller.phones[0];

  async function saveDetails() {
    setSaving(true);
    setErr("");
    const res = await fetch(`/api/callers/${caller.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values, notes: quickNotes }),
    });
    setSaving(false);
    if (!res.ok) {
      setErr("שמירה נכשלה");
      return;
    }
    setEditing(false);
    router.refresh();
  }

  async function addNote() {
    if (!newNote.trim()) return;
    const res = await fetch(`/api/callers/${caller.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: newNote }),
    });
    if (res.ok) {
      setNewNote("");
      router.refresh();
    }
  }

  async function addPhone() {
    if (!newPhone.trim()) return;
    const res = await fetch(`/api/callers/${caller.id}/phones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneRaw: newPhone, label: newPhoneLabel }),
    });
    const data = await res.json();
    if (res.ok) {
      setNewPhone("");
      router.refresh();
    } else {
      alert(data.error || "שגיאה");
    }
  }

  async function removePhone(phoneId: string) {
    if (!confirm("להסיר את המספר?")) return;
    const res = await fetch(`/api/callers/${caller.id}/phones?phoneId=${phoneId}`, {
      method: "DELETE",
    });
    if (res.ok) router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* כותרת */}
      <div className="card flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{fullName}</h1>
          {primaryPhone && (
            <div className="mt-1 text-slate-500" dir="ltr">
              {primaryPhone.phoneRaw}
            </div>
          )}
        </div>
        <button className="btn-secondary" onClick={() => router.push(backPath)}>
          ← חזרה
        </button>
      </div>

      {/* כרטיסיות — ניווט מהיר בלי גלילה */}
      <div className="sticky top-16 z-10 flex flex-wrap gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200">
        {[
          { key: "details", label: "פרטים" },
          { key: "notes", label: "📝 הערות" },
          { key: "history", label: "היסטוריה" },
          { key: "pay", label: "💳 תשלומים" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
              tab === t.key ? "bg-brand-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ===== פרטים ===== */}
      {tab === "details" && (
      <div className="space-y-4">
      {/* פרטי מתקשר */}
      <div className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-title !mb-0">פרטי מתקשר</h2>
          {editing ? (
            <div className="flex gap-2">
              <button className="btn-primary" onClick={saveDetails} disabled={saving}>
                {saving ? "שומר..." : "שמור"}
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  setValues(initialValues());
                  setQuickNotes(caller.notes ?? "");
                  setEditing(false);
                }}
              >
                ביטול
              </button>
            </div>
          ) : (
            <button className="btn-secondary" onClick={() => setEditing(true)}>
              עדכון פרטים
            </button>
          )}
        </div>
        {err && <p className="mb-2 text-sm text-red-600">{err}</p>}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {fieldDefs.map((f) => {
            const val = values[f.fieldKey] ?? "";
            return (
              <div key={f.id}>
                <label className="label">
                  {f.label}
                  {!f.isCore && <span className="mr-1 text-xs text-brand-500">(מותאם)</span>}
                </label>
                {editing ? (
                  <input
                    className="input"
                    type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                    value={val}
                    onChange={(e) => setValues((v) => ({ ...v, [f.fieldKey]: e.target.value }))}
                  />
                ) : (
                  <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    {val || <span className="text-slate-300">—</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-3">
          <label className="label">הערות מהירות</label>
          {editing ? (
            <textarea
              className="input h-20"
              value={quickNotes}
              onChange={(e) => setQuickNotes(e.target.value)}
            />
          ) : (
            <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm ring-1 ring-amber-100">
              {caller.notes || <span className="text-slate-300">—</span>}
            </div>
          )}
        </div>
      </div>

      {/* טלפונים */}
      <div className="card">
        <h2 className="section-title">מספרי טלפון</h2>
        <ul className="mb-3 divide-y divide-slate-100">
          {caller.phones.map((p) => (
            <li key={p.id} className="flex items-center justify-between py-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="badge bg-slate-100 text-slate-600">{PHONE_LABELS[p.label] || p.label}</span>
                <span dir="ltr">{p.phoneRaw}</span>
                {p.isPrimary && <span className="badge bg-brand-100 text-brand-700">ראשי</span>}
              </div>
              <button className="text-xs text-red-500 hover:underline" onClick={() => removePhone(p.id)}>
                הסר
              </button>
            </li>
          ))}
          {caller.phones.length === 0 && <li className="py-2 text-sm text-slate-400">אין מספרים</li>}
        </ul>
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex-1">
            <label className="label">מספר חדש</label>
            <input className="input" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} dir="ltr" placeholder="050-1234567" />
          </div>
          <select className="input w-32" value={newPhoneLabel} onChange={(e) => setNewPhoneLabel(e.target.value)}>
            {Object.entries(PHONE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <button className="btn-secondary" onClick={addPhone}>הוסף מספר</button>
        </div>
      </div>
      </div>
      )}

      {/* ===== הערות ===== */}
      {tab === "notes" && (
      <div className="space-y-4">
      {/* הערות (תיעוד) — הפעולה המרכזית בזמן שיחה */}
      <div className="card ring-2 ring-brand-200">
        <h2 className="section-title">📝 הערות ותיעוד שיחה</h2>
        <div className="mb-3 flex gap-2">
          <input
            className="input flex-1"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="רשמו כאן את סיכום השיחה או הערה חדשה..."
            onKeyDown={(e) => e.key === "Enter" && addNote()}
          />
          <button className="btn-primary" onClick={addNote}>הוסף</button>
        </div>
        <ul className="space-y-2">
          {caller.noteItems.map((n) => (
            <li key={n.id} className="rounded-lg bg-slate-50 p-3 text-sm">
              <div>{n.body}</div>
              <div className="mt-1 text-xs text-slate-400">
                {n.agent?.fullName || "—"} · {new Date(n.createdAt).toLocaleString("he-IL")}
              </div>
            </li>
          ))}
          {caller.noteItems.length === 0 && <li className="text-sm text-slate-400">אין הערות עדיין.</li>}
        </ul>
      </div>
      </div>
      )}

      {/* ===== היסטוריה ===== */}
      {tab === "history" && (
      <div className="space-y-4">
      {/* היסטוריית שיחות */}
      <div className="card">
        <h2 className="section-title">היסטוריית שיחות</h2>
        {caller.calls.length === 0 ? (
          <p className="text-sm text-slate-400">אין שיחות.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {caller.calls.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2">
                <span>{new Date(c.createdAt).toLocaleString("he-IL")}</span>
                <span className="text-slate-500">{c.eventType || "שיחה"}</span>
                <span className="text-slate-400">{c.agent?.fullName || ""}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* היסטוריית עדכונים */}
      <div className="card">
        <h2 className="section-title">היסטוריית עדכונים</h2>
        {audits.length === 0 ? (
          <p className="text-sm text-slate-400">אין עדכונים.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {audits.map((a) => (
              <li key={a.id} className="py-2">
                <span className="text-slate-500">{a.actor?.fullName || "מערכת"}</span> עדכן ·{" "}
                <span className="text-xs text-slate-400">
                  {new Date(a.createdAt).toLocaleString("he-IL")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      </div>
      )}

      {/* ===== תשלומים ===== */}
      {tab === "pay" && (
      <NedarimIframe
        payer={{
          callerId: caller.id,
          callerNumber: caller.callerNumber,
          firstName: caller.firstName,
          lastName: caller.lastName,
          city: caller.city,
          address: caller.address,
          phone: primaryPhone?.phoneRaw || null,
        }}
      />
      )}
    </div>
  );
}
