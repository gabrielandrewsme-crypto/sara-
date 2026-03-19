import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/sara/auth";
import { linkWhatsAppNumber } from "@/lib/sara/whatsapp";

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ ok: false, message: "Nao autenticado." }, { status: 401 });
  }

  const body = (await request.json()) as { phoneNumber?: string };

  if (!body.phoneNumber) {
    return NextResponse.json({ ok: false, message: "Numero obrigatorio." }, { status: 400 });
  }

  const state = await linkWhatsAppNumber({
    userId: session.user.id,
    phoneNumber: body.phoneNumber
  });

  return NextResponse.json({ ok: true, data: state });
}
