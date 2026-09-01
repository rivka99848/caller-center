import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CORE_FIELDS = [
  { fieldKey: "callerNumber", label: "מספר", type: "text", order: 10 },
  { fieldKey: "title", label: "תואר", type: "text", order: 20 },
  { fieldKey: "firstName", label: "שם פרטי", type: "text", order: 30 },
  { fieldKey: "lastName", label: "שם משפחה", type: "text", order: 40 },
  { fieldKey: "suffix", label: "סיומת", type: "text", order: 50 },
  { fieldKey: "address", label: "כתובת", type: "text", order: 60 },
  { fieldKey: "city", label: "עיר", type: "text", order: 70 },
  { fieldKey: "shtiebel", label: "שטיבל", type: "text", order: 80 },
] as const;

async function main() {
  // מנהל ראשוני
  const adminUsername = process.env.SEED_ADMIN_USERNAME || "admin";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin!12345";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { username: adminUsername },
    update: {},
    create: {
      username: adminUsername,
      passwordHash,
      fullName: "מנהל מערכת",
      role: "admin",
      status: "active",
      approvedAt: new Date(),
    },
  });
  console.log(`✓ מנהל: ${adminUsername}`);

  // הגדרות שדות ליבה
  for (const f of CORE_FIELDS) {
    await prisma.fieldDefinition.upsert({
      where: { fieldKey: f.fieldKey },
      update: { label: f.label, displayOrder: f.order, isCore: true },
      create: {
        fieldKey: f.fieldKey,
        label: f.label,
        type: f.type as any,
        displayOrder: f.order,
        isCore: true,
        visible: true,
      },
    });
  }
  console.log(`✓ ${CORE_FIELDS.length} שדות ליבה`);

  // נציג לדוגמה + שלוחה (מאושר) — לבדיקות
  const agentPass = await bcrypt.hash("Agent!12345", 10);
  const agent = await prisma.user.upsert({
    where: { username: "rachel" },
    update: {},
    create: {
      username: "rachel",
      passwordHash: agentPass,
      fullName: "רחל",
      role: "agent",
      status: "active",
      approvedAt: new Date(),
    },
  });
  await prisma.extension.upsert({
    where: { extensionNumber: "203" },
    update: { agentId: agent.id, status: "active", active: true },
    create: {
      extensionNumber: "203",
      agentId: agent.id,
      status: "active",
      active: true,
    },
  });
  console.log("✓ נציג לדוגמה: rachel / שלוחה 203");

  // מתקשר לדוגמה עם מספר טלפון
  const existing = await prisma.callerPhone.findUnique({
    where: { phoneNormalized: "0501234567" },
  });
  if (!existing) {
    await prisma.caller.create({
      data: {
        callerNumber: "847",
        title: "מר",
        firstName: "דוד",
        lastName: "כהן",
        city: "בני ברק",
        shtiebel: "ויז'ניץ",
        notes: "לקוח ביקש לחזור אליו",
        phones: {
          create: [
            {
              phoneNormalized: "0501234567",
              phoneRaw: "050-1234567",
              label: "husband",
              isPrimary: true,
            },
          ],
        },
      },
    });
    console.log("✓ מתקשר לדוגמה: דוד כהן / 050-1234567");
  }

  // נציגי דמה נוספים (מאושרים) עם שלוחות
  const demoAgents = [
    { username: "leah", fullName: "לאה", ext: "201" },
    { username: "miriam", fullName: "מרים", ext: "202" },
  ];
  for (const a of demoAgents) {
    const pass = await bcrypt.hash("Agent!12345", 10);
    const u = await prisma.user.upsert({
      where: { username: a.username },
      update: {},
      create: {
        username: a.username,
        passwordHash: pass,
        fullName: a.fullName,
        role: "agent",
        status: "active",
        approvedAt: new Date(),
      },
    });
    await prisma.extension.upsert({
      where: { extensionNumber: a.ext },
      update: { agentId: u.id, status: "active", active: true },
      create: { extensionNumber: a.ext, agentId: u.id, status: "active", active: true },
    });
  }
  console.log(`✓ ${demoAgents.length} נציגי דמה (שלוחות 201, 202)`);

  // מתקשרי דמה
  const demoCallers = [
    { callerNumber: "1021", title: "הרב", firstName: "משה", lastName: "פרידמן", city: "בני ברק", shtiebel: "ויז'ניץ", phone: "052-7654321", label: "husband", notes: "מעוניין בפרטים על התרומה החודשית" },
    { callerNumber: "1022", title: "מר", firstName: "יעקב", lastName: "רוזנברג", city: "ירושלים", shtiebel: "גור", phone: "053-8887777", label: "husband", notes: "" },
    { callerNumber: "1023", title: "הרב", firstName: "חיים", lastName: "ווייס", city: "מודיעין עילית", shtiebel: "בעלזא", phone: "054-1112233", label: "husband", notes: "ביקש לחזור אליו אחרי השקיעה" },
    { callerNumber: "1024", title: "גב'", firstName: "שרה", lastName: "גרוס", city: "בני ברק", shtiebel: "", phone: "050-9998877", label: "wife", notes: "" },
    { callerNumber: "1025", title: "הרב", firstName: "אברהם", lastName: "הלוי", city: "אלעד", shtiebel: "סאטמר", phone: "058-4445566", label: "husband", notes: "תורם קבוע" },
    { callerNumber: "1026", title: "מר", firstName: "יוסף", lastName: "לנדאו", city: "ביתר עילית", shtiebel: "קרלין", phone: "052-3334455", label: "husband", notes: "" },
  ];
  let createdDemo = 0;
  for (const c of demoCallers) {
    const normalized = c.phone.replace(/\D/g, "");
    const exists = await prisma.callerPhone.findUnique({ where: { phoneNormalized: normalized } });
    if (exists) continue;
    await prisma.caller.create({
      data: {
        callerNumber: c.callerNumber,
        title: c.title,
        firstName: c.firstName,
        lastName: c.lastName,
        city: c.city,
        shtiebel: c.shtiebel || null,
        notes: c.notes || null,
        phones: {
          create: [{ phoneNormalized: normalized, phoneRaw: c.phone, label: c.label as any, isPrimary: true }],
        },
      },
    });
    createdDemo++;
  }
  console.log(`✓ ${createdDemo} מתקשרי דמה נוספו`);

  console.log("\nseed הושלם.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
