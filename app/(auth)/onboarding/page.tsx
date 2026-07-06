"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Upload, Camera, X, Scan, AlertCircle } from "lucide-react";

const GOALS = [
  "Professional Style",
  "Casual Elegance",
  "Luxury Aesthetic",
  "Streetwear",
  "Natural Beauty",
  "Anti-Aging",
  "Acne Control",
  "Even Skin Tone",
];
const AGE_RANGES = ["18–24", "25–34", "35–44", "45–54", "55+"];
const GENDERS = ["Woman", "Man", "Non-binary", "Prefer not to say"];

export default function OnboardingPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [webcamActive, setWebcamActive] = useState(false);
  const [goals, setGoals] = useState<string[]>([]);
  const [gender, setGender] = useState("");
  const [ageRange, setAgeRange] = useState("");

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  function stopWebcam() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setWebcamActive(false);
  }

  useEffect(() => {
    if (!webcamActive) return;

    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      })
      .catch(() => {
        setError("Camera access denied. Please allow camera permission or upload a photo instead.");
        setWebcamActive(false);
      });

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [webcamActive]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please upload a JPEG, PNG, or WebP image.");
      return;
    }
    setError(null);
    stopWebcam();
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function startWebcam() {
    setError(null);
    setWebcamActive(true);
  }

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);

    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const captured = new File([blob], "selfie.jpg", { type: "image/jpeg" });
      setPhotoFile(captured);
      setPhotoPreview(URL.createObjectURL(captured));
      stopWebcam();
    }, "image/jpeg", 0.92);
  }

  function clearPhoto() {
    stopWebcam();
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function toggleGoal(goal: string) {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  }

  async function handleFinish() {
    if (!photoFile) {
      setError("Please upload a selfie first.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("photo", photoFile);
      formData.append("goals", JSON.stringify(goals));
      formData.append("gender", gender);
      formData.append("ageRange", ageRange);

      const res = await fetch("/api/onboarding", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Setup failed. Please try again.");
      }

      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl font-bold text-foreground">
            Luxe <span className="gold-text">Mirror</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Upload or take a selfie — we&apos;ll detect your skin type and build your profile
          </p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-xl mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Step 1 — Selfie */}
        {step === 1 && (
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Take a selfie</CardTitle>
              <CardDescription>
                Face centered, good lighting. We&apos;ll analyze your skin type, tone, and features automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {webcamActive && !photoPreview ? (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-[3/4] max-h-80">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover mirror"
                      style={{ transform: "scaleX(-1)" }}
                    />
                    <div className="absolute inset-0 border-2 border-[var(--gold)]/40 rounded-xl pointer-events-none m-4" />
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      className="flex-1 gold-gradient text-obsidian font-semibold"
                      onClick={capturePhoto}
                    >
                      <Camera className="w-4 h-4 mr-2" /> Capture
                    </Button>
                    <Button type="button" variant="outline" onClick={stopWebcam}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : !photoPreview ? (
                <div className="border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-4 hover:border-[var(--gold)]/60 hover:bg-[var(--gold)]/5 transition-all">
                  <div className="w-14 h-14 rounded-full bg-[var(--gold)]/10 flex items-center justify-center">
                    <Scan className="w-6 h-6 text-[var(--gold)]" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">Add your selfie</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Face centered, good lighting · JPEG, PNG, or WebP
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                    <Button
                      variant="outline"
                      type="button"
                      className="flex-1"
                      onClick={() => fileRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" /> Upload photo
                    </Button>
                    <Button
                      type="button"
                      className="flex-1 gold-gradient text-obsidian font-semibold"
                      onClick={startWebcam}
                    >
                      <Camera className="w-4 h-4 mr-2" /> Take selfie
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <Image
                    src={photoPreview}
                    alt="Your selfie"
                    width={400}
                    height={400}
                    className="w-full max-h-72 object-contain rounded-xl bg-muted"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={clearPhoto}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <Button
                className="w-full gold-gradient text-obsidian font-semibold"
                onClick={() => setStep(2)}
                disabled={!photoFile}
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2 — Style Goals */}
        {step === 2 && (
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Your style goals</CardTitle>
              <CardDescription>Select all that apply.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {GOALS.map((goal) => (
                  <Badge
                    key={goal}
                    variant={goals.includes(goal) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer px-4 py-2 text-sm transition-all",
                      goals.includes(goal)
                        ? "bg-[var(--gold)] text-obsidian border-[var(--gold)]"
                        : "hover:border-[var(--gold)]/50"
                    )}
                    onClick={() => toggleGoal(goal)}
                  >
                    {goal}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  className="flex-1 gold-gradient text-obsidian font-semibold"
                  onClick={() => setStep(3)}
                  disabled={goals.length === 0}
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3 — Demographics + finish */}
        {step === 3 && (
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">A bit about you</CardTitle>
              <CardDescription>
                Then we&apos;ll analyze your photo and set up your personalized profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm font-medium mb-3">Gender</p>
                <div className="grid grid-cols-2 gap-2">
                  {GENDERS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={cn(
                        "p-3 rounded-xl border-2 text-sm font-medium transition-all",
                        gender === g
                          ? "border-[var(--gold)] bg-[var(--gold)]/10"
                          : "border-border bg-card hover:border-[var(--gold)]/50"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-3">Age range</p>
                <div className="flex flex-wrap gap-2">
                  {AGE_RANGES.map((age) => (
                    <button
                      key={age}
                      type="button"
                      onClick={() => setAgeRange(age)}
                      className={cn(
                        "px-4 py-2 rounded-full border-2 text-sm font-medium transition-all",
                        ageRange === age
                          ? "border-[var(--gold)] bg-[var(--gold)]/10"
                          : "border-border bg-card hover:border-[var(--gold)]/50"
                      )}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  className="flex-1 gold-gradient text-obsidian font-semibold"
                  onClick={handleFinish}
                  disabled={!gender || !ageRange || loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Scan className="w-4 h-4 animate-pulse" /> Analyzing & generating previews…
                    </span>
                  ) : (
                    "Enter Luxe Mirror"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
