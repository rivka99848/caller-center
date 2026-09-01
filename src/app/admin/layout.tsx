import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { TopBar } from "@/components/TopBar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/agent");

  return (
    <div className="min-h-screen">
      <TopBar
        title="מוקד · ניהול"
        name={user.name}
        links={[
          { href: "/admin", label: "ראשי" },
          { href: "/admin/agents", label: "נציגים" },
          { href: "/admin/callers", label: "מתקשרים" },
          { href: "/admin/fields", label: "שדות" },
          { href: "/admin/logs", label: "לוגים" },
          { href: "/admin/reports", label: "דוחות" },
          { href: "/admin/import", label: "ייבוא" },
          { href: "/admin/simulator", label: "סימולטור" },
        ]}
      />
      <main className="mx-auto max-w-5xl p-4">{children}</main>
    </div>
  );
}
