import { prisma } from "./prisma";
import { parseGisEvent } from "./gis-adapter";
import { findAgentByExtension, findCallerByPhone } from "./match";
import { normalizePhone } from "./phone";

// עיבוד אירוע שיחה: מציאת נציג+מתקשר, רישום ללוג, ושליחת Screen Pop.
// משמש גם את הוובהוק האמיתי וגם את הסימולטור.
export async function processCallEvent(raw: any) {
  const evt = parseGisEvent(raw);
  const agent = await findAgentByExtension(evt.extension);
  const caller = await findCallerByPhone(evt.phone);
  const matched = !!caller;

  const call = await prisma.call.create({
    data: {
      callId: evt.callId,
      phoneNumber: normalizePhone(evt.phone) || evt.phone,
      extension: evt.extension,
      agentId: agent?.id ?? null,
      callerId: caller?.id ?? null,
      eventType: evt.eventType,
      eventTime: evt.eventTime,
      matched,
      screenPopSent: false,
      screenPopAck: false,
      rawPayload: raw,
    },
  });

  let screenPop = "skipped";
  if (matched && agent) {
    const io = (globalThis as any).__io;
    const callerFull = await prisma.caller.findUnique({
      where: { id: caller!.id },
      include: { phones: true },
    });
    if (io) {
      io.to(`agent:${agent.id}`).emit("screen:pop", {
        callLogId: call.id,
        callId: evt.callId,
        extension: evt.extension,
        phone: normalizePhone(evt.phone),
        eventType: evt.eventType,
        caller: callerFull,
      });
      screenPop = "sent";
      await prisma.call.update({
        where: { id: call.id },
        data: { screenPopSent: true },
      });
    } else {
      screenPop = "no-socket";
    }
  }

  return {
    ok: true,
    matched,
    agent: agent ? agent.fullName : null,
    screen_pop: screenPop,
    caller_id: caller?.id ?? null,
    call_log_id: call.id,
  };
}
