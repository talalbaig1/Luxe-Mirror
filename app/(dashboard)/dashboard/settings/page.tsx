import { getAuthUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/db/profiles";
import { resolvePhotoUrl } from "@/lib/utils/photo-url";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Target, Droplets } from "lucide-react";

export default async function SettingsPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/sign-in");

  const profile = await getProfile(userId);
  if (!profile) redirect("/onboarding");

  const avatarUrl = profile.avatarUrl ? await resolvePhotoUrl(profile.avatarUrl) : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile and preferences</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <User className="w-4 h-4" /> Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={avatarUrl ?? undefined} />
              <AvatarFallback className="bg-[var(--gold)]/20 text-[var(--gold)] font-heading text-xl">
                {profile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg">{profile.name}</p>
              <p className="text-sm text-muted-foreground">
                {profile.gender} · {profile.ageRange}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skin & Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <Droplets className="w-4 h-4" /> Skin & Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Skin Type</p>
            <Badge variant="outline">{profile.skinType ?? "Not set"}</Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Target className="w-3 h-3" /> Style Goals
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.goals.length > 0
                ? profile.goals.map((goal: string) => (
                    <Badge
                      key={goal}
                      className="bg-[var(--gold)]/10 text-[var(--gold)] border-[var(--gold)]/30"
                    >
                      {goal}
                    </Badge>
                  ))
                : <p className="text-sm text-muted-foreground">No goals set</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-muted">
        <CardContent className="p-4 text-sm text-muted-foreground">
          To update your profile details, re-run the onboarding flow or contact support.
          Full settings editing is coming soon.
        </CardContent>
      </Card>
    </div>
  );
}
