import { NextResponse } from "next/server";
import { handleCaktoWebhook, verifyCaktoSignature } from "@/lib/sara/cakto";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature =
    request.headers.get("x-cakto-signature") ?? request.headers.get("x-signature") ?? request.headers.get("signature");

  if (!verifyCaktoSignature(rawBody, signature)) {
    return NextResponse.json({ ok: false, message: "Invalid signature" }, { status: 401 });
  }

  await handleCaktoWebhook(JSON.parse(rawBody));
  return NextResponse.json({ ok: true });
}
