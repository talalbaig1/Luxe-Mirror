import { getAuthUserId, getAuthContext, getCurrentUserName } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/db/profiles";
import { getLatestAnalysis } from "@/lib/db/analyses";
import { getThreads } from "@/lib/db/threads";
import { ChatWindow } from "@/components/chat/ChatWindow";
import type { Analysis } from "@/types/analysis";

export default async function ChatPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/sign-in");

  const [profile, rawLatestAnalysis, threads] = await Promise.all([
    getProfile(userId),
    getLatestAnalysis(userId),
    getThreads(userId),
  ]);

  if (!profile) redirect("/onboarding");

  const latestAnalysis = rawLatestAnalysis as unknown as Analysis | null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">AI Stylist</h1>
        <p className="text-muted-foreground mt-1">
          Chat with your personal Luxe Mirror stylist — ask anything about style, skincare, or grooming
        </p>
      </div>
      <ChatWindow profile={profile} threads={threads} latestAnalysis={latestAnalysis} />
    </div>
  );
}
