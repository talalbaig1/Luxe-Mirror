"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { StoredImage } from "@/components/shared/StoredImage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Upload, X, Shirt, AlertCircle, Calendar } from "lucide-react";
import { SuggestionPreviewCard } from "@/components/shared/SuggestionPreviewCard";

interface Profile {
  userId: string;
  name: string;
  goals: string[];
  gender?: string | null;
}

interface WardrobeAnalysis {
  id: string;
  photoUrl: string;
  recommendations: Record<string, unknown>;
  createdAt: Date;
}

interface WardrobeResults {
  bodyType?: string;
  colorSeason?: string;
  colorPalette?: string[];
  outfits?: Array<{
    occasion: string;
    description: string;
    keyPieces: string[];
    colorsToWear: string[];
    previewUrl?: string;
  }>;
  avoidItems?: string[];
  stylePersonality?: string;
  summary?: string;
}

interface Props {
  profile: Profile;
  analyses: WardrobeAnalysis[];
}

export function WardrobeUploader({ profile, analyses }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WardrobeResults | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(selected.type)) {
      setError("Please upload a JPEG, PNG, or WebP image.");
      return;
    }
    setError(null);
    setFile(selected);
    setResult(null);
    setPreview(URL.createObjectURL(selected));
  }

  function clearPhoto() {
    setPreview(null);
    setFile(null);
    setResult(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleAnalyze() {
    if (!file) return;
    setAnalyzing(true);
    setError(null);
    setProgress(10);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const interval = setInterval(() => setProgress((p) => Math.min(p + 3, 92)), 1500);
      const res = await fetch("/api/wardrobe", { method: "POST", body: formData });
      clearInterval(interval);
      setProgress(100);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Analysis failed");
      }
      const data = await res.json();
      setResult(data.recommendations);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="space-y-6">
      {!result ? (
        <>
          {!preview ? (
            <Card
              className="border-2 border-dashed cursor-pointer hover:border-[var(--gold)]/60 hover:bg-[var(--gold)]/5 transition-all"
              onClick={() => fileRef.current?.click()}
            >
              <CardContent className="py-16 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--gold)]/10 flex items-center justify-center">
                  <Shirt className="w-7 h-7 text-[var(--gold)]" />
                </div>
                <div>
                  <p className="font-semibold">Upload a full-body photo</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Stand facing the camera · Good lighting · Full outfit visible
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
                  <Upload className="w-4 h-4 mr-2" /> Browse files
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="relative">
                  <Image
                    src={preview}
                    alt="Preview"
                    width={400}
                    height={500}
                    className="w-full max-h-[500px] object-contain rounded-xl bg-muted"
                  />
                  <button
                    onClick={clearPhoto}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {analyzing && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Analyzing your style and generating outfit previews…
                    </p>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                )}
                {error && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-xl">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                  </div>
                )}
                <Button
                  className="w-full gold-gradient text-obsidian font-semibold"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                >
                  <Shirt className="w-4 h-4 mr-2" />
                  {analyzing ? "Analyzing..." : "Analyze My Style"}
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <div className="space-y-4">
          {/* Summary */}
          <Card className="border-[var(--gold)]/20 bg-gradient-to-br from-card to-[var(--gold)]/5">
            <CardContent className="p-5 space-y-3">
              <div className="flex flex-wrap gap-2">
                {result.bodyType && <Badge className="bg-[var(--gold)]/15 text-[var(--gold)] border-[var(--gold)]/30">{result.bodyType}</Badge>}
                {result.colorSeason && <Badge variant="outline">{result.colorSeason}</Badge>}
                {result.stylePersonality && <Badge variant="outline">{result.stylePersonality}</Badge>}
              </div>
              {result.summary && <p className="text-sm text-muted-foreground">{result.summary}</p>}
            </CardContent>
          </Card>

          {/* Outfits */}
          {result.outfits && result.outfits.length > 0 && (
            <div>
              <h3 className="font-heading font-semibold mb-3">Outfit Recommendations</h3>
              <div className="space-y-3">
                {result.outfits.map((outfit, i) => (
                  <SuggestionPreviewCard
                    key={i}
                    title={outfit.occasion}
                    description={outfit.description}
                    subtitle={`Colors: ${outfit.colorsToWear.join(", ")} · ${outfit.keyPieces.join(", ")}`}
                    originalUrl={preview ?? undefined}
                    previewUrl={outfit.previewUrl}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Avoid */}
          {result.avoidItems && result.avoidItems.length > 0 && (
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-4">
                <p className="font-semibold text-sm mb-2">Style to avoid</p>
                <div className="space-y-1">
                  {result.avoidItems.map((item, i) => (
                    <p key={i} className="text-sm text-muted-foreground">• {item}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Button variant="outline" onClick={clearPhoto} className="w-full">
            Analyze Another Outfit
          </Button>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleFileChange} />

      {/* History */}
      {analyses.length > 0 && !result && (
        <div>
          <h3 className="font-heading font-semibold mb-3">Previous Analyses</h3>
          <div className="space-y-2">
            {analyses.map((a) => {
              const r = a.recommendations as WardrobeResults;
              return (
                <Card key={a.id} className={cn("hover:border-[var(--gold)]/30 transition-colors")}>
                  <CardContent className="p-4 flex gap-3 items-center">
                    <StoredImage src={a.photoUrl} alt="Wardrobe" width={48} height={56} className="w-12 h-14 rounded-lg object-cover" />
                    <div>
                      <div className="flex gap-1.5 flex-wrap">
                        {r.bodyType && <Badge variant="outline" className="text-xs">{r.bodyType}</Badge>}
                        {r.colorSeason && <Badge variant="outline" className="text-xs">{r.colorSeason}</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(a.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
