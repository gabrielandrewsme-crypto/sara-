import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/sara/auth";
import { getRepository } from "@/lib/sara/repository";

export async function GET() {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ ok: false, message: "Nao autenticado." }, { status: 401 });
  }

  const repository = getRepository();
  const data = await repository.getPanelData(session.user.id);

  return NextResponse.json({ ok: true, data });
}
