import { getAuthUserId } from "@/lib/auth";
import { getProfile } from "@/lib/db/profiles";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/shared/Sidebar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getAuthUserId();
  if (!userId) redirect("/sign-in");

  const profile = await getProfile(userId);
  if (!profile) redirect("/onboarding");

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen">
        <div className="max-w-5xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}
