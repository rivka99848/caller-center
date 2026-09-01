import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  fullName: z.string().min(2, "יש להזין שם מלא"),
  username: z.string().min(3, "שם משתמש קצר מדי"),
  password: z.string().min(6, "הסיסמה חייבת להיות לפחות 6 תווים"),
  extension: z.string().min(1, "יש להזין מספר שלוחה"),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "נתונים לא תקינים" },
      { status: 400 }
    );
  }
  const { fullName, username, password, extension } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) {
    return NextResponse.json({ error: "שם המשתמש כבר תפוס" }, { status: 409 });
  }
  const existingExt = await prisma.extension.findUnique({
    where: { extensionNumber: extension },
  });
  if (existingExt) {
    return NextResponse.json(
      { error: "מספר השלוחה כבר משויך במערכת" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      fullName,
      username,
      passwordHash,
      role: "agent",
      status: "pending",
      extensions: {
        create: { extensionNumber: extension, status: "pending", active: true },
      },
    },
  });

  return NextResponse.json({ ok: true, userId: user.id });
}
