import { openai } from "@/lib/ai/analyze";

export interface WardrobeResults {
  bodyType: string;
  colorSeason: "Spring" | "Summer" | "Autumn" | "Winter";
  colorPalette: string[];
  outfits: Array<{
    occasion: string;
    description: string;
    keyPieces: string[];
    colorsToWear: string[];
    previewUrl?: string;
  }>;
  avoidItems: string[];
  stylePersonality: string;
  summary: string;
}

export async function analyzeWardrobe(
  imageBase64: string,
  profile: { skinTone?: string; goals: string[]; gender?: string | null }
): Promise<WardrobeResults> {
  const systemPrompt = `You are Luxe Mirror, a world-class AI personal stylist and color analyst.
Analyze the provided full-body photo and return detailed wardrobe and style recommendations.
Consider: gender is ${profile.gender ?? "not specified"}, style goals: ${profile.goals.join(", ") || "general improvement"}.

Return a JSON object with this exact structure:
{
  "bodyType": "descriptive body type (e.g. hourglass, rectangle, pear, apple, inverted triangle)",
  "colorSeason": "Spring|Summer|Autumn|Winter",
  "colorPalette": ["#hex1", "#hex2", "description1"],
  "outfits": [
    {
      "occasion": "Casual / Work / Evening / etc.",
      "description": "outfit description",
      "keyPieces": ["piece 1", "piece 2"],
      "colorsToWear": ["color 1", "color 2"]
    }
  ],
  "avoidItems": ["item or style to avoid with reason"],
  "stylePersonality": "2-3 word style archetype e.g. Classic Minimalist",
  "summary": "2-3 sentence personalized summary"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: "high" },
          },
          {
            type: "text",
            text: "Please analyze my body type and provide personalized wardrobe recommendations.",
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 1500,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No wardrobe analysis received from AI");
  return JSON.parse(content) as WardrobeResults;
}
