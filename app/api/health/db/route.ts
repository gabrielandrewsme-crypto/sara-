import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { env, isMockBackend } from "@/lib/config/env";
import { getDb } from "@/lib/db/client";

export async function GET() {
  if (isMockBackend) {
    return NextResponse.json(
      {
        ok: false,
        mode: "mock",
        message: "Banco desativado. Defina MOCK_BACKEND=false e configure DATABASE_URL da Neon."
      },
      { status: 503 }
    );
  }

  try {
    const db = getDb();
    const result = await db.execute(sql`select now() as now, current_database() as database_name`);
    const row = result.rows[0] as { now?: string; database_name?: string } | undefined;

    return NextResponse.json({
      ok: true,
      mode: "neon",
      database: row?.database_name ?? "unknown",
      now: row?.now ?? null,
      appUrl: env.APP_URL
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";

    return NextResponse.json(
      {
        ok: false,
        mode: "neon",
        message
      },
      { status: 500 }
    );
  }
}
