import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { TopBar } from "@/components/TopBar";
import { PopListener } from "@/components/PopListener";

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen">
      <TopBar
        title="מוקד"
        name={user.name}
        links={[
          { href: "/agent", label: "ראשי" },
          { href: "/agent/callers", label: "מתקשרים" },
        ]}
      />
      <PopListener />
      <main className="mx-auto max-w-4xl p-4">{children}</main>
    </div>
  );
}
