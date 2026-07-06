import type { WardrobeResults } from "./wardrobe";
import { generateEditPreview, mapWithConcurrency } from "./visual-tryon";

const OUTFIT_LIMIT = 3;

export async function enrichWardrobeWithVisuals(
  imageBuffer: Buffer,
  mimeType: string,
  results: WardrobeResults
): Promise<WardrobeResults> {
  const enriched = { ...results };

  const outfitPreview = results.outfits.slice(0, OUTFIT_LIMIT);
  const outfitRest = results.outfits.slice(OUTFIT_LIMIT);
  enriched.outfits = [
    ...(await mapWithConcurrency(outfitPreview, 2, async (outfit) => ({
      ...outfit,
      previewUrl:
        (await generateEditPreview(
          imageBuffer,
          mimeType,
          `Full-body fashion photo edit. Same person, pose, body proportions, and background. Change ONLY their clothing to this outfit: ${outfit.description}. Key pieces: ${outfit.keyPieces.join(", ")}. Colors: ${outfit.colorsToWear.join(", ")}. Photorealistic fashion photography, natural lighting.`,
          "1024x1536"
        )) ?? undefined,
    }))),
    ...outfitRest,
  ];

  return enriched;
}
