import { NextResponse } from "next/server";
import { requestEmailLoginCode } from "@/lib/sara/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string };

  if (!body.email) {
    return NextResponse.json({ ok: false, message: "Email obrigatorio." }, { status: 400 });
  }

  const result = await requestEmailLoginCode(body.email);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
