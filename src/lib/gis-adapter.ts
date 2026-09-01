// מתאם (adapter) לאירועי התותח/GIS.
// זו השכבה היחידה שתלויה בפורמט המדויק שה-GIS שולח.
// כשיתקבל הפורמט האמיתי מה-GIS — משנים כאן בלבד, ושאר המערכת לא נוגעים בה.

export interface CanonicalCallEvent {
  callId: string | null;
  extension: string | null;
  phone: string | null;
  eventType: string | null; // ringing | connected | answered | ended
  eventTime: Date | null;
  direction: string | null;
}

function firstDefined(obj: any, keys: string[]): any {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null && obj[k] !== "") return obj[k];
  }
  return null;
}

// ממיר payload גולמי (במבנה כלשהו) למבנה ה-canonical האחיד של המערכת.
// כרגע תומך גם במבנה ה-canonical עצמו וגם בשמות שדות נפוצים חלופיים.
export function parseGisEvent(raw: any): CanonicalCallEvent {
  const body = raw || {};

  const callId = firstDefined(body, ["call_id", "callId", "uniqueid", "id"]);
  const extension = firstDefined(body, ["extension", "ext", "agent_extension", "did", "line"]);
  const phone = firstDefined(body, ["phone", "phone_number", "caller", "callerid", "from", "number"]);
  const eventType = firstDefined(body, ["event_type", "event", "status", "state"]);
  const direction = firstDefined(body, ["direction", "dir"]);
  const eventTimeRaw = firstDefined(body, ["event_time", "eventTime", "timestamp", "time"]);

  let eventTime: Date | null = null;
  if (eventTimeRaw) {
    const d = new Date(eventTimeRaw);
    eventTime = isNaN(d.getTime()) ? new Date() : d;
  } else {
    eventTime = new Date();
  }

  return {
    callId: callId != null ? String(callId) : null,
    extension: extension != null ? String(extension) : null,
    phone: phone != null ? String(phone) : null,
    eventType: eventType != null ? String(eventType) : null,
    eventTime,
    direction: direction != null ? String(direction) : null,
  };
}
