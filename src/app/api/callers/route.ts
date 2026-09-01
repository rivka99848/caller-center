import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { normalizePhone } from "@/lib/phone";
import { splitValues } from "@/lib/fields";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  const where: any = {};
  if (q) {
    const norm = normalizePhone(q);
    where.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { callerNumber: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
    ];
    if (norm) {
      where.OR.push({ phones: { some: { phoneNormalized: { contains: norm } } } });
    }
  }

  const callers = await prisma.caller.findMany({
    where,
    include: { phones: true },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });
  return NextResponse.json(callers);
}

// יצירת מתקשר חדש (מנהל)
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { core, custom } = splitValues(body.values || {});
  const phoneRaw = (body.phoneRaw || "").trim();
  const normalized = normalizePhone(phoneRaw);

  const caller = await prisma.caller.create({
    data: {
      ...core,
      customFields: custom,
      ...(normalized
        ? {
            phones: {
              create: {
                phoneRaw,
                phoneNormalized: normalized,
                label: body.phoneLabel || "other",
                isPrimary: true,
              },
            },
          }
        : {}),
    },
  });
  return NextResponse.json(caller);
}
