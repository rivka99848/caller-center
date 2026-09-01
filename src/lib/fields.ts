import { prisma } from "./prisma";

// שדות הליבה תואמים לעמודות ב-Caller; שאר השדות נשמרים ב-customFields (JSON).
export const CORE_KEYS = [
  "callerNumber",
  "title",
  "firstName",
  "lastName",
  "suffix",
  "address",
  "city",
  "shtiebel",
] as const;

export type CoreKey = (typeof CORE_KEYS)[number];

export function isCoreKey(key: string): key is CoreKey {
  return (CORE_KEYS as readonly string[]).includes(key);
}

export async function getFieldDefinitions() {
  return prisma.fieldDefinition.findMany({
    where: { visible: true },
    orderBy: { displayOrder: "asc" },
  });
}

// מפצל אובייקט ערכים לפי הגדרות השדות לעמודות ליבה ו-customFields
export function splitValues(values: Record<string, any>) {
  const core: Record<string, any> = {};
  const custom: Record<string, any> = {};
  for (const [k, v] of Object.entries(values)) {
    if (isCoreKey(k)) core[k] = v === "" ? null : v;
    else custom[k] = v;
  }
  return { core, custom };
}
