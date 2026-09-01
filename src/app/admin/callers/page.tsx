import Link from "next/link";
import { CallerSearch } from "@/components/CallerSearch";

export default function AdminCallersPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">מתקשרים</h1>
        <Link href="/admin/callers/new" className="btn-primary">
          + מתקשר חדש
        </Link>
      </div>
      <CallerSearch basePath="/admin/callers" />
    </div>
  );
}
