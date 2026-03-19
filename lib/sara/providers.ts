import "server-only";

export type WhatsAppProviderAdapter = {
  provider: "evolution" | "meta";
  normalizeInbound(payload: unknown): {
    providerMessageId: string;
    phoneNumber: string;
    body: string;
    messageType: "text" | "audio";
    audioUrl?: string;
    audioDurationSeconds?: number;
    rawPayload: unknown;
  } | null;
};

export const evolutionProvider: WhatsAppProviderAdapter = {
  provider: "evolution",
  normalizeInbound(payload) {
    const typed = payload as {
      data?: {
        key?: { id?: string; remoteJid?: string; fromMe?: boolean };
        message?: { conversation?: string; audioMessage?: { url?: string; seconds?: number } };
      };
    };

    const providerMessageId = typed.data?.key?.id;
    const remoteJid = typed.data?.key?.remoteJid;

    if (!providerMessageId || !remoteJid || typed.data?.key?.fromMe) {
      console.log(
        "[evolutionProvider] ignored payload",
        JSON.stringify({
          reason: !providerMessageId ? "missing-provider-message-id" : !remoteJid ? "missing-remote-jid" : "from-me",
          payload
        })
      );
      return null;
    }

    const phoneNumber = remoteJid.split("@")[0] ?? "";
    const audio = typed.data?.message?.audioMessage;

    const normalized = {
      providerMessageId,
      phoneNumber,
      body: typed.data?.message?.conversation ?? "[audio]",
      messageType: (audio ? "audio" : "text") as const,
      audioUrl: audio?.url,
      audioDurationSeconds: audio?.seconds,
      rawPayload: payload
    };

    console.log("[evolutionProvider] normalized payload", JSON.stringify(normalized));

    return normalized;
  }
};

export const metaProvider: WhatsAppProviderAdapter = {
  provider: "meta",
  normalizeInbound() {
    return null;
  }
};
