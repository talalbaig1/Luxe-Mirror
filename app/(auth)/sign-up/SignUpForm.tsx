"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (data.session) {
        router.push("/onboarding");
        router.refresh();
      } else {
        setEmailSent(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md px-4 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[var(--gold)]/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7 text-[var(--gold)]" />
          </div>
          <h1 className="font-heading text-2xl font-bold">Check your email</h1>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
          </p>
          <p className="text-xs text-muted-foreground">
            Already confirmed?{" "}
            <Link href="/sign-in" className="text-[var(--gold)] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground">Create your account</h1>
          <p className="text-muted-foreground mt-2">Start your personalized style journey</p>
        </div>

        <div className="border border-border bg-card rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full gold-gradient text-obsidian font-semibold"
              disabled={loading}
            >
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-[var(--gold)] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
