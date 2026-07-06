"use client";

import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function SignUpForm() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground">Create your account</h1>
          <p className="text-muted-foreground mt-2">Start your personalized style journey</p>
        </div>
        <SignUp
          forceRedirectUrl="/onboarding"
          fallbackRedirectUrl="/onboarding"
          signInUrl="/sign-in"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-none border border-border bg-card",
            },
          }}
        />
      </div>
    </div>
  );
}

export function SignUpDevFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4 text-center space-y-4">
        <h1 className="font-heading text-3xl font-bold">Dev mode</h1>
        <p className="text-muted-foreground text-sm">
          Clerk is not configured. Start with onboarding to set up your local profile.
        </p>
        <Link href="/onboarding">
          <Button className="w-full gold-gradient text-obsidian font-semibold">Start onboarding</Button>
        </Link>
      </div>
    </div>
  );
}
