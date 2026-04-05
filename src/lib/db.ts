import { PrismaClient } from "@prisma/client";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not defined in the environment variables.");
  throw new Error("DATABASE_URL is required to start the application.");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalThisAny = globalThis as any;

if (!globalThisAny.pool) {
    globalThisAny.pool = new Pool({ connectionString: process.env.DATABASE_URL });
}
const pool = globalThisAny.pool;

if (!globalThisAny.adapter) {
    globalThisAny.adapter = new PrismaPg(pool);
}
const adapter = globalThisAny.adapter;

export const prisma = globalThisAny.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
    globalThisAny.prisma = prisma;
}