import { NextResponse } from "next/server";
import { processCallEvent } from "@/lib/process-call";

// המערכת חושפת endpoint אחד שה-GIS שולח אליו POST בכל אירוע שיחה.
// אימות באמצעות כותרת X-Webhook-Secret. ראה מפרט מלא בתוכנית.
export async function POST(req: Request) {
  const secret = req.headers.get("x-webhook-secret");
  if (!process.env.GIS_WEBHOOK_SECRET || secret !== process.env.GIS_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const raw = await req.json().catch(() => null);
  if (!raw) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const result = await processCallEvent(raw);
  return NextResponse.json(result);
}
