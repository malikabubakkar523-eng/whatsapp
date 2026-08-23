import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";

// Interface for Cloudflare D1 Database binding
export interface CloudflareEnv {
  DB?: any; // D1Database
  [key: string]: any;
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  d1ClientMap?: Map<any, PrismaClient>;
};

if (!globalForPrisma.d1ClientMap) {
  globalForPrisma.d1ClientMap = new Map();
}

/**
 * Factory to get or create a PrismaClient instance.
 * - If a Cloudflare D1 binding (env.DB) is provided, uses @prisma/adapter-d1.
 * - Otherwise, falls back to the default singleton PrismaClient for local dev / Node.js runtime.
 */
export function getPrisma(env?: CloudflareEnv): PrismaClient {
  // 1. If Cloudflare D1 binding is provided (env.DB)
  const d1Binding = env?.DB || (globalThis as any)?.DB || (process.env as any)?.DB;
  if (d1Binding && typeof d1Binding.prepare === "function") {
    if (!globalForPrisma.d1ClientMap!.has(d1Binding)) {
      const adapter = new PrismaD1(d1Binding);
      const client = new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      });
      globalForPrisma.d1ClientMap!.set(d1Binding, client);
    }
    return globalForPrisma.d1ClientMap!.get(d1Binding)!;
  }

  // 2. Fallback to standard local / Node.js PrismaClient
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }

  return globalForPrisma.prisma;
}

// Default export for existing routes and Node.js dev server
export const prisma = getPrisma();
