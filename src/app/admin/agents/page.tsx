import { AgentsManager } from "@/components/AgentsManager";

export default function AdminAgentsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">נציגים ושלוחות</h1>
      <AgentsManager />
    </div>
  );
}
