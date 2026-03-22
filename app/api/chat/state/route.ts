import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/sara/auth";
import { getCurrentChatState } from "@/lib/sara/chat";

export async function GET() {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ ok: false, message: "Nao autenticado." }, { status: 401 });
  }

  const data = await getCurrentChatState(session.user.id);
  return NextResponse.json({ ok: true, data });
}
