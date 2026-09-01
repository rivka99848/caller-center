import { LogsView } from "@/components/LogsView";

export default function AdminLogsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">לוג אירועי שיחה</h1>
      <p className="text-sm text-slate-500">
        לתיעוד ודיבוג — כל אירוע שהתקבל מהתותח, האם נמצא מתקשר, והאם ההקפצה הצליחה.
      </p>
      <LogsView />
    </div>
  );
}
