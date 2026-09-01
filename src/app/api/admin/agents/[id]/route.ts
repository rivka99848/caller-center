import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const action = body.action as string;
  const id = params.id;

  if (action === "approve") {
    await prisma.user.update({
      where: { id },
      data: { status: "active", approvedAt: new Date() },
    });
    // הפעלת השלוחות הממתינות של הנציג
    await prisma.extension.updateMany({
      where: { agentId: id, status: "pending" },
      data: { status: "active" },
    });
  } else if (action === "deactivate") {
    await prisma.user.update({ where: { id }, data: { status: "inactive" } });
  } else if (action === "activate") {
    await prisma.user.update({
      where: { id },
      data: { status: "active", approvedAt: new Date() },
    });
  } else if (action === "setExtension") {
    const ext = String(body.extension || "").trim();
    if (!ext) return NextResponse.json({ error: "missing extension" }, { status: 400 });
    const existing = await prisma.extension.findUnique({ where: { extensionNumber: ext } });
    if (existing && existing.agentId && existing.agentId !== id) {
      return NextResponse.json({ error: "השלוחה משויכת לנציג אחר" }, { status: 409 });
    }
    await prisma.extension.upsert({
      where: { extensionNumber: ext },
      update: { agentId: id, status: "active", active: true },
      create: { extensionNumber: ext, agentId: id, status: "active", active: true },
    });
  } else {
    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  }

  await prisma.auditLog.create({
    data: {
      entityType: "user",
      entityId: id,
      actorId: admin.id,
      action: `agent:${action}`,
      changes: body,
    },
  });

  return NextResponse.json({ ok: true });
}
