import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { normalizePhone } from "@/lib/phone";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const raw = (body.phoneRaw || "").trim();
  const normalized = normalizePhone(raw);
  if (!normalized) return NextResponse.json({ error: "מספר לא תקין" }, { status: 400 });

  const exists = await prisma.callerPhone.findUnique({
    where: { phoneNormalized: normalized },
  });
  if (exists) {
    return NextResponse.json(
      { error: "המספר כבר קיים במערכת" },
      { status: 409 }
    );
  }

  const phone = await prisma.callerPhone.create({
    data: {
      callerId: params.id,
      phoneRaw: raw,
      phoneNormalized: normalized,
      label: body.label || "other",
    },
  });
  return NextResponse.json(phone);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const phoneId = searchParams.get("phoneId");
  if (!phoneId) return NextResponse.json({ error: "missing phoneId" }, { status: 400 });
  await prisma.callerPhone.deleteMany({
    where: { id: phoneId, callerId: params.id },
  });
  return NextResponse.json({ ok: true });
}
