import { openai } from "@/lib/ai/analyze";
import type { AnalysisResults } from "@/lib/ai/analyze";

export function buildSystemPrompt(context: {
  profile: { name: string; skinType?: string | null; goals: string[]; gender?: string | null };
  latestAnalysis?: { results: AnalysisResults } | null;
}): string {
  const { profile, latestAnalysis } = context;
  const analysisContext = latestAnalysis
    ? `
The user's latest facial analysis revealed:
- Face shape: ${latestAnalysis.results.faceShape}
- Skin tone: ${latestAnalysis.results.skinTone} (${latestAnalysis.results.skinUndertone} undertone)
- Skin concerns: ${latestAnalysis.results.concerns.join(", ")}
- Recommended hairstyles: ${latestAnalysis.results.hairstyles.map((h) => h.name).join(", ")}
`
    : "The user has not yet completed a facial analysis.";

  return `You are Luxe Mirror, a world-class AI personal stylist, skincare expert, and grooming advisor.
You are warm, professional, and encouraging — like a luxury personal stylist who genuinely cares.

Client profile:
- Name: ${profile.name}
- Skin type: ${profile.skinType ?? "unknown"}
- Style goals: ${profile.goals.join(", ") || "general improvement"}
- Gender: ${profile.gender ?? "not specified"}

${analysisContext}

Guidelines:
- Give specific, actionable advice tailored to this client
- Be encouraging but honest
- Reference their analysis data when relevant
- Keep responses concise but thorough
- Use a warm, luxury-brand tone — never clinical or robotic
- If asked about products, recommend product categories not specific brands unless asked`;
}

export async function generateThreadTitle(firstMessage: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Generate a short, descriptive title (4-6 words max) for a beauty/styling chat thread based on the user's first message. Return only the title, no quotes.",
      },
      { role: "user", content: firstMessage },
    ],
    max_tokens: 20,
  });
  return response.choices[0].message.content?.trim() ?? "Style Conversation";
}
