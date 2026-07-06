import { toFile } from "openai";
import { openai } from "./analyze";

function mimeToExt(mime: string): string {
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  return "jpeg";
}

export async function generateEditPreview(
  imageBuffer: Buffer,
  mimeType: string,
  prompt: string,
  size: "1024x1024" | "1024x1536" = "1024x1024"
): Promise<string | null> {
  try {
    const ext = mimeToExt(mimeType);
    const file = await toFile(imageBuffer, `photo.${ext}`, { type: mimeType });

    const response = await openai.images.edit({
      model: "gpt-image-1",
      image: file,
      prompt,
      input_fidelity: "high",
      quality: "medium",
      size,
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) return null;
    return `data:image/png;base64,${b64}`;
  } catch (error) {
    console.error("[visual-tryon] Preview generation failed:", error);
    return null;
  }
}

export async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  if (items.length === 0) return [];
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const i = nextIndex++;
      results[i] = await fn(items[i], i);
    }
  }

  const workers = Math.min(concurrency, items.length);
  await Promise.all(Array.from({ length: workers }, () => worker()));
  return results;
}
