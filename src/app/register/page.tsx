"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    password: "",
    extension: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "שגיאה בהרשמה");
      return;
    }
    router.push("/pending");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-50 to-slate-100 p-4">
      <div className="card w-full max-w-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="פסגות" className="mx-auto mb-4 h-14 w-auto" />
        <h1 className="mb-1 text-center text-xl font-bold">הרשמת נציג</h1>
        <p className="mb-5 text-sm text-slate-500">
          לאחר ההרשמה החשבון ימתין לאישור מנהל.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">שם מלא</label>
            <input className="input" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} autoFocus />
          </div>
          <div>
            <label className="label">שם משתמש</label>
            <input className="input" value={form.username} onChange={(e) => set("username", e.target.value)} />
          </div>
          <div>
            <label className="label">סיסמה</label>
            <input className="input" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} />
          </div>
          <div>
            <label className="label">מספר שלוחה ב־GIS</label>
            <input className="input" value={form.extension} onChange={(e) => set("extension", e.target.value)} placeholder="למשל 203" />
            <p className="mt-1 text-xs text-slate-400">
              לפי השלוחה הזו המערכת תדע להקפיץ אליך שיחות.
            </p>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "נרשם..." : "הרשמה"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          כבר יש חשבון?{" "}
          <Link href="/login" className="text-brand-600 hover:underline">
            כניסה
          </Link>
        </p>
      </div>
    </div>
  );
}
