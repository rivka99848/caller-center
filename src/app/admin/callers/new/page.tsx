"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewCallerPage() {
  const router = useRouter();
  const [v, setV] = useState<Record<string, string>>({});
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  function set(k: string, val: string) {
    setV((s) => ({ ...s, [k]: val }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/callers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values: v, phoneRaw: phone, phoneLabel: "husband" }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) router.push(`/admin/callers/${data.id}`);
    else alert(data.error || "שגיאה");
  }

  const fields = [
    ["callerNumber", "מספר לקוח"],
    ["title", "תואר"],
    ["firstName", "שם פרטי"],
    ["lastName", "שם משפחה"],
    ["city", "עיר"],
    ["shtiebel", "שטיבל"],
    ["address", "כתובת"],
  ];

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-lg font-bold">מתקשר חדש</h1>
      <form onSubmit={save} className="card grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fields.map(([k, label]) => (
          <div key={k}>
            <label className="label">{label}</label>
            <input className="input" value={v[k] || ""} onChange={(e) => set(k, e.target.value)} />
          </div>
        ))}
        <div className="sm:col-span-2">
          <label className="label">טלפון ראשי</label>
          <input className="input" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="050-1234567" />
        </div>
        <div className="sm:col-span-2 flex gap-2">
          <button className="btn-primary" disabled={saving}>
            {saving ? "שומר..." : "שמור"}
          </button>
          <button type="button" className="btn-secondary" onClick={() => router.push("/admin/callers")}>
            ביטול
          </button>
        </div>
      </form>
    </div>
  );
}
