import "server-only";
import { env } from "@/lib/config/env";
import { evolutionProvider } from "./providers";
import { getRepository } from "./repository";
import { classifyMessage } from "./classifier";
import { normalizePhone } from "./utils";
import { storeAudioObject } from "./storage";
import { transcribeAudio } from "./transcription";

export async function linkWhatsAppNumber(input: { userId: string; phoneNumber: string }) {
  const repository = getRepository();
  return repository.linkWhatsApp({
    userId: input.userId,
    phoneNumber: input.phoneNumber
  });
}

export async function processInboundWhatsAppMessage(payload: unknown) {
  const providerPayload = evolutionProvider.normalizeInbound(payload);

  if (!providerPayload) {
    console.log("[processInboundWhatsAppMessage] ignored before normalization");
    return { ok: true, ignored: true };
  }

  const normalized = {
    ...providerPayload,
    phoneNumber: normalizePhone(providerPayload.phoneNumber)
  };

  if (!normalized) {
    return { ok: true, ignored: true };
  }

  const repository = getRepository();
  const linkedUser = await repository.findUserByWhatsAppPhone(normalized.phoneNumber);

  if (!linkedUser) {
    console.log(
      "[processInboundWhatsAppMessage] phone not linked",
      JSON.stringify({ phoneNumber: normalized.phoneNumber })
    );
    return { ok: true, ignored: true, reason: "unlinked-phone" };
  }

  let messageBody = normalized.body;
  if (normalized.messageType === "audio" && (normalized.audioDurationSeconds ?? 0) > 60) {
    console.log(
      "[processInboundWhatsAppMessage] audio rejected",
      JSON.stringify({ durationSeconds: normalized.audioDurationSeconds })
    );
    return { ok: false, reason: "audio-too-long" };
  }

  const inboundMessageId = await repository.storeInboundMessage({
    userId: linkedUser.userId,
    whatsappAccountId: linkedUser.whatsappAccountId,
    providerMessageId: normalized.providerMessageId,
    messageType: normalized.messageType,
    body: normalized.body,
    rawPayload: normalized.rawPayload
  });

  if (normalized.messageType === "audio") {
    const stored = await storeAudioObject({
      userId: linkedUser.userId,
      providerMessageId: normalized.providerMessageId,
      sourceUrl: normalized.audioUrl
    });

    const audioFileId = await repository.storeAudioFile({
      userId: linkedUser.userId,
      inboundMessageId,
      objectKey: stored.objectKey,
      durationSeconds: normalized.audioDurationSeconds ?? 0,
      mimeType: "audio/ogg"
    });

    const transcription = await transcribeAudio({ objectKey: stored.objectKey });
    await repository.storeTranscription({
      audioFileId,
      text: transcription.text,
      rawPayload: transcription
    });

    messageBody = transcription.text;
  }

  const interpreted = await classifyMessage(messageBody);
  console.log("[processInboundWhatsAppMessage] interpreted", JSON.stringify(interpreted));
  await repository.applyMessageInterpretation({
    userId: linkedUser.userId,
    inboundMessageId,
    interpreted
  });

  return {
    ok: true,
    ignored: false,
    connectUrl: env.SARA_WHATSAPP_URL,
    interpreted
  };
}
