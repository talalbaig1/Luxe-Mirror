"use client";

import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function SignInForm() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground mt-2">Sign in to your Luxe Mirror account</p>
        </div>
        <SignIn
          forceRedirectUrl="/dashboard"
          fallbackRedirectUrl="/dashboard"
          signUpUrl="/sign-up"
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

export function SignInDevFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4 text-center space-y-4">
        <h1 className="font-heading text-3xl font-bold">Dev mode</h1>
        <p className="text-muted-foreground text-sm">
          Clerk is not configured. Add your keys to <code className="text-xs">.env</code> or continue without auth.
        </p>
        <div className="flex flex-col gap-2">
          <Link href="/dashboard">
            <Button className="w-full gold-gradient text-obsidian font-semibold">Go to Dashboard</Button>
          </Link>
          <Link href="/onboarding">
            <Button variant="outline" className="w-full">Complete onboarding</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
