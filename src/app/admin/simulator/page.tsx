"use client";
import { useState } from "react";

export default function SimulatorPage() {
  const [extension, setExtension] = useState("203");
  const [phone, setPhone] = useState("0501234567");
  const [eventType, setEventType] = useState("connected");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function send() {
    setLoading(true);
    const res = await fetch("/api/admin/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ extension, phone, event_type: eventType }),
    });
    setResult(await res.json());
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-lg font-bold">סימולטור תותח שיחות</h1>
      <p className="text-sm text-slate-500">
        שולח אירוע שיחה לדוגמה כמו שהתותח היה שולח — כדי לבדוק את ההקפצה אצל הנציג
        המשויך לשלוחה. פתח את מסך הנציג בחלון אחר כדי לראות את הקפיצה.
      </p>
      <div className="card space-y-3">
        <div>
          <label className="label">שלוחה</label>
          <input className="input" value={extension} onChange={(e) => setExtension(e.target.value)} />
        </div>
        <div>
          <label className="label">מספר מתקשר</label>
          <input className="input" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <label className="label">סוג אירוע</label>
          <select className="input" value={eventType} onChange={(e) => setEventType(e.target.value)}>
            <option value="ringing">מצלצל</option>
            <option value="connected">חובר</option>
            <option value="answered">נענה</option>
            <option value="ended">הסתיים</option>
          </select>
        </div>
        <button className="btn-primary" onClick={send} disabled={loading}>
          {loading ? "שולח..." : "שלח אירוע"}
        </button>
      </div>

      {result && (
        <div className={`card ${result.matched ? "bg-green-50 ring-green-200" : "bg-amber-50 ring-amber-200"}`}>
          <h2 className="mb-2 font-bold">תוצאה</h2>
          <ul className="space-y-1 text-sm">
            <li>נמצא מתקשר: {result.matched ? "כן ✓" : "לא"}</li>
            <li>נציג משויך: {result.agent || "— (אין נציג פעיל לשלוחה)"}</li>
            <li>הקפצה: {result.screen_pop}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
