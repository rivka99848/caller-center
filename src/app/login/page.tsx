"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError(res.error === "CredentialsSignin" ? "שם משתמש או סיסמה שגויים" : res.error);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-50 to-slate-100 p-4">
      <div className="card w-full max-w-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="פסגות" className="mx-auto mb-4 h-14 w-auto" />
        <h1 className="mb-1 text-center text-xl font-bold">כניסה למערכת</h1>
        <p className="mb-5 text-center text-sm text-slate-500">מוקד — ניהול מתקשרים</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">שם משתמש</label>
            <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="label">סיסמה</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "מתחבר..." : "כניסה"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          נציג חדש?{" "}
          <Link href="/register" className="text-brand-600 hover:underline">
            הרשמה
          </Link>
        </p>
      </div>
    </div>
  );
}
