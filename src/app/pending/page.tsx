import Link from "next/link";

export default function PendingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="card w-full max-w-md text-center">
        <div className="mb-3 text-4xl">⏳</div>
        <h1 className="mb-2 text-xl font-bold">ההרשמה התקבלה</h1>
        <p className="mb-5 text-sm text-slate-600">
          החשבון שלך ממתין לאישור מנהל. לאחר האישור תוכל להתחבר ולהתחיל לקבל
          שיחות.
        </p>
        <Link href="/login" className="btn-secondary">
          חזרה לכניסה
        </Link>
      </div>
    </div>
  );
}
