import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { processInboundWhatsAppMessage } from "@/lib/sara/whatsapp";

export async function POST(request: Request) {
  const payload = await request.json();
  console.log("[whatsapp/inbound] payload received", JSON.stringify(payload));
  const result = await processInboundWhatsAppMessage(payload);
  console.log("[whatsapp/inbound] result", JSON.stringify(result));

  if (result.ok && !result.ignored) {
    revalidatePath("/painel");
  }

  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
