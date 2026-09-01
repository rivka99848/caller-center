// Prisma singleton (CommonJS) — משמש גם את server.js וגם את קוד ה-app
const { PrismaClient } = require("@prisma/client");

const globalForPrisma = globalThis;
const prisma = globalForPrisma.__prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.__prisma = prisma;

module.exports = { prisma };
