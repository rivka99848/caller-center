"use client";
import { useState } from "react";

// כפתור הדמיה — מפעיל שיחה נכנסת אקראית שתקפוץ על המסך, בדיוק כמו שיחה אמיתית.
export function DemoPopButton() {
  const [loading, setLoading] = useState(false);

  async function fire() {
    setLoading(true);
    await fetch("/api/demo/pop", { method: "POST" });
    // הקפצה עצמה מגיעה דרך ה-WebSocket ונתפסת ע"י ה-PopListener
    setTimeout(() => setLoading(false), 800);
  }

  return (
    <button className="btn-primary w-full !py-3 text-base" onClick={fire} disabled={loading}>
      {loading ? "מחייג..." : "📞 הדמיית שיחה נכנסת"}
    </button>
  );
}
