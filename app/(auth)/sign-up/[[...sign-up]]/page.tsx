import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isClerkEnabled } from "@/lib/config";
import { getProfile } from "@/lib/db/profiles";
import { SignUpDevFallback, SignUpForm } from "./SignUpForm";

export const dynamic = "force-dynamic";

export default async function SignUpPage() {
  if (!isClerkEnabled()) return <SignUpDevFallback />;

  const { userId } = await auth();
  if (userId) {
    const profile = await getProfile(userId);
    redirect(profile ? "/dashboard" : "/onboarding");
  }

  return <SignUpForm />;
}
