import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [callers, agents, pending, calls, unmatched] = await Promise.all([
    prisma.caller.count(),
    prisma.user.count({ where: { role: "agent", status: "active" } }),
    prisma.user.count({ where: { status: "pending" } }),
    prisma.call.count(),
    prisma.call.count({ where: { matched: false } }),
  ]);

  const stats = [
    { label: "מתקשרים", value: callers, href: "/admin/callers" },
    { label: "נציגים פעילים", value: agents, href: "/admin/agents" },
    { label: "ממתינים לאישור", value: pending, href: "/admin/agents", highlight: pending > 0 },
    { label: "אירועי שיחה", value: calls, href: "/admin/logs" },
    { label: "שיחות ללא התאמה", value: unmatched, href: "/admin/logs" },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">לוח בקרה</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={`card text-center transition hover:shadow-md ${s.highlight ? "ring-2 ring-amber-400" : ""}`}
          >
            <div className="text-3xl font-bold text-brand-700">{s.value}</div>
            <div className="mt-1 text-sm text-slate-500">{s.label}</div>
          </Link>
        ))}
      </div>

      {pending > 0 && (
        <div className="card bg-amber-50 ring-amber-200">
          <p className="text-sm">
            יש {pending} נציגים הממתינים לאישור.{" "}
            <Link href="/admin/agents" className="font-medium text-brand-600 hover:underline">
              עבור לאישור →
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
