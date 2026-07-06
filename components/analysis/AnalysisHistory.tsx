"use client";

import { StoredImage } from "@/components/shared/StoredImage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { AnalysisResultCard } from "./AnalysisResultCard";
import { useState } from "react";

interface Analysis {
  id: string;
  photoUrl: string;
  symmetryScore: number | null;
  results: Record<string, unknown>;
  createdAt: Date;
}

interface Props {
  analyses: Analysis[];
}

export function AnalysisHistory({ analyses }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-xl font-semibold">Previous Analyses</h2>
      {analyses.map((a, i) => (
        <Card
          key={a.id}
          className={i === 0 ? "border-[var(--gold)]/30" : ""}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(a.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </CardTitle>
              <div className="flex items-center gap-2">
                {i === 0 && (
                  <Badge className="bg-[var(--gold)]/15 text-[var(--gold)] border-[var(--gold)]/30 text-xs">
                    Latest
                  </Badge>
                )}
                <button
                  onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                  className="text-xs text-[var(--gold)] hover:underline"
                >
                  {expanded === a.id ? "Collapse" : "View details"}
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {expanded !== a.id ? (
              <div className="flex gap-3 items-center">
                <StoredImage
                  src={a.photoUrl}
                  alt="Analysis"
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex flex-wrap gap-1.5">
                  {(a.results as { faceShape?: string }).faceShape && (
                    <Badge variant="outline" className="text-xs">
                      {(a.results as { faceShape?: string }).faceShape}
                    </Badge>
                  )}
                  {(a.results as { skinTone?: string }).skinTone && (
                    <Badge variant="outline" className="text-xs">
                      {(a.results as { skinTone?: string }).skinTone}
                    </Badge>
                  )}
                </div>
              </div>
            ) : (
              <AnalysisResultCard results={a.results} photoUrl={a.photoUrl} />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
