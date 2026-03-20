import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env, isMockBackend } from "@/lib/config/env";
import * as schema from "./schema";

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (isMockBackend) {
    throw new Error("Database client is unavailable while MOCK_BACKEND is enabled. Set MOCK_BACKEND=false and configure DATABASE_URL to use Neon.");
  }

  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing. Add your Neon connection string in .env.local.");
  }

  if (env.DATABASE_URL.includes("SEU_VALOR_REAL_DA_NEON")) {
    throw new Error("DATABASE_URL still uses the placeholder value. Replace it with your real Neon connection string in .env.local.");
  }

  if (!dbInstance) {
    const client = neon(env.DATABASE_URL!);
    dbInstance = drizzle(client, { schema });
  }

  return dbInstance;
}
