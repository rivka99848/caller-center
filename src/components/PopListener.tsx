"use client";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";

type PopEvent = {
  callLogId: string;
  phone: string;
  eventType: string | null;
  caller: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    title: string | null;
  };
};

// מאזין להקפצות שיחה בזמן אמת: מציג באנר, משמיע צליל, ולחיצה פותחת את הרשומה.
export function PopListener() {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ringTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [pop, setPop] = useState<PopEvent | null>(null);
  const [connected, setConnected] = useState(false);

  // --- צליל צלצול (Web Audio) ---
  function getCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!audioCtxRef.current) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (AC) audioCtxRef.current = new AC();
    }
    const ctx = audioCtxRef.current;
    if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  }

  function playRingBurst() {
    const ctx = getCtx();
    if (!ctx) return;
    // צלצול כפול קלאסי: שתי פעימות קצרות
    [0, 0.4].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 440;
      const t = ctx.currentTime + offset;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.34);
    });
  }

  function startRinging() {
    stopRinging();
    playRingBurst();
    ringTimerRef.current = setInterval(playRingBurst, 2500);
    // עצירה אוטומטית אחרי 20 שניות אם לא נסגר
    setTimeout(stopRinging, 20000);
  }

  function stopRinging() {
    if (ringTimerRef.current) {
      clearInterval(ringTimerRef.current);
      ringTimerRef.current = null;
    }
  }

  useEffect(() => {
    // שחרור מנוע השמע בלחיצה ראשונה של המשתמש (דרישת דפדפנים)
    const unlock = () => getCtx();
    document.addEventListener("click", unlock, { once: true });
    document.addEventListener("keydown", unlock, { once: true });

    const socket = io({ path: "/socket.io" });
    socketRef.current = socket;
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("screen:pop", (data: PopEvent) => {
      setPop(data);
      startRinging();
      socket.emit("pop:ack", { callLogId: data.callLogId });
      router.refresh();
    });
    return () => {
      stopRinging();
      socket.disconnect();
      document.removeEventListener("click", unlock);
      document.removeEventListener("keydown", unlock);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  function openRecord() {
    if (!pop?.caller?.id) return;
    const id = pop.caller.id;
    stopRinging();
    setPop(null);
    router.push(`/agent/callers/${id}`);
  }

  function dismiss() {
    stopRinging();
    setPop(null);
  }

  return (
    <>
      {/* מחוון חיבור */}
      <div className="fixed bottom-3 left-3 z-30">
        <span
          className={`badge ${connected ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500"}`}
          title={connected ? "מחובר לשרת ההקפצות" : "מנותק"}
        >
          {connected ? "● מחובר" : "○ מנותק"}
        </span>
      </div>

      {/* באנר הקפצת שיחה — לחיצה בכל מקום פותחת את הרשומה */}
      {pop && (
        <div className="fixed inset-x-0 top-0 z-40 flex justify-center p-3">
          <div
            className="flex w-full max-w-md cursor-pointer items-center gap-4 rounded-xl bg-brand-600 p-4 text-white shadow-lg ring-2 ring-brand-700"
            onClick={openRecord}
          >
            <div className="animate-bounce text-3xl">📞</div>
            <div className="flex-1">
              <div className="text-xs opacity-90">שיחה נכנסת</div>
              <div className="text-lg font-bold">
                {[pop.caller.title, pop.caller.firstName, pop.caller.lastName]
                  .filter(Boolean)
                  .join(" ") || "מתקשר"}
              </div>
              <div className="text-sm opacity-90" dir="ltr">
                {pop.phone}
              </div>
            </div>
            <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
              <button className="btn bg-white text-brand-700 hover:bg-slate-100" onClick={openRecord}>
                פתח רשומה
              </button>
              <button className="text-xs opacity-90 hover:underline" onClick={dismiss}>
                סגור
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
