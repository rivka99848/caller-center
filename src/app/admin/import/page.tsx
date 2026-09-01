import { ImportView } from "@/components/ImportView";

export default function AdminImportPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">ייבוא מתקשרים מ־CSV / אקסל</h1>
      <p className="text-sm text-slate-500">
        העלה קובץ CSV, מפה את העמודות לשדות המערכת, וייבא. מספרים שכבר קיימים ידולגו אוטומטית.
      </p>
      <ImportView />
    </div>
  );
}
