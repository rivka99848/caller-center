import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { normalizePhone } from "@/lib/phone";
import { isCoreKey } from "@/lib/fields";

// יעדי מיפוי אפשריים לעמודות ה-CSV
const PHONE_TARGETS: Record<string, string> = {
  mobileHusband: "husband",
  mobileWife: "wife",
  homePhone: "home",
  otherPhone: "other",
};

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.rows) || !body.mapping) {
    return NextResponse.json({ error: "נתונים לא תקינים" }, { status: 400 });
  }
  const rows: Record<string, any>[] = body.rows;
  const mapping: Record<string, string> = body.mapping; // target -> csvColumn

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const core: Record<string, any> = {};
      const custom: Record<string, any> = {};
      const phones: { raw: string; normalized: string; label: string }[] = [];

      for (const [target, col] of Object.entries(mapping)) {
        if (!col) continue;
        const raw = row[col];
        if (raw == null || String(raw).trim() === "") continue;
        const val = String(raw).trim();

        if (PHONE_TARGETS[target]) {
          const normalized = normalizePhone(val);
          if (normalized) phones.push({ raw: val, normalized, label: PHONE_TARGETS[target] });
        } else if (isCoreKey(target)) {
          core[target] = val;
        } else {
          custom[target] = val;
        }
      }

      // מניעת כפילויות — אם אחד המספרים כבר קיים, מדלגים
      if (phones.length > 0) {
        const existing = await prisma.callerPhone.findFirst({
          where: { phoneNormalized: { in: phones.map((p) => p.normalized) } },
        });
        if (existing) {
          skipped++;
          continue;
        }
      }

      // הסרת כפילויות פנימיות בין מספרי אותה שורה
      const seen = new Set<string>();
      const uniquePhones = phones.filter((p) => {
        if (seen.has(p.normalized)) return false;
        seen.add(p.normalized);
        return true;
      });

      await prisma.caller.create({
        data: {
          ...core,
          customFields: custom,
          phones: {
            create: uniquePhones.map((p, idx) => ({
              phoneRaw: p.raw,
              phoneNormalized: p.normalized,
              label: p.label as any,
              isPrimary: idx === 0,
            })),
          },
        },
      });
      created++;
    } catch (e: any) {
      errors.push(`שורה ${i + 1}: ${e.message || "שגיאה"}`);
    }
  }

  return NextResponse.json({ created, skipped, errors: errors.slice(0, 20), totalErrors: errors.length });
}
