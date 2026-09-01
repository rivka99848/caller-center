// לוגיקת התאמת מתקשר לפי מספר טלפון + מיפוי שלוחה->נציג.
import { prisma } from "./prisma";
import { normalizePhone } from "./phone";

// מציאת רשומת מתקשר קיימת לפי מספר טלפון (מנורמל). לא יוצר חדש.
export async function findCallerByPhone(rawPhone: string | null | undefined) {
  const normalized = normalizePhone(rawPhone);
  if (!normalized) return null;
  const phone = await prisma.callerPhone.findUnique({
    where: { phoneNormalized: normalized },
    include: { caller: true },
  });
  return phone?.caller ?? null;
}

// מציאת הנציג הפעיל המשויך לשלוחה. מחזיר null אם אין/לא פעיל.
export async function findAgentByExtension(extension: string | null | undefined) {
  if (!extension) return null;
  const ext = await prisma.extension.findUnique({
    where: { extensionNumber: String(extension) },
    include: { agent: true },
  });
  if (!ext || !ext.active || ext.status !== "active") return null;
  if (!ext.agent || ext.agent.status !== "active") return null;
  return ext.agent;
}
