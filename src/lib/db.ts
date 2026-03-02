import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

function createPrismaClient(): PrismaClient {
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Configure it in .env for Phase 2.");
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const client = connectionString ? (globalForPrisma.prisma ?? createPrismaClient()) : null;
if (client && process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
export const prisma = client;
