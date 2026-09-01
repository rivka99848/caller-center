import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getFieldDefinitions } from "@/lib/fields";
import { CallerDetail } from "@/components/CallerDetail";

export const dynamic = "force-dynamic";

export default async function AdminCallerPage({ params }: { params: { id: string } }) {
  const [caller, fieldDefs, audits] = await Promise.all([
    prisma.caller.findUnique({
      where: { id: params.id },
      include: {
        phones: true,
        noteItems: { orderBy: { createdAt: "desc" }, include: { agent: true } },
        calls: { orderBy: { createdAt: "desc" }, take: 30, include: { agent: true } },
      },
    }),
    getFieldDefinitions(),
    prisma.auditLog.findMany({
      where: { entityType: "caller", entityId: params.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { actor: true },
    }),
  ]);

  if (!caller) notFound();

  return (
    <CallerDetail
      caller={JSON.parse(JSON.stringify(caller))}
      fieldDefs={JSON.parse(JSON.stringify(fieldDefs))}
      audits={JSON.parse(JSON.stringify(audits))}
      backPath="/admin/callers"
    />
  );
}
