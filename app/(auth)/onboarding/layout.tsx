import { getAuthUserId } from "@/lib/auth";
import { getProfile } from "@/lib/db/profiles";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getAuthUserId();
  if (!userId) redirect("/sign-in");

  const profile = await getProfile(userId);
  if (profile) redirect("/dashboard");

  return children;
}
