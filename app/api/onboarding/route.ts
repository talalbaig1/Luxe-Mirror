import { getAuthUserId, getCurrentUserName } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { upsertProfile } from "@/lib/db/profiles";
import { createAnalysis, createRegime } from "@/lib/db/analyses";
import { analyzeFace } from "@/lib/ai/analyze";
import { enrichAnalysisWithVisuals } from "@/lib/ai/enrich-analysis";
import { isVisualPreviewsEnabled } from "@/lib/config";
import { uploadPhoto } from "@/lib/utils/image";
import { BUCKETS } from "@/lib/supabase";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const photo = formData.get("photo") as File | null;
  if (!photo) return NextResponse.json({ error: "No photo provided" }, { status: 400 });

  const goalsRaw = formData.get("goals") as string | null;
  const gender = (formData.get("gender") as string) || undefined;
  const ageRange = (formData.get("ageRange") as string) || undefined;

  let goals: string[] = [];
  try {
    goals = goalsRaw ? JSON.parse(goalsRaw) : [];
  } catch {
    return NextResponse.json({ error: "Invalid goals data" }, { status: 400 });
  }

  const arrayBuffer = await photo.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString("base64");
  const mimeType = photo.type || "image/jpeg";

  let results;
  try {
    results = await analyzeFace(base64, { goals, gender });
    if (isVisualPreviewsEnabled()) {
      results = await enrichAnalysisWithVisuals(buffer, mimeType, results);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const photoUrl = await uploadPhoto(BUCKETS.FACE_PHOTOS, userId, buffer, photo.name || "face.jpg");
  const displayName = await getCurrentUserName();

  const profile = await upsertProfile({
    userId,
    name: displayName,
    skinType: results.skinType,
    goals,
    avatarUrl: photoUrl,
    gender,
    ageRange,
  });

  const analysis = await createAnalysis({
    userId,
    photoUrl,
    results,
  });

  if (results.skincare) {
    await createRegime({
      analysisId: analysis.id,
      amSteps: results.skincare.amRoutine ?? [],
      pmSteps: results.skincare.pmRoutine ?? [],
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/onboarding");

  return NextResponse.json({ profile, results });
}
