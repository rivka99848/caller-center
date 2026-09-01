import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { DemoPopButton } from "@/components/DemoPopButton";

export const dynamic = "force-dynamic";

export default async function AgentHome() {
  const user = await getCurrentUser();
  if (!user) return null;
  const recent = await prisma.call.findMany({
    where: { agentId: user.id, matched: true },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { caller: true },
  });

  return (
    <div className="space-y-4">
      <div className="card text-center">
        <div className="mb-2 text-4xl">☎️</div>
        <h1 className="text-lg font-bold">ממתין לשיחות</h1>
        <p className="mb-4 text-sm text-slate-500">
          כשתגיע שיחה, רשומת המתקשר תקפוץ אוטומטית על המסך.
        </p>
        <DemoPopButton />
        <p className="mt-2 text-xs text-slate-400">
          לחצי כדי לראות הדגמה של הקפצת שיחה (בוחר מתקשר אקראי).
        </p>
      </div>

      <div className="card">
        <h2 className="section-title">שיחות אחרונות שלי</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-slate-400">אין עדיין שיחות.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recent.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <span className="font-medium">
                    {c.caller
                      ? [c.caller.firstName, c.caller.lastName].filter(Boolean).join(" ")
                      : "—"}
                  </span>
                  <span className="mr-2 text-slate-400" dir="ltr">
                    {c.phoneNumber}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">
                    {new Date(c.createdAt).toLocaleString("he-IL")}
                  </span>
                  {c.caller && (
                    <Link href={`/agent/callers/${c.caller.id}`} className="text-brand-600 hover:underline">
                      פתח
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
