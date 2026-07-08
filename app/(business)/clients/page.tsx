import { getAuthContext } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getOrCreateOrganization, getClients } from "@/lib/db/clients";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Calendar, Scan } from "lucide-react";

export default async function ClientsPage() {
  const { userId, orgId } = await getAuthContext();
  if (!userId) redirect("/sign-in");

  if (!orgId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold">Client Portal</h1>
          <p className="text-muted-foreground mt-1">Manage your clients&apos; style profiles</p>
        </div>
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-heading text-lg font-semibold mb-2">No organization found</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Create or join an organization in your account settings to access the client portal.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const org = await getOrCreateOrganization(orgId);
  const clients = await getClients(org.id);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Client Portal</h1>
          <p className="text-muted-foreground mt-1">{clients.length} client{clients.length !== 1 ? "s" : ""}</p>
        </div>
        <Badge className="bg-[var(--gold)]/15 text-[var(--gold)] border-[var(--gold)]/30 px-3 py-1.5">
          Business Account
        </Badge>
      </div>

      {clients.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-heading text-lg font-semibold mb-2">No clients yet</h3>
            <p className="text-muted-foreground text-sm">
              Invite clients by email from the team settings.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clients.map((client: Awaited<ReturnType<typeof getClients>>[number]) => {
          const profile = client.profile;
            const lastAnalysis = profile?.analyses?.[0];
            const results = lastAnalysis?.results as { faceShape?: string; skinTone?: string } | null;
            return (
              <Card key={client.id} className="hover:border-[var(--gold)]/30 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={profile?.avatarUrl ?? undefined} />
                      <AvatarFallback className="bg-[var(--gold)]/20 text-[var(--gold)] font-heading">
                        {(profile?.name ?? client.email).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base">{profile?.name ?? "Pending"}</CardTitle>
                      <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {profile && (
                    <div className="flex flex-wrap gap-1.5">
                      {profile.skinType && (
                        <Badge variant="outline" className="text-xs">{profile.skinType} skin</Badge>
                      )}
                      {results?.faceShape && (
                        <Badge variant="outline" className="text-xs">{results.faceShape} face</Badge>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {lastAnalysis && (
                      <span className="flex items-center gap-1">
                        <Scan className="w-3 h-3" />
                        {new Date(lastAnalysis.createdAt).toLocaleDateString()}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Added {new Date(client.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
