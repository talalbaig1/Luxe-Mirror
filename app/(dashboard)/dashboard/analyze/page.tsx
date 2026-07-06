import { getAuthUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/db/profiles";
import { getAnalyses } from "@/lib/db/analyses";
import { resolvePhotoUrls } from "@/lib/utils/photo-url";
import { PhotoUploader } from "@/components/analysis/PhotoUploader";
import { AnalysisHistory } from "@/components/analysis/AnalysisHistory";
import type { Analysis } from "@/types/analysis";

export const dynamic = "force-dynamic";

export default async function AnalyzePage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/sign-in");

  const [profile, rawAnalyses] = await Promise.all([
    getProfile(userId),
    getAnalyses(userId),
  ]);

  if (!profile) redirect("/onboarding");

  const analyses = await resolvePhotoUrls(rawAnalyses as unknown as Analysis[]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">Face Analysis</h1>
        <p className="text-muted-foreground mt-1">
          Upload a clear, well-lit selfie for your AI-powered facial assessment
        </p>
      </div>

      <PhotoUploader profile={profile} />

      {analyses.length > 0 && (
        <AnalysisHistory analyses={analyses} />
      )}
    </div>
  );
}
