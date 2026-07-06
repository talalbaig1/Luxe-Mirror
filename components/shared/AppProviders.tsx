"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { isClerkEnabledClient } from "@/lib/clerk-config";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

export function AppProviders({ children }: { children: React.ReactNode }) {
  if (!isClerkEnabledClient()) {
    return <TooltipProvider>{children}</TooltipProvider>;
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <TooltipProvider>{children}</TooltipProvider>
    </ClerkProvider>
  );
}
