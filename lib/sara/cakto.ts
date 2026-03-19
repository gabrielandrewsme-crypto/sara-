import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/config/env";
import { getRepository } from "./repository";

type CaktoWebhookPayload = {
  event?: string;
  data?: {
    customer?: {
      email?: string;
      name?: string;
      id?: string;
    };
    subscription?: {
      id?: string;
      status?: string;
    };
  };
};

function normalizeSubscriptionStatus(status?: string) {
  switch ((status ?? "").toLowerCase()) {
    case "active":
    case "approved":
    case "paid":
      return "active" as const;
    case "past_due":
      return "past_due" as const;
    case "canceled":
    case "cancelled":
      return "canceled" as const;
    case "expired":
      return "expired" as const;
    default:
      return "pending" as const;
  }
}

export function verifyCaktoSignature(rawBody: string, signature: string | null) {
  if (!env.CAKTO_WEBHOOK_SECRET) {
    return true;
  }

  if (!signature) {
    return false;
  }

  const digest = createHmac("sha256", env.CAKTO_WEBHOOK_SECRET).update(rawBody).digest("hex");
  if (digest.length !== signature.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export async function handleCaktoWebhook(payload: CaktoWebhookPayload) {
  const email = payload.data?.customer?.email?.toLowerCase();

  if (!email) {
    throw new Error("Cakto payload missing customer email");
  }

  const repository = getRepository();
  await repository.upsertSubscription({
    email,
    fullName: payload.data?.customer?.name ?? null,
    status: normalizeSubscriptionStatus(payload.data?.subscription?.status ?? payload.event),
    providerCustomerId: payload.data?.customer?.id ?? null,
    providerSubscriptionId: payload.data?.subscription?.id ?? null,
    rawPayload: payload
  });
}
