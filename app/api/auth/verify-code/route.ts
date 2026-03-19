import { NextResponse } from "next/server";
import { verifyEmailLoginCode } from "@/lib/sara/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; code?: string };

  if (!body.email || !body.code) {
    return NextResponse.json({ ok: false, message: "Email e codigo sao obrigatorios." }, { status: 400 });
  }

  const result = await verifyEmailLoginCode(body.email, body.code);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
