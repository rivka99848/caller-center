"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export function TopBar({
  title,
  name,
  links,
}: {
  title: string;
  name?: string | null;
  links?: { href: string; label: string }[];
}) {
  const pathname = usePathname();
  const isActive = (href: string) => {
    // "/admin" ו-"/agent" הם עמוד הבית — התאמה מדויקת; שאר הקישורים גם לתת-עמודים
    if (href === "/admin" || href === "/agent") return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="פסגות" className="h-9 w-auto" />
          <span className="hidden text-sm font-medium text-slate-400 sm:inline">{title}</span>
        </div>
        {links && (
          <nav className="hidden gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-link ${isActive(l.href) ? "nav-link-active" : ""}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
      <div className="flex items-center gap-3">
        {name && <span className="text-sm text-slate-500">שלום, {name}</span>}
        <button className="btn-secondary" onClick={() => signOut({ callbackUrl: "/login" })}>
          יציאה
        </button>
      </div>
    </header>
  );
}
