import type { AnalysisResults, EyewearSuggestion, GroomingLook } from "./analyze";
import { generateEditPreview, mapWithConcurrency } from "./visual-tryon";

const HAIRSTYLE_LIMIT = 3;
const EYEWEAR_LIMIT = 2;
const GROOMING_LIMIT = 2;

function normalizeEyewear(results: AnalysisResults): EyewearSuggestion[] {
  if (results.eyewear?.length) return results.eyewear;
  return (results.eyewearStyles ?? []).map((style) =>
    typeof style === "string" ? { style } : style
  );
}

export async function enrichAnalysisWithVisuals(
  imageBuffer: Buffer,
  mimeType: string,
  results: AnalysisResults
): Promise<AnalysisResults> {
  const enriched = { ...results };

  const hairstylePreview = results.hairstyles.slice(0, HAIRSTYLE_LIMIT);
  const hairstyleRest = results.hairstyles.slice(HAIRSTYLE_LIMIT);
  enriched.hairstyles = [
    ...(await mapWithConcurrency(hairstylePreview, 2, async (h) => ({
      ...h,
      previewUrl:
        (await generateEditPreview(
          imageBuffer,
          mimeType,
          `Professional portrait photo edit. Keep the exact same person, face, facial features, skin tone, expression, and background. Change ONLY the hairstyle to: ${h.name}. ${h.description}. Photorealistic, natural salon result.`
        )) ?? undefined,
    }))),
    ...hairstyleRest,
  ];

  const eyewear = normalizeEyewear(results);
  const eyewearPreview = eyewear.slice(0, EYEWEAR_LIMIT);
  const eyewearRest = eyewear.slice(EYEWEAR_LIMIT);
  enriched.eyewear = [
    ...(await mapWithConcurrency(eyewearPreview, 2, async (e) => ({
      ...e,
      previewUrl:
        (await generateEditPreview(
          imageBuffer,
          mimeType,
          `Professional portrait photo edit. Same person, same face and identity. Add stylish ${e.style} eyeglasses. ${e.description ?? ""} Photorealistic, natural lighting.`
        )) ?? undefined,
    }))),
    ...eyewearRest,
  ];

  const groomingPreview = results.groomingTips.slice(0, GROOMING_LIMIT);
  enriched.groomingLooks = await mapWithConcurrency(
    groomingPreview,
    2,
    async (tip, i): Promise<GroomingLook> => ({
      title: `Grooming look ${i + 1}`,
      description: tip,
      previewUrl:
        (await generateEditPreview(
          imageBuffer,
          mimeType,
          `Professional portrait photo edit. Same person and identity. Apply this grooming enhancement: ${tip}. Subtle, polished, photorealistic.`
        )) ?? undefined,
    })
  );

  return enriched;
}
