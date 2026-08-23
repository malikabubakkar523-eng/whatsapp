import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { createD1HttpClientFromEnv } from "./d1-http";

// Interface for Cloudflare D1 Database binding
export interface CloudflareEnv {
  DB?: any; // D1Database
  [key: string]: any;
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

/**
 * Factory to get or create a PrismaClient instance.
 * - If running on Cloudflare Workers with native D1 binding (`env.DB`): uses PrismaD1(env.DB).
 * - If running on Vercel with Cloudflare D1 HTTP credentials: uses PrismaD1(d1HttpClient).
 * - Otherwise: falls back to standard PrismaClient (local SQLite / DATABASE_URL).
 */
export function getPrisma(env?: CloudflareEnv): PrismaClient {
  // 1. Check for native Cloudflare Worker / Pages binding (env.DB)
  const d1Binding = env?.DB || (globalThis as any)?.DB || (process.env as any)?.DB;
  if (d1Binding && typeof d1Binding.prepare === "function") {
    const adapter = new PrismaD1(d1Binding);
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }

  // 2. Check for Cloudflare D1 HTTP credentials on Vercel / Serverless
  const d1HttpClient = createD1HttpClientFromEnv();
  if (d1HttpClient) {
    const adapter = new PrismaD1(d1HttpClient as any);
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }

  // 3. Default fallback for local Node.js / dev server
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }

  return globalForPrisma.prisma;
}

// Default export for all existing API routes and server components
export const prisma = getPrisma();
