import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const data: any = {};
  if (typeof body.label === "string" && body.label.trim()) data.label = body.label.trim();
  if (typeof body.visible === "boolean") data.visible = body.visible;
  const field = await prisma.fieldDefinition.update({ where: { id: params.id }, data });
  return NextResponse.json(field);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const field = await prisma.fieldDefinition.findUnique({ where: { id: params.id } });
  if (!field) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (field.isCore)
    return NextResponse.json({ error: "לא ניתן למחוק שדה ליבה" }, { status: 400 });
  await prisma.fieldDefinition.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
