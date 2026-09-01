import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// הדמיית שיחה נכנסת — בוחר מתקשר אקראי ומקפיץ אותו למסך של הנציג הנוכחי,
// דרך אותו מנגנון בדיוק כמו שיחה אמיתית מהתותח. לצורכי הדגמה בלבד.
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // בחירת מתקשר אקראי שיש לו מספר טלפון
  const count = await prisma.caller.count();
  if (count === 0)
    return NextResponse.json({ error: "אין מתקשרים במערכת" }, { status: 400 });
  const skip = Math.floor(Math.random() * count);
  const caller = await prisma.caller.findFirst({
    skip,
    include: { phones: true },
  });
  if (!caller)
    return NextResponse.json({ error: "לא נמצא מתקשר" }, { status: 400 });

  const primaryPhone =
    caller.phones.find((p) => p.isPrimary)?.phoneNormalized ||
    caller.phones[0]?.phoneNormalized ||
    "—";

  // רישום ללוג — מסומן כהדמיה
  const call = await prisma.call.create({
    data: {
      callId: "demo-" + Date.now(),
      phoneNumber: primaryPhone,
      extension: "DEMO",
      agentId: user.id,
      callerId: caller.id,
      eventType: "demo",
      eventTime: new Date(),
      matched: true,
      screenPopSent: true,
      screenPopAck: false,
    },
  });

  // שידור ההקפצה למסך של הנציג הנוכחי
  const io = (globalThis as any).__io;
  if (io) {
    io.to(`agent:${user.id}`).emit("screen:pop", {
      callLogId: call.id,
      callId: call.callId,
      extension: "DEMO",
      phone: primaryPhone,
      eventType: "demo",
      caller,
    });
  }

  return NextResponse.json({ ok: true, caller_id: caller.id });
}
