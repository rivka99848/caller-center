import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const agents = await prisma.user.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { extensions: true },
  });
  return NextResponse.json(
    agents.map((a) => ({
      id: a.id,
      fullName: a.fullName,
      username: a.username,
      role: a.role,
      status: a.status,
      createdAt: a.createdAt,
      extensions: a.extensions.map((e) => ({
        id: e.id,
        extensionNumber: e.extensionNumber,
        status: e.status,
        active: e.active,
      })),
    }))
  );
}
