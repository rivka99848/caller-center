"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Phone = { phoneRaw: string; isPrimary: boolean };
type Caller = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  callerNumber: string | null;
  city: string | null;
  phones: Phone[];
};

export function CallerSearch({ basePath }: { basePath: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Caller[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/callers?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setResults(data);
    setLoading(false);
    setSearched(true);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={search} className="card flex gap-2">
        <input
          className="input flex-1"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="חיפוש לפי שם, מספר לקוח, טלפון או עיר..."
          autoFocus
        />
        <button className="btn-primary" disabled={loading}>
          {loading ? "מחפש..." : "חיפוש"}
        </button>
      </form>

      {searched && (
        <div className="card">
          {results.length === 0 ? (
            <p className="text-sm text-slate-400">לא נמצאו מתקשרים.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {results.map((c) => {
                const phone = c.phones.find((p) => p.isPrimary) || c.phones[0];
                return (
                  <li
                    key={c.id}
                    className="flex cursor-pointer items-center justify-between py-3 hover:bg-slate-50"
                    onClick={() => router.push(`${basePath}/${c.id}`)}
                  >
                    <div>
                      <div className="font-medium">
                        {[c.firstName, c.lastName].filter(Boolean).join(" ") || "—"}
                        {c.callerNumber && <span className="mr-2 text-xs text-slate-400">#{c.callerNumber}</span>}
                      </div>
                      <div className="text-sm text-slate-500">
                        {phone && <span dir="ltr">{phone.phoneRaw}</span>}
                        {c.city && <span className="mr-2">· {c.city}</span>}
                      </div>
                    </div>
                    <span className="text-brand-600">פתח ←</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
