import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/sara/auth";
import { processChatMessage } from "@/lib/sara/chat";

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ ok: false, message: "Nao autenticado." }, { status: 401 });
  }

  const body = (await request.json()) as { content?: string };
  if (!body.content?.trim()) {
    return NextResponse.json({ ok: false, message: "Mensagem obrigatoria." }, { status: 400 });
  }

  const data = await processChatMessage(session.user.id, body.content.trim());
  revalidatePath("/painel");
  revalidatePath("/painel/tarefas");
  revalidatePath("/painel/lembretes");
  revalidatePath("/painel/agenda");
  revalidatePath("/painel/rotina");
  revalidatePath("/painel/listas");

  return NextResponse.json({ ok: true, data });
}
