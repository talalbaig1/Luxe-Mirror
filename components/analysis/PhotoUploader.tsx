"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Upload, Camera, X, Scan, AlertCircle } from "lucide-react";
import { AnalysisResultCard } from "./AnalysisResultCard";

interface Profile {
  userId: string;
  name: string;
  skinType?: string | null;
  goals: string[];
  gender?: string | null;
}

interface Props {
  profile: Profile;
}

export function PhotoUploader({ profile }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [webcam, setWebcam] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(selected.type)) {
      setError("Please upload a JPEG, PNG, or WebP image.");
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setError("Image must be under 10MB.");
      return;
    }
    setError(null);
    setFile(selected);
    setResult(null);
    const url = URL.createObjectURL(selected);
    setPreview(url);
  }

  async function startWebcam() {
    setWebcam(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) videoRef.current.srcObject = stream;
  }

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d")!;
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const captured = new File([blob], "webcam.jpg", { type: "image/jpeg" });
      setFile(captured);
      setPreview(URL.createObjectURL(captured));
      setWebcam(false);
      const tracks = (videoRef.current?.srcObject as MediaStream)?.getTracks();
      tracks?.forEach((t) => t.stop());
    }, "image/jpeg");
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

      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + 3, 92));
      }, 1500);

      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      clearInterval(progressInterval);
      setProgress(100);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Analysis failed");
      }

      const data = await res.json();
      setResult(data.results);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAnalyzing(false);
    }
  }

  if (result) {
    return (
      <div className="space-y-4">
        <AnalysisResultCard results={result} photoUrl={preview ?? undefined} />
        <Button variant="outline" onClick={clearPhoto} className="w-full">
          Start New Analysis
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload zone */}
      {!preview && !webcam && (
        <Card
          className={cn(
            "border-2 border-dashed cursor-pointer transition-all hover:border-[var(--gold)]/60 hover:bg-[var(--gold)]/5",
            "border-border"
          )}
          onClick={() => fileRef.current?.click()}
        >
          <CardContent className="py-16 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--gold)]/10 flex items-center justify-center">
              <Upload className="w-7 h-7 text-[var(--gold)]" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Upload a selfie</p>
              <p className="text-sm text-muted-foreground mt-1">
                JPEG, PNG, or WebP · Max 10MB · Face centered, good lighting
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
              >
                <Upload className="w-4 h-4 mr-2" /> Browse files
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => { e.stopPropagation(); startWebcam(); }}
              >
                <Camera className="w-4 h-4 mr-2" /> Use webcam
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Webcam */}
      {webcam && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex gap-3">
              <Button className="flex-1 gold-gradient text-obsidian" onClick={capturePhoto}>
                <Camera className="w-4 h-4 mr-2" /> Capture
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setWebcam(false);
                  const tracks = (videoRef.current?.srcObject as MediaStream)?.getTracks();
                  tracks?.forEach((t) => t.stop());
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {preview && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="relative">
              <Image
                src={preview}
                alt="Preview"
                width={400}
                height={400}
                className="w-full max-h-96 object-contain rounded-xl bg-muted"
              />
              <button
                onClick={clearPhoto}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {analyzing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Scan className="w-4 h-4 animate-pulse text-[var(--gold)]" />
                  Analyzing your features and generating style previews…
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-xl">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button
              className="w-full gold-gradient text-obsidian font-semibold"
              onClick={handleAnalyze}
              disabled={analyzing}
            >
              <Scan className="w-4 h-4 mr-2" />
              {analyzing ? "Analyzing..." : "Analyze My Face"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
