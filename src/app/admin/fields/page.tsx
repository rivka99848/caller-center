import { FieldsManager } from "@/components/FieldsManager";

export default function AdminFieldsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">שדות רשומת מתקשר</h1>
      <p className="text-sm text-slate-500">
        שדות ליבה קבועים. ניתן להוסיף שדות מותאמים משלך, להסתיר או למחוק אותם.
      </p>
      <FieldsManager />
    </div>
  );
}
