import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { splitValues } from "@/lib/fields";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const caller = await prisma.caller.findUnique({
    where: { id: params.id },
    include: {
      phones: true,
      noteItems: { orderBy: { createdAt: "desc" }, include: { agent: true } },
      calls: { orderBy: { createdAt: "desc" }, take: 30 },
    },
  });
  if (!caller) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(caller);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const values: Record<string, any> = body.values || {};
  const { core, custom } = splitValues(values);

  const before = await prisma.caller.findUnique({ where: { id: params.id } });
  if (!before) return NextResponse.json({ error: "not found" }, { status: 404 });

  const mergedCustom = { ...(before.customFields as any), ...custom };

  const updated = await prisma.caller.update({
    where: { id: params.id },
    data: {
      ...core,
      ...(typeof body.notes === "string" ? { notes: body.notes } : {}),
      customFields: mergedCustom,
    },
  });

  // תיעוד עדכון (היסטוריית עדכונים)
  await prisma.auditLog.create({
    data: {
      entityType: "caller",
      entityId: params.id,
      actorId: user.id,
      action: "update",
      changes: { values, notes: body.notes },
    },
  });

  return NextResponse.json(updated);
}
