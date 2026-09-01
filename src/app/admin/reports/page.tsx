import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;

  const [total, matched, popped, byAgentRaw] = await Promise.all([
    prisma.call.count(),
    prisma.call.count({ where: { matched: true } }),
    prisma.call.count({ where: { screenPopAck: true } }),
    prisma.call.groupBy({ by: ["agentId"], _count: { _all: true } }),
  ]);

  const agentIds = byAgentRaw.map((r) => r.agentId).filter(Boolean) as string[];
  const agents = await prisma.user.findMany({
    where: { id: { in: agentIds } },
    select: { id: true, fullName: true },
  });
  const nameById = Object.fromEntries(agents.map((a) => [a.id, a.fullName]));
  const byAgent = byAgentRaw
    .filter((r) => r.agentId)
    .map((r) => ({ agent: nameById[r.agentId as string] || "—", calls: r._count._all }))
    .sort((a, b) => b.calls - a.calls);

  const popRate = matched ? Math.round((popped / matched) * 100) : 0;

  const cards = [
    { label: "סה\"כ אירועים", value: total },
    { label: "עם התאמה", value: matched },
    { label: "ללא התאמה", value: total - matched },
    { label: "אחוז הקפצות מוצלחות", value: `${popRate}%` },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">דוחות</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card text-center">
            <div className="text-3xl font-bold text-brand-700">{c.value}</div>
            <div className="mt-1 text-sm text-slate-500">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="section-title">שיחות לפי נציג</h2>
        {byAgent.length === 0 ? (
          <p className="text-sm text-slate-400">אין נתונים.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {byAgent.map((r) => (
              <li key={r.agent} className="flex items-center justify-between py-2">
                <span>{r.agent}</span>
                <span className="font-medium">{r.calls}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
