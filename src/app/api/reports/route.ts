import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const [total, matched, popped, byAgentRaw] = await Promise.all([
    prisma.call.count(),
    prisma.call.count({ where: { matched: true } }),
    prisma.call.count({ where: { screenPopAck: true } }),
    prisma.call.groupBy({
      by: ["agentId"],
      _count: { _all: true },
    }),
  ]);

  // שמות נציגים
  const agentIds = byAgentRaw.map((r) => r.agentId).filter(Boolean) as string[];
  const agents = await prisma.user.findMany({
    where: { id: { in: agentIds } },
    select: { id: true, fullName: true },
  });
  const nameById = Object.fromEntries(agents.map((a) => [a.id, a.fullName]));

  const byAgent = byAgentRaw
    .filter((r) => r.agentId)
    .map((r) => ({
      agent: nameById[r.agentId as string] || "—",
      calls: r._count._all,
    }))
    .sort((a, b) => b.calls - a.calls);

  return NextResponse.json({
    total,
    matched,
    unmatched: total - matched,
    popped,
    popRate: matched ? Math.round((popped / matched) * 100) : 0,
    byAgent,
  });
}
