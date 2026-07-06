"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StoredImage } from "@/components/shared/StoredImage";
import { Scissors, Droplets, Glasses, Palette, Sparkles } from "lucide-react";
import { SuggestionPreviewCard } from "@/components/shared/SuggestionPreviewCard";

interface HairstyleSuggestion {
  name: string;
  description: string;
  suitability: string;
  previewUrl?: string;
}

interface EyewearSuggestion {
  style: string;
  description?: string;
  previewUrl?: string;
}

interface GroomingLook {
  title: string;
  description: string;
  previewUrl?: string;
}

interface AnalysisResult {
  faceShape?: string;
  skinTone?: string;
  skinUndertone?: string;
  concerns?: string[];
  symmetryNotes?: string;
  hairstyles?: HairstyleSuggestion[];
  groomingTips?: string[];
  groomingLooks?: GroomingLook[];
  makeupTips?: string[];
  eyewear?: EyewearSuggestion[];
  eyewearStyles?: string[];
  skincare?: {
    amRoutine?: Array<{ step: string; product: string; reason: string }>;
    pmRoutine?: Array<{ step: string; product: string; reason: string }>;
  };
  summary?: string;
}

interface Props {
  results: Record<string, unknown>;
  photoUrl?: string;
}

function getEyewearItems(r: AnalysisResult): EyewearSuggestion[] {
  if (r.eyewear?.length) return r.eyewear;
  return (r.eyewearStyles ?? []).map((style) => ({ style }));
}

export function AnalysisResultCard({ results, photoUrl }: Props) {
  const r = results as AnalysisResult;
  const eyewearItems = getEyewearItems(r);
  const hasGroomingLooks = (r.groomingLooks?.length ?? 0) > 0;

  return (
    <div className="space-y-4">
      {/* Summary header */}
      <Card className="border-[var(--gold)]/20 bg-gradient-to-br from-card to-[var(--gold)]/5">
        <CardContent className="p-5">
          <div className="flex gap-4">
            {photoUrl && (
              <StoredImage
                src={photoUrl}
                alt="Your photo"
                width={72}
                height={72}
                className="w-18 h-18 rounded-xl object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[var(--gold)]" />
                <h3 className="font-heading font-semibold text-lg">Your Analysis</h3>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {r.faceShape && (
                  <Badge className="bg-[var(--gold)]/15 text-[var(--gold)] border-[var(--gold)]/30">
                    {r.faceShape} face
                  </Badge>
                )}
                {r.skinTone && <Badge variant="outline">{r.skinTone}</Badge>}
                {r.skinUndertone && (
                  <Badge variant="outline">{r.skinUndertone} undertone</Badge>
                )}
              </div>
              {r.summary && (
                <p className="text-sm text-muted-foreground leading-relaxed">{r.summary}</p>
              )}
            </div>
          </div>

          {r.concerns && r.concerns.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Skin concerns detected</p>
              <div className="flex flex-wrap gap-1.5">
                {r.concerns.map((c) => (
                  <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="hairstyles">
        <TabsList className="w-full h-auto flex-wrap gap-1 bg-muted/50">
          <TabsTrigger value="hairstyles" className="flex items-center gap-1.5 text-xs">
            <Scissors className="w-3 h-3" /> Hairstyles
          </TabsTrigger>
          <TabsTrigger value="skincare" className="flex items-center gap-1.5 text-xs">
            <Droplets className="w-3 h-3" /> Skincare
          </TabsTrigger>
          <TabsTrigger value="grooming" className="flex items-center gap-1.5 text-xs">
            <Palette className="w-3 h-3" /> Grooming
          </TabsTrigger>
          <TabsTrigger value="eyewear" className="flex items-center gap-1.5 text-xs">
            <Glasses className="w-3 h-3" /> Eyewear
          </TabsTrigger>
        </TabsList>

        {/* Hairstyles */}
        <TabsContent value="hairstyles" className="space-y-3 mt-3">
          {r.hairstyles?.map((h, i) => (
            <SuggestionPreviewCard
              key={i}
              title={h.name}
              description={h.description}
              subtitle={h.suitability}
              originalUrl={photoUrl}
              previewUrl={h.previewUrl}
            />
          ))}
        </TabsContent>

        {/* Skincare */}
        <TabsContent value="skincare" className="space-y-4 mt-3">
          {r.skincare?.amRoutine && (
            <div>
              <p className="font-semibold text-sm mb-2 flex items-center gap-1.5">
                ☀️ Morning
              </p>
              <div className="space-y-2">
                {r.skincare.amRoutine.map((s, i) => (
                  <Card key={i}>
                    <CardContent className="p-3">
                      <p className="text-sm font-medium">{s.step}</p>
                      <Badge variant="outline" className="text-xs mt-1">{s.product}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{s.reason}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {r.skincare?.pmRoutine && (
            <div>
              <p className="font-semibold text-sm mb-2 flex items-center gap-1.5">
                🌙 Evening
              </p>
              <div className="space-y-2">
                {r.skincare.pmRoutine.map((s, i) => (
                  <Card key={i}>
                    <CardContent className="p-3">
                      <p className="text-sm font-medium">{s.step}</p>
                      <Badge variant="outline" className="text-xs mt-1">{s.product}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{s.reason}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Grooming / Makeup */}
        <TabsContent value="grooming" className="space-y-3 mt-3">
          {hasGroomingLooks ? (
            r.groomingLooks!.map((look, i) => (
              <SuggestionPreviewCard
                key={i}
                title={look.title}
                description={look.description}
                originalUrl={photoUrl}
                previewUrl={look.previewUrl}
              />
            ))
          ) : (
            <div className="space-y-2">
              {[...(r.groomingTips ?? []), ...(r.makeupTips ?? [])].map((tip, i) => (
                <div key={i} className="flex gap-2 p-3 rounded-xl bg-muted/40 text-sm">
                  <span className="text-[var(--gold)] font-bold flex-shrink-0">{i + 1}.</span>
                  {tip}
                </div>
              ))}
            </div>
          )}

          {hasGroomingLooks && (r.makeupTips?.length ?? 0) > 0 && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">Additional makeup tips</p>
              <div className="space-y-2">
                {r.makeupTips!.map((tip, i) => (
                  <div key={i} className="flex gap-2 p-3 rounded-xl bg-muted/40 text-sm">
                    <span className="text-[var(--gold)] font-bold flex-shrink-0">{i + 1}.</span>
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Eyewear */}
        <TabsContent value="eyewear" className="space-y-3 mt-3">
          {eyewearItems.map((item, i) => (
            <SuggestionPreviewCard
              key={i}
              title={item.style}
              description={item.description}
              originalUrl={photoUrl}
              previewUrl={item.previewUrl}
            />
          ))}
          {r.symmetryNotes && (
            <Card className="bg-muted/30">
              <CardContent className="p-3 text-sm text-muted-foreground">
                <strong className="text-foreground">Symmetry notes:</strong> {r.symmetryNotes}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
