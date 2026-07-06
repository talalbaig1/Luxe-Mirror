import OpenAI from "openai";

let _openai: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

export const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return (getOpenAI() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export interface HairstyleSuggestion {
  name: string;
  description: string;
  suitability: string;
  previewUrl?: string;
}

export interface EyewearSuggestion {
  style: string;
  description?: string;
  previewUrl?: string;
}

export interface GroomingLook {
  title: string;
  description: string;
  previewUrl?: string;
}

export interface AnalysisResults {
  faceShape: "oval" | "round" | "square" | "heart" | "diamond" | "oblong";
  skinType: "Oily" | "Dry" | "Combination" | "Normal" | "Sensitive";
  skinTone: string;
  skinUndertone: "warm" | "cool" | "neutral";
  concerns: string[];
  symmetryNotes: string;
  hairstyles: HairstyleSuggestion[];
  groomingTips: string[];
  groomingLooks?: GroomingLook[];
  makeupTips: string[];
  /** @deprecated use eyewear */
  eyewearStyles?: string[];
  eyewear?: EyewearSuggestion[];
  skincare: {
    amRoutine: Array<{ step: string; product: string; reason: string }>;
    pmRoutine: Array<{ step: string; product: string; reason: string }>;
  };
  summary: string;
}

export async function analyzeFace(
  imageBase64: string,
  profile: { skinType?: string | null; goals: string[]; gender?: string | null }
): Promise<AnalysisResults> {
  const systemPrompt = `You are Luxe Mirror, a world-class AI personal stylist and dermatologist.
Analyze the provided facial photo and return a detailed, professional assessment.
Detect the user's skin type from the photo — do not ask them to self-report.
Consider: gender is ${profile.gender ?? "not specified"}, 
style goals are: ${profile.goals.join(", ") || "general improvement"}.

Return a JSON object matching this exact structure:
{
  "faceShape": "oval|round|square|heart|diamond|oblong",
  "skinType": "Oily|Dry|Combination|Normal|Sensitive",
  "skinTone": "descriptive tone (e.g. fair, medium, deep, rich)",
  "skinUndertone": "warm|cool|neutral",
  "concerns": ["array of detected skin concerns"],
  "symmetryNotes": "brief professional symmetry assessment",
  "hairstyles": [
    { "name": "style name", "description": "brief description", "suitability": "why it works for this face shape" }
  ],
  "groomingTips": ["tip 1", "tip 2"],
  "makeupTips": ["tip 1", "tip 2"],
  "eyewear": [
    { "style": "frame style name", "description": "why it suits this face" }
  ],
  "skincare": {
    "amRoutine": [{ "step": "1. Cleanser", "product": "Gentle foaming cleanser", "reason": "why needed" }],
    "pmRoutine": [{ "step": "1. Double cleanse", "product": "Oil cleanser + foaming", "reason": "why needed" }]
  },
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
            text: "Please analyze my face and provide personalized styling and skincare recommendations.",
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 2000,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No analysis received from AI");
  return JSON.parse(content) as AnalysisResults;
}
