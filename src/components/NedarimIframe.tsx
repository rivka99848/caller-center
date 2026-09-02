"use client";
import { useEffect, useRef, useState } from "react";

// שילוב iframe התשלומים של נדרים פלוס (matara.pro) במסך המתקשר.
// פרוטוקול התקשורת (postMessage) לפי הסטנדרט של נדרים פלוס:
//   הורה -> iframe:  { Name: 'Redraw' } / { Name: 'FinishTransaction', Value: {...} }
//   iframe -> הורה:  { Name: 'Height', Value: <px> } / { Name: 'TransactionResponse', Value: {...} }

const IFRAME_SRC = "https://www.matara.pro/nedarimplus/iframe/";

// ⚙️ פרטי המוסד — יש למלא את הערכים של פסגות (אפשר גם דרך משתני סביבה NEXT_PUBLIC_*)
const MOSAD_ID = process.env.NEXT_PUBLIC_NEDARIM_MOSAD || "";
const API_VALID = process.env.NEXT_PUBLIC_NEDARIM_API || "";

type PayerInfo = {
  callerId: string;
  callerNumber: string | null;
  firstName: string | null;
  lastName: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
};

export function NedarimIframe({ payer }: { payer: PayerInfo }) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [height, setHeight] = useState(420);
  const [amount, setAmount] = useState("");
  const [tashlumim, setTashlumim] = useState("1");
  const [status, setStatus] = useState<"idle" | "processing" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  function postNedarim(name: string, value: any = "") {
    iframeRef.current?.contentWindow?.postMessage({ Name: name, Value: value }, "*");
  }

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (typeof e.origin === "string" && e.origin.indexOf("matara.pro") === -1) return;
      const data: any = e.data;
      if (!data || !data.Name) return;
      switch (data.Name) {
        case "Height":
          if (data.Value) setHeight(Number(data.Value) + 15);
          break;
        case "TransactionResponse": {
          const v = data.Value || {};
          const okStatus = String(v.Status || "").toLowerCase();
          if (okStatus === "ok" || okStatus === "success") {
            setStatus("ok");
            setMessage(`התשלום בוצע בהצלחה. אישור: ${v.TransactionId || v.ConfirmationNumber || ""}`);
          } else {
            setStatus("error");
            setMessage(v.Message || "העסקה נכשלה. נסו שוב.");
          }
          break;
        }
        default:
          break;
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  function onIframeLoad() {
    // בקשת ציור מחדש כדי שה-iframe ידווח על גובהו
    postNedarim("Redraw", "");
  }

  function pay() {
    setMessage("");
    if (!MOSAD_ID || !API_VALID) {
      setStatus("error");
      setMessage("חסרים פרטי מוסד — יש להגדיר מספר מוסד וסיסמת API.");
      return;
    }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setStatus("error");
      setMessage("יש להזין סכום תקין.");
      return;
    }
    setStatus("processing");
    postNedarim("FinishTransaction", {
      Mosad: MOSAD_ID,
      ApiValid: API_VALID,
      PaymentType: "Ragil", // תשלום רגיל
      Currency: 1, // 1 = ש"ח
      Amount: amt,
      Tashlumim: Number(tashlumim) || 1,
      Zeout: "",
      FirstName: payer.firstName || "",
      LastName: payer.lastName || "",
      Street: payer.address || "",
      City: payer.city || "",
      Phone: payer.phone || "",
      Mail: "",
      Comment: `תרומה דרך מערכת המוקד${payer.callerNumber ? " · לקוח #" + payer.callerNumber : ""}`,
      Groupe: "",
      Param1: payer.callerId,
      Param2: payer.callerNumber || "",
    });
  }

  const configured = MOSAD_ID && API_VALID;

  return (
    <div className="card">
      <h2 className="section-title">💳 תשלומים · נדרים פלוס</h2>

      {!configured && (
        <div className="mb-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 ring-1 ring-amber-200">
          כדי להפעיל תשלומים יש להזין את <b>מספר המוסד</b> ו<b>סיסמת ה־API</b> של פסגות
          (משתני סביבה <code>NEXT_PUBLIC_NEDARIM_MOSAD</code> ו־<code>NEXT_PUBLIC_NEDARIM_API</code>).
          עד אז ה־iframe מוצג לצפייה בלבד.
        </div>
      )}

      {/* פרטי התשלום */}
      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="label">סכום (₪)</label>
          <input
            className="input"
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <label className="label">תשלומים</label>
          <select className="input" value={tashlumim} onChange={(e) => setTashlumim(e.target.value)}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2 flex items-end">
          <div className="text-sm text-slate-500">
            משלם:{" "}
            <span className="font-medium text-slate-700">
              {[payer.firstName, payer.lastName].filter(Boolean).join(" ") || "—"}
            </span>
          </div>
        </div>
      </div>

      {/* iframe הזנת כרטיס אשראי מאובטח */}
      <div className="overflow-hidden rounded-lg ring-1 ring-slate-200">
        <iframe
          ref={iframeRef}
          src={IFRAME_SRC}
          onLoad={onIframeLoad}
          title="נדרים פלוס — תשלום מאובטח"
          className="w-full"
          style={{ height }}
        />
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button className="btn-primary" onClick={pay} disabled={status === "processing" || !configured}>
          {status === "processing" ? "מעבד תשלום..." : "בצע תשלום"}
        </button>
        {message && (
          <span className={`text-sm ${status === "ok" ? "text-green-700" : "text-red-600"}`}>
            {message}
          </span>
        )}
      </div>

      <p className="mt-2 text-xs text-slate-400">
        פרטי הכרטיס מוזנים ישירות מול נדרים פלוס (מאובטח) — הם לא עוברים דרך המערכת שלנו.
      </p>
    </div>
  );
}
