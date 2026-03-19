import "server-only";

export async function storeAudioObject(input: {
  userId: string;
  providerMessageId: string;
  sourceUrl?: string;
}) {
  return {
    objectKey: `audio/${input.userId}/${input.providerMessageId}.ogg`,
    sourceUrl: input.sourceUrl ?? null
  };
}
