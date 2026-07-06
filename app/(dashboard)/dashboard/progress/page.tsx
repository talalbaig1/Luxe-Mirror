import { getAuthUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/db/profiles";
import { getAnalyses } from "@/lib/db/analyses";
import { resolvePhotoUrls } from "@/lib/utils/photo-url";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar } from "lucide-react";
import { StoredImage } from "@/components/shared/StoredImage";
import type { Analysis } from "@/types/analysis";

interface AnalysisResults {
  faceShape?: string;
  skinTone?: string;
  concerns?: string[];
  symmetryNotes?: string;
  summary?: string;
}

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/sign-in");

  const [profile, rawAnalyses] = await Promise.all([
    getProfile(userId),
    getAnalyses(userId),
  ]);

  if (!profile) redirect("/onboarding");

  const analyses = await resolvePhotoUrls(rawAnalyses as unknown as Analysis[]);

  if (analyses.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold">Progress Timeline</h1>
          <p className="text-muted-foreground mt-1">Track your style and skin evolution over time</p>
        </div>
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <TrendingUp className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-heading text-lg font-semibold mb-2">No analyses yet</h3>
            <p className="text-muted-foreground text-sm">
              Start with a face analysis — each scan is saved here to track your journey.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Progress Timeline</h1>
        <p className="text-muted-foreground mt-1">
          {analyses.length} analysis{analyses.length !== 1 ? "es" : ""} recorded
        </p>
      </div>

      <div className="space-y-4">
        {analyses.map((analysis: Analysis, index: number) => {
          const results = analysis.results as AnalysisResults;
          const isLatest = index === 0;
          return (
            <Card
              key={analysis.id}
              className={isLatest ? "border-[var(--gold)]/30 bg-[var(--gold)]/5" : ""}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-heading text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {new Date(analysis.createdAt).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {isLatest && (
                      <Badge className="bg-[var(--gold)]/15 text-[var(--gold)] border-[var(--gold)]/30 text-xs">
                        Latest
                      </Badge>
                    )}
                    {analysis.symmetryScore && (
                      <Badge variant="outline" className="text-xs">
                        Symmetry: {Math.round(analysis.symmetryScore * 100)}%
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {analysis.photoUrl && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                      <StoredImage
                        src={analysis.photoUrl}
                        alt="Analysis photo"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {results.faceShape && (
                        <Badge variant="outline" className="text-xs">{results.faceShape} face</Badge>
                      )}
                      {results.skinTone && (
                        <Badge variant="outline" className="text-xs">{results.skinTone}</Badge>
                      )}
                      {results.concerns?.slice(0, 3).map((c) => (
                        <Badge key={c} variant="outline" className="text-xs text-muted-foreground">{c}</Badge>
                      ))}
                    </div>
                    {results.summary && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{results.summary}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
