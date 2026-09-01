"use client";
import { useEffect, useState } from "react";

type Ext = { id: string; extensionNumber: string; status: string; active: boolean };
type Agent = {
  id: string;
  fullName: string;
  username: string;
  role: string;
  status: string;
  extensions: Ext[];
};

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  pending: { text: "ממתין לאישור", cls: "bg-amber-100 text-amber-700" },
  active: { text: "פעיל", cls: "bg-green-100 text-green-700" },
  inactive: { text: "מושבת", cls: "bg-slate-200 text-slate-500" },
};

export function AgentsManager() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/admin/agents");
    setAgents(await res.json());
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function act(id: string, action: string, extra: any = {}) {
    const res = await fetch(`/api/admin/agents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "שגיאה");
      return;
    }
    load();
  }

  if (loading) return <div className="card text-sm text-slate-400">טוען...</div>;

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-right text-slate-500">
            <th className="py-2">שם</th>
            <th>שם משתמש</th>
            <th>תפקיד</th>
            <th>שלוחות</th>
            <th>סטטוס</th>
            <th>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((a) => {
            const st = STATUS_LABEL[a.status] || { text: a.status, cls: "" };
            return (
              <tr key={a.id} className="border-b border-slate-100">
                <td className="py-3 font-medium">{a.fullName}</td>
                <td>{a.username}</td>
                <td>{a.role === "admin" ? "מנהל" : "נציג"}</td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {a.extensions.map((e) => (
                      <span key={e.id} className="badge bg-slate-100 text-slate-600">
                        {e.extensionNumber}
                      </span>
                    ))}
                    {a.extensions.length === 0 && <span className="text-slate-300">—</span>}
                  </div>
                </td>
                <td>
                  {a.role === "admin" ? (
                    <span className="badge bg-brand-100 text-brand-700">מנהל</span>
                  ) : a.status === "pending" ? (
                    <span className={`badge ${st.cls}`}>{st.text}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => act(a.id, a.status === "active" ? "deactivate" : "activate")}
                      className="inline-flex items-center gap-2"
                      title={a.status === "active" ? "לחצו כדי להשבית את הנציג" : "לחצו כדי להפעיל את הנציג"}
                    >
                      <span
                        className={`flex h-6 w-11 items-center rounded-full p-0.5 transition ${
                          a.status === "active" ? "justify-start bg-green-500" : "justify-end bg-slate-300"
                        }`}
                      >
                        <span className="h-5 w-5 rounded-full bg-white shadow" />
                      </span>
                      <span className={`text-xs font-medium ${a.status === "active" ? "text-green-700" : "text-slate-500"}`}>
                        {a.status === "active" ? "פעיל" : "מושבת"}
                      </span>
                    </button>
                  )}
                </td>
                <td>
                  <div className="flex flex-wrap gap-2 py-1">
                    {a.status === "pending" && (
                      <button className="btn-primary !px-3 !py-1" onClick={() => act(a.id, "approve")}>
                        אשר נציג
                      </button>
                    )}
                    {a.role !== "admin" && (
                      <button
                        className="btn-secondary !px-3 !py-1"
                        onClick={() => {
                          const ext = prompt("מספר שלוחה לשיוך לנציג:");
                          if (ext) act(a.id, "setExtension", { extension: ext });
                        }}
                      >
                        שיוך שלוחה
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
