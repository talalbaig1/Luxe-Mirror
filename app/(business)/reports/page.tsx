import { getAuthUserId, getAuthContext, getCurrentUserName } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default async function ReportsPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/sign-in");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground mt-1">Generate and download client analysis reports</p>
      </div>
      <Card className="border-dashed">
        <CardContent className="py-16 text-center">
          <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-heading text-lg font-semibold mb-2">PDF Reports</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Select a client from the Client Portal to generate their branded PDF report.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
