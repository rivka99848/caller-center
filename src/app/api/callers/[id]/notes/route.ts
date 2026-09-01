import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const text = (body.body || "").trim();
  if (!text) return NextResponse.json({ error: "הערה ריקה" }, { status: 400 });

  const note = await prisma.note.create({
    data: { callerId: params.id, agentId: user.id, body: text },
    include: { agent: true },
  });
  return NextResponse.json(note);
}
