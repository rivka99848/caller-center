import { CallerSearch } from "@/components/CallerSearch";

export default function AgentCallersPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">חיפוש מתקשרים</h1>
      <CallerSearch basePath="/agent/callers" />
    </div>
  );
}
