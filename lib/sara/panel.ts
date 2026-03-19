import "server-only";
import { requireSession } from "./auth";
import { getRepository } from "./repository";
import type { CurrentUserPanelPayload } from "./types";

export async function getCurrentUserPanelData(): Promise<CurrentUserPanelPayload> {
  const session = await requireSession();
  const repository = getRepository();
  const data = await repository.getPanelData(session.user.id);
  return { data };
}
