import { NextResponse } from "next/server";
import { logoutCurrentSession } from "@/lib/sara/auth";

export async function POST() {
  await logoutCurrentSession();
  return NextResponse.json({ ok: true });
}
