import { getAuthUserId, getAuthContext, getCurrentUserName } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/db/profiles";
import { getLatestAnalysis } from "@/lib/db/analyses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sun, Moon, Droplets } from "lucide-react";

interface RegimeStep {
  step: string;
  product: string;
  reason: string;
}

export default async function RegimePage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/sign-in");

  const [profile, latestAnalysis] = await Promise.all([
    getProfile(userId),
    getLatestAnalysis(userId),
  ]);

  if (!profile) redirect("/onboarding");

  const regime = latestAnalysis?.regime as {
    amSteps: RegimeStep[];
    pmSteps: RegimeStep[];
  } | null;

  if (!latestAnalysis || !regime) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Skin Regime</h1>
          <p className="text-muted-foreground mt-1">Your personalized skincare routine</p>
        </div>
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Droplets className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-heading text-lg font-semibold mb-2">No regime yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Complete a face analysis first — your personalized AM &amp; PM skincare routine will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const amSteps = regime.amSteps as RegimeStep[];
  const pmSteps = regime.pmSteps as RegimeStep[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">Skin Regime</h1>
        <p className="text-muted-foreground mt-1">
          Your personalized routine based on your facial analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AM Routine */}
        <Card className="border-amber-200/40">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-xl flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" />
              Morning Routine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {amSteps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <p className="font-medium text-sm">{step.step}</p>
                  <Badge variant="outline" className="text-xs mt-1 mb-1">{step.product}</Badge>
                  <p className="text-xs text-muted-foreground">{step.reason}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* PM Routine */}
        <Card className="border-indigo-200/40">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-xl flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-500" />
              Evening Routine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pmSteps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <p className="font-medium text-sm">{step.step}</p>
                  <Badge variant="outline" className="text-xs mt-1 mb-1">{step.product}</Badge>
                  <p className="text-xs text-muted-foreground">{step.reason}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/30">
        <CardContent className="p-4 text-sm text-muted-foreground">
          <strong className="text-foreground">Tip:</strong> Run a new face analysis anytime to update your routine as your skin evolves.
        </CardContent>
      </Card>
    </div>
  );
}
