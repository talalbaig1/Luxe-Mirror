import { getAuthUserId, getAuthContext, getCurrentUserName } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/lib/db/profiles";
import { createWardrobeAnalysis } from "@/lib/db/wardrobe";
import { analyzeWardrobe } from "@/lib/ai/wardrobe";
import { enrichWardrobeWithVisuals } from "@/lib/ai/enrich-wardrobe";
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

  const arrayBuffer = await photo.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString("base64");
  const mimeType = photo.type || "image/jpeg";

  let recommendations = await analyzeWardrobe(base64, {
    goals: profile.goals,
    gender: profile.gender,
  });

  if (isVisualPreviewsEnabled()) {
    recommendations = await enrichWardrobeWithVisuals(buffer, mimeType, recommendations);
  }

  const photoUrl = await uploadPhoto(
    BUCKETS.WARDROBE_PHOTOS,
    userId,
    buffer,
    photo.name || "wardrobe.jpg"
  );

  await createWardrobeAnalysis({ userId, photoUrl, recommendations });

  return NextResponse.json({ recommendations });
}
