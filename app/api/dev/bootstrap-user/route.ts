import { NextResponse } from "next/server";
import { env } from "@/lib/config/env";
import { bootstrapLocalUser } from "@/lib/sara/bootstrap";

export async function POST(request: Request) {
  const isLocalApp = env.APP_URL.includes("localhost") || env.APP_URL.includes("127.0.0.1");

  if (env.NODE_ENV === "production" && !isLocalApp) {
    return NextResponse.json({ ok: false, message: "Unavailable in production." }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    name?: string;
  };

  const email = body.email?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ ok: false, message: "Email obrigatorio." }, { status: 400 });
  }

  const result = await bootstrapLocalUser({
    email,
    name: body.name
  });

  return NextResponse.json(result);
}
