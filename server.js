// שרת מותאם: Next.js + Socket.IO באותו תהליך.
// כך ה-API של הוובהוק יכול לשדר "הקפצה" (screen pop) לדפדפן של נציג ספציפי.
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");
const { getToken } = require("next-auth/jwt");
const { parse: parseCookie } = require("cookie");

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res, parse(req.url, true));
  });

  const io = new Server(server, {
    path: "/socket.io",
    cors: { origin: false },
  });

  // אימות ה-socket לפי ה-session cookie של NextAuth
  io.use(async (socket, nextFn) => {
    try {
      const rawCookie = socket.handshake.headers.cookie || "";
      const token = await getToken({
        req: { cookies: parseCookie(rawCookie), headers: { cookie: rawCookie } },
        secret: process.env.NEXTAUTH_SECRET,
      });
      if (!token || !token.sub) return nextFn(new Error("unauthorized"));
      socket.data.userId = token.sub;
      socket.data.role = token.role;
      return nextFn();
    } catch (e) {
      return nextFn(new Error("unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId;
    socket.join(`agent:${userId}`); // חדר אישי לנציג — לכאן מגיעה ההקפצה
    if (socket.data.role === "admin") socket.join("admins");

    // הדפדפן מאשר שקיבל הקפצה — נעדכן את הלוג
    socket.on("pop:ack", async (payload) => {
      try {
        if (payload && payload.callLogId) {
          const { prisma } = require("./src/lib/prisma-runtime");
          await prisma.call.update({
            where: { id: payload.callLogId },
            data: { screenPopAck: true },
          });
        }
      } catch (e) {
        console.error("pop:ack error", e);
      }
    });
  });

  // חשיפה גלובלית כדי שה-API routes ישדרו דרך אותו io
  globalThis.__io = io;

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
