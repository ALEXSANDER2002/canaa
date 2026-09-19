import { PrismaClient } from "@prisma/client";

// Singleton do PrismaClient para evitar múltiplas conexões durante o
// hot-reload em desenvolvimento (padrão recomendado pela documentação).
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
