import { getAuthUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus } from "lucide-react";

export default async function TeamPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/sign-in");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Team</h1>
        <p className="text-muted-foreground mt-1">Manage team members and invite clients</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Invite a Client
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Client invitations via email are coming in the next release.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
