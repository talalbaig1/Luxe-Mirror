import Link from "next/link";
import { getAuthUserId } from "@/lib/auth";
import { getProfile } from "@/lib/db/profiles";
import { getLatestAnalysis } from "@/lib/db/analyses";
import { getThreads } from "@/lib/db/threads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scan, Shirt, MessageCircle, Droplets, TrendingUp, ArrowRight, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const userId = await getAuthUserId();
  const profile = userId ? await getProfile(userId) : null;

  const [latestAnalysis, threads] = await Promise.all([
    userId ? getLatestAnalysis(userId) : null,
    userId ? getThreads(userId) : [],
  ]);

  if (!profile) return null;

  const analysisResults = latestAnalysis?.results as {
    faceShape?: string;
    skinTone?: string;
    concerns?: string[];
    summary?: string;
  } | null;

  const quickActions = [
    {
      href: "/dashboard/analyze",
      icon: Scan,
      title: "Face Analysis",
      description: "Analyze your facial features and get personalized recommendations",
      cta: latestAnalysis ? "New Scan" : "Start Analysis",
    },
    {
      href: "/dashboard/wardrobe",
      icon: Shirt,
      title: "Wardrobe",
      description: "Upload a photo for style and outfit recommendations",
      cta: "Analyze Outfit",
    },
    {
      href: "/dashboard/chat",
      icon: MessageCircle,
      title: "AI Stylist",
      description: "Chat with your personal AI stylist anytime",
      cta: threads.length > 0 ? "Continue Chat" : "Start Chat",
    },
    {
      href: "/dashboard/regime",
      icon: Droplets,
      title: "Skin Regime",
      description: "Your personalized morning and night skincare routine",
      cta: "View Routine",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Welcome back, <span className="gold-text">{profile.name.split(" ")[0]}</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          {latestAnalysis
            ? `Your last analysis was on ${new Date(latestAnalysis.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric" })}`
            : "You haven't done a facial analysis yet — start below"}
        </p>
      </div>

      {/* Analysis summary card */}
      {latestAnalysis && analysisResults && (
        <Card className="border-[var(--gold)]/20 bg-gradient-to-br from-card to-[var(--gold)]/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-heading text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--gold)]" />
                Your Style Profile
              </CardTitle>
              <Link href="/dashboard/analyze">
                <Button variant="ghost" size="sm" className="text-[var(--gold)] hover:text-[var(--gold)]">
                  View full report <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-3">
              {analysisResults.faceShape && (
                <Badge className="bg-[var(--gold)]/15 text-[var(--gold)] border-[var(--gold)]/30 hover:bg-[var(--gold)]/20">
                  {analysisResults.faceShape} face
                </Badge>
              )}
              {analysisResults.skinTone && (
                <Badge variant="outline">{analysisResults.skinTone}</Badge>
              )}
              {analysisResults.concerns?.slice(0, 2).map((c) => (
                <Badge key={c} variant="outline" className="text-muted-foreground">{c}</Badge>
              ))}
            </div>
            {analysisResults.summary && (
              <p className="text-sm text-muted-foreground leading-relaxed">{analysisResults.summary}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="font-heading text-xl font-semibold mb-4">What would you like to do?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map(({ href, icon: Icon, title, description, cta }) => (
            <Card
              key={href}
              className="group hover:border-[var(--gold)]/40 transition-all hover:shadow-md cursor-pointer"
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--gold)]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--gold)]/20 transition-colors">
                    <Icon className="w-5 h-5 text-[var(--gold)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5 leading-snug">{description}</p>
                    <Link href={href}>
                      <Button variant="link" className="p-0 h-auto mt-2 text-[var(--gold)] text-sm font-medium">
                        {cta} <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Progress teaser */}
      {latestAnalysis && (
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-[var(--gold)]" />
              <div>
                <p className="font-medium">Track your progress</p>
                <p className="text-sm text-muted-foreground">
                  See how your style and skin have evolved over time
                </p>
              </div>
            </div>
            <Link href="/dashboard/progress">
              <Button variant="outline" size="sm">View Timeline</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
