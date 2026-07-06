import { getAuthUserId, getCurrentUserName } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { upsertProfile, getProfile } from "@/lib/db/profiles";

export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const profile = await getProfile(userId);
  return NextResponse.json(profile);
}

export async function POST(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const displayName = await getCurrentUserName();
  const body = await req.json();

  const profile = await upsertProfile({
    userId,
    name: body.name ?? displayName,
    skinType: body.skinType,
    goals: body.goals ?? [],
    avatarUrl: body.avatarUrl,
    gender: body.gender,
    ageRange: body.ageRange,
  });

  return NextResponse.json(profile);
}
