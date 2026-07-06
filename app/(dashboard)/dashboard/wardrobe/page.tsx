import { getAuthUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/db/profiles";
import { getWardrobeAnalyses } from "@/lib/db/wardrobe";
import { resolvePhotoUrls } from "@/lib/utils/photo-url";
import { WardrobeUploader } from "@/components/wardrobe/WardrobeUploader";
import type { WardrobeAnalysis } from "@/types/analysis";

export const dynamic = "force-dynamic";

export default async function WardrobePage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/sign-in");

  const [profile, rawAnalyses] = await Promise.all([
    getProfile(userId),
    getWardrobeAnalyses(userId),
  ]);

  if (!profile) redirect("/onboarding");

  const analyses = await resolvePhotoUrls(rawAnalyses as unknown as WardrobeAnalysis[]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">Wardrobe Analysis</h1>
        <p className="text-muted-foreground mt-1">
          Upload a full-body photo for personalized style and outfit recommendations
        </p>
      </div>
      <WardrobeUploader profile={profile} analyses={analyses} />
    </div>
  );
}
