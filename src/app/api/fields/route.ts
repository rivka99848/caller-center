import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const fields = await prisma.fieldDefinition.findMany({
    orderBy: { displayOrder: "asc" },
  });
  return NextResponse.json(fields);
}

// יצירת שדה מותאם חדש (מנהל)
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const label = (body.label || "").trim();
  if (!label) return NextResponse.json({ error: "יש להזין שם שדה" }, { status: 400 });
  const type = ["text", "phone", "number", "date", "select"].includes(body.type)
    ? body.type
    : "text";

  const max = await prisma.fieldDefinition.aggregate({ _max: { displayOrder: true } });
  const fieldKey = "custom_" + Math.random().toString(36).slice(2, 10);

  const field = await prisma.fieldDefinition.create({
    data: {
      fieldKey,
      label,
      type,
      isCore: false,
      visible: true,
      displayOrder: (max._max.displayOrder || 0) + 10,
    },
  });
  return NextResponse.json(field);
}
