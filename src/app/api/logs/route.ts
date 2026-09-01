import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { normalizePhone } from "@/lib/phone";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const where: any = {};
  const extension = searchParams.get("extension");
  const phone = searchParams.get("phone");
  const matched = searchParams.get("matched");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (extension) where.extension = extension;
  if (phone) where.phoneNumber = { contains: normalizePhone(phone) };
  if (matched === "true") where.matched = true;
  if (matched === "false") where.matched = false;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to + "T23:59:59");
  }

  const logs = await prisma.call.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { agent: true, caller: true },
  });
  return NextResponse.json(logs);
}
