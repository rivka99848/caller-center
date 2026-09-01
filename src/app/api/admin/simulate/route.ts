import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { processCallEvent } from "@/lib/process-call";

// סימולטור התותח — לשימוש מנהל בלבד, לבדיקת זרימת ההקפצה בלי התותח האמיתי.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const result = await processCallEvent({
    call_id: body.call_id || "sim-" + Date.now(),
    extension: body.extension,
    phone: body.phone,
    event_type: body.event_type || "connected",
    event_time: new Date().toISOString(),
    direction: "outbound",
  });
  return NextResponse.json(result);
}
