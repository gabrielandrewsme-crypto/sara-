import "server-only";

export async function transcribeAudio(input: { objectKey: string }) {
  return {
    text: `Audio transcrito de ${input.objectKey}`
  };
}
