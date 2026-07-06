import { getAuthUserId, getAuthContext, getCurrentUserName } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/lib/db/profiles";
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

  const profile = await getProfile(userId);
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const formData = await req.formData();
  const photo = formData.get("photo") as File | null;
  if (!photo) return NextResponse.json({ error: "No photo provided" }, { status: 400 });

  // Convert file to base64 for OpenAI
  const arrayBuffer = await photo.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString("base64");
  const mimeType = photo.type || "image/jpeg";

  // Run AI analysis
  let results = await analyzeFace(base64, {
    skinType: profile.skinType,
    goals: profile.goals,
    gender: profile.gender,
  });

  if (isVisualPreviewsEnabled()) {
    results = await enrichAnalysisWithVisuals(buffer, mimeType, results);
  }

  // Upload photo to Supabase Storage
  const photoUrl = await uploadPhoto(BUCKETS.FACE_PHOTOS, userId, buffer, photo.name || "face.jpg");

  // Save analysis to DB
  const analysis = await createAnalysis({
    userId,
    photoUrl,
    results,
  });

  // Save regime
  if (results.skincare) {
    await createRegime({
      analysisId: analysis.id,
      amSteps: results.skincare.amRoutine ?? [],
      pmSteps: results.skincare.pmRoutine ?? [],
    });
  }

  return NextResponse.json({ analysisId: analysis.id, results });
}
